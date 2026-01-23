-- ============================================
-- Script: Política de Leitura Pública para Properties
-- Objetivo: Permitir que usuários não autenticados possam
--           visualizar fichas de imóveis através de links compartilhados
-- ============================================
-- Verifica se RLS está habilitado (se não estiver, habilita)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- Remove política existente se houver (para evitar erro de duplicação)
DROP POLICY IF EXISTS "Allow public read on properties" ON properties;
-- Cria política que permite SELECT público em properties
-- Isso é necessário para que links compartilhados funcionem sem autenticação
CREATE POLICY "Allow public read on properties" ON properties FOR
SELECT USING (true);
-- Mantém políticas de INSERT, UPDATE e DELETE apenas para usuários autenticados
-- (essas políticas provavelmente já existem, mas garantimos aqui)
-- Política para INSERT (apenas autenticados)
DROP POLICY IF EXISTS "Allow authenticated insert on properties" ON properties;
CREATE POLICY "Allow authenticated insert on properties" ON properties FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- Política para UPDATE (apenas autenticados)
DROP POLICY IF EXISTS "Allow authenticated update on properties" ON properties;
CREATE POLICY "Allow authenticated update on properties" ON properties FOR
UPDATE USING (auth.role() = 'authenticated');
-- Política para DELETE (apenas autenticados)
DROP POLICY IF EXISTS "Allow authenticated delete on properties" ON properties;
CREATE POLICY "Allow authenticated delete on properties" ON properties FOR DELETE USING (auth.role() = 'authenticated');
-- ============================================
-- COMO EXECUTAR:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script e clique em "Run"
-- ============================================