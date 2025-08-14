
-- Create storage bucket for restaurant logos (if not exists)
INSERT INTO storage.buckets (id, name, public)
SELECT 'restaurant-logos', 'restaurant-logos', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'restaurant-logos'
);

-- Create storage bucket for dish images (if not exists)
INSERT INTO storage.buckets (id, name, public)
SELECT 'dish-images', 'dish-images', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'dish-images'
);

-- Create RLS policy for restaurant logo uploads (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Restaurant owners can upload logos'
  ) THEN
    CREATE POLICY "Restaurant owners can upload logos" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'restaurant-logos' AND
      EXISTS (
        SELECT 1 FROM restaurant_owners 
        WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Create RLS policy for dish image uploads (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Restaurant owners can upload dish images'
  ) THEN
    CREATE POLICY "Restaurant owners can upload dish images" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'dish-images' AND
      EXISTS (
        SELECT 1 FROM restaurant_owners 
        WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Create RLS policy for public access to logos (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Anyone can view restaurant logos'
  ) THEN
    CREATE POLICY "Anyone can view restaurant logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'restaurant-logos');
  END IF;
END $$;

-- Create RLS policy for public access to dish images (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Anyone can view dish images'
  ) THEN
    CREATE POLICY "Anyone can view dish images" ON storage.objects
    FOR SELECT USING (bucket_id = 'dish-images');
  END IF;
END $$;

-- Create RLS policy for restaurant owners to update their logos (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Restaurant owners can update their logos'
  ) THEN
    CREATE POLICY "Restaurant owners can update their logos" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'restaurant-logos' AND
      EXISTS (
        SELECT 1 FROM restaurant_owners 
        WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Create RLS policy for restaurant owners to update their dish images (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Restaurant owners can update their dish images'
  ) THEN
    CREATE POLICY "Restaurant owners can update their dish images" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'dish-images' AND
      EXISTS (
        SELECT 1 FROM restaurant_owners 
        WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Create RLS policy for restaurant owners to delete their logos (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Restaurant owners can delete their logos'
  ) THEN
    CREATE POLICY "Restaurant owners can delete their logos" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'restaurant-logos' AND
      EXISTS (
        SELECT 1 FROM restaurant_owners 
        WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Create RLS policy for restaurant owners to delete their dish images (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Restaurant owners can delete their dish images'
  ) THEN
    CREATE POLICY "Restaurant owners can delete their dish images" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'dish-images' AND
      EXISTS (
        SELECT 1 FROM restaurant_owners 
        WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;
