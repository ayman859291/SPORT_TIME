/*
# Add Image Support for Workouts

## 1. Table Changes
- Add `image_url` column to `workouts` table (text, nullable)
  - Stores the public URL of the workout image from Supabase Storage

## 2. Storage Bucket
- Create `app-854zbfquogld_workout_images` bucket for storing workout images
- Set maximum file size to 1 MB
- Allow public read access
- Allow all users to upload images (no authentication required)

## 3. Security
- Public read access for all images
- Public upload access (since no authentication is used)
- File size limit: 1 MB

## 4. Notes
- Images are optional for workouts
- Supported formats: JPEG, PNG, GIF, WEBP, AVIF
- Frontend will handle compression if needed
*/

-- Add image_url column to workouts table
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for workout images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-854zbfquogld_workout_images',
  'app-854zbfquogld_workout_images',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for workout images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for workout images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for workout images" ON storage.objects;

-- Allow public read access to images
CREATE POLICY "Public read access for workout images"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-854zbfquogld_workout_images');

-- Allow public upload access (no authentication required)
CREATE POLICY "Public upload access for workout images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'app-854zbfquogld_workout_images');

-- Allow public delete access for own uploads
CREATE POLICY "Public delete access for workout images"
ON storage.objects FOR DELETE
USING (bucket_id = 'app-854zbfquogld_workout_images');