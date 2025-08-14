-- Script para criar os buckets de storage no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Criar bucket para logos de restaurantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-logos', 'restaurant-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar bucket para imagens de pratos
INSERT INTO storage.buckets (id, name, public)
VALUES ('dish-images', 'dish-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar se os buckets foram criados
SELECT id, name, public FROM storage.buckets WHERE id IN ('restaurant-logos', 'dish-images');

-- 4. Criar políticas RLS para o bucket restaurant-logos
CREATE POLICY IF NOT EXISTS "Restaurant owners can upload logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'restaurant-logos' AND
  EXISTS (
    SELECT 1 FROM restaurant_owners 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Anyone can view restaurant logos" ON storage.objects
FOR SELECT USING (bucket_id = 'restaurant-logos');

CREATE POLICY IF NOT EXISTS "Restaurant owners can update their logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'restaurant-logos' AND
  EXISTS (
    SELECT 1 FROM restaurant_owners 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Restaurant owners can delete their logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'restaurant-logos' AND
  EXISTS (
    SELECT 1 FROM restaurant_owners 
    WHERE user_id = auth.uid()
  )
);

-- 5. Criar políticas RLS para o bucket dish-images
CREATE POLICY IF NOT EXISTS "Restaurant owners can upload dish images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'dish-images' AND
  EXISTS (
    SELECT 1 FROM restaurant_owners 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Anyone can view dish images" ON storage.objects
FOR SELECT USING (bucket_id = 'dish-images');

CREATE POLICY IF NOT EXISTS "Restaurant owners can update their dish images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'dish-images' AND
  EXISTS (
    SELECT 1 FROM restaurant_owners 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Restaurant owners can delete their dish images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'dish-images' AND
  EXISTS (
    SELECT 1 FROM restaurant_owners 
    WHERE user_id = auth.uid()
  )
);

-- 6. Verificar as políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
