-- Crowd voting for finalist teams. One row per (voter_email, track).
-- Submitting again overwrites the previous pick for that track.
CREATE TABLE IF NOT EXISTS crowd_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_email TEXT NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('athletic_performance', 'accessibility_solutions', 'entrepreneurial_ai')),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (voter_email, track)
);

CREATE INDEX IF NOT EXISTS crowd_votes_track_idx ON crowd_votes(track);
CREATE INDEX IF NOT EXISTS crowd_votes_team_id_idx ON crowd_votes(team_id);
