
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(
    envFile.split('\n')
        .filter(line => line.includes('='))
        .map(line => line.split('=').map(part => part.trim().replace(/^["']|["']$/g, '')))
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspectFields() {
    const { data, error } = await supabase.from('properties').select('*').limit(1);
    if (error) {
        console.error(error);
        return;
    }
    if (data && data.length > 0) {
        console.log("Fields in properties table:");
        console.log(Object.keys(data[0]));
        console.log("Full first record sample:");
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log("No data found in properties table.");
    }
}

inspectFields();
