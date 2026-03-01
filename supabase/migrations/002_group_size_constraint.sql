-- Cap registration group size at 3 (you + max 2 teammates)
ALTER TABLE registration_groups
  ADD CONSTRAINT chk_group_size CHECK (group_size BETWEEN 1 AND 3);
