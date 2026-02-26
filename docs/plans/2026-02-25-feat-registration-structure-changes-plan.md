---
title: "Registration Structure Changes"
type: feat
date: 2026-02-25
changes_covered: [1, 2, 3, 4, 5, 6]
issues: 6
---

# Registration Structure Changes

## Overview

Major restructuring of the registration flow, matching algorithm, and admin audit system. The event now mandates cross-school team mixing — no pre-formed teams of 5 are allowed. Registration caps at trios (yourself + 2), and the matching algorithm handles ALL team formation. AI tools experience is simplified from 15 categories to 5.

## Key Decisions

1. **`admin_assigned` not `admin_manual`**: The spec says `'admin_manual'` but the codebase already uses `'admin_assigned'`. Keeping existing naming to avoid unnecessary churn across admin API routes and components.

2. **Keep team creation at registration**: Even though the algorithm reassembles teams later, the current flow creates a placeholder team at registration. Keeping this pattern to minimize blast radius — the matching confirm endpoint already creates new teams and reassigns `team_id`.

3. **`needs_more_members` / `members_requested` removed from UI**: Since ALL groups go through matching, asking "do you need more members?" is redundant. DB column stays (no destructive migration) but UI and API no longer populate it.

4. **`admin_actions` replaces `team_audit_log`**: New table per spec. Existing `team_audit_log` is NOT dropped (safe deprecation) — all new writes go to `admin_actions`. Can drop the old table in a future cleanup migration.

5. **PRIMARY_ROLES unchanged**: The 9 granular roles stay as-is per Change 7. The 5 conceptual roles (Developer, Designer, Business/Strategy, Data/AI, Domain Expert) are just groupings — the form still shows 9 options.

6. **Scoring dimensions reduced from 5 to 4**: AI Tool Diversity (20%) is removed as a separate dimension. Skill Coverage is redefined to count the 5 new AI tool categories. New weights: Role 35%, Skill 30%, Experience 15%, School 20%.

7. **`admin_email` will be `'admin'` for now**: Current shared-token auth doesn't track individual admins. The `admin_actions.admin_email` column will populate with the shared admin identifier until magic link auth (Change 14) is implemented in a future sprint.

## Dependency Graph

```
Issue 1 (Migration)
  ├── Issue 2 (Types + Constants + Validations)
  │     ├── Issue 3 (Registration UI + API)
  │     ├── Issue 4 (AI Tools Selector UI)
  │     └── Issue 5 (Matching Algorithm) ← also depends on Issue 4
  └── Issue 6 (Admin Actions + Locking) ← independent of Issues 2-5
```

Issues 3, 4, and 6 can run in parallel after their dependencies are met.
Issue 5 depends on both Issue 2 (types) and Issue 4 (new AI tool categories).

---

## Phase 1: Schema & Data Foundation

### Issue 1: DB migration — registration restructuring + admin actions

#### Context
Plan: `docs/plans/2026-02-25-feat-registration-structure-changes-plan.md` Phase 1
Existing: `supabase/migrations/004_participant_profiles.sql` (latest migration)
Existing schema: `supabase/migrations/001_initial_schema.sql` (teams, registration_groups, participants)

#### What to Build
`supabase/migrations/005_registration_restructuring.sql` — Single migration covering all schema changes for the new registration model.

**registration_groups changes:**
- Add CHECK constraint: `group_size BETWEEN 1 AND 3`. Must DROP existing implicit constraint (none exists — `group_size INTEGER NOT NULL` has no CHECK) and add the new one.

**teams changes:**
- DROP `invite_code` column and its unique index `idx_teams_invite_code`.
- UPDATE `formation_type` CHECK constraint: remove `'pre_formed'`, keep `('algorithm_matched', 'admin_assigned')`. Requires DROP + re-ADD of the constraint.
- Backfill: UPDATE any existing rows with `formation_type = 'pre_formed'` to `'algorithm_matched'`.
- ADD `locked_by TEXT` (nullable — email of admin who locked).
- ADD `locked_at TIMESTAMPTZ` (nullable — when lock was toggled).

**participants changes:**
- ADD `ai_tools_used TEXT[] DEFAULT '{}'` — specific tool IDs within checked AI tool categories.

**admin_actions table (new):**
```sql
CREATE TABLE admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'ran_matching', 'confirmed_matching',
    'unlocked_team', 'locked_team',
    'moved_participant', 'swapped_participants',
    'added_participant', 'removed_participant',
    'created_team', 'dissolved_team',
    'marked_complete', 'marked_incomplete'
  )),
  team_id UUID REFERENCES teams(id),
  participant_id UUID REFERENCES participants(id),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_team ON admin_actions(team_id);
CREATE INDEX idx_admin_actions_time ON admin_actions(created_at DESC);
CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);
```

Note: `team_audit_log` is NOT dropped — deprecated in place. New writes go to `admin_actions`.

**RLS + policies:**
```sql
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
-- Service role (used by admin API routes) bypasses RLS automatically
```

**Backfill existing `ai_tools` data:**
Map old tool strings to new category IDs for existing participants so the matching algorithm scores them correctly. Best-effort mapping based on keyword matching:
```sql
-- Map old ai_tools strings to new category IDs
UPDATE participants SET ai_tools = ARRAY(
  SELECT DISTINCT category FROM (
    SELECT unnest(ai_tools) AS tool,
      CASE
        WHEN unnest(ai_tools) ILIKE '%coding%' OR unnest(ai_tools) ILIKE '%development%'
          OR unnest(ai_tools) ILIKE '%cursor%' OR unnest(ai_tools) ILIKE '%claude code%'
          OR unnest(ai_tools) ILIKE '%copilot%' OR unnest(ai_tools) ILIKE '%replit%'
          OR unnest(ai_tools) ILIKE '%bolt%' OR unnest(ai_tools) ILIKE '%lovable%'
          THEN 'coding_dev'
        WHEN unnest(ai_tools) ILIKE '%image%' OR unnest(ai_tools) ILIKE '%design%'
          OR unnest(ai_tools) ILIKE '%midjourney%' OR unnest(ai_tools) ILIKE '%dall-e%'
          OR unnest(ai_tools) ILIKE '%figma%' OR unnest(ai_tools) ILIKE '%canva%'
          THEN 'image_gen'
        WHEN unnest(ai_tools) ILIKE '%data%' OR unnest(ai_tools) ILIKE '%research%'
          OR unnest(ai_tools) ILIKE '%chatgpt%' OR unnest(ai_tools) ILIKE '%python%'
          OR unnest(ai_tools) ILIKE '%notebook%' OR unnest(ai_tools) ILIKE '%excel%'
          THEN 'data_research'
        WHEN unnest(ai_tools) ILIKE '%hardware%' OR unnest(ai_tools) ILIKE '%arduino%'
          OR unnest(ai_tools) ILIKE '%3d%' OR unnest(ai_tools) ILIKE '%sensor%'
          THEN 'hardware_iot'
        WHEN unnest(ai_tools) ILIKE '%business%' OR unnest(ai_tools) ILIKE '%productivity%'
          OR unnest(ai_tools) ILIKE '%notion%' OR unnest(ai_tools) ILIKE '%marketing%'
          THEN 'business_productivity'
        ELSE NULL
      END AS category
  ) mapped WHERE category IS NOT NULL
)
WHERE array_length(ai_tools, 1) > 0;
```

Note: This is lossy — tools like "Suno (Music Generation)" that don't map to any new category are dropped. This is acceptable as the old categories (Music, Video, Audio, etc.) don't exist in the new 5-category system.

#### Read Before Implementing
1. `supabase/migrations/001_initial_schema.sql` — current teams/registration_groups schema, constraint syntax patterns
2. `supabase/migrations/002_spring26_schema.sql` — example of ALTER TABLE + ADD COLUMN patterns
3. `supabase/migrations/003_team_audit_log.sql` — existing audit table (being superseded)

#### Files
- CREATE `supabase/migrations/005_registration_restructuring.sql`

#### Depends On
Nothing — this is foundational.

#### Acceptance Criteria
- [ ] Migration runs cleanly after 004
- [ ] `registration_groups.group_size` has CHECK constraint `BETWEEN 1 AND 3`
- [ ] `teams.invite_code` column is dropped (index dropped first, then column)
- [ ] `teams.formation_type` CHECK only allows `('algorithm_matched', 'admin_assigned')`
- [ ] Existing `pre_formed` AND NULL rows are backfilled to `algorithm_matched`
- [ ] `teams.locked_by` and `teams.locked_at` columns exist
- [ ] `participants.ai_tools_used` column exists with empty array default
- [ ] `admin_actions` table created with all CHECK constraints, indexes, and RLS enabled
- [ ] Existing `participants.ai_tools` data backfilled from old strings to new category IDs
- [ ] No TypeScript errors (`npx tsc --noEmit`)

---

### Issue 2: Types + Constants + Validations for new registration model

#### Context
Plan: `docs/plans/2026-02-25-feat-registration-structure-changes-plan.md` Phase 1
Depends on: Issue 1 (schema changes exist)
Existing: `src/lib/constants.ts`, `src/types/index.ts`, `src/lib/validations.ts`, `src/lib/utils.ts`

#### What to Build

**`src/lib/constants.ts` changes:**

Remove `full_team` from `TEAM_OPTIONS`. Replace with simplified two-option structure:
```typescript
export const TEAM_OPTIONS = [
  {
    value: "partial_team" as const,
    label: "I have teammates",
    description: "Register with 1 or 2 teammates (trio max). Your group enters the matching pool together.",
    teammateCount: null, // 1-2
  },
  {
    value: "solo" as const,
    label: "I'm registering solo",
    description: "You go into the matching pool individually.",
    teammateCount: 0,
  },
  {
    value: "spectator" as const,
    label: "Spectator",
    description: "For faculty, sponsors, judges, parents, etc.",
    teammateCount: 0,
  },
] as const;
```

Update `TeamOption` type: remove `"full_team"`, keep `"partial_team" | "solo" | "spectator"`.

Replace `SPECIFIC_SKILLS`, `AI_TOOLS`, `AI_TOOL_CATEGORIES`, and `AI_TOOLS_BY_CATEGORY` with new `AI_TOOLS_EXPERIENCE`:
```typescript
export const AI_TOOLS_EXPERIENCE = [
  {
    id: 'coding_dev',
    label: 'Coding & Development',
    tools: [
      { id: 'claude_code', label: 'Claude Code / Cursor' },
      { id: 'github_copilot', label: 'GitHub Copilot' },
      { id: 'replit', label: 'Replit / Bolt / Lovable' },
      { id: 'other_coding', label: 'Other' },
    ],
  },
  {
    id: 'image_gen',
    label: 'Image Generation & Design',
    tools: [
      { id: 'midjourney', label: 'Midjourney' },
      { id: 'figma_ai', label: 'Figma AI' },
      { id: 'canva_ai', label: 'Canva AI' },
      { id: 'other_design', label: 'Other' },
    ],
  },
  {
    id: 'data_research',
    label: 'Data Analysis & Research',
    tools: [
      { id: 'chatgpt', label: 'ChatGPT / Claude for research' },
      { id: 'python_notebooks', label: 'Python / Jupyter notebooks' },
      { id: 'excel_ai', label: 'Excel Copilot / Sheets AI' },
      { id: 'other_data', label: 'Other' },
    ],
  },
  {
    id: 'hardware_iot',
    label: 'Hardware / IoT',
    tools: [
      { id: 'arduino', label: 'Arduino / Raspberry Pi' },
      { id: 'sensors', label: 'Sensors & wearables' },
      { id: '3d_printing', label: '3D printing / prototyping' },
      { id: 'other_hardware', label: 'Other' },
    ],
  },
  {
    id: 'business_productivity',
    label: 'Business & Productivity AI',
    tools: [
      { id: 'notion_ai', label: 'Notion AI' },
      { id: 'ai_marketing', label: 'AI marketing tools (Jasper, Copy.ai)' },
      { id: 'other_business', label: 'Other' },
    ],
  },
] as const;

export type AiToolCategory = (typeof AI_TOOLS_EXPERIENCE)[number]['id'];
export type AiToolId = (typeof AI_TOOLS_EXPERIENCE)[number]['tools'][number]['id'];
```

Keep `SPECIFIC_SKILLS` array for the `tagged_team_skills` field (team skill preferences still use these). Only the AI tools selector changes.

**`src/types/index.ts` changes:**

`Team` interface:
- Remove `invite_code: string`
- Change `formation_type` to `"algorithm_matched" | "admin_assigned"`
- Add `locked_by?: string | null`
- Add `locked_at?: string | null`

`Participant` interface:
- Add `ai_tools_used: string[]`

`RegistrationFormData` interface:
- Change `team_option` to `"partial_team" | "solo" | "spectator"` (remove `"full_team"`)
- Remove `needs_more_members`
- Remove `members_requested`
- Add `ai_tools_used: string[]` (specific tool IDs)
- `ai_tools` becomes the category IDs (e.g., `['coding_dev', 'data_research']`)

**`src/lib/validations.ts` changes:**

`stepTeamSetupSchema`:
- Remove `"full_team"` from `team_option` enum
- Remove `needs_more_members` and `members_requested` fields
- Teammate count refinement: `partial_team` requires 1-2 (was 1-3), solo/spectator requires 0
- Remove the `members_requested` ceiling refinement entirely

`stepPersonalInfoSchema`:
- Add `ai_tools_used: z.array(z.string()).optional().default([])` — needed for step-level validation

`fullRegistrationSchema`:
- Same removals as above
- Remove `full_team` branch from teammate count refinement
- Partial team: 1-2 teammates (was 1-3)
- Remove `needs_more_members` / `members_requested` refinements
- Add `ai_tools_used: z.array(z.string()).optional().default([])`

**`src/lib/utils.ts` changes:**
- Remove `generateInviteCode()` function and `nanoid` import (no longer needed)
- If `nanoid` is only used for invite codes, remove it from package.json dependencies too

#### Read Before Implementing
1. `src/lib/constants.ts` — current TEAM_OPTIONS, AI_TOOLS structure, TeamOption type
2. `src/types/index.ts` — Team, Participant, RegistrationFormData interfaces
3. `src/lib/validations.ts` — stepTeamSetupSchema refinements, fullRegistrationSchema
4. `src/lib/utils.ts` — generateInviteCode usage

#### Files
- MODIFY `src/lib/constants.ts` (remove full_team, replace AI tools, update types)
- MODIFY `src/types/index.ts` (Team, Participant, RegistrationFormData)
- MODIFY `src/lib/validations.ts` (remove full_team, cap at 2 teammates)
- MODIFY `src/lib/utils.ts` (remove generateInviteCode)

#### Depends On
- Issue 1 (schema must exist for type alignment)

#### Acceptance Criteria
- [ ] `TEAM_OPTIONS` has 3 options: partial_team, solo, spectator (no full_team)
- [ ] `TeamOption` type does not include `"full_team"`
- [ ] `AI_TOOLS_EXPERIENCE` has exactly 5 categories with nested tools
- [ ] `Team` interface has no `invite_code`, has `locked_by` and `locked_at`
- [ ] `stepTeamSetupSchema` rejects `full_team`, caps partial_team at 2 teammates
- [ ] `stepPersonalInfoSchema` includes `ai_tools_used` field
- [ ] `fullRegistrationSchema` includes `ai_tools_used` field
- [ ] `generateInviteCode` removed from utils
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Build passes (`npm run build`)

---

## Phase 2: Registration Flow

### Issue 3: Registration UI + API — trio cap, no pre-formed teams

#### Context
Plan: `docs/plans/2026-02-25-feat-registration-structure-changes-plan.md` Phase 2
Depends on: Issue 2 (types, constants, validations updated)
Existing: `src/components/registration/StepTeamSetup.tsx`, `src/components/registration/StepReview.tsx`, `src/app/register/registration-wizard.tsx`, `src/app/api/register/route.ts`

#### What to Build

**`src/components/registration/StepTeamSetup.tsx` changes:**

Complete rewrite of the team options section:
- Show 3 cards (partial_team = "I have teammates", solo, spectator) instead of 4
- Remove the `full_team` icon mapping (`Users` icon for full_team)
- Remove the entire `data.team_option === "full_team"` block (4 fixed teammate inputs)
- Update the `partial_team` section:
  - Max 2 teammates (currently allows up to 3 via `addTeammate`)
  - `addTeammate` guard: `data.teammates.length < 2` (was `< 3`)
  - Header: "Your Teammates (max 2)"
- Remove the entire "Does your team need additional members?" section (`needs_more_members` / `members_requested` UI)
- Update subtitle: "How would you like to participate? Teams of 5 are formed by our matching algorithm."
- Add info banner for partial_team: "Your group will be combined with others to form a team of 5."
- Update `handleOptionChange`: remove `full_team` branch, `partial_team` starts with 1 teammate slot (unchanged)

**`src/components/registration/StepReview.tsx` changes:**

- Remove `full_team` from `teamOptionLabels` map
- Update `partial_team` label to `"I have teammates (group of 2-3)"`
- Update `solo` label to `"Solo (entering matching pool)"`
- Remove any invite_code display (currently not shown but verify)

**`src/app/register/registration-wizard.tsx` changes:**

- Update `INITIAL_FORM_DATA`: remove `needs_more_members` and `members_requested` fields (they're removed from RegistrationFormData type)
- Verify step flow still works (spectators skip Team Skills — unchanged)

**`src/app/api/register/route.ts` changes:**

- Remove `import { generateInviteCode } from "@/lib/utils"`
- Remove `full_team` branch:
  - Line 186-188: Remove `const formationType = data.team_option === "full_team" ? "pre_formed" : ...`
  - Always use `formation_type: "algorithm_matched"`
  - Always use `is_complete: false`
- Team creation: remove `invite_code: generateInviteCode()`
- Remove `members_requested` computation (lines 225-229)
- Set `members_requested: null` in registration_group insert
- Response: remove `invite_code` from team response object (line 274)
- Add `ai_tools_used` to both spectator and participant inserts: `ai_tools_used: data.ai_tools_used ?? []`

**`src/app/api/matching/confirm/route.ts` changes:**
- Remove `import { generateInviteCode } from "@/lib/utils"` (confirm route also uses this)
- Remove `invite_code: generateInviteCode()` from team insert (column no longer exists)
- This prevents a cross-issue build failure — if Issue 2 removes the utility but this file still imports it, TypeScript fails

#### Integration
- StepTeamSetup reads from `TEAM_OPTIONS` (updated in Issue 2) and validates against `stepTeamSetupSchema` (updated in Issue 2)
- API route validates against `fullRegistrationSchema` (updated in Issue 2)
- registration-wizard passes `RegistrationFormData` (updated in Issue 2) through the step components

#### Read Before Implementing
1. `src/components/registration/StepTeamSetup.tsx` — current full_team/partial_team rendering, needs_more_members UI
2. `src/app/api/register/route.ts` — pre_formed team creation logic, invite code generation
3. `src/components/registration/StepReview.tsx` — team option labels, teammate display
4. `src/app/register/registration-wizard.tsx` — INITIAL_FORM_DATA, step flow
5. `src/lib/constants.ts` — verify updated TEAM_OPTIONS shape (from Issue 2)

#### Files
- MODIFY `src/components/registration/StepTeamSetup.tsx` (remove full_team, cap at 2 teammates, remove needs_more_members)
- MODIFY `src/components/registration/StepReview.tsx` (update labels)
- MODIFY `src/app/register/registration-wizard.tsx` (update INITIAL_FORM_DATA)
- MODIFY `src/app/api/register/route.ts` (remove pre_formed, invite_code, always incomplete, add ai_tools_used)
- MODIFY `src/app/api/matching/confirm/route.ts` (remove invite_code + generateInviteCode import)

#### Depends On
- Issue 2 (types, constants, validations must be updated first)

#### Acceptance Criteria
- [ ] StepTeamSetup shows 3 options: "I have teammates", "Solo", "Spectator"
- [ ] Team options grid uses `md:grid-cols-3` (not 4)
- [ ] Partial team allows max 2 teammates (trio = you + 2)
- [ ] No "needs more members" question shown
- [ ] API always creates teams with `formation_type: 'algorithm_matched'`, `is_complete: false`
- [ ] API does not generate or store invite codes
- [ ] API persists `ai_tools_used` for both participants and spectators
- [ ] Matching confirm route compiles without `invite_code` or `generateInviteCode`
- [ ] StepReview shows correct labels for new team options
- [ ] Registration works end-to-end for solo, partial_team (1 teammate), partial_team (2 teammates), spectator
- [ ] Lint passes (`npm run lint`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Build passes (`npm run build`)

---

### Issue 4: AI Tools selector redesign — 5 categories with nested tools

#### Context
Plan: `docs/plans/2026-02-25-feat-registration-structure-changes-plan.md` Phase 2
Depends on: Issue 2 (AI_TOOLS_EXPERIENCE constant defined)
Existing: `src/components/registration/AiToolsSelector.tsx`, `src/components/registration/StepPersonalInfo.tsx`

#### What to Build

**`src/components/registration/AiToolsSelector.tsx` — Full rewrite:**

Replace the current 15-category flat chip selector with a 5-category collapsible system:

UI behavior:
- Show 5 categories as checkboxes (coding_dev, image_gen, data_research, hardware_iot, business_productivity)
- When a category checkbox is checked, a section expands showing the 3-5 tool options as checkboxes underneath
- User checks "all that apply" within each expanded category
- When a category is unchecked, collapse the tools and deselect all tools in that category
- Keep the "I have no experience with AI tools" option at the bottom — clears all selections when checked
- Clean, not overwhelming — vertical stack, clear visual hierarchy

Data flow:
- `selectedCategories: string[]` — the checked category IDs (e.g., `['coding_dev', 'data_research']`)
- `selectedTools: string[]` — the checked tool IDs within categories (e.g., `['claude_code', 'chatgpt']`)
- `onChange` callback passes both: `onChange(categories, tools)`

Read from `AI_TOOLS_EXPERIENCE` constant (from Issue 2).

**`src/components/registration/StepPersonalInfo.tsx` changes:**

- Update AiToolsSelector integration to pass `selectedCategories={data.ai_tools}` and `selectedTools={data.ai_tools_used}`
- Update `onChange` handler to write both `ai_tools` (categories) and `ai_tools_used` (specific tools) to form data
- The section label can stay "AI Tools Experience" or similar

**`src/components/registration/StepReview.tsx` changes:**

- Update AI tools display to show category labels (not raw IDs)
- Map category IDs to labels using `AI_TOOLS_EXPERIENCE`
- Optionally show specific tools under each category

#### Read Before Implementing
1. `src/components/registration/AiToolsSelector.tsx` — current 15-category chip selector, no-experience toggle
2. `src/components/registration/StepPersonalInfo.tsx` — how AiToolsSelector is integrated, data flow
3. `src/lib/constants.ts` — verify AI_TOOLS_EXPERIENCE shape (from Issue 2)
4. `src/components/registration/SkillChips.tsx` — current chip component for reference (may or may not reuse)

#### Files
- MODIFY `src/components/registration/AiToolsSelector.tsx` (full rewrite — 5 collapsible categories)
- MODIFY `src/components/registration/StepPersonalInfo.tsx` (update AiToolsSelector integration)
- MODIFY `src/components/registration/StepReview.tsx` (display category labels + tools)

#### Depends On
- Issue 2 (AI_TOOLS_EXPERIENCE constant, ai_tools_used in types)

#### Acceptance Criteria
- [ ] AiToolsSelector shows 5 category checkboxes
- [ ] Checking a category expands nested tool options
- [ ] Unchecking a category collapses and deselects its tools
- [ ] "No experience" option clears all categories and tools
- [ ] `ai_tools` field contains checked category IDs
- [ ] `ai_tools_used` field contains checked tool IDs
- [ ] StepReview displays category labels (not raw IDs) with tool details
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Build passes (`npm run build`)

---

## Phase 3: Matching & Admin

### Issue 5: Matching algorithm rebalance — cross-school mixing + all-pool formation

#### Context
Plan: `docs/plans/2026-02-25-feat-registration-structure-changes-plan.md` Phase 3
Depends on: Issue 2 (types), Issue 4 (new AI tool categories for skill coverage scoring)
Existing: `src/lib/matching/scoring.ts`, `src/lib/matching/algorithm.ts`, `src/lib/matching/types.ts`

#### What to Build

**`src/lib/matching/scoring.ts` changes:**

Reduce from 5 scoring dimensions to 4. Remove AI Tool Diversity as separate dimension. Redefine Skill Coverage to count the 5 new AI tool categories.

New weights:
```typescript
const WEIGHT_ROLE_DIVERSITY = 0.35;     // was 0.30
const WEIGHT_SKILL_COVERAGE = 0.30;     // was 0.25, now counts AI tool categories
const WEIGHT_EXPERIENCE_BALANCE = 0.15; // unchanged
const WEIGHT_SCHOOL_MIX = 0.20;         // was 0.10
```

**`skillCoverageScore` rewrite:** Instead of counting unique `specificSkills` against `SPECIFIC_SKILLS.length`, count unique AI tool categories (from `aiTools` field which now contains category IDs like `'coding_dev'`) against the 5 total categories.

```typescript
function skillCoverageScore(members: MatchInput[]): number {
  const categories = new Set(members.flatMap((m) => m.aiTools));
  return Math.min(categories.size / 5, 1.0); // 5 AI tool categories
}
```

**`aiToolDiversityScore` — REMOVE entirely.** Its logic is absorbed into the new `skillCoverageScore`.

**`schoolMixScore` rewrite:** New tiered scoring per spec:
```typescript
function schoolMixScore(members: MatchInput[]): number {
  if (members.length === 0) return 0;
  const uniqueSchools = new Set(members.map((m) => m.school));
  const count = uniqueSchools.size;
  if (count >= 3) return 20 / 20; // 1.0 — ideal
  if (count === 2) return 14 / 20; // 0.7 — good
  return 4 / 20;                   // 0.2 — all same school
}
```

**`calculateTeamScore` update:** Remove `aiTool` dimension, use new weights, update JSDoc.

**`src/lib/matching/algorithm.ts` changes:**

Remove handling for groups of 4 and groups of 5 (full groups). Since registration now caps at 3:

In `greedyConstruction`:
- Remove `groupsOf4: MatchInput[][]` and `fullGroups: MatchInput[][]` arrays
- Remove the `members.length >= TEAM_SIZE` (full groups) handling
- Remove the `members.length === 4` bucket
- Keep `groupsOf3`, `groupsOf2`, and solos
- The phase 1 greedy logic simplifies to:
  1. Trios (3): Find best pair, or 2 solos
  2. Pairs (2): Find best trio (should be consumed), or best pair + solo, or 3 solos
  3. Solos: Group into teams of 5

Remove `prioritizeRequesting` sort entirely from ALL group buckets (groupsOf3, groupsOf2 — not just groupsOf4). Since `membersRequested` is always 0 after this change, the sort is dead code everywhere. Remove the `prioritizeRequesting` function itself.

Fix existing bug: `experienceBalanceScore` has comment `const totalLevels = EXPERIENCE_LEVELS.length; // 3` — should be `// 4` (there are 4 experience levels).

**`src/lib/matching/types.ts` — Optional cleanup:**
- Update JSDoc for `MatchInput.groupSize` comment: `// 1 for solo, 2 or 3 for registration group (max 3)`

#### Read Before Implementing
1. `src/lib/matching/scoring.ts` — current 5-weight scoring, aiToolDiversityScore logic
2. `src/lib/matching/algorithm.ts` — greedyConstruction phases, groupsOf4/fullGroups handling
3. `src/lib/matching/types.ts` — MatchInput interface (groupSize, aiTools fields)
4. `src/lib/constants.ts` — verify AI_TOOLS_EXPERIENCE has 5 categories (from Issue 2)

#### Files
- MODIFY `src/lib/matching/scoring.ts` (new weights, remove AI Tool Diversity, rewrite Skill Coverage + School Mix)
- MODIFY `src/lib/matching/algorithm.ts` (remove groupsOf4/fullGroups, simplify to groups of 1-3)
- MODIFY `src/lib/matching/types.ts` (update JSDoc)

#### Depends On
- Issue 2 (types alignment for MatchInput)
- Issue 4 (AI tool categories — scoring uses the new category IDs in `aiTools` field)

#### Acceptance Criteria
- [ ] Scoring has 4 dimensions: Role (35%), Skill Coverage (30%), Experience (15%), School Mix (20%)
- [ ] Skill Coverage counts 5 AI tool category IDs (not old specific_skills)
- [ ] School Mix: 3 schools = 1.0, 2 schools = 0.7, 1 school = 0.2
- [ ] Algorithm does NOT handle groups of 4 or 5 (no fullGroups, no groupsOf4)
- [ ] `prioritizeRequesting` sort function removed entirely (dead code)
- [ ] Algorithm correctly combines: 3+2, 3+1+1, 2+2+1, 2+1+1+1, 1+1+1+1+1
- [ ] `runMatching()` produces valid output with mock inputs of groups sized 1-3
- [ ] `totalLevels` comment fixed to `// 4`
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Build passes (`npm run build`)

---

### Issue 6: Admin actions audit trail + per-team locking enhancements

#### Context
Plan: `docs/plans/2026-02-25-feat-registration-structure-changes-plan.md` Phase 3
Depends on: Issue 1 (admin_actions table, locked_by/locked_at columns)
Existing: `src/app/api/teams/[id]/route.ts`, `src/app/api/teams/[id]/members/route.ts`, `src/app/api/teams/[id]/move/route.ts`, `src/app/api/admin/teams/route.ts`, `src/app/api/matching/confirm/route.ts`, `src/components/admin/TeamActions.tsx`, `src/components/admin/MatchingPreview.tsx`

#### What to Build

**All team API routes — Switch from `team_audit_log` to `admin_actions`:**

Every audit log insert currently writes to `team_audit_log` with `{ team_id, admin_id, action, details }`. Switch to `admin_actions` with `{ admin_email, action_type, team_id, participant_id, details }`.

The `admin_email` comes from `admin.email` returned by `verifyAdmin()` (currently returns `'admin'` for all shared-token sessions).

Routes to update:

1. **`src/app/api/teams/[id]/route.ts`** — PATCH handler (lock/unlock, complete/incomplete):
   - When toggling `is_locked`: set `locked_by` and `locked_at` **server-side** (from `admin.email` + `new Date().toISOString()` on lock, `null` on unlock). These fields must NOT be in `allowedFields` — they are derived, not client-passed, to prevent spoofing.
   - Switch audit writes from `team_audit_log` to `admin_actions`
   - Map action names: `"is_locked"` → `action_type: "locked_team"` or `"unlocked_team"`, `"is_complete"` → `"marked_complete"` or `"marked_incomplete"`
   - DELETE handler (dissolve): `action_type: "dissolved_team"`

2. **`src/app/api/teams/[id]/members/route.ts`** — POST (add member), DELETE (remove member):
   - Switch to `admin_actions` with `participant_id` field populated
   - `action_type: "added_participant"` or `"removed_participant"`

3. **`src/app/api/teams/[id]/move/route.ts`** — POST (move participant):
   - Switch to `admin_actions` with `action_type: "moved_participant"`
   - Write one entry (not two) with `details` containing source/target info

4. **`src/app/api/admin/teams/route.ts`** — POST (create team):
   - Switch to `admin_actions` with `action_type: "created_team"`

5. **`src/app/api/matching/confirm/route.ts`** — POST (confirm matching):
   - Add `admin_actions` write with `action_type: "confirmed_matching"`
   - This was previously a TODO (no audit log existed for matching confirmation)

**`src/components/admin/TeamActions.tsx` changes:**
- When lock is toggled, display `locked_by` and `locked_at` on the team card (e.g., "Locked by admin at 2:30 PM")
- Read `locked_by` and `locked_at` from team data

**`src/components/admin/MatchingPreview.tsx` changes:**
- Before showing "Run Matching Algorithm" button, check if ANY teams in the system are locked
- If locked teams exist: disable the button and show message "Unlock all teams before re-running the algorithm"
- This prevents accidental re-runs that would overwrite locked teams

**`src/app/admin/teams/page.tsx` changes:**
- Remove `pre_formed` from formation type filter/badge display
- Pass `locked_by`/`locked_at` to TeamActions component

#### Read Before Implementing
1. `src/app/api/teams/[id]/route.ts` — current PATCH/DELETE with team_audit_log writes
2. `src/app/api/teams/[id]/members/route.ts` — member add/remove audit writes
3. `src/app/api/teams/[id]/move/route.ts` — move participant audit writes
4. `src/app/api/matching/confirm/route.ts` — confirm endpoint (missing audit write)
5. `src/components/admin/TeamActions.tsx` — lock/unlock UI, current team data props
6. `src/components/admin/MatchingPreview.tsx` — "Run Matching" button and its guards

#### Files
- MODIFY `src/app/api/teams/[id]/route.ts` (admin_actions writes, locked_by/locked_at)
- MODIFY `src/app/api/teams/[id]/members/route.ts` (admin_actions writes)
- MODIFY `src/app/api/teams/[id]/move/route.ts` (admin_actions writes)
- MODIFY `src/app/api/admin/teams/route.ts` (admin_actions writes)
- MODIFY `src/app/api/matching/confirm/route.ts` (admin_actions writes)
- MODIFY `src/components/admin/TeamActions.tsx` (locked_by/locked_at display)
- MODIFY `src/components/admin/MatchingPreview.tsx` (disable Run Matching when teams locked)
- MODIFY `src/app/admin/teams/page.tsx` (remove pre_formed badge, pass lock metadata)

#### Depends On
- Issue 1 (admin_actions table + locked_by/locked_at columns must exist in schema)

#### Acceptance Criteria
- [ ] All team API mutations write to `admin_actions` (not `team_audit_log`)
- [ ] Lock toggle sets `locked_by` and `locked_at` on the team
- [ ] Unlock clears `locked_by` and `locked_at`
- [ ] TeamActions displays who locked and when
- [ ] "Run Matching" button is disabled when any teams are locked
- [ ] Matching confirmation writes audit entry
- [ ] `pre_formed` formation type no longer displayed in admin UI
- [ ] Lint passes (`npm run lint`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Build passes (`npm run build`)

---

## Things NOT Changed (Confirmed Unchanged)

Per the spec, these remain as-is:
- **Registration cap**: 500 participants
- **Team size**: Exactly 5
- **Primary roles taxonomy**: 9 roles (Developer x3, Designer, Data/ML, PM, Business, Pitch, Domain Expert)
- **Experience levels**: 4 levels (Beginner through Expert)
- **Check-in system**: QR code flow unchanged
- **Email confirmation**: ICS calendar invite unchanged
- **CSV export**: Finance export unchanged
- **Tech stack**: Next.js + Supabase + Resend + Vercel

## SpecFlow Analysis — Gaps & Resolutions

The following gaps were identified by SpecFlow analysis and resolved in the plan:

### Resolved (incorporated into issues)

**Gap: `confirm/route.ts` imports `generateInviteCode` which is removed in Issue 2**
The matching confirm route also uses `generateInviteCode()` and `invite_code` in its team insert. If Issue 2 removes the utility but Issue 6 hasn't updated the confirm route yet, the build breaks.
**Resolution:** Issue 3 now also covers removing `invite_code` from the confirm route's team insert and the `generateInviteCode` import. Added to Issue 3 files list and acceptance criteria.

**Gap: `md:grid-cols-4` in StepTeamSetup breaks with 3 options**
The team option cards grid uses `md:grid-cols-4` for 4 cards. With 3 cards, one column is empty on desktop.
**Resolution:** Issue 3 must update grid to `md:grid-cols-3`. Added to acceptance criteria.

**Gap: `stepPersonalInfoSchema` missing `ai_tools_used` field**
Step-level schema validates on each step advancement. Without `ai_tools_used` in the step schema, it's silently ignored.
**Resolution:** Issue 2 must add `ai_tools_used: z.array(z.string()).optional().default([])` to `stepPersonalInfoSchema`. Added to acceptance criteria.

**Gap: `prioritizeRequesting` sort applied to groupsOf3 and groupsOf2 becomes dead code**
Since `membersRequested` will always be 0, the sort is a no-op for all group buckets, not just groupsOf4.
**Resolution:** Issue 5 removes `prioritizeRequesting` entirely from all group buckets. Updated in algorithm changes.

**Gap: `locked_by`/`locked_at` must be server-derived, not client-passed**
If these fields are in `allowedFields` for the PATCH endpoint, clients could spoof who locked a team.
**Resolution:** Issue 6 must set `locked_by` and `locked_at` server-side based on `admin.email` and `new Date()` when `is_locked` is toggled. These fields must NOT be in `allowedFields`.

**Gap: `TeamActionsProps` needs `lockedBy` and `lockedAt` props**
The component interface needs updating to pass and display lock metadata.
**Resolution:** Issue 6 file list already includes `TeamActions.tsx` and `teams/page.tsx`. Acceptance criteria updated to verify prop threading.

**Gap: Existing `ai_tools` data has old format strings, not new category IDs**
After the AI tools change, existing participants have strings like `"Cursor (Coding & Development)"` instead of category IDs. The algorithm's `skillCoverageScore` would score them incorrectly.
**Resolution:** Issue 1 migration must include a best-effort backfill mapping old AI tool strings to new category IDs. Add a backfill statement that maps tools to categories based on keyword matching. Add `ai_tools_used` backfill from the old `ai_tools` values.

**Gap: `admin_actions` table needs RLS policy**
Without RLS policies, anon client queries would return nothing.
**Resolution:** Issue 1 migration must include `ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;` (service role bypasses RLS; admin dashboard uses admin client).

**Gap: `totalLevels` comment in scoring.ts says `// 3` but should be `// 4`**
Existing bug. Since Issue 5 modifies scoring.ts, fix the comment.
**Resolution:** Issue 5 fixes comment to `// 4`.

### Known Limitations (accepted)

**Swap optimization limited to solo members only:** Groups of 2-3 are never broken apart during Phase 2 swap optimization. A poorly matched trio stays together. This is by design — "Never break registration group integrity during matching." Documented as a known tradeoff.

**School mix scoring plateau at 3 schools:** A trio spanning 3 different schools already scores 1.0 for school mix, so adding 2 more members from any school doesn't improve the score. This is mathematically correct but reduces the algorithm's incentive to diversify beyond 3 schools on a team of 5. Accepted — 3+ schools on a team is already excellent diversity.

**"Run Matching" lock gate may be overly broad:** The plan gates on "any locked teams exist." This could block the button if an admin-assigned team is locked. The more precise condition would be "any algorithm_matched teams are locked." Leave as-is for v1 (safety-first) — can refine if admins report friction.

**Empty orphan teams after re-run:** When matching re-runs after unlocking, old team rows may become empty (0 members). The confirm endpoint does not clean these up. Accepted for v1 — admin can dissolve empty teams manually. Can add auto-cleanup in a future iteration.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing registrations have `formation_type: 'pre_formed'` | Migration fails on CHECK constraint | Backfill `pre_formed` → `algorithm_matched` BEFORE altering constraint. Also handle NULL values. |
| `invite_code` column has UNIQUE NOT NULL constraint + index | DROP fails on constraint | DROP INDEX `idx_teams_invite_code` first, then ALTER TABLE DROP COLUMN |
| `confirm/route.ts` also uses `invite_code` and `generateInviteCode` | Build failure between Issue 2 and Issue 6 | Issue 3 also updates confirm route to remove invite_code references |
| Admin auth is shared token — audit trail shows same email for all admins | Low accountability | Acceptable for now; magic link auth (Change 14) will fix this later |
| `SPECIFIC_SKILLS` still used by `tagged_team_skills` | Removing it breaks team skills step | Keep `SPECIFIC_SKILLS` — only replace the AI tools selector |
| Matching algorithm scoring change affects all existing team scores | Scores shift significantly | Expected — new weights are intentional policy change |
| Existing `ai_tools` data has old-format strings | Scoring gives wrong results for pre-existing registrants | Migration includes best-effort backfill mapping old strings to new category IDs |
| Audit writes must happen BEFORE team dissolution (FK constraint) | `admin_actions` write fails if team is deleted first | Preserve existing ordering: write audit entry, then delete team |
