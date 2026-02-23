-- 003_team_audit_log.sql
-- Adds: team_audit_log table for tracking admin mutations on teams

CREATE TABLE team_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id),
  admin_id UUID NOT NULL REFERENCES admins(id),
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_team_audit_log_team_id ON team_audit_log(team_id);
CREATE INDEX idx_team_audit_log_admin_id ON team_audit_log(admin_id);
CREATE INDEX idx_team_audit_log_created_at ON team_audit_log(created_at);

-- RLS
ALTER TABLE team_audit_log ENABLE ROW LEVEL SECURITY;
