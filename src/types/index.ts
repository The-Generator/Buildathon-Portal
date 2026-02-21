export interface Participant {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  school: string;
  school_other?: string | null;
  year: string;
  tshirt_size: string;
  dietary_restrictions?: string | null;
  primary_role: string;
  specific_skills: string[];
  experience_level: string;
  is_self_registered: boolean;
  registered_by?: string | null;
  team_id?: string | null;
  checked_in: boolean;
  checked_in_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  invite_code: string;
  formation_type: "pre_formed" | "algorithm_matched" | "admin_assigned";
  is_complete: boolean;
  is_locked: boolean;
  aggregate_roles: string[];
  aggregate_skills: string[];
  project_name?: string | null;
  project_description?: string | null;
  created_at: string;
  updated_at: string;
  members?: Participant[];
}

export interface RegistrationGroup {
  id: string;
  registrant_id: string;
  group_size: number;
  team_id?: string | null;
  tagged_team_skills: string[];
  created_at: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "organizer" | "judge";
  created_at: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  location?: string | null;
  type: "ceremony" | "workshop" | "meal" | "hacking" | "judging" | "other";
  sort_order: number;
}

export interface RegistrationFormData {
  // Step 1: Personal Info
  full_name: string;
  email: string;
  phone: string;
  school: string;
  school_other?: string;
  year: string;
  tshirt_size: string;
  dietary_restrictions?: string;
  primary_role: string;
  specific_skills: string[];
  experience_level: string;

  // Step 2: Team Setup
  team_option: "full_team" | "partial_team" | "solo";
  teammates: { full_name: string; email: string }[];

  // Step 3: Team Skills
  tagged_team_skills: string[];
}
