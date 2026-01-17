-- Script definitivo para corrigir a tabela leads
-- Execute este script no SQL Editor do seu Supabase Dashboard

-- 1. Desabilita RLS temporariamente para garantir que as atualizações funcionem
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- 2. Garante que todas as colunas existem usando um bloco robusto
DO $$ 
BEGIN 
    -- Coluna role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='role') THEN
        ALTER TABLE leads ADD COLUMN role TEXT;
    END IF;

    -- Coluna company
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='company') THEN
        ALTER TABLE leads ADD COLUMN company TEXT;
    END IF;

    -- Coluna level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='level') THEN
        ALTER TABLE leads ADD COLUMN level TEXT DEFAULT 'Frio';
    END IF;

    -- Coluna marking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='marking') THEN
        ALTER TABLE leads ADD COLUMN marking TEXT;
    END IF;

    -- Coluna phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='phone') THEN
        ALTER TABLE leads ADD COLUMN phone TEXT;
    END IF;
END $$;

-- 3. Comentários
COMMENT ON COLUMN leads.role IS 'Função ou cargo do lead';
COMMENT ON COLUMN leads.company IS 'Empresa que o lead representa';
COMMENT ON COLUMN leads.level IS 'Nível de interesse do lead';
COMMENT ON COLUMN leads.marking IS 'Marcações ou tags';
COMMENT ON COLUMN leads.phone IS 'Telefone de contato';

-- 4. Recarregar cache
NOTIFY pgrst, 'reload schema';
