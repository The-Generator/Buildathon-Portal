# Design Constraints -- Spring '26

> Hard rules for all frontend work. Reference this before touching any UI.

## DO NOT

- **No Lovable/vibecoded card layouts.** The Fall '25 site (`buildathon_fall_25`) was built with Lovable and has generic Shadcn/Radix card soup. We are not replicating that aesthetic anywhere.
- **No Shadcn default component styling.** If you need a card, build it with Tailwind from scratch. No `<Card>` imports from a shadcn/ui library.
- **No React Native patterns.** This is a Next.js web app with Tailwind CSS. No Expo, no React Native, no cross-platform abstractions.
- **No cramped/overwhelming layouts.** Every section must breathe. If it looks "visually tight" on mobile, it's wrong.
- **No Radix UI dependency bloat.** The Fall '25 repo had 20+ Radix packages. We use lucide-react for icons and custom Tailwind for everything else.

## DO

- **Custom Tailwind CSS for all UI.** Clean, purposeful styling. Every class should be there for a reason.
- **Keep the current design direction.** The Spring '26 codebase already has a clean dark immersive theme. Extend it, don't replace it.
- **Mobile-first readability.** Hero, schedule, tools -- all must be scannable on a phone without squinting.
- **Minimal dependency footprint.** Current stack: Next.js, React, Tailwind, Zod, Supabase, lucide-react. That's it. Don't add UI libraries.
- **Accessible.** All participant information in one place, easy to find, easy to read.

## Reference

- Old repo (what NOT to do): `https://github.com/skarnz/buildathon_fall_25`
- Current repo (extend this): `/Users/skarnz/Buildathon-Portal`
- Transcript source: `transcripts/granola2_21_organized.md`
