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

### Issue 6: Wire AI tools into registration flow + API

**Context:**
Existing: `src/components/registration/StepPersonalInfo.tsx`, `src/app/api/register/route.ts`
Depends on: Issue 5 (AiToolsSelector component), Issue 2 (types)

**What to Build:**
Add the AiToolsSelector to StepPersonalInfo below the skills section. Add `ai_tools` field to RegistrationFormData, Zod step 1 schema, and full registration schema. Wire through to StepReview display. Update registration API to persist ai_tools to participant record.

**Read Before Implementing:**
1. `src/components/registration/StepPersonalInfo.tsx` -- where to add the selector
2. `src/lib/validations.ts` -- step 1 schema to extend
3. `src/app/api/register/route.ts` -- participant insert to extend
4. `src/components/registration/StepReview.tsx` -- review display

**Files:**
- MODIFY `src/components/registration/StepPersonalInfo.tsx` (add AiToolsSelector)
- MODIFY `src/lib/validations.ts` (add ai_tools to schemas)
- MODIFY `src/app/api/register/route.ts` (persist ai_tools)
- MODIFY `src/components/registration/StepReview.tsx` (display ai_tools)

**Depends On:** Issue 5 (component), Issue 2 (types/constants)

**Acceptance Criteria:**
- [ ] AI tools selector visible in Step 1 below skills
- [ ] Selected tools appear in Review step
- [ ] ai_tools persisted to participants table
- [ ] Validation allows empty array (optional field)
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

## Dependency Graph

```
Issue 1 (Migration) ── foundational
  └── Issue 2 (Types + constants)
        ├── Issue 3 (Spectator UI)
        │     └── Issue 4 (Spectator API)
        ├── Issue 5 (AI tools component)
        │     └── Issue 6 (Wire AI tools)
        ├── Issue 7 (Partial team UI)
        │     └── Issue 8 (Persist members_requested)
        └── Issue 13 (AI tools scoring)
              └── Issue 14 (Wire into matching)

Issue 1 → Issue 9 (Track API) → Issue 10 (Track toggle UI)
Issue 1 → Issue 11 (Walk-in) → Issue 12 (Link from check-in)
Issue 1 → Issue 15 (Admin filter) → Issue 16 (Badges + stats)
Issue 17 (Team actions) → Issue 18 (Audit log) → Issue 19 (Move modal)
Issue 1 → Issue 20 (Check-in metrics) → Issue 21 (Realtime feed)

Issue 22 (Nav) → Issues 26, 28 (sidebar targets)
Issues 23-25, 27, 29 -- independent frontend
Issue 30 (Simulation) -- last
```

## Implementation Order

**Backend (sequential chains):**
1. Issue 1 → 2 (schema + types)
2. Issues 3→4, 5→6, 7→8 (registration paths -- 3 parallel chains)
3. Issue 9→10, 11→12 (track gating + walk-in -- parallel)
4. Issue 13→14 (matching upgrades)
5. Issues 15→16, 17→18→19, 20→21 (admin -- 3 parallel chains)
6. Issue 30 (simulation -- last)

**Frontend (parallel with backend):**
1. Issues 22, 23 (nav + hero -- parallel)
2. Issues 24, 25, 27, 29 (sections -- parallel)
3. Issues 26, 28 (depend on sidebar from 22)
