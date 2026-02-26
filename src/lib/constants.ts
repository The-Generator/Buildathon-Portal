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
    value: "partial_team" as const,
    label: "I have teammates",
    description: "Register with 1 or 2 teammates (trio max). Your group enters the matching pool together.",
    teammateCount: null, // 1-2
  },
  {
    value: "solo" as const,
    label: "I'm registering solo",
    description: "You go into the matching pool individually.",
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
export type TeamOption = "partial_team" | "solo" | "spectator";

export const PARTICIPANT_TYPES = [
  "participant",
  "spectator",
  "walk_in",
] as const;

export type ParticipantType = (typeof PARTICIPANT_TYPES)[number];

export const AI_TOOLS_EXPERIENCE = [
  {
    id: 'coding_dev',
    label: 'Coding & Development',
    tools: [
      { id: 'claude_code', label: 'Claude Code / Cursor' },
      { id: 'github_copilot', label: 'GitHub Copilot' },
      { id: 'replit', label: 'Replit / Bolt / Lovable' },
      { id: 'other_coding', label: 'Other' },
    ],
  },
  {
    id: 'image_gen',
    label: 'Image Generation & Design',
    tools: [
      { id: 'midjourney', label: 'Midjourney' },
      { id: 'figma_ai', label: 'Figma AI' },
      { id: 'canva_ai', label: 'Canva AI' },
      { id: 'other_design', label: 'Other' },
    ],
  },
  {
    id: 'data_research',
    label: 'Data Analysis & Research',
    tools: [
      { id: 'chatgpt', label: 'ChatGPT / Claude for research' },
      { id: 'python_notebooks', label: 'Python / Jupyter notebooks' },
      { id: 'excel_ai', label: 'Excel Copilot / Sheets AI' },
      { id: 'other_data', label: 'Other' },
    ],
  },
  {
    id: 'hardware_iot',
    label: 'Hardware / IoT',
    tools: [
      { id: 'arduino', label: 'Arduino / Raspberry Pi' },
      { id: 'sensors', label: 'Sensors & wearables' },
      { id: '3d_printing', label: '3D printing / prototyping' },
      { id: 'other_hardware', label: 'Other' },
    ],
  },
  {
    id: 'business_productivity',
    label: 'Business & Productivity AI',
    tools: [
      { id: 'notion_ai', label: 'Notion AI' },
      { id: 'ai_marketing', label: 'AI marketing tools (Jasper, Copy.ai)' },
      { id: 'other_business', label: 'Other' },
    ],
  },
] as const;

export type AiToolCategory = (typeof AI_TOOLS_EXPERIENCE)[number]['id'];
export type AiToolId = (typeof AI_TOOLS_EXPERIENCE)[number]['tools'][number]['id'];
