-- Fix warnings flagged by Supabase security advisor.

-- 1. Function Search Path Mutable: pin search_path so the trigger function
-- can't be hijacked by a role with a different search_path.
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Public Bucket Allows Listing: the avatars bucket is served via
-- getPublicUrl(), which hits the public object endpoint and bypasses RLS
-- entirely -- it never needs this policy. The broad SELECT policy only
-- served to let anyone enumerate/list every file in the bucket via the
-- storage API, so drop it.
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
