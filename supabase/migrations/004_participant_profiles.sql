-- 004_participant_profiles.sql
-- Adds: linkedin_url, portfolio_url, bio, profile_visible for participant networking

ALTER TABLE participants
  ADD COLUMN linkedin_url TEXT,
  ADD COLUMN portfolio_url TEXT,
  ADD COLUMN bio TEXT,
  ADD COLUMN profile_visible BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_participants_profile_visible ON participants(profile_visible);
