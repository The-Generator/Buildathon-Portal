# Issue Creation Guide

> Standard for creating GitHub issues that agents can implement in a single Droid session without context rot.

---

## Why This Matters

Claude Opus 4.6 has a 1M token context window (200K default, 1M in beta), but raw context size is misleading. Factory's Droid sets its compression threshold (Tmax) at ~140K tokens -- when context reaches this point, it triggers "anchored iterative summarization" to compress older turns. Running near max context empirically degrades response quality, so Droid stays well below the model's actual limit.

What this means in practice:

- **~140K is the real working window**: Droid triggers compression at this threshold (the "fill line"). After compression, it retains even fewer tokens (the "drain line", Tretained < Tmax). An issue that fits comfortably in one session never triggers compression.
- **Compression loses file tracking first**: Factory's evaluation scores artifact tracking at only 2.45/5 -- the weakest dimension across all methods. After compression, the agent often forgets which files it created or modified. This is why issues must explicitly list files.
- **Optimize for tokens per task, not tokens per request**: aggressive compression saves per-request tokens but loses details that force expensive re-fetching and rework. Factory's research calls this "the false economy of over-compression."
- **Structured summaries beat raw compression**: Factory's anchored iterative approach merges new summaries into a persistent state with explicit sections (session intent, artifact trail, decisions, next steps). This prevents "silent drift" where details vanish across repeated compressions.

Factory's recommended workflow for large features: spec mode (Shift+Tab) to create a master plan, then one fresh Droid session per implementation phase. Each session references the plan doc and implements one coherent piece. Fresh sessions avoid compression entirely.

**Target: 3-8 files touched per issue, one coherent concept, testable independently.**

---

## Issue Template

```markdown
## Context
Plan: `plans/{plan-file}.md` {section/phase reference}
Existing code: {what already exists that this builds on or modifies, with file paths}

## What to Build
`src/{path}/file.tsx` -- {ComponentName} component:

{2-4 paragraphs describing WHAT to build, not HOW to code it.
Include key props, state, and integration points.
Reference specific existing components/hooks by name and file path.
Include code snippets ONLY for non-obvious interfaces or data schemas.}

### Integration:
- {How this connects to existing code}
- {What calls it / what it calls}
- {Where the output goes}

## Read Before Implementing
1. `src/{path}/file.tsx` -- {what to look for and why}
2. `src/{path}/other.tsx` -- {what to look for and why}
3. `plans/{plan}.md` -- {specific section reference}

## Files
- CREATE `src/{path}/new_file.tsx`
- MODIFY `src/{path}/existing.tsx` ({what change})

## Depends On
- #{number} ({short reason -- what it provides that this needs})
- `src/{path}/file.tsx` (already built)

## Acceptance Criteria
- [ ] {Specific, testable criterion}
- [ ] {Another specific criterion}
- [ ] {Integration criterion -- works with X}
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors
```

---

## Section-by-Section Rules

### Context
- Always reference the source plan file with backtick path
- Include phase/section number so the agent can jump straight there
- Name the existing code this builds on (file paths, component names)
- If this replaces a closed issue, mention it: "Replaces closed #53 (too broad)"

### What to Build
- Lead with the file path and component name: `` `src/components/ui/button.tsx` -- Button component ``
- Describe the public interface (props, callbacks, state)
- Include data structures (types, interfaces) with field names and types
- For complex logic, describe the approach (not pseudocode line-by-line)
- For integrations, name the exact hooks/stores being used
- **Include schemas** (Zustand state, TypeScript interfaces) when creating data models

### Read Before Implementing
- List 3-6 files the agent MUST read before writing code
- Explain WHAT to look for in each file (not just "read this")
- Order by importance (most critical first)
- Include plan docs where relevant
- This section directly compensates for compression's artifact tracking weakness

### Files
- Use CREATE / MODIFY / DELETE verbs
- For MODIFY, say what's changing (e.g., "add new route to bottom-nav")
- List specific component names for MODIFY when possible
- **This is the most important section for agent reliability** -- compression loses file tracking first

### Depends On
- List issue numbers with a short reason (what the dependency provides)
- Distinguish between "needs this built first" vs "already built, just reference it"
- If independent (no deps), say "Nothing -- this is foundational" or "Independent module"

### Acceptance Criteria
- 4-6 checkboxes
- Each must be independently verifiable
- Include at least one integration criterion ("works with X")
- Always end with build command: `npm run build`
- Never include vague criteria like "code is clean" or "well-documented"

---

## Sizing Rules

| Signal | Issue is too broad | Issue is right-sized | Issue is too narrow |
|--------|-------------------|---------------------|-------------------|
| Files touched | 10+ | 3-8 | 1-2 trivial files |
| Concepts | Multiple unrelated subsystems | One coherent concept | Sub-part of a concept |
| Session cost | Would require multiple compressions | Comfortable in one session (~140K effective window) | 15 minutes of work |
| Dependencies | Creates AND consumes new interfaces | Creates OR consumes | None meaningful |

**Why these numbers**: Factory's Droid maintains an optimal ~140K token working window. A right-sized issue (3-8 files) stays within this window including file reads, tool calls, and build output. Issues touching 10+ files risk triggering compression mid-implementation, which degrades artifact tracking.

**Examples of right-sized issues:**
- "Checklist History: Calendar view + detail pages" (1 page, 1 component, store updates)
- "Offline Queue: IndexedDB + sync indicator" (2 new files, 2 modified files)
- "UI Polish: Dashboard glassmorphism + micro-interactions" (3-4 files modified)

**Examples of too-broad issues:**
- "Complete admin dashboard" (6+ pages, 10+ components -- should be 3-4 issues)
- "Full offline support" (queue + sync + conflict resolution + indicators -- should be 2-3 issues)

**Examples of too-narrow issues:**
- "Change button color" (1 line change, not worth an issue)
- "Fix typo in heading" (trivial fix)

---

## Workflow: Large Features

Following Factory's "Implementing Large Features" guide:

1. **Spec mode** (`Shift+Tab`): Create a master plan breaking the feature into phases
2. **Save the plan** as a markdown file in the repo (e.g., `plans/feature-name.md`)
3. **Create one issue per phase** using this template
4. **One fresh Droid session per issue**: start clean, reference the plan doc, implement, commit
5. **Commit at the end of each session**: don't carry uncommitted work across sessions
6. **Update the plan** after each phase to mark completion

This avoids the compression trap: each session starts with full context, never hits degradation.

---

## Dependency Notation

In the "Depends On" section:
```
- #5 (needs offline queue built first)                  -- needs this built first
- `src/lib/store.ts` (already built)                    -- just references existing code
- Nothing -- this is foundational                        -- independent, can start immediately
- -- (independent; used by #8)                          -- others depend on THIS
```

---

## Labeling Convention

| Label | When to use |
|-------|------------|
| `feature` | New user-facing feature |
| `ui-polish` | Visual/UX improvements |
| `admin` | Admin dashboard features |
| `offline` | Offline/PWA functionality |
| `data` | Data import/export/analytics |
| `checklists` | Checklist system |
| `temperature` | Temperature logging |
| `waste` | Waste tracking |
| `responsive` | Responsive/breakpoint work |

---

## Naming Convention

Issue titles follow: `[{PREFIX}-{NUMBER}] {Short description}`

| Prefix | Meaning | Example |
|--------|---------|---------|
| `FEAT-` | New feature | `[FEAT-1] Checklist History Calendar` |
| `UI-` | UI/UX polish | `[UI-1] Dashboard glassmorphism` |
| `ADMIN-` | Admin features | `[ADMIN-1] Activity log` |
| `DATA-` | Data features | `[DATA-1] Bulk CSV export` |
| `PWA-` | Offline/PWA | `[PWA-1] Offline queue` |

---

## DesiEats Design Principles

When implementing UI changes, follow these principles:

### Visual Language
- **Glassmorphism over flat cards**: Use `backdrop-blur`, subtle borders, translucent backgrounds
- **Liquid glass aesthetic**: Soft gradients, organic shapes, depth through shadows
- **Micro-interactions**: Subtle hover states, smooth transitions, purposeful animations
- **Whitespace**: Let content breathe, avoid cramped layouts

### Kitchen-First UX
- **Touch targets**: Minimum 44px for fingers in gloves
- **High contrast**: Readable in bright kitchen lighting
- **One-handed operation**: Primary actions reachable with thumb
- **Fast feedback**: Immediate visual response to all interactions
- **Forgiving**: Easy to undo, hard to make mistakes

### Brand Integration
- Primary: `#E06838` (DesiEats orange)
- Accent: `#7C2D53` (deep maroon)
- Gold: `#ffd632` (accent highlights)
- Use food imagery sparingly but purposefully

---

## After Creating Issues

1. Update the relevant plan document's implementation status section
2. Commit all trace doc updates
3. Push to main
