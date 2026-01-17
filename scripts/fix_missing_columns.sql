-- Script para corrigir colunas faltantes na tabela properties
-- Execute este script no SQL Editor do seu Supabase Dashboard

-- Adiciona coluna floors (Pavimentos)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS floors INTEGER DEFAULT 0;

-- Adiciona coluna sequencial (Sequenciais)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS sequencial TEXT;

-- Adiciona coluna parent_id (para suportar unidades em complexos)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES properties(id) ON DELETE CASCADE;

-- Comentários para documentação
COMMENT ON COLUMN properties.floors IS 'Quantidade de pavimentos do imóvel';
COMMENT ON COLUMN properties.sequencial IS 'Números sequenciais do imóvel';
COMMENT ON COLUMN properties.parent_id IS 'ID do imóvel pai caso este seja uma unidade de um complexo';
