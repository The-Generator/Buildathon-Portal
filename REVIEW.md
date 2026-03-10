# Code Review Rules -- Buildathon Portal

> These rules guide automated code review. Violations of "MUST" rules are normal-severity findings. Violations of "SHOULD" rules are nit-severity findings.

---

## Design System (MUST)

- **No UI component libraries.** Shadcn, Radix, MUI, Chakra, Headless UI — all banned. Flag any import from these packages.
- **No Lovable/vibecoded patterns.** Generic grid-of-cards layouts with icon+title+description cards are a hard reject.
- **Tailwind CSS only.** No inline styles, no CSS modules, no styled-components. Exception: `style={}` for dynamic values that Tailwind can't express (e.g., computed gradients).
- **No hardcoded color hex values in JSX/TSX.** All colors must use Tailwind utility classes. Brand green `#006241` and accent `#00e87b` should be referenced via Tailwind config or CSS variables, not raw hex in className strings.
- **UI primitives come from `src/components/ui/`.** If a Button, Input, Badge, or Card component exists there, use it — don't create a new one or import an external one.

## Mobile & Accessibility (MUST)

- **No horizontal overflow at 375px.** Every layout must work on mobile without horizontal scrolling.
- **Readable text on mobile.** No text smaller than `text-sm` (14px) for body content on mobile.
- **Tap targets minimum 44px.** Interactive elements (buttons, links, toggles) must have adequate touch targets.
- **Responsive breakpoints.** Use `sm:`, `md:`, `lg:` prefixes. Don't build desktop-only layouts.

## TypeScript Quality (MUST)

- **No `as any` casts.** Flag every occurrence.
- **No `@ts-ignore` or `@ts-expect-error` without an explanatory comment.**
- **Use existing types.** Types in `src/types/index.ts` must be used instead of creating ad-hoc inline types for DB entities.
- **Use existing Zod schemas.** Validation schemas live in `src/lib/validations.ts`. Don't create one-off schemas in component files.
- **Use existing constants.** Enums and option arrays live in `src/lib/constants.ts`. Don't duplicate them.

## Data & Security (MUST)

- **Correct Supabase client usage:**
  - Browser/client components → `src/lib/supabase/client.ts`
  - Server components → `src/lib/supabase/server.ts`
  - API routes → `src/lib/supabase/admin.ts`
  - Flag any usage of the wrong client for the context.
- **Admin routes MUST call `verifyAdmin()`.** Every API route under `/api/admin/` must import and call `verifyAdmin()` from `src/lib/admin-auth.ts`. Missing auth is a critical finding.
- **No secrets in code.** Flag any hardcoded API keys, tokens, Supabase URLs, or credentials. These must come from environment variables.
- **No `console.log` of user data.** Logging PII (emails, names, phone numbers) or full state dumps is a security issue.

## Integration Completeness (MUST)

- **New components must be rendered somewhere.** If a new component file is created, it must be imported and used in at least one parent.
- **New API routes must be called.** If a new route handler is created, something must call it.
- **New types/interfaces must be consumed.** Exported types with zero consumers are dead code.
- **New Zod schemas must be used in validation.** A schema that exists but isn't called in `.parse()` or `.safeParse()` is dead code.

## Dead Code (SHOULD)

- **No unused imports.** Flag imports that aren't referenced in the file.
- **No commented-out code blocks.** Remove them unless annotated with a `// TODO: #issue-number` reference.
- **No `console.log` left behind.** Development logging should be removed before merge.
- **No unreachable code.** Early returns that make subsequent code unreachable.

## Patterns to Skip (DO NOT FLAG)

- **Don't flag Tailwind class ordering.** We don't enforce a specific utility class order.
- **Don't flag missing JSDoc/TSDoc comments.** We prefer self-documenting code over comment density.
- **Don't flag file length alone.** Long files are fine if they're cohesive.
- **Don't flag missing unit tests.** We don't have a test suite yet — this is not actionable.
- **Don't flag `"use client"` directives.** These are required by Next.js App Router and are correct.
- **Don't flag dynamic imports or `force-dynamic` exports.** These are intentional patterns in our Supabase server component setup.

## Registration-Specific (MUST)

- **Jotform parity.** If registration flow code is modified, conditional field visibility must match the logic in `docs/jotform/JOTFORM_LOGIC_EXTRACT.md`.
- **Registration group integrity.** The matching algorithm must never split members of the same `registration_group` across different teams.

## Matching Algorithm (MUST)

- **Scoring functions must return values in 0–1 range.** Any scoring function returning outside this range is a bug.
- **Weights must sum to 1.0.** If weight constants are modified, verify they still sum to 1.0.
- **Guard against empty arrays.** Division by zero when `ai_tools` or similar arrays are empty.
