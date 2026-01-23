-- Adiciona coluna fiche_available (Ficha Disponível?)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS fiche_available BOOLEAN DEFAULT TRUE;
-- Comentário para documentação
COMMENT ON COLUMN properties.fiche_available IS 'Indica se a ficha técnica do imóvel está disponível para visualização (Sim/Não)';