-- Script de migração para adicionar novos campos na tabela properties
-- Execute este script no Supabase SQL Editor
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS main_quota DECIMAL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS lateral_quota DECIMAL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS terrain_config VARCHAR(20) DEFAULT 'regular',
    ADD COLUMN IF NOT EXISTS iptu_value DECIMAL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS spu_value DECIMAL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS other_taxes DECIMAL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS terrain_marking_url TEXT,
    ADD COLUMN IF NOT EXISTS aerial_view_url TEXT,
    ADD COLUMN IF NOT EXISTS front_view_url TEXT,
    ADD COLUMN IF NOT EXISTS side_view_url TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT;
-- Comentários para documentação
COMMENT ON COLUMN properties.main_quota IS 'Cota Principal (m²)';
COMMENT ON COLUMN properties.lateral_quota IS 'Cota Lateral (m²)';
COMMENT ON COLUMN properties.terrain_config IS 'Configuração do Terreno: regular ou irregular';
COMMENT ON COLUMN properties.iptu_value IS 'Valor do IPTU (R$)';
COMMENT ON COLUMN properties.spu_value IS 'Valor SPU (R$)';
COMMENT ON COLUMN properties.other_taxes IS 'Outros Impostos (R$)';
COMMENT ON COLUMN properties.terrain_marking_url IS 'URL da imagem de marcação do terreno';
COMMENT ON COLUMN properties.aerial_view_url IS 'URL da visão aérea';
COMMENT ON COLUMN properties.front_view_url IS 'URL da vista frontal';
COMMENT ON COLUMN properties.side_view_url IS 'URL da vista lateral';