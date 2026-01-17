-- Add new columns to leads table for enhanced management
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Frio',
ADD COLUMN IF NOT EXISTS marking TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);

-- Add comments for documentation
COMMENT ON COLUMN leads.level IS 'Lead status level: Frio, Morno, Quente';
COMMENT ON COLUMN leads.marking IS 'General tags or internal labels for the lead';
COMMENT ON COLUMN leads.author_id IS 'References the user who manually created or last modified the lead';
