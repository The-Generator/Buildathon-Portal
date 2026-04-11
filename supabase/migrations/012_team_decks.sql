-- Deck submission: file uploads tied to teams.
-- Files are stored in the "team-decks" Supabase Storage bucket; the row
-- holds the storage path (e.g. "teams/<uuid>/deck.pdf") and a timestamp.

ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS deck_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS deck_filename TEXT,
  ADD COLUMN IF NOT EXISTS deck_uploaded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS teams_deck_uploaded_at_idx ON teams(deck_uploaded_at);
