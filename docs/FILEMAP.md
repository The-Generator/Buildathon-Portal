# File Map

This map is intended to sit alongside `README.md` as a quick orientation guide.

## Root

- `package.json` — Next.js app scripts and dependencies.
- `next.config.ts` — Next.js runtime config.
- `eslint.config.mjs` — ESLint setup.
- `postcss.config.mjs` — PostCSS/Tailwind processing.
- `tsconfig.json` — TypeScript compiler settings.
- `scripts/generate-images.mjs` — Batch generator for landing page art assets via Gemini.
- `supabase/migrations/001_initial_schema.sql` — Initial DB schema (participants, teams, admins, groups, schedule).
- `public/generated/*` — Generated visual assets used in landing sections.

## Application (`src/app`)

- `layout.tsx` — Global HTML shell, metadata, and font setup.
- `globals.css` — Global styles.
- `page.tsx` — Marketing landing page assembly.
- `register/page.tsx` — Registration entrypoint with capacity guard.
- `register/registration-wizard.tsx` — 4-step registration flow orchestration.
- `checkin/page.tsx` — Public check-in surface.
- `admin/layout.tsx` — Admin shell and client-side auth guard.
- `admin/page.tsx` — Admin overview metrics.
- `admin/participants/page.tsx` — Participant table, filters, sorting, pagination.
- `admin/teams/page.tsx` — Team management view and matching preview trigger.
- `admin/checkin/page.tsx` — Real-time check-in dashboard page wrapper.
- `admin/export/page.tsx` — CSV export UI + preview.
- `admin/login/page.tsx` — Magic link admin login.
- `api/register/route.ts` — Registration API (validation, participant/team/group creation).
- `api/checkin/lookup/route.ts` — Participant lookup by email/phone.
- `api/checkin/route.ts` — Check-in mutation + anti-abuse rate limiting.
- `api/matching/preview/route.ts` — Builds candidate pool and runs team matching algorithm.
- `api/matching/confirm/route.ts` — Persists/locks matched teams.
- `api/teams/[id]/route.ts` — Team details and team updates.
- `api/admin/export/route.ts` — CSV export API.
- `api/generate-image/route.ts` — On-demand image generation/caching into `public/generated`.
- `error.tsx` / `not-found.tsx` — Route-level fallback pages.

## Components (`src/components`)

- `landing/*` — Landing page sections (hero, about, tracks, schedule, sponsors, FAQ, header, footer).
- `registration/*` — Step UIs and controls for registration flow.
- `checkin/CheckinForm.tsx` — Public check-in state machine UI.
- `admin/*` — Admin visual components (stats, rows, matching preview/cards, check-in dashboard).
- `ui/*` — Shared primitives (button, input, badge, card, modal, select, progress, stat card, spinner).

## Domain & Integrations (`src/lib`)

- `constants.ts` — Event metadata, enums/options used across UI/API.
- `validations.ts` — Zod schemas for registration steps and full payloads.
- `utils.ts` — Utility helpers (`cn`, invite code generation, date formatting).
- `supabase/client.ts` — Browser Supabase client.
- `supabase/server.ts` — Server component Supabase client.
- `supabase/admin.ts` — Service-role Supabase client for privileged routes.
- `matching/algorithm.ts` — Deterministic team construction + swap optimization.
- `matching/scoring.ts` — Weighted team scoring (role, skill, experience, school mix).
- `matching/types.ts` / `matching/index.ts` — Matching types and serialization helpers.
- `email/send.ts` — Resend wrapper.
- `email/calendar.ts` — ICS invite generation.
- `email/templates/*` — React Email templates for registration and team assignment.

## Supporting Types & Middleware

- `types/index.ts` — Core app interfaces (participant, team, group, admin, schedule, form data).
- `middleware.ts` — Session refresh and `/admin` route protection.
