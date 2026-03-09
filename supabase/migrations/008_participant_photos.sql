-- Add photo_url column to participants
ALTER TABLE participants ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create storage bucket for participant avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to the avatars bucket (registration is public)
CREATE POLICY "Anyone can upload avatars"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow public read access to avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');
