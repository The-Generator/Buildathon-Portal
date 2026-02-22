-- 002_spring26_schema.sql
-- Adds: participant_type, ai_tools, members_requested, event_config table

-- participant_type column on participants
ALTER TABLE participants
  ADD COLUMN participant_type TEXT NOT NULL DEFAULT 'participant'
  CHECK (participant_type IN ('participant', 'spectator', 'walk_in'));

-- ai_tools column on participants
ALTER TABLE participants
  ADD COLUMN ai_tools TEXT[] NOT NULL DEFAULT '{}';

-- members_requested column on registration_groups
ALTER TABLE registration_groups
  ADD COLUMN members_requested INTEGER;

-- event_config single-row table
CREATE TABLE event_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_released BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure single-row constraint on event_config
CREATE UNIQUE INDEX idx_event_config_singleton ON event_config ((true));

-- RLS for event_config
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event config is viewable by everyone" ON event_config FOR SELECT USING (true);

-- Updated_at trigger for event_config
CREATE TRIGGER event_config_updated_at BEFORE UPDATE ON event_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index on participant_type for filtering
CREATE INDEX idx_participants_participant_type ON participants(participant_type);

-- Seed default event_config row
INSERT INTO event_config (track_released) VALUES (false);

-- Backfill: existing rows already have defaults from column definition
-- participant_type defaults to 'participant', ai_tools defaults to '{}'
