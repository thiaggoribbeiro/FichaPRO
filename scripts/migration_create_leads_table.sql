-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Add comments
COMMENT ON TABLE leads IS 'Table to store leads captured from public property sheets.';
COMMENT ON COLUMN leads.property_id IS 'Reference to the property the lead is interested in.';
COMMENT ON COLUMN leads.name IS 'Full name of the lead.';
COMMENT ON COLUMN leads.email IS 'Email address of the lead.';
COMMENT ON COLUMN leads.phone IS 'Phone number of the lead.';
-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- Create policy to allow anonymous inserts (for public lead capture)
CREATE POLICY "Allow anonymous insert on leads" ON leads FOR
INSERT WITH CHECK (true);
-- Create policy to allow authenticated users to view leads
CREATE POLICY "Allow authenticated users to select leads" ON leads FOR
SELECT USING (auth.role() = 'authenticated');