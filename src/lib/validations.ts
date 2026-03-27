import { z } from "zod";
import {
  PRIMARY_ROLES,
  SPECIFIC_SKILLS,
  EXPERIENCE_LEVELS,
  SCHOOLS,
  YEARS,
} from "./constants";

// Step 1: Personal Info
export const stepPersonalInfoSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    school: z.enum([...SCHOOLS], { message: "Please select your school" }),
    school_other: z.string().optional(),
    year: z.enum([...YEARS], { message: "Please select your year" }),
    dietary_restrictions: z.string().optional(),
    primary_role: z.enum([...PRIMARY_ROLES], { message: "Please select a role" }),
    specific_skills: z
      .array(z.enum([...SPECIFIC_SKILLS]))
      .optional()
      .default([]),
    experience_level: z.enum([...EXPERIENCE_LEVELS], { message: "Please select your experience level" }),
    ai_tools: z.array(z.string()).optional().default([]),
    ai_tools_used: z.array(z.string()).optional().default([]),
    // Public Profile (optional)
    linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    portfolio_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    bio: z.string().max(280, "Bio must be 280 characters or less").optional().or(z.literal("")),
    photo_url: z.string().optional(),
    profile_visible: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (data.school === "Other") {
        return !!data.school_other && data.school_other.trim().length > 0;
      }
      return true;
    },
    {
      message: "Please specify your school",
      path: ["school_other"],
    }
  )
  .refine(
    (data) => {
      if (!data.profile_visible) return true;
      return !!(data.photo_url || data.linkedin_url || data.portfolio_url);
    },
    {
      message: "Add at least a photo, LinkedIn, or social media link to make your profile public",
      path: ["profile_visible"],
    }
  );

// Step 2: Team Setup
const teammateSchema = z.object({
  full_name: z.string().min(2, "Teammate name must be at least 2 characters"),
  email: z.string().email("Invalid teammate email address"),
});

export const stepTeamSetupSchema = z
  .object({
    team_option: z.enum(["partial_team", "solo", "spectator"]),
    teammates: z.array(teammateSchema),
  })
  .refine(
    (data) => {
      if (data.team_option === "partial_team") {
        return data.teammates.length >= 1 && data.teammates.length <= 2;
      }
      if (data.team_option === "solo" || data.team_option === "spectator") {
        return data.teammates.length === 0;
      }
      return true;
    },
    {
      message:
        "Invalid number of teammates for the selected team option. Partial team requires 1-2 teammates, solo/spectator requires 0.",
      path: ["teammates"],
    }
  );

// Step 3: Team Skills
export const stepTeamSkillsSchema = z.object({
  tagged_team_skills: z
    .array(z.enum([...SPECIFIC_SKILLS]))
    .min(1, "Select at least one team skill"),
});

// Full Registration Schema (merge of all steps)
// Spectators skip team skills and don't require role/skills/experience (Jotform condition #1)
export const fullRegistrationSchema = z
  .object({
    // Step 1: Personal Info
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    school: z.enum([...SCHOOLS], { message: "Please select your school" }),
    school_other: z.string().optional(),
    year: z.enum([...YEARS], { message: "Please select your year" }),
    dietary_restrictions: z.string().optional(),
    // Optional for spectators (Jotform condition #1 disables these)
    // Accept empty string so base parsing passes; refinements enforce for non-spectators.
    primary_role: z.enum([...PRIMARY_ROLES], { message: "Please select a role" }).optional().or(z.literal("")),
    specific_skills: z.array(z.enum([...SPECIFIC_SKILLS])).optional().default([]),
    experience_level: z.enum([...EXPERIENCE_LEVELS], { message: "Please select your experience level" }).optional().or(z.literal("")),
    ai_tools: z.array(z.string()).optional().default([]),
    ai_tools_used: z.array(z.string()).optional().default([]),
    // Public Profile (optional)
    linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    portfolio_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    bio: z.string().max(280, "Bio must be 280 characters or less").optional().or(z.literal("")),
    photo_url: z.string().optional(),
    profile_visible: z.boolean().optional().default(false),

    // Step 2: Team Setup
    team_option: z.enum(["partial_team", "solo", "spectator"]),
    teammates: z.array(teammateSchema),

    // Step 3: Team Skills
    tagged_team_skills: z.array(z.enum([...SPECIFIC_SKILLS])),

    // Re-submission flag (set when user confirms replacing an existing registration)
    replaceExisting: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (data.school === "Other") {
        return !!data.school_other && data.school_other.trim().length > 0;
      }
      return true;
    },
    {
      message: "Please specify your school",
      path: ["school_other"],
    }
  )
  .refine(
    (data) => {
      if (data.team_option === "spectator") return true;
      return !!data.primary_role;
    },
    {
      message: "Primary role is required for participants",
      path: ["primary_role"],
    }
  )
  .refine(
    (data) => {
      if (data.team_option === "spectator") return true;
      return !!data.experience_level;
    },
    {
      message: "Experience level is required for participants",
      path: ["experience_level"],
    }
  )
  .refine(
    (data) => {
      if (data.team_option === "partial_team") {
        return data.teammates.length >= 1 && data.teammates.length <= 2;
      }
      if (data.team_option === "solo" || data.team_option === "spectator") {
        return data.teammates.length === 0;
      }
      return true;
    },
    {
      message:
        "Invalid number of teammates for the selected team option. Partial team requires 1-2 teammates, solo/spectator requires 0.",
      path: ["teammates"],
    }
  )
  .refine(
    (data) =>
      data.team_option === "spectator"
        ? data.tagged_team_skills.length === 0
        : data.tagged_team_skills.length >= 1,
    {
      message:
        "Select at least one team skill for team registrations. Spectator registrations should not include team skills.",
      path: ["tagged_team_skills"],
    }
  )
  .refine(
    (data) => {
      if (!data.profile_visible) return true;
      return !!(data.photo_url || data.linkedin_url || data.portfolio_url);
    },
    {
      message: "Add at least a photo, LinkedIn, or social media link to make your profile public",
      path: ["profile_visible"],
    }
  );

export type StepPersonalInfoData = z.infer<typeof stepPersonalInfoSchema>;
export type StepTeamSetupData = z.infer<typeof stepTeamSetupSchema>;
export type StepTeamSkillsData = z.infer<typeof stepTeamSkillsSchema>;
export type FullRegistrationData = z.infer<typeof fullRegistrationSchema>;
