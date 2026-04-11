-- Track declaration on teams
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS track TEXT
  CHECK (track IN ('athletic_performance', 'accessibility_solutions', 'entrepreneurial_ai'));

CREATE INDEX IF NOT EXISTS teams_track_idx ON teams(track);

-- Judge scores: one row per (judge, team)
CREATE TABLE IF NOT EXISTS judge_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_name TEXT NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('athletic_performance', 'accessibility_solutions', 'entrepreneurial_ai')),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team_number INTEGER NOT NULL,
  business_strength NUMERIC(2,1) NOT NULL CHECK (business_strength >= 1 AND business_strength <= 5),
  track_focus NUMERIC(2,1) NOT NULL CHECK (track_focus >= 1 AND track_focus <= 5),
  innovation NUMERIC(2,1) NOT NULL CHECK (innovation >= 1 AND innovation <= 5),
  execution NUMERIC(2,1) NOT NULL CHECK (execution >= 1 AND execution <= 5),
  presentation NUMERIC(2,1) NOT NULL CHECK (presentation >= 1 AND presentation <= 5),
  notes TEXT,
  total_score NUMERIC(3,1) GENERATED ALWAYS AS (
    business_strength + track_focus + innovation + execution + presentation
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (judge_name, team_id)
);

CREATE INDEX IF NOT EXISTS judge_scores_team_id_idx ON judge_scores(team_id);
CREATE INDEX IF NOT EXISTS judge_scores_track_idx ON judge_scores(track);
CREATE INDEX IF NOT EXISTS judge_scores_team_number_idx ON judge_scores(team_number);
