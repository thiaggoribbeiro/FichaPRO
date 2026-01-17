-- Add new columns to leads table for full lead profile
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS company TEXT DEFAULT '';

-- Add comments for documentation
COMMENT ON COLUMN leads.role IS 'Job function/role of the lead';
COMMENT ON COLUMN leads.company IS 'Company or organization the lead belongs to';
