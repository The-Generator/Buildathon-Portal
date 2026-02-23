export const DISCORD_URL = "https://discord.gg/babson-generator";
export const WHATSAPP_URL = "https://chat.whatsapp.com/babson-generator";

export const EVENT_CONFIG = {
  name: "Babson Generator Build-a-thon 2026",
  shortName: "Build-a-thon 2026",
  date: "2026-04-11",
  startTime: "2026-04-11T09:00:00-04:00",
  endTime: "2026-04-11T21:00:00-04:00",
  location: "Knight Auditorium, Babson College",
  address: "231 Forest St, Wellesley, MA 02457",
  capacity: 500,
  teamSize: 5,
  theme: "AI x Body & Mind",
} as const;

export const PRIMARY_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "UI/UX Designer",
  "Data Scientist / ML Engineer",
  "Project Manager",
  "Business / Strategy",
  "Pitch / Presenting",
  "Domain Expert (Health, Neuro, Wellness)",
] as const;

export const SPECIFIC_SKILLS = [
  "React / Next.js",
  "Python",
  "Machine Learning",
  "UI/UX Design (Figma)",
  "Data Analysis",
  "Public Speaking / Pitching",
  "Business Strategy",
  "Marketing / Growth",
  "Neuroscience / Brain-Computer Interfaces",
  "Health & Fitness Tech",
  "Mental Health / Wellness",
  "Bioinformatics / Genomics",
  "Wearables / Sensor Data",
  "Nutrition / Dietetics",
  "Psychology / Behavioral Science",
  "Medical / Clinical Knowledge",
] as const;

export const EXPERIENCE_LEVELS = [
  "Beginner (I've used ChatGPT or similar tools)",
  "Intermediate (I've used AI tools for projects)",
  "Advanced (I've built or modified AI models)",
  "Expert (I've developed custom AI solutions)",
] as const;

export const SCHOOLS = [
  "Babson",
  "Olin",
  "Wellesley",
  "MIT",
  "Harvard",
  "Stanford",
  "Northeastern",
  "Brandeis",
  "Other",
] as const;

export const YEARS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate Student",
] as const;


export const TEAM_OPTIONS = [
  {
    value: "full_team" as const,
    label: "Full Team (5 people)",
    description: "You already have a complete team of 5",
    teammateCount: 4,
  },
  {
    value: "partial_team" as const,
    label: "Partial Team (2-4 people)",
    description: "You have some teammates but need more",
    teammateCount: null, // 1-3
  },
  {
    value: "solo" as const,
    label: "Solo (just me)",
    description: "Match me with a team!",
    teammateCount: 0,
  },
  {
    value: "spectator" as const,
    label: "Spectator",
    description: "For faculty, sponsors, judges, parents, etc.",
    teammateCount: 0,
  },
] as const;

export type PrimaryRole = (typeof PRIMARY_ROLES)[number];
export type SpecificSkill = (typeof SPECIFIC_SKILLS)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type School = (typeof SCHOOLS)[number];
export type Year = (typeof YEARS)[number];
export type TeamOption = "full_team" | "partial_team" | "solo" | "spectator";

export const PARTICIPANT_TYPES = [
  "participant",
  "spectator",
  "walk_in",
] as const;

export type ParticipantType = (typeof PARTICIPANT_TYPES)[number];

export const AI_TOOLS = [
  // Coding & Development
  "v0.dev (Coding & Development)",
  "Lovable (Coding & Development)",
  "Bolt (Coding & Development)",
  "Gemini Command Line Coding Tool",
  "Cursor (Coding & Development)",
  "Claude Code",
  "Chat GPT Codex",
  "Windsurf (Coding & Development)",
  "Replit Agent (Coding & Development)",
  "Rork (Coding & Development)",
  "n8n (Coding & Development)",
  "Other coding tools (Coding & Development)",
  // Hosting & Infrastructure
  "Supabase (Hosting & Infrastructure)",
  "Vercel (Hosting & Infrastructure)",
  "Other hosting platforms (Hosting & Infrastructure)",
  // Image Generation & Design
  "Krea.ai (Image Generation & Design)",
  "Midjourney (Image Generation & Design)",
  "Vizcom (Image Generation & Design)",
  "DALL-E (Image Generation & Design)",
  "Stable Diffusion (Image Generation & Design)",
  "Other image tools (Image Generation & Design)",
  // Video Creation
  "Google Veo 2 (Video Creation)",
  "InVideo (Video Creation)",
  "Minimax (Video Creation)",
  "Kling (Video Creation)",
  "Other video tools (Video Creation)",
  // Audio & Speech
  "Eleven Labs (Audio & Speech)",
  "ElevenLabs Text to Speech (Audio & Speech)",
  "ElevenLabs Scribe (Audio & Speech)",
  "Superwhisperer (Audio & Speech)",
  "Other audio tools (Audio & Speech)",
  // Music Generation
  "Suno (Music Generation)",
  "Lemonaide AI (Music Generation)",
  "Other music tools (Music Generation)",
  // 3D Modeling
  "Meshy (3D Modeling)",
  "Other 3D tools (3D Modeling)",
  // Productivity & Organization
  "Superhuman (Productivity & Organization)",
  "Motion (Productivity & Organization)",
  "Granola (Productivity & Organization)",
  "Rewind (Productivity & Organization)",
  "Gamma (Productivity & Organization)",
  "Other productivity tools (Productivity & Organization)",
  // Research & Search
  "Deep Research (Research & Search)",
  "Exa (Research & Search)",
  "Firecrawl (Research & Search)",
  "Other research tools (Research & Search)",
  // Product Development
  "Naya (Product Development)",
  "Flora (Product Development)",
  "Other product tools (Product Development)",
  // Customer Service
  "Intercom (Customer Service)",
  "Other customer service tools (Customer Service)",
  // Agent Frameworks
  "Agno (Agent Frameworks)",
  "OpenAI Agents (Agent Frameworks)",
  "Agents Marketplace (Agent Frameworks)",
  "LangChain (Agent Frameworks)",
  "Other agent frameworks (Agent Frameworks)",
  // Large Language Models
  "ChatGPT (Large Language Models)",
  "Claude (Large Language Models)",
  "Gemini (Large Language Models)",
  "Llama (Large Language Models)",
  "Other LLMs (Large Language Models)",
  // Hardware
  "Limitless (Hardware)",
  "Other AI hardware (Hardware)",
  // Agentic Browsers
  "Perplexity's Comet Agentic Browser",
  "OpenAi's Atlas Agentic Browser",
  "TheBrowserCompany's Dia Agentic Browser",
  "OpenSource Agentic browsers (locally built + hosted)",
  // No Experience
  "I have no experience with AI tools (That's OK!)",
] as const;

export type AiTool = (typeof AI_TOOLS)[number];

export const AI_TOOL_CATEGORIES = [
  "Coding & Development",
  "Hosting & Infrastructure",
  "Image Generation & Design",
  "Video Creation",
  "Audio & Speech",
  "Music Generation",
  "3D Modeling",
  "Productivity & Organization",
  "Research & Search",
  "Product Development",
  "Customer Service",
  "Agent Frameworks",
  "Large Language Models",
  "Hardware",
  "Agentic Browsers",
] as const;

export type AiToolCategory = (typeof AI_TOOL_CATEGORIES)[number];

export const AI_TOOLS_BY_CATEGORY: Record<AiToolCategory, readonly AiTool[]> = {
  "Coding & Development": [
    "v0.dev (Coding & Development)",
    "Lovable (Coding & Development)",
    "Bolt (Coding & Development)",
    "Gemini Command Line Coding Tool",
    "Cursor (Coding & Development)",
    "Claude Code",
    "Chat GPT Codex",
    "Windsurf (Coding & Development)",
    "Replit Agent (Coding & Development)",
    "Rork (Coding & Development)",
    "n8n (Coding & Development)",
    "Other coding tools (Coding & Development)",
  ],
  "Hosting & Infrastructure": [
    "Supabase (Hosting & Infrastructure)",
    "Vercel (Hosting & Infrastructure)",
    "Other hosting platforms (Hosting & Infrastructure)",
  ],
  "Image Generation & Design": [
    "Krea.ai (Image Generation & Design)",
    "Midjourney (Image Generation & Design)",
    "Vizcom (Image Generation & Design)",
    "DALL-E (Image Generation & Design)",
    "Stable Diffusion (Image Generation & Design)",
    "Other image tools (Image Generation & Design)",
  ],
  "Video Creation": [
    "Google Veo 2 (Video Creation)",
    "InVideo (Video Creation)",
    "Minimax (Video Creation)",
    "Kling (Video Creation)",
    "Other video tools (Video Creation)",
  ],
  "Audio & Speech": [
    "Eleven Labs (Audio & Speech)",
    "ElevenLabs Text to Speech (Audio & Speech)",
    "ElevenLabs Scribe (Audio & Speech)",
    "Superwhisperer (Audio & Speech)",
    "Other audio tools (Audio & Speech)",
  ],
  "Music Generation": [
    "Suno (Music Generation)",
    "Lemonaide AI (Music Generation)",
    "Other music tools (Music Generation)",
  ],
  "3D Modeling": [
    "Meshy (3D Modeling)",
    "Other 3D tools (3D Modeling)",
  ],
  "Productivity & Organization": [
    "Superhuman (Productivity & Organization)",
    "Motion (Productivity & Organization)",
    "Granola (Productivity & Organization)",
    "Rewind (Productivity & Organization)",
    "Gamma (Productivity & Organization)",
    "Other productivity tools (Productivity & Organization)",
  ],
  "Research & Search": [
    "Deep Research (Research & Search)",
    "Exa (Research & Search)",
    "Firecrawl (Research & Search)",
    "Other research tools (Research & Search)",
  ],
  "Product Development": [
    "Naya (Product Development)",
    "Flora (Product Development)",
    "Other product tools (Product Development)",
  ],
  "Customer Service": [
    "Intercom (Customer Service)",
    "Other customer service tools (Customer Service)",
  ],
  "Agent Frameworks": [
    "Agno (Agent Frameworks)",
    "OpenAI Agents (Agent Frameworks)",
    "Agents Marketplace (Agent Frameworks)",
    "LangChain (Agent Frameworks)",
    "Other agent frameworks (Agent Frameworks)",
  ],
  "Large Language Models": [
    "ChatGPT (Large Language Models)",
    "Claude (Large Language Models)",
    "Gemini (Large Language Models)",
    "Llama (Large Language Models)",
    "Other LLMs (Large Language Models)",
  ],
  "Hardware": [
    "Limitless (Hardware)",
    "Other AI hardware (Hardware)",
  ],
  "Agentic Browsers": [
    "Perplexity's Comet Agentic Browser",
    "OpenAi's Atlas Agentic Browser",
    "TheBrowserCompany's Dia Agentic Browser",
    "OpenSource Agentic browsers (locally built + hosted)",
  ],
};
