-- Create storage bucket for ephemeral chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files',
  'chat-files',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip'
  ]
);

-- Allow anyone to upload files (since it's ephemeral and public)
CREATE POLICY "Anyone can upload files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'chat-files');

-- Allow anyone to view files
CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-files');

-- Allow anyone to delete files (for cleanup)
CREATE POLICY "Anyone can delete files"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'chat-files');