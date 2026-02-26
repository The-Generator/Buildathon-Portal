export interface Participant {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  school: string;
  school_other?: string | null;
  year: string;
  tshirt_size?: string | null;
  dietary_restrictions?: string | null;
  primary_role: string;
  specific_skills: string[];
  experience_level: string;
  participant_type: string;
  ai_tools: string[];
  ai_tools_used?: string[] | null;
  is_self_registered: boolean;
  registered_by?: string | null;
  team_id?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  bio?: string | null;
  profile_visible: boolean;
  checked_in: boolean;
  checked_in_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  formation_type: "algorithm_matched" | "admin_assigned";
  is_complete: boolean;
  is_locked: boolean;
  locked_by?: string | null;
  locked_at?: string | null;
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
  members_requested: number | null;
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

export interface TeamAuditEntry {
  id: string;
  team_id: string;
  admin_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface EventConfig {
  id: string;
  track_released: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegistrationFormData {
  // Step 1: Personal Info
  full_name: string;
  email: string;
  phone: string;
  school: string;
  school_other?: string;
  year: string;
  dietary_restrictions?: string;
  // Optional for spectators (Jotform condition #1 disables these)
  primary_role?: string;
  specific_skills?: string[];
  experience_level?: string;

  // Step 2: Team Setup
  team_option: "full_team" | "partial_team" | "solo" | "spectator";
  teammates: { full_name: string; email: string }[];

  // AI Tools
  ai_tools: string[];

  // Public Profile (optional)
  linkedin_url?: string;
  portfolio_url?: string;
  bio?: string;
  profile_visible?: boolean;

  // Partial team: need more members?
  needs_more_members?: "yes" | "no" | "";
  members_requested?: number | null;

  // Step 3: Team Skills
  tagged_team_skills: string[];
}
