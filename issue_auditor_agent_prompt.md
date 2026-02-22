# Post-Implementation Audit Guide

> Final quality pass for every Buildathon-Portal issue. Run this after the coder session completes, before considering the issue done.

---

## Why This Exists

Opus 4.6 coding sessions reliably produce these artifacts:

- **Dead code**: Unused imports, unreachable branches, commented-out blocks left behind
- **Partial integrations**: New component built but never wired into navigation, page, or parent layout
- **Floating state**: New fields added to types but never read, or read but never written
- **Style drift**: Hardcoded colors instead of Tailwind tokens, Shadcn/Lovable patterns sneaking in, missing mobile styles
- **Broken mobile**: Layouts that overflow on 375px, text too small to read, cramped cards
- **Silent TypeScript**: `as any` casts, suppressed errors, loose types where interfaces exist
- **Stale plan references**: Issue says MODIFY file X but coder skipped it or modified the wrong section

This audit catches all of that in a single focused pass.

---

## Audit Prompt

Copy this block into a fresh Droid session. Replace `{ISSUE_NUMBER}` with the GitHub issue number.

````
You are the final audit layer for Buildathon-Portal issue **#{ISSUE_NUMBER}**.

Your job: strict quality pass on everything the coder session touched. Verify correctness, remove junk, fix anything broken or incomplete. If everything is already clean, report that and make no unnecessary changes.

### Do this in order

1. **Gather context**
   - Run: `git log --oneline -10`, `git status`
   - Run: `gh issue view {ISSUE_NUMBER} --json title,body`
   - Read: `AGENTS.md` (project context)
   - Read: `docs/ISSUE-CREATION-GUIDE-1.md` (standards)
   - Read: `docs/DESIGN-CONSTRAINTS.md` (hard UI rules)
   - Read: `src/lib/constants.ts`, `src/types/index.ts`, `src/lib/validations.ts`

2. **Read the issue's "Files" section**
   - For every CREATE file: verify it exists and is fully implemented
   - For every MODIFY file: verify the described change was actually made
   - Flag any files the issue mentions that were skipped

3. **Read the issue's "Read Before Implementing" files**
   - Verify the coder followed patterns from those files
   - Check for style consistency with adjacent code

4. **Audit the implementation end-to-end**

   Run each check below. Fix real problems. Do not refactor working code for style preference.

   **a. Dead Code**
   - Unused imports (grep for imported names not used in the file)
   - Unused variables, functions, interfaces, types
   - Commented-out code blocks (remove unless marked `// TODO: #issue-number`)
   - Console.log statements left behind

   **b. Integration Completeness**
   - If a new page was created: is it reachable from navigation or a link?
   - If a new component was created: is it imported and rendered in a parent?
   - If props were added to an interface: are they passed by callers?
   - If a new API route was created: is it called from somewhere?
   - If a new Zod schema was created: is it used in validation?

   **c. TypeScript Quality**
   - No `as any` casts
   - No `@ts-ignore` or `@ts-expect-error` without comment
   - Exported interfaces/types are used by at least one consumer
   - Types in `src/types/index.ts` match the DB schema in `supabase/migrations/`

   **d. Design System Compliance**
   - NO Shadcn, Radix, MUI, or any UI component library imports
   - NO Lovable/vibecoded card layouts (generic grid cards with icons)
   - Colors use Tailwind utility classes -- no hardcoded hex values
   - UI primitives come from `src/components/ui/` -- not external packages
   - Dark immersive theme maintained (current design direction)
   - See `docs/DESIGN-CONSTRAINTS.md` for full rules

   **e. Mobile-First UX**
   - All layouts work at 375px width without horizontal overflow
   - Text is readable without squinting on mobile
   - Interactive elements have reasonable tap targets (min ~44px)
   - No cramped, visually overwhelming layouts
   - Responsive breakpoints: mobile (375px), tablet (768px), desktop (1024px+)

   **f. Supabase / Data Patterns**
   - Browser components use `src/lib/supabase/client.ts`
   - Server components use `src/lib/supabase/server.ts`
   - API routes use `src/lib/supabase/admin.ts`
   - Admin API routes call `verifyAdmin()` from `src/lib/admin-auth.ts`
   - Zod validation on all form inputs (schemas in `src/lib/validations.ts`)
   - No raw SQL -- use Supabase query builder

   **g. Registration / Jotform Parity**
   - If registration flow was modified: check against `docs/jotform/JOTFORM_LOGIC_EXTRACT.md`
   - Conditional field visibility matches Jotform conditions
   - Field options match Jotform dropdown values

   **h. Security / Secrets**
   - No API keys, tokens, or credentials in committed code
   - No `console.log` of user data or state dumps
   - No hardcoded Supabase URLs or keys (must come from env vars)
   - Admin routes properly gated with `verifyAdmin()`

5. **Build verification**
   - Run: `npm run lint`
   - Run: `npx tsc --noEmit`
   - Run: `npm run build`
   - All pages compile, zero errors
   - If build fails, fix the errors

6. **Commit and push**
   - Before committing: `git diff --cached` and `git status` -- verify no secrets
   - Commit format: `audit(<scope>): <description> (#ISSUE_NUMBER)`
   - If no changes needed: do not create an empty commit
   - Push to `main`

### Rules
- ONE issue per audit session
- No unnecessary refactors -- only fix real problems
- Follow existing code patterns in adjacent files
- Do not modify `AGENTS.md`, `CLAUDE.md`, `README.md`, or plan docs
- Do not close or comment on the GitHub issue
- If a problem is too large to fix in the audit (architectural, needs redesign), note it in the report and move on

### Report

After completing the audit, provide:

```
## Audit Report: #{ISSUE_NUMBER}

### Files Audited
- {list of files read/checked}

### Issues Found & Fixed
- {description of each fix, or "None -- implementation was clean"}

### Issues Found & NOT Fixed (out of scope)
- {anything too large for audit, or "None"}

### Build Status
- {pass/fail, any warnings}

### Commit
- {hash and message, or "No changes needed"}

### Acceptance Criteria Status
- [ ] {copy each criterion from the issue, mark checked/unchecked}
```
````

---

## When to Run This

Run an audit session after every coder session that implements an issue. The workflow is:

```
1. Coder session  -->  implements issue, commits, pushes
2. Audit session  -->  reviews, fixes, commits, pushes (this guide)
3. Visual check   -->  you (human) verify in browser
```

---

## Common Fixes by Issue Type

### Registration Path Issues (Issues 3-8)
Most common problems:
- Zod schema updated but not used in the right step validation
- New field added to form but not passed through to API
- Conditional visibility logic doesn't match Jotform conditions
- Missing RegistrationFormData type updates

### Admin Issues (Issues 15-21)
Most common problems:
- New admin API route missing `verifyAdmin()` call
- New component exists but not imported in admin page
- Stats queries don't account for new participant_type values
- Audit log writes missing on some mutation paths

### Landing Page Issues (Issues 22-33)
Most common problems:
- Shadcn/Lovable card patterns sneaking in (HARD REJECT)
- New section created but not added to `src/app/page.tsx`
- Missing mobile responsive styles at 375px
- Hardcoded colors instead of Tailwind utilities
- Section not anchor-linked from navigation

### Matching Issues (Issues 13-14)
Most common problems:
- Weight rebalancing doesn't sum to 1.0
- New scoring function returns outside 0-1 range
- MatchInput type updated but serialization missed
- Empty ai_tools array causes division by zero

---

## Reference: Buildathon-Portal File Map

```
Key Files (read these during every audit):
  AGENTS.md                              -- Project context for AI agents
  docs/DESIGN-CONSTRAINTS.md             -- Hard UI/UX rules
  src/lib/constants.ts                   -- All enums, option arrays, event config
  src/types/index.ts                     -- TypeScript interfaces (match DB schema)
  src/lib/validations.ts                 -- Zod schemas for all forms
  src/lib/admin-auth.ts                  -- Shared admin verification
  src/lib/supabase/admin.ts              -- Service role Supabase client

Page Routes:
  /                                      -- Landing page (hero, about, prizes, etc.)
  /register                              -- Registration wizard (4 steps)
  /checkin                               -- Public check-in page
  /walkin                                -- Walk-in fast intake (event day)
  /resources                             -- AI tools & resources
  /admin                                 -- Admin dashboard overview
  /admin/participants                    -- Participant management
  /admin/teams                           -- Team management
  /admin/checkin                         -- Check-in dashboard

Database:
  supabase/migrations/001_initial_schema.sql  -- Base schema
  supabase/migrations/002_spring26_schema.sql -- Spring '26 additions
```

---

## Reference: Commit Message Format

```
audit(<scope>): <description> (#ISSUE_NUMBER)
```

Scope examples: `registration`, `admin`, `matching`, `landing`, `walkin`, `checkin`, `schema`, `nav`.

Examples:
- `audit(registration): Remove dead imports and fix spectator validation gap (#15)`
- `audit(landing): No changes needed -- implementation clean (#36)`
- `audit(admin): Fix missing verifyAdmin call on team PATCH route (#29)`
