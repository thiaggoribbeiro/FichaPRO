-- Script para corrigir as políticas de RLS da tabela leads
-- Execute este script no SQL Editor do seu Supabase Dashboard
-- 1. Garantir que RLS está habilitado
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- 2. Remover políticas antigas se existirem (para evitar duplicatas)
DROP POLICY IF EXISTS "Allow anonymous insert on leads" ON leads;
DROP POLICY IF EXISTS "Allow authenticated users to select leads" ON leads;
DROP POLICY IF EXISTS "Allow authenticated users to update leads" ON leads;
DROP POLICY IF EXISTS "Allow authenticated users to delete leads" ON leads;
DROP POLICY IF EXISTS "Allow authenticated users to insert leads" ON leads;
-- 3. Criar política para permitir inserção anônima (para captura de leads pública)
CREATE POLICY "Allow anonymous insert on leads" ON leads FOR
INSERT WITH CHECK (true);
-- 4. Criar política para permitir que usuários autenticados visualizem leads
CREATE POLICY "Allow authenticated users to select leads" ON leads FOR
SELECT USING (auth.role() = 'authenticated');
-- 5. Criar política para permitir que usuários autenticados criem leads (manualmente)
CREATE POLICY "Allow authenticated users to insert leads" ON leads FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- 6. Criar política para permitir que usuários autenticados atualizem leads
CREATE POLICY "Allow authenticated users to update leads" ON leads FOR
UPDATE USING (auth.role() = 'authenticated');
-- 7. Criar política para permitir que usuários autenticados excluam leads
CREATE POLICY "Allow authenticated users to delete leads" ON leads FOR DELETE USING (auth.role() = 'authenticated');
-- 8. Recarregar cache
NOTIFY pgrst,
'reload schema';