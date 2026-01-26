
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
    console.log("Checking total count...");
    const { count, error: countError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error("Count Error:", countError);
    } else {
        console.log("Total properties in table:", count);
    }

    console.log("\nFetching one ID to test single fetch...");
    const { data: listData, error: listError } = await supabase
        .from('properties')
        .select('id')
        .limit(1);

    if (listError || !listData || listData.length === 0) {
        console.error("Could not get an ID to test:", listError);
        return;
    }

    const testId = listData[0].id;
    console.log("Testing fetchFullProperty with ID:", testId);

    const { data: fullData, error: fullError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', testId)
        .single();

    if (fullError) {
        console.error("fetchFullProperty FAILED!");
        console.error("Error Message:", fullError.message);
        console.error("Error Hint:", fullError.hint);
        console.error("Error Details:", fullError.details);
    } else {
        console.log("fetchFullProperty successful!");
        console.log("Record keys:", Object.keys(fullData));
    }
}

inspectFields();
