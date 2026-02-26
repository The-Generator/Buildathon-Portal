-- 005_registration_restructuring.sql
-- Registration restructuring: cap groups at trios, remove pre-formed teams,
-- add admin actions audit table, simplify AI tools to 5 categories.

-- ============================================================
-- 1. registration_groups: cap group_size at 1-3 (trios max)
-- ============================================================
ALTER TABLE registration_groups
  ADD CONSTRAINT chk_registration_groups_group_size CHECK (group_size BETWEEN 1 AND 3);

-- ============================================================
-- 2. teams: drop invite_code (no more pre-formed teams)
-- ============================================================
DROP INDEX IF EXISTS idx_teams_invite_code;
ALTER TABLE teams DROP COLUMN invite_code;

-- ============================================================
-- 3. teams: update formation_type constraint
--    Backfill pre_formed and NULLs → algorithm_matched first,
--    then swap the CHECK constraint.
-- ============================================================
UPDATE teams SET formation_type = 'algorithm_matched'
  WHERE formation_type = 'pre_formed' OR formation_type IS NULL;

ALTER TABLE teams DROP CONSTRAINT teams_formation_type_check;
ALTER TABLE teams ADD CONSTRAINT teams_formation_type_check
  CHECK (formation_type IN ('algorithm_matched', 'admin_assigned'));

-- ============================================================
-- 4. teams: add lock tracking columns
-- ============================================================
ALTER TABLE teams
  ADD COLUMN locked_by TEXT,
  ADD COLUMN locked_at TIMESTAMPTZ;

-- ============================================================
-- 5. participants: add ai_tools_used for specific tool IDs
-- ============================================================
ALTER TABLE participants
  ADD COLUMN ai_tools_used TEXT[] DEFAULT '{}';

-- ============================================================
-- 6. admin_actions table (supersedes team_audit_log)
-- ============================================================
CREATE TABLE admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'ran_matching', 'confirmed_matching',
    'unlocked_team', 'locked_team',
    'moved_participant', 'swapped_participants',
    'added_participant', 'removed_participant',
    'created_team', 'dissolved_team',
    'marked_complete', 'marked_incomplete'
  )),
  team_id UUID REFERENCES teams(id),
  participant_id UUID REFERENCES participants(id),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_team ON admin_actions(team_id);
CREATE INDEX idx_admin_actions_time ON admin_actions(created_at DESC);
CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
-- Service role (used by admin API routes) bypasses RLS automatically

-- ============================================================
-- 7. Backfill: map old ai_tools strings → new 5 category IDs
--    Old 15 categories collapse to: coding_dev, image_gen,
--    data_research, hardware_iot, business_productivity.
--    Unmapped categories (Music, Video, Audio, etc.) are dropped.
-- ============================================================
UPDATE participants SET ai_tools = ARRAY(
  SELECT DISTINCT category FROM (
    SELECT unnest(ai_tools) AS tool,
      CASE
        WHEN unnest(ai_tools) ILIKE '%coding%' OR unnest(ai_tools) ILIKE '%development%'
          OR unnest(ai_tools) ILIKE '%cursor%' OR unnest(ai_tools) ILIKE '%claude code%'
          OR unnest(ai_tools) ILIKE '%copilot%' OR unnest(ai_tools) ILIKE '%replit%'
          OR unnest(ai_tools) ILIKE '%bolt%' OR unnest(ai_tools) ILIKE '%lovable%'
          OR unnest(ai_tools) ILIKE '%v0.dev%' OR unnest(ai_tools) ILIKE '%windsurf%'
          OR unnest(ai_tools) ILIKE '%rork%' OR unnest(ai_tools) ILIKE '%n8n%'
          OR unnest(ai_tools) ILIKE '%codex%'
          THEN 'coding_dev'
        WHEN unnest(ai_tools) ILIKE '%image%' OR unnest(ai_tools) ILIKE '%design%'
          OR unnest(ai_tools) ILIKE '%midjourney%' OR unnest(ai_tools) ILIKE '%dall-e%'
          OR unnest(ai_tools) ILIKE '%stable diffusion%' OR unnest(ai_tools) ILIKE '%krea%'
          OR unnest(ai_tools) ILIKE '%vizcom%'
          THEN 'image_gen'
        WHEN unnest(ai_tools) ILIKE '%research%' OR unnest(ai_tools) ILIKE '%chatgpt%'
          OR unnest(ai_tools) ILIKE '%large language%' OR unnest(ai_tools) ILIKE '%claude (%'
          OR unnest(ai_tools) ILIKE '%gemini%' OR unnest(ai_tools) ILIKE '%llama%'
          OR unnest(ai_tools) ILIKE '%deep research%' OR unnest(ai_tools) ILIKE '%exa%'
          OR unnest(ai_tools) ILIKE '%firecrawl%' OR unnest(ai_tools) ILIKE '%agent%'
          OR unnest(ai_tools) ILIKE '%langchain%' OR unnest(ai_tools) ILIKE '%browser%'
          THEN 'data_research'
        WHEN unnest(ai_tools) ILIKE '%hardware%' OR unnest(ai_tools) ILIKE '%3d%'
          OR unnest(ai_tools) ILIKE '%meshy%' OR unnest(ai_tools) ILIKE '%limitless%'
          THEN 'hardware_iot'
        WHEN unnest(ai_tools) ILIKE '%productivity%' OR unnest(ai_tools) ILIKE '%superhuman%'
          OR unnest(ai_tools) ILIKE '%motion%' OR unnest(ai_tools) ILIKE '%granola%'
          OR unnest(ai_tools) ILIKE '%rewind%' OR unnest(ai_tools) ILIKE '%gamma%'
          OR unnest(ai_tools) ILIKE '%hosting%' OR unnest(ai_tools) ILIKE '%supabase%'
          OR unnest(ai_tools) ILIKE '%vercel%' OR unnest(ai_tools) ILIKE '%product%'
          OR unnest(ai_tools) ILIKE '%naya%' OR unnest(ai_tools) ILIKE '%flora%'
          OR unnest(ai_tools) ILIKE '%customer%' OR unnest(ai_tools) ILIKE '%intercom%'
          THEN 'business_productivity'
        ELSE NULL
      END AS category
  ) mapped WHERE category IS NOT NULL
)
WHERE array_length(ai_tools, 1) > 0;
