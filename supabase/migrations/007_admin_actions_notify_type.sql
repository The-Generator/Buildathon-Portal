-- Allow admin email notification actions in the admin_actions audit table.
ALTER TABLE admin_actions
  DROP CONSTRAINT IF EXISTS admin_actions_action_type_check;

ALTER TABLE admin_actions
  ADD CONSTRAINT admin_actions_action_type_check
  CHECK (action_type IN (
    'ran_matching',
    'confirmed_matching',
    'unlocked_team',
    'locked_team',
    'moved_participant',
    'swapped_participants',
    'added_participant',
    'removed_participant',
    'created_team',
    'dissolved_team',
    'marked_complete',
    'marked_incomplete',
    'sent_team_notifications'
  ));
