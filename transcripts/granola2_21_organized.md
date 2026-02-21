# Generator Buildathon Planning Session -- Feb 21, 2026

> Organized losslessly from Granola transcript. Original: `transcripts/granola2_21.md`

---

## 1. Site Design Direction (CRITICAL)

**Hard constraints from Spencer:**
- **NO ugly vibecoded Lovable card layouts** -- the old Fall '25 site (`buildathon_fall_25`) used Lovable-generated Shadcn/Radix cards that look generic and ugly. Do NOT replicate that style.
- **NO React Native patterns** -- keep it clean React (Next.js) with Tailwind CSS and custom styling.
- The current Spring '26 codebase (`Buildathon-Portal`) already has a clean design direction. **Keep it and extend it.**
- Hero section on mobile was too crowded on the old site -- needs to be dialed back and more readable.
- "What you have is clean already, and we're gonna keep it away from doing the ugly card layout."

**Design philosophy:**
- All participant info accessible in one place, but "not visually tight and overwhelming"
- "Super accessible" -- easy to read, not cramped
- Clean, custom Tailwind -- not Lovable/Shadcn default look

---

## 2. Navigation / Page Structure

**Top bar (simplified, 5 items):**
1. About
2. Prizes
3. Sponsors
4. Schedule
5. Register Now (CTA button)

**Sidebar menu (secondary, more informational):**
- Judging rubric
- Resources / AI tools (with categorized dropdowns -- "are you looking for a repo, or a tool?")
- Note: These are NOT in the top bar to keep it clean

**Tracks:**
- NOT in top nav (tracks are gated until event day per earlier decision)
- Can still scroll to a placeholder section on the page

---

## 3. Content to Port from Fall '25

**From old repo (`buildathon_fall_25`):**

### a. AI Tools / Resources Page
- `src/data/tools.ts` -- 27 curated tools with names, descriptions, URLs, categories, logos
- Categories: Web App Creation, AI API Credits, Text to Image, Coding Tool, AI Text to Speech, AI Speech to Text, 3D Creation, AI Workflows, Mobile App Dev, Music Creation, AI Search, Web Scraping, Agent Framework, Application Hosting, Database, Research, Presentation Creation, Agents Marketplace, Customer Service, Free Resources, Development Libraries, Learning Resources
- Spencer wants this expanded with more repos/resources from Gen 1000 work (hundreds of git repos in PDF/Google Docs)
- Make it "more sectionable" with dropdowns for filtering: repos vs tools vs learning resources
- Cut: Azure API Keys, Lovable (people already know about it), other obvious ones
- Keep: Most tools, especially the specialized ones

### b. Schedule
- Full day schedule from `ScheduleSection.tsx` -- 16 time blocks, 10:00 AM to 7:15+ PM
- Includes: check-in, group photo, opening presentation, team formation, work sessions, lunch, pitches, finals, awards, dinner
- Need to update times/details for Spring '26

### c. Prizes Section
- $5,000+ in prizes
- Prize items: 3D Printers, Meta Quest, Meta Ray-Bans, Apple Watches, iPads
- 1st/2nd/3rd place tiers with descriptions
- Special award: "Creative AI Thinking" ($500, sponsored by Evoke Yoga)
- Need to update for Spring '26 sponsors/prizes

### d. Judging Rubric
- Preliminary rounds: 2 judges per room, full 100-point rubric
- Judge huddle: 5:15-6:00 PM
- Finals: 6 semifinalists, 80/20 scoring (judge 80% + crowd vote 20%)
- Crowd voting: ranked-choice system (rank all 6 teams 1st-6th)
- Rubric categories:
  - Problem Validation & Research (20 pts)
  - Functional Prototype & Proof of Concept (25 pts)
  - Technical Innovation & AI Integration (20 pts)
  - Feasibility, Ethics & Implementation Path (20 pts)
  - Presentation & Communication (15 pts)
- Need to decide if rubric changes for Spring '26

### e. Photos/Images
- Old repo has: `hero-background.jpg`, `buildathon-team-photo.jpg`, `buildathon-judges-photo.jpg`, `b-thon_full_group_spring25.jpeg`
- Need: photos for backgrounds, Ryan's Buildathon video (embed window)
- Need: Generator logo banner
- Current repo has AI-generated section backgrounds in `public/generated/`

### f. Help Desk Section
- 4-level help desk: Lovable (beginners), Cursor/Claude Code (advanced), 3D Design (Meshy/Hunyuan), 3D Printing (scouts)
- Available all day, no appointment needed

---

## 4. New Content Needed

### a. Video Embed
- Ryan's Buildathon recap video needs an embed window on the site
- Prominent placement (likely hero or about section)

### b. Generator Logo Banner
- Needs proper generator branding at top

### c. Important Registration Information
- Display section for key registration info (dates, requirements, what to bring)

### d. Discord Integration
- Discord should be the PRIMARY community button (not WhatsApp)
- WhatsApp can exist somewhere secondary
- Jonathan wants Discord as main channel

### e. Sponsors Section
- Separate from prizes (don't want to imply prizes come from specific sponsors)
- Needs its own section

---

## 5. Workflow / Agent Process Notes

**How issues get implemented (Spencer's process):**
1. Custom system prompt primes the agent to read the right files
2. One fresh Claude Code instance per issue (to not fill up context)
3. Agent works the issue, then Codex reviews the work
4. Clean up dead code, lint, push
5. Can run issues 1-4 in sequence, then 4-10 in sequence (non-overlapping)

**For Tuesday meeting:**
- Base agenda on how Monday meeting goes
- Get update from team
- Discussing "second tier" of Generator -- builders team that works on semester-long projects (like Olin model)
- TRI program potential if team can execute

---

## 6. Non-Site Business Context (preserved for reference)

- Josh met a New York Life AI strategy lead (Conan) on bus to Hartford
- Conan: HBS grad, 3 months at NYL, previously 6 years at Total Energies
- NYL invested $10B into AI, struggling to deploy it properly
- Conan has ad-hoc projects that need quick execution
- Connection to SpaceX-adjacent startup founder (nuclear fusion on moon) who needs agents built
- Eli Paulica: Babson student, AI consultant at NYL since mid-2024, built portfolio review agent (86% time reduction)
- Plan to talk to Eli for additional leverage/connections
- Meeting with Conan scheduled for Friday
