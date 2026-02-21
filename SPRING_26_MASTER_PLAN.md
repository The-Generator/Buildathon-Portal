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

## Dependency Order
1. Phase 1 must complete before any behavior-changing implementation.
2. Phase 2 policy controls must land before opening Spring 2026 registration.
3. Phase 3 real-time operations depend on final policy + schema mapping.
4. Phase 4 command center should iterate in parallel with Phase 3 once core data contracts stabilize.
5. Phase 5 is mandatory before production launch.

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
