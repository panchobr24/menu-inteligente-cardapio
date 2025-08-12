
-- Create storage bucket for restaurant logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-logos', 'restaurant-logos', true);

-- Create RLS policy for restaurant logo uploads
CREATE POLICY "Restaurant owners can upload logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'restaurant-logos' AND
  EXISTS (
    SELECT 1 FROM restaurant_owners 
    WHERE user_id = auth.uid()
  )
);

-- Create RLS policy for public access to logos
CREATE POLICY "Anyone can view restaurant logos" ON storage.objects
FOR SELECT USING (bucket_id = 'restaurant-logos');

-- Create RLS policy for restaurant owners to update their logos
CREATE POLICY "Restaurant owners can update their logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'restaurant-logos' AND
  EXISTS (
    SELECT 1 FROM restaurant_owners 
    WHERE user_id = auth.uid()
  )
);

-- Create RLS policy for restaurant owners to delete their logos
CREATE POLICY "Restaurant owners can delete their logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'restaurant-logos' AND
  EXISTS (
    SELECT 1 FROM restaurant_owners 
    WHERE user_id = auth.uid()
  )
);
