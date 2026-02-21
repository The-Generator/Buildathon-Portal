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
] as const;

export type PrimaryRole = (typeof PRIMARY_ROLES)[number];
export type SpecificSkill = (typeof SPECIFIC_SKILLS)[number];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type School = (typeof SCHOOLS)[number];
export type Year = (typeof YEARS)[number];
export type TeamOption = "full_team" | "partial_team" | "solo";
