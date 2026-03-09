-- Add SELECT policies for tables that the browser client needs to read.
-- The admin dashboard uses the anon-key browser client to fetch teams and participants.

CREATE POLICY "Teams are viewable by everyone"
  ON teams FOR SELECT USING (true);

CREATE POLICY "Participants are viewable by everyone"
  ON participants FOR SELECT USING (true);

CREATE POLICY "Registration groups are viewable by everyone"
  ON registration_groups FOR SELECT USING (true);
