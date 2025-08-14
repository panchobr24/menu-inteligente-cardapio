-- Script para adicionar colunas de personalização de fundo
-- Execute este script no SQL Editor do seu projeto Supabase

-- Adicionar colunas de personalização de fundo na tabela restaurants
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS background_color TEXT,
ADD COLUMN IF NOT EXISTS background_image_url TEXT;

-- Atualizar restaurantes existentes com valores padrão
UPDATE restaurants 
SET background_color = NULL, background_image_url = NULL 
WHERE background_color IS NULL AND background_image_url IS NULL;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND column_name IN ('background_color', 'background_image_url');
