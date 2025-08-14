-- Adicionar colunas que estão faltando na tabela restaurants
-- Execute este SQL no painel do Supabase > SQL Editor

-- Adicionar colunas de personalização de fonte e estilo de cabeçalho
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter';

ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS header_style TEXT DEFAULT 'logo-name';

-- Adicionar colunas de personalização dos cards
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS card_background_color TEXT DEFAULT '#ffffff';

ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS card_size TEXT DEFAULT 'medium';

-- Atualizar registros existentes com valores padrão
UPDATE restaurants 
SET font_family = 'Inter' 
WHERE font_family IS NULL;

UPDATE restaurants 
SET header_style = 'logo-name' 
WHERE header_style IS NULL;

UPDATE restaurants 
SET card_background_color = '#ffffff' 
WHERE card_background_color IS NULL;

UPDATE restaurants 
SET card_size = 'medium' 
WHERE card_size IS NULL;

-- Verificar se as colunas foram adicionadas corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND table_schema = 'public'
ORDER BY ordinal_position;
