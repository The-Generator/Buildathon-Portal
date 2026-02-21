# Babson Generator Build-a-thon 2026

Next.js 16 + React 19 + Tailwind CSS 4 + Supabase + Zod 4

## Core Commands

- Dev server: `npm run dev`
- Lint: `npm run lint`
- Type-check: `npx tsc --noEmit`
- Build: `npm run build`

Always run lint + typecheck before committing. Fix all errors before pushing.

## Project Layout

```
src/
├── app/                  # Next.js App Router pages + API routes
│   ├── api/              # Server-side API routes (register, checkin, matching, admin)
│   ├── admin/            # Admin dashboard (layout + sub-pages)
│   ├── register/         # Registration wizard
│   ├── checkin/          # Public check-in page
│   └── walkin/           # Walk-in intake (event day)
├── components/
│   ├── landing/          # Landing page sections (hero, about, schedule, etc.)
│   ├── registration/     # Registration step components
│   ├── checkin/          # Check-in UI
│   ├── admin/            # Admin dashboard components
│   └── ui/               # Shared primitives (button, input, badge, card, etc.)
├── lib/
│   ├── constants.ts      # All enums, option arrays, event config
│   ├── validations.ts    # Zod schemas for all forms
│   ├── utils.ts          # Utility helpers (cn, invite codes, date formatting)
│   ├── admin-auth.ts     # Shared admin verification for API routes
│   ├── supabase/         # Supabase clients (browser, server, admin)
│   └── matching/         # Team matching algorithm + scoring
├── data/                 # Static data (tools catalog, schedule items)
├── types/                # TypeScript interfaces
└── middleware.ts         # Session refresh + /admin route protection
supabase/migrations/      # SQL migrations (run in order: 001, 002, ...)
docs/                     # Planning docs, issue guide, Jotform artifacts
scripts/                  # Utility scripts (seed, validate, image generation)
```

## Development Patterns

### Styling
- Tailwind CSS only. No component libraries (no Shadcn, no Radix, no MUI).
- Custom UI primitives live in `src/components/ui/`. Extend these, don't import external ones.
- NO Lovable/vibecoded card layouts. Clean, minimal, readable on mobile.
- See `docs/DESIGN-CONSTRAINTS.md` for full design rules.

### Data
- Supabase for all persistence. Three client variants:
  - `lib/supabase/client.ts` -- browser (anon key, used in client components)
  - `lib/supabase/server.ts` -- server components (cookie-based sessions)
  - `lib/supabase/admin.ts` -- service role (API routes, privileged ops)
- Zod for all input validation. Schemas in `lib/validations.ts`.
- Types in `src/types/index.ts` must match DB schema exactly.

### API Routes
- All API routes use `src/lib/supabase/admin.ts` for DB access.
- Admin-only routes must call `verifyAdmin()` from `src/lib/admin-auth.ts`.
- Return proper HTTP status codes and structured error responses.

### Registration
- 4-step wizard: Personal Info -> Team Setup -> Team Skills -> Review
- Registration types: solo, partial_team, full_team, spectator
- Jotform parity is critical. See `docs/jotform/JOTFORM_LOGIC_EXTRACT.md`.

### Matching
- Deterministic algorithm in `src/lib/matching/algorithm.ts`
- Scoring weights in `src/lib/matching/scoring.ts`
- Never break registration group integrity during matching.

## Git Workflow

- Branch from `main`. Descriptive names: `feat/<slug>`, `fix/<slug>`.
- One issue per session. Commit at end of session.
- Never push secrets, API keys, or .env files.
- Run `npm run lint && npx tsc --noEmit` before every commit.

## Key References

- `docs/SPRING_26_MASTER_PLAN.md` -- phased implementation plan
- `docs/ISSUE-CREATION-GUIDE-1.md` -- issue sizing and template rules
- `docs/DESIGN-CONSTRAINTS.md` -- hard UI/UX rules
- `docs/DRAFT-ISSUES-SP26.md` -- approved issue set
- `docs/jotform/JOTFORM_LOGIC_EXTRACT.md` -- registration branching logic
