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
    school: z.enum([...SCHOOLS]),
    school_other: z.string().optional(),
    year: z.enum([...YEARS]),
    dietary_restrictions: z.string().optional(),
    primary_role: z.enum([...PRIMARY_ROLES]),
    specific_skills: z
      .array(z.enum([...SPECIFIC_SKILLS]))
      .min(1, "Select at least one skill"),
    experience_level: z.enum([...EXPERIENCE_LEVELS]),
    ai_tools: z.array(z.string()).optional().default([]),
    // Public Profile (optional)
    linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    portfolio_url: z.string().url("Invalid portfolio URL").optional().or(z.literal("")),
    bio: z.string().max(280, "Bio must be 280 characters or less").optional().or(z.literal("")),
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
  );

// Step 2: Team Setup
const teammateSchema = z.object({
  full_name: z.string().min(2, "Teammate name must be at least 2 characters"),
  email: z.string().email("Invalid teammate email address"),
});

export const stepTeamSetupSchema = z
  .object({
    team_option: z.enum(["full_team", "partial_team", "solo", "spectator"]),
    teammates: z.array(teammateSchema),
    needs_more_members: z.enum(["yes", "no", ""]).optional().default(""),
    members_requested: z.number().int().min(1).max(4).nullable().optional().default(null),
  })
  .refine(
    (data) => {
      if (data.team_option === "full_team") {
        return data.teammates.length === 4;
      }
      if (data.team_option === "partial_team") {
        return data.teammates.length >= 1 && data.teammates.length <= 3;
      }
      if (data.team_option === "solo" || data.team_option === "spectator") {
        return data.teammates.length === 0;
      }
      return true;
    },
    {
      message:
        "Invalid number of teammates for the selected team option. Full team requires exactly 4 teammates, partial team requires 1-3, solo/spectator requires 0.",
      path: ["teammates"],
    }
  )
  .refine(
    (data) => {
      if (data.team_option !== "partial_team") return true;
      if (data.needs_more_members !== "yes") return true;
      if (!data.members_requested || data.members_requested < 1) return false;
      // Total = registrant (1) + teammates + requested must not exceed 5
      const groupSize = 1 + data.teammates.length;
      return groupSize + data.members_requested <= 5;
    },
    {
      message:
        "Total team size (you + teammates + requested members) cannot exceed 5.",
      path: ["members_requested"],
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
    school: z.enum([...SCHOOLS]),
    school_other: z.string().optional(),
    year: z.enum([...YEARS]),
    dietary_restrictions: z.string().optional(),
    // Optional for spectators (Jotform condition #1 disables these)
    primary_role: z.enum([...PRIMARY_ROLES]).optional(),
    specific_skills: z.array(z.enum([...SPECIFIC_SKILLS])).optional().default([]),
    experience_level: z.enum([...EXPERIENCE_LEVELS]).optional(),
    ai_tools: z.array(z.string()).optional().default([]),
    // Public Profile (optional)
    linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    portfolio_url: z.string().url("Invalid portfolio URL").optional().or(z.literal("")),
    bio: z.string().max(280, "Bio must be 280 characters or less").optional().or(z.literal("")),
    profile_visible: z.boolean().optional().default(false),

    // Step 2: Team Setup
    team_option: z.enum(["full_team", "partial_team", "solo", "spectator"]),
    teammates: z.array(teammateSchema),
    needs_more_members: z.enum(["yes", "no", ""]).optional().default(""),
    members_requested: z.number().int().min(1).max(4).nullable().optional().default(null),

    // Step 3: Team Skills
    tagged_team_skills: z.array(z.enum([...SPECIFIC_SKILLS])),
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
      return data.specific_skills && data.specific_skills.length >= 1;
    },
    {
      message: "Select at least one skill",
      path: ["specific_skills"],
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
      if (data.team_option === "full_team") {
        return data.teammates.length === 4;
      }
      if (data.team_option === "partial_team") {
        return data.teammates.length >= 1 && data.teammates.length <= 3;
      }
      if (data.team_option === "solo" || data.team_option === "spectator") {
        return data.teammates.length === 0;
      }
      return true;
    },
    {
      message:
        "Invalid number of teammates for the selected team option. Full team requires exactly 4 teammates, partial team requires 1-3, solo/spectator requires 0.",
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
      if (data.team_option !== "partial_team") return true;
      if (data.needs_more_members !== "yes") return true;
      if (!data.members_requested || data.members_requested < 1) return false;
      const groupSize = 1 + data.teammates.length;
      return groupSize + data.members_requested <= 5;
    },
    {
      message:
        "Total team size (you + teammates + requested members) cannot exceed 5.",
      path: ["members_requested"],
    }
  );

export type StepPersonalInfoData = z.infer<typeof stepPersonalInfoSchema>;
export type StepTeamSetupData = z.infer<typeof stepTeamSetupSchema>;
export type StepTeamSkillsData = z.infer<typeof stepTeamSkillsSchema>;
export type FullRegistrationData = z.infer<typeof fullRegistrationSchema>;
