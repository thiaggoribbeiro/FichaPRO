-- Script para criar a tabela de negociações (Kanban)
-- Execute este script no SQL Editor do seu Supabase Dashboard

-- 1. Criar a tabela de negociações
CREATE TABLE IF NOT EXISTS negotiations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    client_name TEXT NOT NULL,
    value NUMERIC(15, 2),
    probability INTEGER DEFAULT 0,
    stage TEXT NOT NULL DEFAULT 'Oportunidade',
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS (desabilitado conforme solicitado para testes iniciais, assim como em leads)
ALTER TABLE negotiations DISABLE ROW LEVEL SECURITY;

-- 3. Comentários
COMMENT ON TABLE negotiations IS 'Tabela que armazena os cards do Kanban de negociação';
COMMENT ON COLUMN negotiations.title IS 'Título da negociação (ex: Nome do Imóvel)';
COMMENT ON COLUMN negotiations.client_name IS 'Nome do cliente interessado';
COMMENT ON COLUMN negotiations.value IS 'Valor da negociação';
COMMENT ON COLUMN negotiations.probability IS 'Probabilidade de fechamento (%)';
COMMENT ON COLUMN negotiations.stage IS 'Estágio atual no funil (Oportunidade, Contactando, Engajado, Negociando, Negócio Fechado, Perdido)';

-- 4. Recarregar cache
NOTIFY pgrst, 'reload schema';
