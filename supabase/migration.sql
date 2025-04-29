
-- Create storage buckets for avatars and company logos if they don't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

INSERT INTO storage.buckets (id, name, public)
SELECT 'company-logos', 'company-logos', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'company-logos');

-- Create storage RLS policies for avatars
INSERT INTO storage.policies (name, definition, bucket_id)
SELECT 
  'Avatar images are publicly accessible',
  'bucket_id = ''avatars''',
  'avatars'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE name = 'Avatar images are publicly accessible' AND bucket_id = 'avatars'
);

-- Create storage RLS policies for company logos
INSERT INTO storage.policies (name, definition, bucket_id)
SELECT 
  'Company logos are publicly accessible',
  'bucket_id = ''company-logos''',
  'company-logos'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE name = 'Company logos are publicly accessible' AND bucket_id = 'company-logos'
);
