# Babson Generator Build-a-thon 2026

Read AGENTS.md first -- it has the full project context.

## Quick Reference

- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Build: `npm run build`
- Dev: `npm run dev`

## Before Writing Code

1. Read `docs/DESIGN-CONSTRAINTS.md` -- hard rules on styling
2. Read `docs/DRAFT-ISSUES-SP26.md` -- the approved issue set
3. Check `src/lib/constants.ts` for existing enums before creating new ones
4. Check `src/types/index.ts` for existing interfaces before creating new ones
5. Check `src/lib/validations.ts` for existing schemas before creating new ones

## Rules

- Tailwind CSS only. No Shadcn, Radix, MUI, or any UI component library.
- Custom primitives are in `src/components/ui/`. Use and extend those.
- All DB operations go through Supabase clients in `src/lib/supabase/`.
- All validation uses Zod schemas in `src/lib/validations.ts`.
- Admin API routes must use `verifyAdmin()` from `src/lib/admin-auth.ts`.
- Types in `src/types/index.ts` must match the DB schema.
- Run lint + typecheck before every commit. Fix all errors.
- One issue per session. Don't scope-creep into adjacent work.
