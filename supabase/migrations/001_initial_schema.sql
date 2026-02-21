-- participants table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  school TEXT NOT NULL,
  school_other TEXT,
  year TEXT NOT NULL,
  tshirt_size TEXT,
  dietary_restrictions TEXT,
  primary_role TEXT NOT NULL,
  specific_skills TEXT[] NOT NULL DEFAULT '{}',
  experience_level TEXT NOT NULL,
  is_self_registered BOOLEAN NOT NULL DEFAULT true,
  registered_by UUID REFERENCES participants(id),
  team_id UUID,
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  formation_type TEXT NOT NULL DEFAULT 'pre_formed' CHECK (formation_type IN ('pre_formed', 'algorithm_matched', 'admin_assigned')),
  is_complete BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  aggregate_roles TEXT[] NOT NULL DEFAULT '{}',
  aggregate_skills TEXT[] NOT NULL DEFAULT '{}',
  project_name TEXT,
  project_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key for team_id after teams table exists
ALTER TABLE participants ADD CONSTRAINT fk_participants_team FOREIGN KEY (team_id) REFERENCES teams(id);

-- registration_groups table
CREATE TABLE registration_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registrant_id UUID NOT NULL REFERENCES participants(id),
  group_size INTEGER NOT NULL,
  team_id UUID REFERENCES teams(id),
  tagged_team_skills TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'organizer' CHECK (role IN ('super_admin', 'organizer', 'judge')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- schedule_items table
CREATE TABLE schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('ceremony', 'workshop', 'meal', 'hacking', 'judging', 'other')),
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX idx_participants_email ON participants(email);
CREATE INDEX idx_participants_phone ON participants(phone);
CREATE INDEX idx_participants_team_id ON participants(team_id);
CREATE INDEX idx_participants_school ON participants(school);
CREATE INDEX idx_participants_checked_in ON participants(checked_in);
CREATE INDEX idx_teams_invite_code ON teams(invite_code);
CREATE INDEX idx_teams_is_complete ON teams(is_complete);
CREATE INDEX idx_teams_is_locked ON teams(is_locked);
CREATE INDEX idx_registration_groups_registrant_id ON registration_groups(registrant_id);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_schedule_items_sort_order ON schedule_items(sort_order);

-- RLS Policies
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;

-- Public read access to schedule
CREATE POLICY "Schedule items are viewable by everyone" ON schedule_items FOR SELECT USING (true);

-- Service role has full access (API routes use service role)
-- Anon users can read schedule only
CREATE POLICY "Anon can read schedule" ON schedule_items FOR SELECT TO anon USING (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER participants_updated_at BEFORE UPDATE ON participants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
