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
    team_option: z.enum(["full_team", "partial_team", "solo"]),
    teammates: z.array(teammateSchema),
  })
  .refine(
    (data) => {
      if (data.team_option === "full_team") {
        return data.teammates.length === 4;
      }
      if (data.team_option === "partial_team") {
        return data.teammates.length >= 1 && data.teammates.length <= 3;
      }
      if (data.team_option === "solo") {
        return data.teammates.length === 0;
      }
      return true;
    },
    {
      message:
        "Invalid number of teammates for the selected team option. Full team requires exactly 4 teammates, partial team requires 1-3, solo requires 0.",
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
    primary_role: z.enum([...PRIMARY_ROLES]),
    specific_skills: z
      .array(z.enum([...SPECIFIC_SKILLS]))
      .min(1, "Select at least one skill"),
    experience_level: z.enum([...EXPERIENCE_LEVELS]),

    // Step 2: Team Setup
    team_option: z.enum(["full_team", "partial_team", "solo"]),
    teammates: z.array(teammateSchema),

    // Step 3: Team Skills
    tagged_team_skills: z
      .array(z.enum([...SPECIFIC_SKILLS]))
      .min(1, "Select at least one team skill"),
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
      if (data.team_option === "full_team") {
        return data.teammates.length === 4;
      }
      if (data.team_option === "partial_team") {
        return data.teammates.length >= 1 && data.teammates.length <= 3;
      }
      if (data.team_option === "solo") {
        return data.teammates.length === 0;
      }
      return true;
    },
    {
      message:
        "Invalid number of teammates for the selected team option. Full team requires exactly 4 teammates, partial team requires 1-3, solo requires 0.",
      path: ["teammates"],
    }
  );

export type StepPersonalInfoData = z.infer<typeof stepPersonalInfoSchema>;
export type StepTeamSetupData = z.infer<typeof stepTeamSetupSchema>;
export type StepTeamSkillsData = z.infer<typeof stepTeamSkillsSchema>;
export type FullRegistrationData = z.infer<typeof fullRegistrationSchema>;
