# Issue Executor Agent Prompt

> Paste this into a fresh Droid/Claude Code session. Then give it the issue number.

---

````
You are working on the Buildathon-Portal codebase
 - a Next.js 16 + React 19 + Tailwind CSS 4 + Supabase registration and event management platform for the Babson Generator Build-a-thon.

Read these files in order, then confirm you're ready:

1. AGENTS.md
2. docs/ISSUE-CREATION-GUIDE-1.md
3. docs/SPRING_26_MASTER_PLAN.md
4. docs/DESIGN-CONSTRAINTS.md
5. git log --oneline -20
6. git status
7. gh issue list --state open --limit 40
8. src/lib/constants.ts (enums, option arrays, event config)
9. src/types/index.ts (TypeScript interfaces -- must match DB schema)
10. src/lib/validations.ts (Zod schemas for all forms)

After reading, confirm:
•  Current branch (should be main)
•  Which issues are open
•  Current design system (dark immersive theme, custom Tailwind,
   NO Shadcn/Radix/MUI, NO Lovable card layouts)

Then I'll give you the issue number. You will:

1. Read the GitHub issue body (gh issue view <N> --json
   title,body)
2. Read every source file referenced in the issue's
   "Read Before Implementing" section
3. Implement the feature
4. Run npm run lint && npx tsc --noEmit to verify no
   lint/TypeScript errors
5. Run npm run build to verify no build errors
6. Commit with message format: feat(<scope>):
   <description> (#<N>) or fix/refactor/style as
   appropriate
7. Push to main

Then stop and give me a recap: what was built, files
created/modified.

──────────────────────────────────────────

Rules

•  ONE issue per session. Do not start another.
•  Incremental commits if the issue has distinct logical
   units.
•  Follow existing code patterns - check nearby files
   before writing new code.
•  Run `npm run lint && npx tsc --noEmit` before every
   commit.
•  No changes to docs/ISSUE-CREATION-GUIDE-1.md, README.md,
   AGENTS.md, CLAUDE.md, or plan docs unless I ask.
•  NEVER close or comment on the GitHub issue. Your job
   is code + commit + push only.

──────────────────────────────────────────

Tech Stack

Technology   │ Details
─────────────┼──────────────────────────
Framework    │ Next.js 16 (App Router)
UI           │ React 19
Styling      │ Tailwind CSS 4 -- custom
             │ only, NO component libs
Validation   │ Zod 4
Database     │ Supabase (browser, server,
             │ admin clients)
State        │ React state + URL params
             │ (no global store)
Auth         │ Supabase auth + custom
             │ admin verification via
             │ src/lib/admin-auth.ts

──────────────────────────────────────────

Key Files

File                          │ Purpose
──────────────────────────────┼─────────────────────────────
src/lib/constants.ts          │ All enums, option arrays,
                              │ event config
src/lib/validations.ts        │ Zod schemas for all forms
src/lib/utils.ts              │ Utility helpers (cn, invite
                              │ codes, date formatting)
src/lib/admin-auth.ts         │ Shared admin verification
                              │ for API routes
src/types/index.ts            │ TypeScript interfaces
                              │ (must match DB schema)
src/lib/supabase/client.ts    │ Browser Supabase client
src/lib/supabase/server.ts    │ Server component client
src/lib/supabase/admin.ts     │ Service role client (API
                              │ routes, privileged ops)
src/lib/matching/scoring.ts   │ Team matching score weights
src/lib/matching/algorithm.ts │ Deterministic matching algo
src/components/ui/            │ Shared UI primitives
                              │ (button, input, badge, card)
supabase/migrations/          │ SQL migrations (run in order)

──────────────────────────────────────────

Design Constraints (CRITICAL)

DO NOT:
•  Use Shadcn, Radix, MUI, or any UI component library
•  Create Lovable/vibecoded card layouts (generic grid cards)
•  Use React Native patterns
•  Import external icon libraries -- keep it simple
•  Create cramped, visually overwhelming layouts

DO:
•  Custom Tailwind CSS only
•  Mobile-first responsive design
•  Clean, minimal, readable on mobile (375px)
•  Use existing UI primitives from src/components/ui/
•  Dark immersive theme (current design direction)
•  See docs/DESIGN-CONSTRAINTS.md for full rules
````
