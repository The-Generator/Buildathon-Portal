export const DISCORD_URL = "https://discord.gg/6RNCt46u9q";
export const WHATSAPP_URL = "https://chat.whatsapp.com/BDmBe9kZVjz2X9EAZFtvW2";

/** When true, the public registration page and API are closed to new signups. */
export const REGISTRATION_CLOSED = true;

/** Competition tracks. Stored on teams.track and on judge_scores.track. */
export const TRACKS = [
  {
    id: "athletic_performance",
    title: "AI-Enhanced Athletic Performance",
    subtitle: "Optimizing Human Performance",
    tiebreaker: "track_focus",
  },
  {
    id: "accessibility_solutions",
    title: "AI-Powered Accessibility Solutions",
    subtitle: "Technology for Every Body",
    tiebreaker: "track_focus",
  },
  {
    id: "entrepreneurial_ai",
    title: "Entrepreneurial AI for Unseen Markets",
    subtitle: "Innovating in Untapped Spaces",
    tiebreaker: "business_strength",
  },
] as const;

export type TrackId = (typeof TRACKS)[number]["id"];

/** Per-track rubric criteria text. Mirrors Rubric All Tracks v4 PDF. */
export const RUBRIC: Record<
  TrackId,
  {
    tiebreakerNote: string;
    criteria: Array<{
      key: "business_strength" | "track_focus" | "innovation" | "execution" | "presentation";
      label: string;
      isTiebreaker: boolean;
      whatToEvaluate: string;
      levels: { 1: string; 2: string; 3: string; 4: string; 5: string };
    }>;
  }
> = {
  athletic_performance: {
    tiebreakerNote: "Tiebreaker: Track Focus determines higher placement in ties.",
    criteria: [
      {
        key: "business_strength",
        label: "Business Strength",
        isTiebreaker: false,
        whatToEvaluate: "Real market? Problem worth solving?",
        levels: {
          1: "No target user or rationale.",
          2: "Vague market; unclear who pays.",
          3: "Clear user/problem; basic viability.",
          4: "Defined market and value prop.",
          5: "Differentiated case; deep insight.",
        },
      },
      {
        key: "track_focus",
        label: "Track Focus ★",
        isTiebreaker: true,
        whatToEvaluate: "Athletic-specific vs general wellness?",
        levels: {
          1: "No athletic connection.",
          2: "Applies to general fitness only.",
          3: "Addresses an athletic challenge.",
          4: "Scoped to injury/load/training.",
          5: "Domain-specific deep insight.",
        },
      },
      {
        key: "innovation",
        label: "Innovation",
        isTiebreaker: false,
        whatToEvaluate: "AI central value or just a wrapper?",
        levels: {
          1: "AI is incidental/generic.",
          2: "Present but not differentiated.",
          3: "Fresh angle; AI adds real value.",
          4: "Creative; non-obvious gaps.",
          5: "Original; could disrupt training.",
        },
      },
      {
        key: "execution",
        label: "Execution",
        isTiebreaker: false,
        whatToEvaluate: "Judge the built MVP demo.",
        levels: {
          1: "Broken or slides only.",
          2: "Incomplete or unreliable core.",
          3: "Working prototype of main idea.",
          4: "Solid demo; handles core case.",
          5: "Polished; impressive one-day build.",
        },
      },
      {
        key: "presentation",
        label: "Presentation",
        isTiebreaker: false,
        whatToEvaluate: "Clear communication and passion?",
        levels: {
          1: "Confusing/Disorganized.",
          2: "Idea exists; pitch is rough.",
          3: "Clear/Structured (Problem/Demo).",
          4: "Confident; handles Q&A well.",
          5: "Exceptional; leaves judges excited.",
        },
      },
    ],
  },
  accessibility_solutions: {
    tiebreakerNote: "Tiebreaker: Track Focus determines higher placement in ties.",
    criteria: [
      {
        key: "business_strength",
        label: "Business Strength",
        isTiebreaker: false,
        whatToEvaluate: "Viable social or market model?",
        levels: {
          1: "No target or impact model.",
          2: "Vague benefit; unclear sustain.",
          3: "Clear user; basic impact model.",
          4: "Strong value prop; defined need.",
          5: "Credible path to users/sustain.",
        },
      },
      {
        key: "track_focus",
        label: "Track Focus ★",
        isTiebreaker: true,
        whatToEvaluate: "Genuine disability improvement?",
        levels: {
          1: "No accessibility connection.",
          2: "Serves anyone; loosely related.",
          3: "Designed for specific access need.",
          4: "Deep focus on a real barrier.",
          5: "Empathy-driven; domain knowledge.",
        },
      },
      {
        key: "innovation",
        label: "Innovation",
        isTiebreaker: false,
        whatToEvaluate: "Expanding access via new AI?",
        levels: {
          1: "AI is incidental/generic.",
          2: "Not differentiated from tools.",
          3: "Fresh angle; AI adds real value.",
          4: "Identifies unaddressed access gap.",
          5: "Original; expands independence.",
        },
      },
      {
        key: "execution",
        label: "Execution",
        isTiebreaker: false,
        whatToEvaluate: "Judge the built MVP demo.",
        levels: {
          1: "Broken or slides only.",
          2: "Incomplete or unreliable core.",
          3: "Working prototype of main idea.",
          4: "Solid demo; handles core case.",
          5: "Polished; accessible design.",
        },
      },
      {
        key: "presentation",
        label: "Presentation",
        isTiebreaker: false,
        whatToEvaluate: "Clear communication and passion?",
        levels: {
          1: "Confusing/Disorganized.",
          2: "Idea exists; pitch is rough.",
          3: "Clear/Structured (Problem/Demo).",
          4: "Confident; handles Q&A well.",
          5: "Exceptional; leaves judges excited.",
        },
      },
    ],
  },
  entrepreneurial_ai: {
    tiebreakerNote: "Tiebreaker: Business Strength determines higher placement in ties.",
    criteria: [
      {
        key: "business_strength",
        label: "Business Strength ★",
        isTiebreaker: true,
        whatToEvaluate: "Is this a real winnable opportunity?",
        levels: {
          1: "No target user or rationale.",
          2: "Market implied; vague revenue.",
          3: "Clear user/problem; market size.",
          4: "Compelling opportunity/revenue.",
          5: "Exceptional instinct; winnable.",
        },
      },
      {
        key: "track_focus",
        label: "Track Focus",
        isTiebreaker: false,
        whatToEvaluate: "Overlooked body/mind market?",
        levels: {
          1: "No wellness connection.",
          2: "Touches obvious/saturated space.",
          3: "Identifies real gap in wellness.",
          4: "Articulates why space is ignored.",
          5: "Insightful framing of underserved.",
        },
      },
      {
        key: "innovation",
        label: "Innovation",
        isTiebreaker: false,
        whatToEvaluate: "AI central value or just a wrapper?",
        levels: {
          1: "AI is incidental/generic.",
          2: "Not differentiated from tools.",
          3: "Fresh angle; AI adds real value.",
          4: "Creative; non-obvious gap.",
          5: "AI unlocks previously impossible.",
        },
      },
      {
        key: "execution",
        label: "Execution",
        isTiebreaker: false,
        whatToEvaluate: "Judge the built MVP demo.",
        levels: {
          1: "Broken or slides only.",
          2: "Incomplete or unreliable core.",
          3: "Working prototype of main idea.",
          4: "Solid demo; handles core case.",
          5: "Polished; goes beyond basics.",
        },
      },
      {
        key: "presentation",
        label: "Presentation",
        isTiebreaker: false,
        whatToEvaluate: "Clear communication and passion?",
        levels: {
          1: "Confusing/Disorganized.",
          2: "Idea exists; pitch is rough.",
          3: "Clear/Structured (Problem/Demo).",
          4: "Confident; handles Q&A well.",
          5: "Exceptional; leaves judges excited.",
        },
      },
    ],
  },
};

/** Score values allowed by the rubric (half points). */
export const SCORE_VALUES = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

export const EVENT_CONFIG = {
  name: "Babson Generator Build-a-thon 2026",
  shortName: "Build-a-thon 2026",
  date: "2026-04-11",
  startTime: "2026-04-11T08:00:00-04:00",
  endTime: "2026-04-11T20:30:00-04:00",
  location: "Knight Auditorium, Babson College",
  address: "231 Forest St, Wellesley, MA 02457",
  capacity: 500,
  teamSize: 5,
  roomCount: 10,
  theme: "AI x Body & Mind",
} as const;

/** Workrooms available for team assignments (index + 1 = room_number in DB) */
export const WORKROOMS = [
  "Malloy 102",
  "Malloy 201",
  "Malloy 202",
  "Olin 101",
  "Olin 102",
  "Olin 120",
  "Olin 202",
  "Olin 225",
  "Knight Auditorium",
  "FME Workshop (Schlesinger Innovation Center)",
] as const;

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
  "Bentley",
  "Bryant",
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
