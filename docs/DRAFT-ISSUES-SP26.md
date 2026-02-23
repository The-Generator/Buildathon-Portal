# Spring '26 Draft Issues (v2 -- properly scoped)

> Each issue: 3-8 files, one coherent concept, one Droid session.
> Do NOT create on GitHub until explicitly approved.

---

## Phase 1: Schema & Types Foundation

### Issue 1: DB migration -- participant_type + ai_tools + event_config

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 1
Existing: `supabase/migrations/001_initial_schema.sql`

**What to Build:**
`supabase/migrations/002_spring26_schema.sql` -- Single migration file adding: `participant_type` text column on participants (CHECK: participant/spectator/walk_in, default participant), `ai_tools` text array column on participants (default {}), `members_requested` integer column on registration_groups, and a new `event_config` single-row table with `track_released` boolean (default false). Backfill defaults for existing rows.

**Read Before Implementing:**
1. `supabase/migrations/001_initial_schema.sql` -- current schema shape and constraint patterns

**Files:**
- CREATE `supabase/migrations/002_spring26_schema.sql`

**Depends On:** Nothing -- foundational

**Acceptance Criteria:**
- [ ] Migration runs cleanly after 001
- [ ] participant_type column has CHECK constraint
- [ ] ai_tools column defaults to empty array
- [ ] event_config table has track_released boolean
- [ ] members_requested column on registration_groups
- [ ] No TypeScript errors

---

### Issue 2: TypeScript types + constants for new schema columns

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 1
Existing: `src/types/index.ts`, `src/lib/constants.ts`
Depends on: Issue 1 (schema exists)

**What to Build:**
Update `Participant` interface to add `participant_type` and `ai_tools` fields. Update `RegistrationGroup` to add `members_requested`. Add `PARTICIPANT_TYPES` constant array. Add `AI_TOOLS` constant array (68 items from Jotform Q10, grouped by category). Add `AI_TOOLS_BY_CATEGORY` grouped object for UI rendering.

**Read Before Implementing:**
1. `src/types/index.ts` -- existing interfaces
2. `src/lib/constants.ts` -- existing constant patterns
3. `docs/jotform/JOTFORM_FIELD_CATALOG.json` -- Q10 has the 68 AI tools to extract

**Files:**
- MODIFY `src/types/index.ts` (add participant_type, ai_tools, members_requested)
- MODIFY `src/lib/constants.ts` (add PARTICIPANT_TYPES, AI_TOOLS, AI_TOOLS_BY_CATEGORY)

**Depends On:** Issue 1 (types must match schema)

**Acceptance Criteria:**
- [ ] Participant interface has participant_type and ai_tools fields
- [ ] RegistrationGroup has members_requested field
- [ ] AI_TOOLS array has all 68 tools from Jotform Q10
- [ ] AI_TOOLS_BY_CATEGORY groups tools by category
- [ ] No TypeScript errors (`npx tsc --noEmit`)

---

## Phase 2: Registration Paths

### Issue 3: Spectator option in registration wizard (UI only)

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 1-2
Existing: `src/components/registration/StepTeamSetup.tsx` has solo/partial/full cards
Depends on: Issue 2 (constants)

**What to Build:**
Add a "Spectator" option card to StepTeamSetup. When selected, the RegistrationWizard should skip Steps 2 (team inputs) and 3 (team skills), jumping directly to Review. The spectator card should clearly say "For faculty, sponsors, judges, parents, etc." matching Jotform Q6.

**Read Before Implementing:**
1. `src/components/registration/StepTeamSetup.tsx` -- option card rendering pattern
2. `src/app/register/registration-wizard.tsx` -- step flow to modify
3. `docs/jotform/JOTFORM_LOGIC_EXTRACT.md` -- conditions #0, #1

**Files:**
- MODIFY `src/lib/constants.ts` (add spectator to TEAM_OPTIONS)
- MODIFY `src/components/registration/StepTeamSetup.tsx` (spectator card)
- MODIFY `src/app/register/registration-wizard.tsx` (skip steps for spectator)

**Depends On:** Issue 2 (TEAM_OPTIONS constant)

**Acceptance Criteria:**
- [ ] Spectator option card appears in team setup step
- [ ] Selecting spectator skips team inputs and team skills steps
- [ ] Review step renders correctly for spectator (no team/skills sections)
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 4: Spectator validation schema + API branch

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 1-2
Existing: `src/lib/validations.ts`, `src/app/api/register/route.ts`
Depends on: Issue 3 (UI sends spectator option)

**What to Build:**
Update Zod schemas to handle spectator path: when team_option is "spectator", teammates must be empty, tagged_team_skills must be empty, and specific_skills/primary_role/experience_level become optional. Update the registration API to branch on spectator: set participant_type='spectator', skip team creation, skip registration_group creation, don't count against capacity.

**Read Before Implementing:**
1. `src/lib/validations.ts` -- current schema refinements
2. `src/app/api/register/route.ts` -- full registration flow
3. `docs/jotform/JOTFORM_LOGIC_EXTRACT.md` -- conditions #0, #1 disable/unrequire behavior

**Files:**
- MODIFY `src/lib/validations.ts` (spectator-aware refinements)
- MODIFY `src/app/api/register/route.ts` (spectator branch)
- MODIFY `src/types/index.ts` (add spectator to RegistrationFormData team_option union)

**Depends On:** Issue 3 (UI sends spectator), Issue 1 (participant_type column)

**Acceptance Criteria:**
- [ ] Spectator submission validates without team/skill fields
- [ ] API creates participant with participant_type='spectator'
- [ ] No team or registration_group created for spectators
- [ ] Spectators don't count against capacity
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 5: AI tools selector component

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 1
Existing: `src/components/registration/SkillChips.tsx` (reusable chip selector)
Depends on: Issue 2 (AI_TOOLS_BY_CATEGORY constant)

**What to Build:**
A grouped AI tools multi-select for Step 1 of registration. Uses SkillChips component per category, with category headers. Includes "I have no experience with AI tools" mutual-exclusion option (selecting it clears others, selecting any tool clears it). This is a self-contained component that receives selectedTools and onChange props.

**Read Before Implementing:**
1. `src/components/registration/SkillChips.tsx` -- chip component API
2. `src/lib/constants.ts` -- AI_TOOLS_BY_CATEGORY structure
3. `docs/jotform/JOTFORM_FIELD_CATALOG.json` -- Q10 mutual exclusion behavior

**Files:**
- CREATE `src/components/registration/AiToolsSelector.tsx`

**Depends On:** Issue 2 (AI_TOOLS_BY_CATEGORY)

**Acceptance Criteria:**
- [ ] Component renders tools grouped by category with headers
- [ ] "No experience" option clears all other selections
- [ ] Selecting any tool clears "no experience" option
- [ ] Component is reusable (props-driven, no global state)
- [ ] No TypeScript errors

---

### Issue 6a: Wire AI tools selector into registration form UI

**Context:**
Existing: `src/components/registration/StepPersonalInfo.tsx`, `src/components/registration/StepReview.tsx`
Depends on: Issue 5 (AiToolsSelector component), Issue 2 (types)

**What to Build:**
Add the AiToolsSelector to StepPersonalInfo below the skills section. Add `ai_tools` field to RegistrationFormData type. Wire selected tools through to StepReview display section. This is UI-only -- no validation or API changes.

**Read Before Implementing:**
1. `src/components/registration/StepPersonalInfo.tsx` -- where to add the selector
2. `src/components/registration/StepReview.tsx` -- review display pattern
3. `src/types/index.ts` -- RegistrationFormData shape

**Files:**
- MODIFY `src/components/registration/StepPersonalInfo.tsx` (add AiToolsSelector)
- MODIFY `src/components/registration/StepReview.tsx` (display ai_tools)
- MODIFY `src/types/index.ts` (add ai_tools to RegistrationFormData if not already there)

**Depends On:** Issue 5 (component), Issue 2 (types/constants)

**Acceptance Criteria:**
- [ ] AI tools selector visible in Step 1 below skills
- [ ] Selected tools appear in Review step
- [ ] Form state carries ai_tools through wizard steps
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 6b: AI tools validation schema + API persistence

**Context:**
Existing: `src/lib/validations.ts`, `src/app/api/register/route.ts`
Depends on: Issue 6a (UI sends ai_tools in form data)

**What to Build:**
Add `ai_tools` field to Zod step 1 schema and full registration schema in validations.ts (optional string array, defaults to empty). Update registration API to read ai_tools from validated data and persist to participant record insert.

**Read Before Implementing:**
1. `src/lib/validations.ts` -- step 1 schema and full schema patterns
2. `src/app/api/register/route.ts` -- participant insert statement

**Files:**
- MODIFY `src/lib/validations.ts` (add ai_tools to step 1 + full schema)
- MODIFY `src/app/api/register/route.ts` (persist ai_tools in participant insert)

**Depends On:** Issue 6a (UI sends ai_tools), Issue 1 (ai_tools column exists)

**Acceptance Criteria:**
- [ ] Validation allows empty array (optional field)
- [ ] Validation rejects non-string values in array
- [ ] ai_tools persisted to participants table on registration
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 7: Partial team "need more members?" flow

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 1-2
Existing: `src/components/registration/StepTeamSetup.tsx`
Depends on: Issue 2 (members_requested in types)

**What to Build:**
When partial_team is selected and teammates are entered, show follow-up: "Does your team need additional members?" (Yes/No). If Yes, show "How many more?" numeric input (constrained: total members + requested <= 5). If No or empty, hide the field. Matches Jotform Q26 + Q27 conditions #2/#3.

**Read Before Implementing:**
1. `src/components/registration/StepTeamSetup.tsx` -- current partial team UI
2. `docs/jotform/JOTFORM_LOGIC_EXTRACT.md` -- conditions #2, #3 for Q26/Q27
3. `src/lib/validations.ts` -- step 2 schema

**Files:**
- MODIFY `src/components/registration/StepTeamSetup.tsx` (add follow-up UI)
- MODIFY `src/lib/validations.ts` (add members_requested validation)
- MODIFY `src/types/index.ts` (add members_requested to RegistrationFormData)

**Depends On:** Issue 2 (types)

**Acceptance Criteria:**
- [ ] "Need more members?" appears after partial team teammate entry
- [ ] "Yes" reveals constrained numeric input
- [ ] "No" hides the input (Jotform conditions #2/#3)
- [ ] Total doesn't exceed team size 5
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 8: Persist members_requested in registration API

**Context:**
Existing: `src/app/api/register/route.ts`
Depends on: Issue 7 (UI sends members_requested)

**What to Build:**
Update registration API to read `members_requested` from form data and persist it to the registration_groups table insert. Only relevant for partial_team registrations.

**Read Before Implementing:**
1. `src/app/api/register/route.ts` -- registration_group insert at step 9
2. `src/lib/validations.ts` -- full schema to add members_requested

**Files:**
- MODIFY `src/app/api/register/route.ts` (persist members_requested)
- MODIFY `src/lib/validations.ts` (add members_requested to full schema)

**Depends On:** Issue 7 (UI), Issue 1 (column)

**Acceptance Criteria:**
- [ ] members_requested persisted for partial_team registrations
- [ ] Null/0 for solo and full_team registrations
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

## Phase 3: Event Day Operations

### Issue 9: Track/theme release gating -- API + admin toggle

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 2.3
Depends on: Issue 1 (event_config table)

**What to Build:**
Admin API endpoint (`src/app/api/admin/tracks/route.ts`): GET returns track_released state, POST toggles it. Public endpoint (`src/app/api/tracks/route.ts`): returns track data only if released, gated message otherwise. Both use verifyAdmin from admin-auth.ts for the admin route.

**Read Before Implementing:**
1. `src/lib/admin-auth.ts` -- verifyAdmin pattern
2. `src/lib/supabase/admin.ts` -- admin client

**Files:**
- CREATE `src/app/api/admin/tracks/route.ts`
- CREATE `src/app/api/tracks/route.ts`

**Depends On:** Issue 1 (event_config table)

**Acceptance Criteria:**
- [ ] Admin GET returns current track_released boolean
- [ ] Admin POST toggles the state
- [ ] Public endpoint returns gated response when unreleased
- [ ] Public endpoint returns track data when released
- [ ] No TypeScript errors

---

### Issue 10: Track release toggle UI in admin dashboard

**Context:**
Existing: `src/app/admin/page.tsx`, `src/components/admin/StatsOverview.tsx`
Depends on: Issue 9 (API endpoints)

**What to Build:**
A toggle card component for the admin overview page. Shows current track release state with an on/off switch. Toggle calls the admin tracks API. Includes confirmation before toggling on (irreversible for participants once they see tracks).

**Read Before Implementing:**
1. `src/app/admin/page.tsx` -- admin overview layout
2. `src/components/admin/StatsOverview.tsx` -- existing card patterns

**Files:**
- CREATE `src/components/admin/TrackReleaseToggle.tsx`
- MODIFY `src/app/admin/page.tsx` (add toggle card)

**Depends On:** Issue 9 (API)

**Acceptance Criteria:**
- [ ] Toggle card visible on admin overview
- [ ] Shows current track release state
- [ ] Confirmation prompt before toggling
- [ ] State persists across page reloads
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 11: Walk-in fast intake page + API

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 3.1
Depends on: Issue 1 (participant_type column)

**What to Build:**
`src/app/walkin/page.tsx` -- minimal fast intake form: name, email, phone, school, year. No team setup or skills. `src/app/api/walkin/route.ts` -- creates participant with participant_type='walk_in', checked_in=true. Duplicate email detection: if exists, return existing record instead.

**Read Before Implementing:**
1. `src/app/api/register/route.ts` -- participant insert pattern
2. `src/components/checkin/CheckinForm.tsx` -- "not found" state where walk-in link goes

**Files:**
- CREATE `src/app/walkin/page.tsx`
- CREATE `src/app/api/walkin/route.ts`
- CREATE `src/lib/validations-walkin.ts`

**Depends On:** Issue 1 (participant_type column)

**Acceptance Criteria:**
- [ ] Walk-in page collects only name, email, phone, school, year
- [ ] Creates participant_type='walk_in' with checked_in=true
- [ ] Duplicate email returns existing record
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 12: Link walk-in from check-in "not found" state

**Context:**
Existing: `src/components/checkin/CheckinForm.tsx`
Depends on: Issue 11 (walk-in page exists)

**What to Build:**
In the CheckinForm "not_found" state, add a "Register as walk-in" link/button that navigates to `/walkin`. Small, targeted change.

**Read Before Implementing:**
1. `src/components/checkin/CheckinForm.tsx` -- "not_found" render block

**Files:**
- MODIFY `src/components/checkin/CheckinForm.tsx` (add walk-in link)

**Depends On:** Issue 11 (walk-in page)

**Acceptance Criteria:**
- [ ] "Not found" state shows walk-in registration link
- [ ] Link navigates to /walkin
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

## Phase 4: Matching Upgrades

### Issue 13: AI tools diversity scoring function

**Context:**
Existing: `src/lib/matching/scoring.ts`
Depends on: Issue 2 (ai_tools in types)

**What to Build:**
Add `aiToolDiversityScore` function to scoring.ts. Similar pattern to skillCoverageScore but operates on ai_tools arrays. Update MatchInput type to include `aiTools: string[]`. Rebalance weights: role 30%, skill 25%, AI tools 20%, experience 15%, school 10%.

**Read Before Implementing:**
1. `src/lib/matching/scoring.ts` -- existing scoring functions
2. `src/lib/matching/types.ts` -- MatchInput interface

**Files:**
- MODIFY `src/lib/matching/scoring.ts` (add aiToolDiversityScore, rebalance weights)
- MODIFY `src/lib/matching/types.ts` (add aiTools to MatchInput + serialization)

**Depends On:** Issue 2 (types)

**Acceptance Criteria:**
- [ ] aiToolDiversityScore scores 0-1 based on unique tool coverage
- [ ] Weights rebalanced to include AI tools at 20%
- [ ] MatchInput includes aiTools field
- [ ] Existing tests/behavior preserved for empty ai_tools
- [ ] No TypeScript errors

---

### Issue 14: Wire ai_tools + members_requested into matching preview

**Context:**
Existing: `src/app/api/matching/preview/route.ts`
Depends on: Issue 13 (scoring uses aiTools), Issue 8 (members_requested persisted)

**What to Build:**
Update matching preview route to populate `aiTools` from participant data into MatchInput. Read `members_requested` from registration_groups and use it to prioritize partial teams (process them before pure solos in the algorithm's partitioning phase).

**Read Before Implementing:**
1. `src/app/api/matching/preview/route.ts` -- MatchInput construction
2. `src/lib/matching/algorithm.ts` -- partitionByGroup function

**Files:**
- MODIFY `src/app/api/matching/preview/route.ts` (populate aiTools)
- MODIFY `src/lib/matching/algorithm.ts` (prioritize partial teams with members_requested)

**Depends On:** Issue 13 (scoring), Issue 8 (members_requested)

**Acceptance Criteria:**
- [ ] aiTools populated from participant data in preview route
- [ ] Partial teams with members_requested > 0 processed before solos
- [ ] Existing matching behavior preserved for participants without ai_tools
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

## Phase 5: Admin Enhancements

### Issue 15: Admin participant type filter

**Context:**
Existing: `src/app/admin/participants/page.tsx`
Depends on: Issue 1 (participant_type column)

**What to Build:**
Add a participant_type dropdown filter alongside existing school/role/team filters. Options: All, Participant, Spectator, Walk-in. Filter applied to the existing filtered memo.

**Read Before Implementing:**
1. `src/app/admin/participants/page.tsx` -- existing filter pattern

**Files:**
- MODIFY `src/app/admin/participants/page.tsx` (add participant_type filter)

**Depends On:** Issue 1 (participant_type column)

**Acceptance Criteria:**
- [ ] Dropdown filter works for All/Participant/Spectator/Walk-in
- [ ] Combines correctly with existing search/school/role/team filters
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 16: Participant type badges in admin rows + stats

**Context:**
Existing: `src/components/admin/ParticipantRow.tsx`, `src/app/admin/page.tsx`
Depends on: Issue 15 (filter exists, data flowing)

**What to Build:**
Add colored type badge to each ParticipantRow (green=participant, gray=spectator, orange=walk_in). Update admin overview getStats to include participant_type breakdown. Update StatsOverview to render the breakdown.

**Read Before Implementing:**
1. `src/components/admin/ParticipantRow.tsx` -- row layout
2. `src/app/admin/page.tsx` -- getStats function
3. `src/components/admin/StatsOverview.tsx` -- stats display

**Files:**
- MODIFY `src/components/admin/ParticipantRow.tsx` (add type badge)
- MODIFY `src/app/admin/page.tsx` (type breakdown in getStats)
- MODIFY `src/components/admin/StatsOverview.tsx` (render type breakdown)

**Depends On:** Issue 1 (participant_type column)

**Acceptance Criteria:**
- [ ] Each row shows colored type badge
- [ ] Admin overview shows count by participant type
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 17: Team lock/unlock + complete/incomplete admin actions

**Context:**
Existing: `src/app/api/teams/[id]/route.ts`, `src/app/admin/teams/page.tsx`
Depends on: nothing beyond existing code

**What to Build:**
Add PATCH handler to teams API for lock/unlock and complete/incomplete mutations. Add action buttons to expanded team cards in admin teams page. Each action calls the API and refreshes the team list.

**Read Before Implementing:**
1. `src/app/api/teams/[id]/route.ts` -- existing team API
2. `src/app/admin/teams/page.tsx` -- expanded card layout
3. `src/lib/admin-auth.ts` -- verifyAdmin

**Files:**
- MODIFY `src/app/api/teams/[id]/route.ts` (add PATCH for lock/complete)
- CREATE `src/components/admin/TeamActions.tsx`
- MODIFY `src/app/admin/teams/page.tsx` (integrate TeamActions)

**Depends On:** `src/lib/admin-auth.ts` (already built)

**Acceptance Criteria:**
- [ ] Admin can lock/unlock a team
- [ ] Admin can mark team complete/incomplete
- [ ] Actions call API and refresh list
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 18: Team audit log schema + write-on-mutation

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 4.2
Depends on: Issue 17 (team mutations exist)

**What to Build:**
Migration `003_team_audit_log.sql` creating team_audit_log table (id, team_id, admin_id, action, details jsonb, created_at). Update teams PATCH handler to write audit entries on every mutation. Add TeamAuditEntry type.

**Read Before Implementing:**
1. `src/app/api/teams/[id]/route.ts` -- mutation handlers from Issue 17
2. `supabase/migrations/` -- migration naming pattern

**Files:**
- CREATE `supabase/migrations/003_team_audit_log.sql`
- MODIFY `src/app/api/teams/[id]/route.ts` (write audit log on mutations)
- MODIFY `src/types/index.ts` (add TeamAuditEntry type)

**Depends On:** Issue 17 (mutations to audit)

**Acceptance Criteria:**
- [ ] team_audit_log table created by migration
- [ ] Every lock/unlock/complete action writes audit entry
- [ ] Audit entry includes admin_id, action, timestamp
- [ ] No TypeScript errors

---

### Issue 19: Move participant between teams (modal + API)

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 4.2
Depends on: Issue 17 (team actions UI), Issue 18 (audit log)

**What to Build:**
Modal component that lets admin select a target team and move a participant. API mutation updates participant's team_id, recalculates aggregate_roles/skills on both source and target teams, writes audit log entry.

**Read Before Implementing:**
1. `src/app/admin/teams/page.tsx` -- team card where move button lives
2. `src/app/api/teams/[id]/route.ts` -- extend with move endpoint
3. `src/components/admin/TeamActions.tsx` -- trigger for modal

**Files:**
- CREATE `src/components/admin/MoveParticipantModal.tsx`
- MODIFY `src/app/api/teams/[id]/route.ts` (add move-participant mutation)
- MODIFY `src/components/admin/TeamActions.tsx` (add move button + modal trigger)

**Depends On:** Issue 17 (TeamActions), Issue 18 (audit log)

**Acceptance Criteria:**
- [ ] Modal shows list of teams to move participant to
- [ ] Move updates team_id and recalculates aggregates
- [ ] Audit log entry written
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 20: Enhanced check-in dashboard metrics

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 4.1
Existing: `src/components/admin/CheckinDashboard.tsx`

**What to Build:**
Add metric cards to CheckinDashboard: total checked in vs registered (progress bar), breakdown by participant type, breakdown by school, unassigned walk-in queue count. Static data fetch on mount (realtime comes in a separate issue).

**Read Before Implementing:**
1. `src/components/admin/CheckinDashboard.tsx` -- existing component
2. `src/components/admin/StatsOverview.tsx` -- stat card patterns

**Files:**
- MODIFY `src/components/admin/CheckinDashboard.tsx` (add metrics)
- CREATE `src/components/admin/CheckinMetrics.tsx`

**Depends On:** Issue 1 (participant_type for breakdown)

**Acceptance Criteria:**
- [ ] Check-in count vs total with progress bar
- [ ] Breakdown by participant type and school
- [ ] Walk-in queue count (unassigned walk-ins)
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 21: Check-in live feed with Supabase realtime

**Context:**
Existing: `src/components/admin/CheckinDashboard.tsx`
Depends on: Issue 20 (metrics component exists)

**What to Build:**
Add a live feed showing last 20 check-ins, auto-updating via Supabase realtime subscription on participants table (filter: checked_in changes). New component receives updates and prepends to list.

**Read Before Implementing:**
1. `src/lib/supabase/client.ts` -- browser client (supports realtime)
2. `src/components/admin/CheckinDashboard.tsx` -- where feed goes

**Files:**
- CREATE `src/components/admin/CheckinLiveFeed.tsx`
- MODIFY `src/components/admin/CheckinDashboard.tsx` (integrate live feed)

**Depends On:** Issue 20 (dashboard structure)

**Acceptance Criteria:**
- [ ] Live feed shows last 20 check-ins
- [ ] Auto-updates when new check-ins occur
- [ ] Realtime subscription properly cleaned up on unmount
- [ ] No TypeScript errors

---

## Phase 6: Landing Page

### Issue 22: Simplified top nav + sidebar menu

**Context:**
Transcript: `transcripts/granola2_21_organized.md` Section 2
Existing: `src/components/landing/Header.tsx`

**What to Build:**
Simplify header to 5 items: About, Prizes, Sponsors, Schedule, Register Now CTA. Add sidebar/drawer component for secondary content (Judging, Resources). Mobile hamburger menu. No tracks in nav (gated).

**Read Before Implementing:**
1. `src/components/landing/Header.tsx` -- current nav
2. `transcripts/granola2_21_organized.md` -- Section 2

**Files:**
- CREATE `src/components/landing/Sidebar.tsx`
- MODIFY `src/components/landing/Header.tsx` (simplified nav + sidebar trigger)

**Depends On:** Nothing -- independent

**Acceptance Criteria:**
- [ ] Top nav: About, Prizes, Sponsors, Schedule, Register Now
- [ ] Sidebar: Judging, Resources links
- [ ] No tracks in navigation
- [ ] Smooth scroll to sections works
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 23: Hero section mobile readability cleanup

**Context:**
Transcript: `transcripts/granola2_21_organized.md` Section 1
Existing: `src/components/landing/Hero.tsx`

**What to Build:**
Reduce visual density on mobile. Keep dark immersive theme. Ensure text is readable without squinting. Dial back floating elements/clutter on small screens. Add video embed placeholder (Ryan's recap video).

**Read Before Implementing:**
1. `src/components/landing/Hero.tsx` -- current hero component
2. `docs/DESIGN-CONSTRAINTS.md` -- styling rules

**Files:**
- MODIFY `src/components/landing/Hero.tsx` (mobile cleanup + video embed)

**Depends On:** Nothing

**Acceptance Criteria:**
- [ ] Hero text readable on mobile (375px width)
- [ ] Visual clutter reduced on small screens
- [ ] Video embed placeholder renders responsively
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 24: Prizes section

**Context:**
Old repo: `buildathon_fall_25/src/components/buildathon/PrizesSection.tsx`
Existing: current landing page sections in `src/components/landing/`

**What to Build:**
Prizes landing section with: $5,000+ prize display, prize item icons (3D Printers, Meta Quest, Ray-Bans, Watches, iPads), 1st/2nd/3rd place tiers, special Creative AI Thinking award. Clean Tailwind styling, NO Shadcn cards.

**Read Before Implementing:**
1. Old repo `PrizesSection.tsx` -- content to port (NOT the styling)
2. `src/components/landing/` -- existing section patterns
3. `docs/DESIGN-CONSTRAINTS.md` -- no card layouts

**Files:**
- CREATE `src/components/landing/Prizes.tsx`
- MODIFY `src/app/page.tsx` (add Prizes section)

**Depends On:** Nothing

**Acceptance Criteria:**
- [ ] Prize tiers and items displayed
- [ ] Special award section included
- [ ] NO Shadcn/Lovable card styling
- [ ] Mobile responsive
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 25: Sponsors section

**Context:**
Transcript: `transcripts/granola2_21_organized.md` Section 4e

**What to Build:**
Sponsors landing section, separate from prizes. Clean logo grid with sponsor names and links. Placeholder data until sponsors confirmed. Anchor-linked from top nav.

**Read Before Implementing:**
1. `src/components/landing/` -- existing section patterns
2. `docs/DESIGN-CONSTRAINTS.md`

**Files:**
- CREATE `src/components/landing/Sponsors.tsx`
- MODIFY `src/app/page.tsx` (add Sponsors section)

**Depends On:** Nothing

**Acceptance Criteria:**
- [ ] Sponsors section renders with placeholder data
- [ ] Separate from prizes section
- [ ] Mobile responsive
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 26: Judging rubric page/section

**Context:**
Old repo: `PrizesSection.tsx` had rubric inline
Transcript: goes in sidebar, not top nav

**What to Build:**
Judging rubric accessible from sidebar. Full 100-point breakdown: Problem Validation (20), Functional Prototype (25), Technical Innovation (20), Feasibility/Ethics (20), Presentation (15). Judging process: prelims, judge huddle, finals, ranked-choice crowd vote (80/20).

**Read Before Implementing:**
1. Old repo `PrizesSection.tsx` -- rubric content
2. `src/components/landing/Sidebar.tsx` -- link target

**Files:**
- CREATE `src/components/landing/JudgingRubric.tsx`
- MODIFY `src/app/page.tsx` (add Judging section with anchor)

**Depends On:** Issue 22 (sidebar links here)

**Acceptance Criteria:**
- [ ] Full 100-point rubric displayed
- [ ] Judging process explained (prelims, finals, crowd vote)
- [ ] Accessible from sidebar
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 27: Schedule section rebuild

**Context:**
Old repo: `ScheduleSection.tsx` -- 16 time blocks

**What to Build:**
Rebuild schedule as compact scannable timeline. Port the 16 time blocks from Fall '25 with placeholder times for Spring '26. Clean timeline layout (not card-per-item). Time, activity, description, location for each block.

**Read Before Implementing:**
1. Old repo `ScheduleSection.tsx` -- schedule data
2. `src/components/landing/` -- existing section patterns

**Files:**
- CREATE `src/data/schedule.ts` (schedule data)
- MODIFY `src/components/landing/Schedule.tsx` (rebuild with timeline)

**Depends On:** Nothing

**Acceptance Criteria:**
- [ ] All 16 time blocks displayed
- [ ] Compact timeline layout, not card soup
- [ ] Mobile responsive and scannable
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 28: AI tools & resources page

**Context:**
Old repo: `src/data/tools.ts` -- 27 tools
Transcript: `transcripts/granola2_21_organized.md` Section 3a

**What to Build:**
Port tools data from Fall '25. Create `/resources` page with category-based filtering (dropdown: repos / tools / learning). Cut Azure and Lovable. Clean list/grid layout with Tailwind -- no card soup.

**Read Before Implementing:**
1. Old repo `src/data/tools.ts` -- tools data
2. `transcripts/granola2_21_organized.md` -- Section 3a
3. `docs/DESIGN-CONSTRAINTS.md`

**Files:**
- CREATE `src/data/tools.ts`
- CREATE `src/app/resources/page.tsx`
- CREATE `src/components/resources/ToolsGrid.tsx`
- CREATE `src/components/resources/CategoryFilter.tsx`

**Depends On:** Issue 22 (sidebar links to /resources)

**Acceptance Criteria:**
- [ ] /resources page with all tools categorized
- [ ] Category filter dropdown works
- [ ] Azure and Lovable removed
- [ ] NO Shadcn card styling
- [ ] Mobile responsive
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 29: Discord community button + footer update

**Context:**
Transcript: `transcripts/granola2_21_organized.md` Section 4d

**What to Build:**
Discord as primary community CTA. Add DISCORD_URL and WHATSAPP_URL to constants. Floating or prominent Discord button on landing page. Footer: Discord primary, WhatsApp secondary.

**Read Before Implementing:**
1. `src/components/landing/Footer.tsx` -- current footer
2. `src/lib/constants.ts` -- where to add URLs

**Files:**
- MODIFY `src/lib/constants.ts` (add DISCORD_URL, WHATSAPP_URL)
- CREATE `src/components/landing/CommunityButton.tsx`
- MODIFY `src/components/landing/Footer.tsx` (Discord primary, WhatsApp secondary)

**Depends On:** Nothing

**Acceptance Criteria:**
- [ ] Discord is primary community link
- [ ] WhatsApp secondary in footer
- [ ] URLs configurable in constants
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 31: Generator logo banner

**Context:**
Transcript: `transcripts/granola2_21_organized.md` Section 4b
Old repo: `https://github.com/skarnz/buildathon_fall_25.git` -- check `public/` for existing Generator branding assets

**What to Build:**
Add proper Generator branding banner to top of landing page, above or integrated into the hero section. Pull any existing logo assets from the Fall '25 repo. If no suitable asset exists, create a clean text-based banner using Tailwind typography. Should feel like official Generator branding, not generic.

**Read Before Implementing:**
1. `src/components/landing/Hero.tsx` -- where banner integrates
2. `public/` -- existing assets in current repo
3. Fall '25 repo `public/` -- existing Generator logo/branding assets

**Files:**
- CREATE `src/components/landing/GeneratorBanner.tsx`
- MODIFY `src/app/page.tsx` (add banner above hero or integrate into hero)

**Depends On:** Nothing -- independent

**Acceptance Criteria:**
- [ ] Generator branding visible at top of landing page
- [ ] Uses existing logo asset from Fall '25 repo if available
- [ ] Mobile responsive
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 32: Registration info display section

**Context:**
Transcript: `transcripts/granola2_21_organized.md` Section 4c
Old repo: `https://github.com/skarnz/buildathon_fall_25.git` -- check for registration info content

**What to Build:**
Landing page section displaying key registration information: dates, requirements, what to bring, who can participate, team size limits. Clean readable layout -- NOT a card grid. Anchor-linked from nav or placed near the Register CTA so participants see it before registering.

**Read Before Implementing:**
1. `src/components/landing/` -- existing section patterns
2. `docs/DESIGN-CONSTRAINTS.md` -- styling rules
3. `src/lib/constants.ts` -- event config values to reference

**Files:**
- CREATE `src/components/landing/RegistrationInfo.tsx`
- MODIFY `src/app/page.tsx` (add registration info section)

**Depends On:** Nothing -- independent

**Acceptance Criteria:**
- [ ] Displays dates, requirements, eligibility, team size info
- [ ] Placed near Register CTA for visibility
- [ ] NO card grid layout
- [ ] Mobile responsive
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 33: Port photos from Fall '25

**Context:**
Transcript: `transcripts/granola2_21_organized.md` Section 3e
Old repo: `https://github.com/skarnz/buildathon_fall_25.git` -- `public/` contains: `hero-background.jpg`, `buildathon-team-photo.jpg`, `buildathon-judges-photo.jpg`, `b-thon_full_group_spring25.jpeg`

**What to Build:**
Copy photo assets from Fall '25 repo into `public/photos/`. Update hero section to use real event photos instead of AI-generated backgrounds. Add team/judges/group photos to an appropriate section (about or a photo gallery area). Ensure images are optimized with Next.js `<Image>` component.

**Read Before Implementing:**
1. Fall '25 repo `public/` -- identify all usable photo assets
2. `src/components/landing/Hero.tsx` -- current background image usage
3. `public/generated/` -- current AI-generated section backgrounds to potentially replace

**Files:**
- CREATE `public/photos/` (directory with copied assets)
- MODIFY `src/components/landing/Hero.tsx` (use real photo background)
- MODIFY `src/app/page.tsx` (add photos where appropriate)

**Depends On:** Nothing -- independent

**Acceptance Criteria:**
- [ ] Fall '25 photos copied to `public/photos/`
- [ ] Hero uses real event photo background
- [ ] Photos rendered with Next.js `<Image>` for optimization
- [ ] Mobile responsive
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

## Phase 7: Validation

### Issue 30: Simulation seed + validation scripts

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 5.1
Depends on: All prior backend issues

**What to Build:**
`scripts/seed-simulation.ts` -- seeds DB with: 50 solos, 10 full teams, 8 partial teams, 15 spectators, 10 walk-ins. Idempotent. `scripts/validate-simulation.ts` -- checks data integrity invariants. Add npm scripts.

**Read Before Implementing:**
1. `src/lib/supabase/admin.ts` -- admin client
2. `src/lib/constants.ts` -- valid enum values
3. `supabase/migrations/` -- full schema shape

**Files:**
- CREATE `scripts/seed-simulation.ts`
- CREATE `scripts/validate-simulation.ts`
- MODIFY `package.json` (add seed + validate scripts)

**Depends On:** All backend issues (tests full schema)

**Acceptance Criteria:**
- [ ] Seed creates all participant types
- [ ] Seed is idempotent
- [ ] Validation checks all integrity invariants
- [ ] Validation exits non-zero on failure
- [ ] No TypeScript errors

---

## Phase 5b: Admin Teams Management Backend

> Fills the admin/teams management gaps identified from the old buildathon-management system
> (github.com/cbrane/buildathon-management). The old system had create/delete/add-member/
> remove-member/unassigned-queue but was buggy -- inconsistent status flags, no audit trail,
> simplistic matching. These issues bring those requirements into the new architecture properly.

### Issue 34: Admin create team API

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 4.4
Existing: `src/app/api/matching/confirm/route.ts` creates teams from the algorithm with `generateInviteCode()`, aggregate computation, and participant `team_id` assignment. `src/app/api/teams/[id]/route.ts` has GET (single team) and PATCH (metadata update + audit log). There is currently NO way to manually create a team from the admin dashboard -- teams only come from registration (pre_formed) or matching (algorithm_matched).

**What to Build:**
`src/app/api/admin/teams/route.ts` -- POST endpoint for admin team creation.

Accepts JSON body:
```typescript
{
  name?: string;           // optional -- auto-generates "Team N" if omitted
  participant_ids: string[]; // 1-5 participant UUIDs to assign
}
```

Creates team row with `formation_type: "admin_assigned"`, `invite_code` from `generateInviteCode()`, `is_complete: participant_ids.length >= 5`, `is_locked: false`. Updates each participant's `team_id`. Computes `aggregate_roles` and `aggregate_skills` from assigned members (same pattern as `src/app/api/matching/confirm/route.ts` lines 68-82). Writes audit log entry with `action: "team_created"`. Returns created team with members array.

For auto-naming: query `SELECT MAX(CAST(SUBSTRING(name FROM 'Team (\d+)') AS INTEGER)) FROM teams` to find the next number.

### Integration:
- Called by the CreateTeamModal UI (Issue 38a)
- Uses `verifyAdmin()` from `src/lib/admin-auth.ts`
- Uses `generateInviteCode()` from `src/lib/utils.ts`
- Uses `createAdminClient()` from `src/lib/supabase/admin.ts`

**Read Before Implementing:**
1. `src/app/api/matching/confirm/route.ts` -- team insert + participant assignment + aggregate computation pattern to reuse
2. `src/app/api/teams/[id]/route.ts` -- audit log write pattern in the PATCH handler (lines 96-117)
3. `src/lib/admin-auth.ts` -- `verifyAdmin()` returns admin object with `id` for audit entries
4. `src/lib/utils.ts` -- `generateInviteCode()` uses nanoid(8)

**Files:**
- CREATE `src/app/api/admin/teams/route.ts`

**Depends On:**
- `src/lib/admin-auth.ts` (already built)
- `src/lib/utils.ts` (already built -- generateInviteCode)
- `supabase/migrations/003_team_audit_log.sql` (already built -- #30 closed)

**Acceptance Criteria:**
- [ ] POST creates team with `formation_type: "admin_assigned"`
- [ ] All participant_ids get their `team_id` set to the new team
- [ ] `aggregate_roles` and `aggregate_skills` computed from assigned members
- [ ] Auto-generates sequential team name when name not provided
- [ ] Rejects if any participant_id already has a team_id (409 response)
- [ ] Writes audit log entry with `action: "team_created"`
- [ ] Admin auth required (401 without token)
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 35: Delete/dissolve team API + audit

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 4.4
Existing: `src/app/api/teams/[id]/route.ts` has GET and PATCH handlers but NO DELETE. The PATCH handler already writes to `team_audit_log` on every field change (lines 96-117). `src/app/api/teams/[id]/move/route.ts` shows the pattern for resetting participant `team_id` and recomputing aggregates.
Old system: `storage.js` `deleteTeam()` reset all members to `team_id=null` then deleted the team row.

**What to Build:**
Add a DELETE handler to `src/app/api/teams/[id]/route.ts`.

Logic:
1. `verifyAdmin()` -- reject 401 if unauthorized
2. Fetch team by id -- reject 404 if not found
3. If `team.is_locked === true`, reject 400 with message "Unlock team before dissolving"
4. Count members via `SELECT * FROM participants WHERE team_id = :id`
5. Write audit entry: `{ team_id: id, admin_id: admin.id, action: "team_dissolved", details: { team_name: team.name, member_count, member_ids } }`
6. `UPDATE participants SET team_id = NULL WHERE team_id = :id`
7. `DELETE FROM teams WHERE id = :id`
8. Return `{ success: true, freed_participants: member_count }`

**Read Before Implementing:**
1. `src/app/api/teams/[id]/route.ts` -- existing GET/PATCH handlers, audit log write pattern (extend this file)
2. `src/app/api/teams/[id]/move/route.ts` -- pattern for resetting participant team_id (lines 100-105)
3. `src/types/index.ts` -- `TeamAuditEntry` interface shape

**Files:**
- MODIFY `src/app/api/teams/[id]/route.ts` (add DELETE export)

**Depends On:**
- `src/lib/admin-auth.ts` (already built)
- `supabase/migrations/003_team_audit_log.sql` (already built -- #30 closed)

**Acceptance Criteria:**
- [ ] DELETE resets all team members' `team_id` to null
- [ ] Deletes the team row from `teams` table
- [ ] Returns `{ success: true, freed_participants: N }`
- [ ] Rejects with 400 if team `is_locked`
- [ ] Writes `team_dissolved` entry to `team_audit_log` before deletion
- [ ] Admin auth required (401 without token)
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 36: Add/remove participant from team API

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 4.4
Existing: `src/app/api/teams/[id]/move/route.ts` moves a participant FROM one team TO another (handles team_id swap, aggregate recomputation, and audit logging). But there is no way to add an unassigned participant to a team, or remove a participant to the unassigned pool. The move route requires both source and target team -- it can't handle null on either side.
Old system: `storage.js` had `addMemberToTeam()` (collision check + team_id set) and `removeMemberFromTeam()` (team_id to null).

**What to Build:**
`src/app/api/teams/[id]/members/route.ts` -- two handlers:

**POST** (add members):
Accepts `{ participant_ids: string[] }`. Validates:
- Team exists and is not locked (400)
- Each participant exists (404 for any missing)
- No participant already has a non-null `team_id` (409, unless `force: true` in body)
- Team would not exceed 5 members after addition (400)
Updates participants' `team_id`. Recomputes `aggregate_roles`/`aggregate_skills` (same pattern as `move/route.ts` lines 118-131). Writes audit entries with `action: "member_added"`.

**DELETE** (remove member):
Accepts `{ participant_id: string }`. Validates participant exists and belongs to this team. Sets `team_id = null`. Recomputes aggregates. Writes audit entry with `action: "member_removed"`.

**Read Before Implementing:**
1. `src/app/api/teams/[id]/move/route.ts` -- aggregate recomputation pattern (lines 108-131) and audit log write pattern (lines 134-160)
2. `src/app/api/teams/[id]/route.ts` -- team fetch + admin auth pattern
3. `src/types/index.ts` -- `Participant` interface (team_id field), `TeamAuditEntry`

**Files:**
- CREATE `src/app/api/teams/[id]/members/route.ts`

**Depends On:**
- `src/lib/admin-auth.ts` (already built)
- `supabase/migrations/003_team_audit_log.sql` (already built -- #30 closed)

**Acceptance Criteria:**
- [ ] POST sets `team_id` on participants, 409 if already on another team
- [ ] POST rejects if team would exceed 5 members (400)
- [ ] POST rejects if team is locked (400)
- [ ] DELETE sets participant `team_id` to null
- [ ] Both recompute `aggregate_roles` and `aggregate_skills` on the team
- [ ] Both write audit log entries
- [ ] Admin auth required on both (401 without token)
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 37: Unassigned participants queue component

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 4.4
Existing: `src/app/admin/teams/page.tsx` fetches all participants via `createClient()` browser queries and groups them by `team_id` into team cards. Unassigned participants (those with `team_id = null`) are currently invisible on this page. `src/app/admin/participants/page.tsx` has a "No Team" filter but no assign action. `src/components/admin/MoveParticipantModal.tsx` shows the established modal + team selector UI pattern (fetches teams, shows member count, disables full/locked teams).

**What to Build:**
`src/components/admin/UnassignedQueue.tsx` -- client component that displays unassigned non-spectator participants below the teams grid on the admin teams page.

Props: `{ adminToken: string; onAssigned: () => void }`. On mount, queries Supabase browser client for participants where `team_id IS NULL` and `participant_type != 'spectator'`. Renders a collapsible section with:
- Header: "Unassigned Queue (N)" with expand/collapse toggle
- A compact list: each row shows `full_name`, `school`, `primary_role`, and an "Assign" button
- Clicking "Assign" opens an inline dropdown (not a modal) listing teams with `< 5 members` and `is_locked = false`, showing `team.name (M/5)` per option
- Selecting a team calls `POST /api/teams/[teamId]/members` with `{ participant_ids: [participantId] }`
- On success, calls `onAssigned()` prop to refresh parent and removes the participant from the local list

Uses `createClient()` from `src/lib/supabase/client.ts` for the initial fetch (same pattern as the teams page). No server-side API route needed -- the browser client can query participants directly, and assignment goes through the Issue 36 API.

**Read Before Implementing:**
1. `src/app/admin/teams/page.tsx` -- where this component gets mounted, existing data fetch pattern, `handleMatchingConfirmed` callback pattern for `onAssigned`
2. `src/components/admin/MoveParticipantModal.tsx` -- team selector pattern: fetching teams with member counts, disabling full/locked teams (lines 49-72)
3. `src/components/admin/TeamActions.tsx` -- existing action button patterns in the expanded card area
4. `src/components/ui/badge.tsx` -- Badge component for role/school display

**Files:**
- CREATE `src/components/admin/UnassignedQueue.tsx`
- MODIFY `src/app/admin/teams/page.tsx` (import and render `<UnassignedQueue>` below the teams grid, pass `adminToken` and `onAssigned={handleMatchingConfirmed}`)

**Depends On:**
- Issue 36 (members API -- POST endpoint for assignment)
- `src/lib/supabase/client.ts` (already built)

**Acceptance Criteria:**
- [ ] Component renders unassigned non-spectator participants with name, school, role
- [ ] "Assign" button opens inline team dropdown with available teams
- [ ] Selecting a team calls POST `/api/teams/[id]/members` and refreshes on success
- [ ] Full (5 members) and locked teams are disabled in the dropdown
- [ ] Collapsible section header shows live count
- [ ] Integrates into admin teams page below the teams grid
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 38a: Admin create team modal

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 4.4
Existing: `src/components/admin/MoveParticipantModal.tsx` is the established modal pattern -- uses `<Modal>` from `src/components/ui/modal.tsx`, fetches data on open, has loading/error states, confirmation button. `src/app/admin/teams/page.tsx` has a header area with the "Teams" heading where a "Create Team" button fits.

**What to Build:**
`src/components/admin/CreateTeamModal.tsx` -- modal to create a new team from unassigned participants.

Props: `{ open: boolean; onClose: () => void; adminToken: string; onCreated: () => void }`.

On open:
- Fetch unassigned non-spectator participants via browser Supabase client (`team_id IS NULL`, `participant_type != 'spectator'`)
- Display searchable list with checkboxes (search filters by `full_name` or `school`)
- Each row: checkbox, full_name, school, primary_role (using Badge)
- Optional team name input at top (placeholder: "Auto-generated if empty")
- "Create Team" button enabled when 2-5 participants selected
- On submit: call `POST /api/admin/teams` with `{ name?, participant_ids }` using adminToken
- On success: call `onCreated()` and close modal

Follow the `MoveParticipantModal` structure exactly: same Modal wrapper, same loading/error/moving state pattern, same button layout.

### Integration:
- Triggered from a "Create Team" button added to the teams page header (next to the "Teams" heading)
- Calls Issue 34 POST API
- `onCreated` triggers `handleMatchingConfirmed` in the teams page to refresh

**Read Before Implementing:**
1. `src/components/admin/MoveParticipantModal.tsx` -- modal structure to replicate (Modal wrapper, fetch on open, loading state, error display, action buttons)
2. `src/components/ui/modal.tsx` -- Modal component API (props: open, onClose, title)
3. `src/app/admin/teams/page.tsx` -- where "Create Team" button goes (header area, lines 115-123), `handleMatchingConfirmed` callback
4. `src/lib/supabase/client.ts` -- browser client for participant fetch

**Files:**
- CREATE `src/components/admin/CreateTeamModal.tsx`
- MODIFY `src/app/admin/teams/page.tsx` (add "Create Team" button in header, import and render modal)

**Depends On:**
- Issue 34 (create team API)
- `src/components/ui/modal.tsx` (already built)

**Acceptance Criteria:**
- [ ] Modal shows searchable list of unassigned non-spectator participants
- [ ] Checkbox selection with 2-5 participant constraint
- [ ] Optional team name input
- [ ] "Create Team" calls POST `/api/admin/teams` with selected participant IDs
- [ ] Success closes modal and refreshes teams list
- [ ] Error state displayed inline (same pattern as MoveParticipantModal)
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 38b: Dissolve team button + confirmation

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 4.4
Existing: `src/components/admin/TeamActions.tsx` renders lock/unlock and complete/incomplete buttons in the expanded team card area. It calls `PATCH /api/teams/${teamId}` via fetch with adminToken. `src/app/api/teams/[id]/route.ts` will have a DELETE handler (Issue 35).

**What to Build:**
Add a "Dissolve" button to `src/components/admin/TeamActions.tsx`. Renders as a destructive-styled button (red outline) below the existing lock/complete buttons. On click: shows a browser `confirm()` dialog: "Dissolve {teamName}? All {members.length} members will be returned to the unassigned pool." If confirmed, calls `DELETE /api/teams/${teamId}` with adminToken. On success, calls `onUpdated()` to refresh the teams page.

### Integration:
- Lives in `TeamActions` alongside existing lock/complete buttons
- Calls Issue 35 DELETE endpoint
- `onUpdated()` is already wired to refresh the teams page

**Read Before Implementing:**
1. `src/components/admin/TeamActions.tsx` -- existing button pattern, `patchTeam` helper function, loading state management
2. `src/app/api/teams/[id]/route.ts` -- DELETE handler response shape from Issue 35
3. `src/components/ui/button.tsx` -- Button variant props (need `variant="outline"` with red styling)

**Files:**
- MODIFY `src/components/admin/TeamActions.tsx` (add dissolve button + confirm handler)

**Depends On:**
- Issue 35 (DELETE endpoint on teams API)
- `src/components/admin/TeamActions.tsx` (already built -- #29 closed)

**Acceptance Criteria:**
- [ ] "Dissolve" button visible in expanded team card actions area
- [ ] `confirm()` dialog shows team name and member count
- [ ] DELETE call uses adminToken auth header
- [ ] Success triggers `onUpdated()` to refresh teams list
- [ ] Button disabled while any action is loading (reuses existing `loading` state)
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

## Phase 5c: Realtime + Event-Day Operations

### Issue 39: Realtime sync on admin teams page

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 3.2 (real-time team state model)
Existing: `src/app/admin/teams/page.tsx` fetches teams and participants on mount via `fetchData()`, and re-fetches after every action via `handleMatchingConfirmed()`. But if Admin A creates a team, Admin B's teams page doesn't update until they manually refresh. The old buildathon-management system had Supabase realtime subscriptions in `ManagementDashboard.jsx` (lines 82-138) and `ParticipantManagement.jsx` (lines 24-85) -- subscriptions on `participants`, `teams`, and `check_ins` tables with optimistic updates. That system worked for multi-station check-in.

**What to Build:**
Add Supabase realtime subscriptions to `src/app/admin/teams/page.tsx`. Subscribe to `postgres_changes` on both `teams` and `participants` tables. On any INSERT/UPDATE/DELETE event, call `fetchData()` to reload the full teams list. Use a debounce (300ms) to avoid rapid re-fetches when multiple rows change in a batch operation (e.g., dissolving a team updates N participants + deletes 1 team = N+1 events).

Implementation: use the `createClient()` browser client (already imported). Set up subscriptions in a `useEffect` with cleanup. The `channel` pattern:
```typescript
const channel = supabase.channel('admin-teams-realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, handleChange)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, handleChange)
  .subscribe();
```

Where `handleChange` debounces into `fetchData()`.

**Read Before Implementing:**
1. `src/app/admin/teams/page.tsx` -- existing `fetchData()` function (lines 30-56), `handleMatchingConfirmed` callback, `createClient` import
2. `src/components/admin/CheckinDashboard.tsx` -- if Issue 33 (realtime feed) is built by then, check its subscription pattern for consistency
3. `src/lib/supabase/client.ts` -- browser client supports `.channel()` and `.on('postgres_changes', ...)`

**Files:**
- MODIFY `src/app/admin/teams/page.tsx` (add useEffect with realtime subscriptions + debounced refetch + cleanup)

**Depends On:** Nothing -- standalone improvement to existing page

**Acceptance Criteria:**
- [ ] Teams page auto-updates when another admin creates/dissolves/modifies a team
- [ ] Teams page auto-updates when participants are assigned/removed from teams
- [ ] Debounce prevents rapid re-fetches during batch operations
- [ ] Subscription properly cleaned up on unmount (no memory leaks)
- [ ] No duplicate subscriptions on re-render
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 40a: Event-day quick-assign for unassigned participants

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 3.3 (live matching operation mode)
Existing: `src/components/admin/MatchingPreview.tsx` runs the full matching algorithm via `POST /api/matching/preview`. It processes ALL unassigned participants + all members on incomplete unlocked teams, runs `runMatching()` from `src/lib/matching/algorithm.ts`, and produces complete team formations. Admin reviews proposed teams and clicks "Confirm & Lock Teams" which creates new teams via `/api/matching/confirm`. This works for pre-event bulk matching but is heavy for event-day: you don't want to re-process everyone when 3 walk-ins just arrived.

**What to Build:**
Add a "Quick Assign" button to the `UnassignedQueue` component (Issue 37). When clicked, it calls `POST /api/matching/preview` (same existing endpoint -- it already only processes unassigned participants and incomplete teams). But instead of the full MatchingPreview card with stats/team cards/review, it shows a lightweight confirmation: "Assign N participants to M teams?" with a summary list of assignments, then calls `/api/matching/confirm` on confirm.

Implementation in `UnassignedQueue.tsx`:
- Add a "Quick Assign All" button in the queue header (next to the collapse toggle)
- On click: fetch `/api/matching/preview` with adminToken
- Show results inline in the queue: for each proposed team, show "Participant A, B, C -> Team N (score: X)"
- "Confirm All" button calls `/api/matching/confirm` then triggers `onAssigned()`
- "Cancel" dismisses the preview

This reuses the existing matching algorithm and API -- no new backend work. The only change is a lighter UI for reviewing results.

**Read Before Implementing:**
1. `src/components/admin/UnassignedQueue.tsx` -- where button goes (must be built first via Issue 37)
2. `src/components/admin/MatchingPreview.tsx` -- existing preview/confirm flow to simplify (fetch pattern lines 32-55, confirm pattern lines 57-87)
3. `src/app/api/matching/preview/route.ts` -- response shape: `{ poolStats, matchResult: SerializedMatchOutput }`
4. `src/app/api/matching/confirm/route.ts` -- request shape: `{ matches: [{ team_id, participant_ids }] }`
5. `src/lib/matching/types.ts` -- `SerializedMatchOutput` and `SerializedDraftTeam` interfaces

**Files:**
- MODIFY `src/components/admin/UnassignedQueue.tsx` (add quick-assign button, inline preview, confirm action)

**Depends On:**
- Issue 37 (UnassignedQueue component must exist)
- `src/app/api/matching/preview/route.ts` (already built -- #26 closed)
- `src/app/api/matching/confirm/route.ts` (already built)

**Acceptance Criteria:**
- [ ] "Quick Assign All" button visible in unassigned queue header
- [ ] Calls existing matching preview API and shows assignment summary inline
- [ ] "Confirm All" calls existing matching confirm API
- [ ] On success, triggers refresh of teams list and unassigned queue
- [ ] "Cancel" dismisses the preview without making changes
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

### Issue 40b: Simplify admin login to shared password

**Context:**
Plan: `docs/SPRING_26_MASTER_PLAN.md` Phase 4 (admin command center)
Existing auth flow is fragmented and over-complicated for a one-day event:
- `src/app/admin/login/page.tsx` -- Supabase magic link OTP to admin email
- `src/middleware.ts` -- checks Supabase session, redirects to login if missing
- `src/app/admin/layout.tsx` -- verifies session email is in `admins` table
- `src/lib/admin-auth.ts` -- API routes check `Authorization: Bearer <email>` against `admins` table
- `src/app/admin/teams/page.tsx` -- gets token from `sessionStorage.getItem("admin_token")` (inconsistent with other pages that use `session.user.email`)

Problems: magic links require email delivery (unreliable at event venues), multiple email accounts need to be in the `admins` table, and the Bearer token pattern is inconsistent across components. For a buildathon with 3-5 organizers, a shared password is simpler and more reliable.

**What to Build:**
Replace the magic link login with a password form. Add `ADMIN_PASSWORD` to environment variables (`.env.local`). Change the login page to a single password input field. On submit, compare against `ADMIN_PASSWORD` server-side via a new `POST /api/admin/auth` route that returns a session token (a signed JWT or a simple hash). Store the token in `sessionStorage` as `admin_token`. Update `verifyAdmin()` in `src/lib/admin-auth.ts` to validate this token instead of looking up emails in the `admins` table. Update the middleware to check for the session token cookie/header instead of Supabase auth session.

The `admins` table stays for audit log attribution (`admin_id` on audit entries) but is no longer used for authentication -- just for identity display. The layout can show "Admin" instead of a specific name, or we can add an optional name prompt after password entry.

**Read Before Implementing:**
1. `src/app/admin/login/page.tsx` -- current magic link form to replace with password input
2. `src/lib/admin-auth.ts` -- `verifyAdmin()` function to simplify (currently queries `admins` table by email)
3. `src/middleware.ts` -- session check logic to update (currently uses Supabase auth)
4. `src/app/admin/layout.tsx` -- auth check on mount + admin name display (lines 40-68)
5. `src/components/admin/TrackReleaseToggle.tsx` -- example of `session.user.email` token pattern (line 23)
6. `src/app/admin/teams/page.tsx` -- example of `sessionStorage.getItem("admin_token")` pattern (line 26)

**Files:**
- CREATE `src/app/api/admin/auth/route.ts` (POST: validate password, return token)
- MODIFY `src/app/admin/login/page.tsx` (replace magic link with password form)
- MODIFY `src/lib/admin-auth.ts` (validate token instead of email lookup)
- MODIFY `src/middleware.ts` (check for admin token cookie instead of Supabase session)
- MODIFY `src/app/admin/layout.tsx` (simplify auth check, remove Supabase session dependency)

**Depends On:** Nothing -- can be done independently. All existing admin components already pass `adminToken` to API calls.

**Acceptance Criteria:**
- [ ] Password form replaces magic link on `/admin/login`
- [ ] Correct password grants access to all admin routes
- [ ] Wrong password shows error, no access
- [ ] `ADMIN_PASSWORD` is in environment variable, not hardcoded
- [ ] All existing admin API routes still work with the new token
- [ ] Token persists in sessionStorage (survives page refresh within tab)
- [ ] Logout clears token and redirects to login
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors

---

## Dependency Graph

```
Issue 1 (Migration) ── foundational
  └── Issue 2 (Types + constants)
        ├── Issue 3 (Spectator UI)
        │     └── Issue 4 (Spectator API)
        ├── Issue 5 (AI tools component)
        │     └── Issue 6a (Wire AI tools UI)
        │           └── Issue 6b (AI tools validation + API)
        ├── Issue 7 (Partial team UI)
        │     └── Issue 8 (Persist members_requested)
        └── Issue 13 (AI tools scoring)
              └── Issue 14 (Wire into matching)

Issue 1 → Issue 9 (Track API) → Issue 10 (Track toggle UI)
Issue 1 → Issue 11 (Walk-in) → Issue 12 (Link from check-in)
Issue 1 → Issue 15 (Admin filter) → Issue 16 (Badges + stats)
Issue 17 (Team actions) → Issue 18 (Audit log) → Issue 19 (Move modal)
Issue 1 → Issue 20 (Check-in metrics) → Issue 21 (Realtime feed)

Issue 34 (Create team API) → Issue 38a (Create team modal)
Issue 35 (Delete team API) → Issue 38b (Dissolve button)
Issue 36 (Add/remove member) → Issue 37 (Unassigned queue) → Issue 40a (Quick assign)
Issue 39 (Realtime teams) -- independent
Issue 40b (Admin password login) -- independent

Issue 22 (Nav) → Issues 26, 28 (sidebar targets)
Issues 23-25, 27, 29, 31-33 -- independent frontend
Issue 30 (Simulation) -- last
```

## Implementation Order

**Backend (sequential chains):**
1. Issue 1 → 2 (schema + types)
2. Issues 3→4, 5→6a→6b, 7→8 (registration paths -- 3 parallel chains)
3. Issue 9→10, 11→12 (track gating + walk-in -- parallel)
4. Issue 13→14 (matching upgrades)
5. Issues 15→16, 17→18→19, 20→21 (admin -- 3 parallel chains)
6. Issues 34, 35, 36, 39, 40b (all parallel -- no cross-deps)
7. Issues 37, 38a, 38b (UI -- parallel: 37 depends on 36, 38a depends on 34, 38b depends on 35)
8. Issue 40a (quick assign -- depends on 37)
9. Issue 30 (simulation -- last)

**Frontend (parallel with backend):**
1. Issues 22, 23 (nav + hero -- parallel)
2. Issues 24, 25, 27, 29, 31, 32, 33 (sections -- all parallel, independent)
3. Issues 26, 28 (depend on sidebar from 22)
