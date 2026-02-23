# Spring 2026 Master Plan (`master-updates-spring-26`)

## Goal
Ship a registration + event-day operations system that preserves Jotform logic, enables real-time walk-in team orchestration, and prevents pre-built team advantage before official release windows.

## Phase 1 — Freeze and Map Registration Logic

### Issue 1.1: Create canonical Jotform logic spec
- **Outcome:** one source of truth for all branching/validation behavior.
- **Scope:** map QIDs, required fields, conditions, and path permutations.
- **Acceptance criteria:** every `setConditions` rule is represented in app-readable form.

### Issue 1.2: Build form-to-schema mapping matrix
- **Outcome:** explicit mapping from Jotform fields to `participants`, `registration_groups`, `teams`.
- **Scope:** define data types, nullability, enum constraints, migration gaps.
- **Acceptance criteria:** no unmapped Jotform field used by matching or operations.

## Phase 2 — Registration Policy and Anti-Prebuild Controls

### Issue 2.1: Registration policy engine
- **Outcome:** policy layer enforcing who can register as individual/partial/full/spectator.
- **Scope:** role/path guards, deadline windows, team-size constraints.
- **Acceptance criteria:** policy decisions are deterministic and test-covered.

### Issue 2.2: Pre-build prevention controls
- **Outcome:** block pre-formation abuse before event-day official matching windows.
- **Scope:** enforce hold states, lock team edits, defer track/theme release.
- **Acceptance criteria:** users cannot finalize strategic team composition before allowed time.

### Issue 2.3: Track/theme release gating
- **Outcome:** no early track release.
- **Scope:** admin-controlled release toggle + audit events.
- **Acceptance criteria:** participant-facing endpoints return gated state until release action.

## Phase 3 — Walk-In and Real-Time Team Operations

### Issue 3.1: Walk-in intake flow
- **Outcome:** fast check-in flow for late arrivals and no-pre-reg participants.
- **Scope:** queue state, duplicate detection, instant profile capture.
- **Acceptance criteria:** intake can process high throughput with clear statuses.

### Issue 3.2: Real-time team state model
- **Outcome:** authoritative team occupancy + composition model.
- **Scope:** team capacity, lock state, eligibility, assignment provenance.
- **Acceptance criteria:** every participant has one valid team state at all times.

### Issue 3.3: Live matching operation mode
- **Outcome:** event-day matching tool for incomplete teams and solo participants.
- **Scope:** balancing constraints (skills/themes/schools), manual overrides, rollback.
- **Acceptance criteria:** admins can run/re-run matching safely during live operations.

## Phase 4 — Admin Command Center

### Issue 4.1: Operational dashboard v1
- **Outcome:** single-pane event status (capacity, check-in, team completion, queue depth).
- **Scope:** metrics cards, real-time updates, alert states.
- **Acceptance criteria:** dashboard reflects source-of-truth within acceptable latency.

### Issue 4.2: Team intervention tools
- **Outcome:** admin actions for lock/unlock, move participant, merge/split teams.
- **Scope:** guarded mutations with confirmation + audit log.
- **Acceptance criteria:** all interventions are reversible or compensatable.
- **Draft Issues:** #17 (lock/unlock/complete), #18 (audit log), #19 (move participant modal)

### Issue 4.4: Admin teams CRUD + unassigned queue
- **Outcome:** admins can create teams manually, dissolve teams, add/remove members, and view unassigned participants.
- **Scope:** full team lifecycle management from admin dashboard. Replaces broken flows from old buildathon-management system (manual team creation, member assignment, team dissolution, seeker queue).
- **Acceptance criteria:** admin can create a team from unassigned participants, dissolve a team returning members to unassigned pool, add/remove individual members, and view a live queue of unassigned non-spectator participants.
- **Draft Issues (7 right-sized issues, 3-8 files each):**
  - **Backend (parallel):** #34 (create team API -- 1 file), #35 (dissolve team API -- 1 file modified), #36 (add/remove member API -- 1 file)
  - **Frontend (each depends on its backend):** #37 (unassigned queue component -- 2 files), #38a (create team modal -- 2 files), #38b (dissolve button -- 1 file modified)

### Issue 4.5: Realtime + event-day operations
- **Outcome:** teams page auto-syncs across multiple admin stations; event-day quick-assign for walk-ins; simplified admin login.
- **Scope:** realtime subscriptions on teams page, lightweight matching UI on unassigned queue, shared password auth replacing magic links.
- **Acceptance criteria:** Admin A's changes appear on Admin B's screen within 1s. Walk-in batch assignment takes < 30 seconds. Admin login works without email delivery.
- **Draft Issues:** #39 (realtime sync -- 1 file), #40a (quick assign -- 1 file), #40b (admin password login -- 5 files)

### Issue 4.3: Incident fallback mode
- **Outcome:** resilient operation during partial outages.
- **Scope:** degraded workflow, manual queue export/import, recovery checklist.
- **Acceptance criteria:** event operations continue even if matching service is unavailable.

## Phase 5 — Validation, Simulation, and Rollout

### Issue 5.1: End-to-end simulation suite
- **Outcome:** replayable day-of scenarios (full teams, partial teams, walk-ins, spectators).
- **Scope:** scripted seed data + deterministic runbook tests.
- **Acceptance criteria:** all critical flows pass before launch.

### Issue 5.2: Operational runbook and staffing protocol
- **Outcome:** clear event-day SOP for admins and volunteers.
- **Scope:** playbooks for check-in, matching waves, exceptions, escalation.
- **Acceptance criteria:** dry run executed with no unresolved blockers.

### Issue 5.3: Launch readiness gate
- **Outcome:** go/no-go checklist with owner signoff.
- **Scope:** lint/type/tests, security review, data integrity checks, rollback plan.
- **Acceptance criteria:** all critical checks green; unresolved risks documented and approved.

## Phase 6 -- Participant Networking Directory

### Issue 6.1: Profile fields + schema migration
- **Outcome:** linkedin_url, portfolio_url, bio, profile_visible columns on participants.
- **Scope:** migration, type updates, validation schema, registration form fields.
- **Acceptance criteria:** registration collects optional profile data; profile_visible defaults false.
- **Issues:** #55 (draft Issue 41)

### Issue 6.2: Public directory page + profile card
- **Outcome:** public "Meet the Builders" page showing opted-in participants.
- **Scope:** filterable grid (school, role, name search), profile cards with social links.
- **Acceptance criteria:** only profile_visible=true shown; no email/phone exposed.
- **Issues:** #56, #57 (draft Issues 42, 43)

## Dependency Order
1. Phase 1 must complete before any behavior-changing implementation.
2. Phase 2 policy controls must land before opening Spring 2026 registration.
3. Phase 3 real-time operations depend on final policy + schema mapping.
4. Phase 4 command center should iterate in parallel with Phase 3 once core data contracts stabilize.
5. Phase 5 is mandatory before production launch.
6. Phase 6 can be built in parallel with Phase 4/5 (no blocking dependencies).

## Suggested GitHub Labels
- `spring-26`
- `master-updates-spring-26`
- `registration-logic`
- `walk-in-ops`
- `admin-command-center`
- `blocking`

## Immediate Backlog Cut (Create First)
1. Canonical Jotform logic spec
2. Form-to-schema mapping matrix
3. Registration policy engine
4. Pre-build prevention controls
5. Walk-in intake flow
6. Real-time team state model
