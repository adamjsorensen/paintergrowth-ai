import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client with service role key
const supabaseUrl = 'https://vsxbpknreazkcvjswycc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deployEdgeFunction() {
  try {
    // Read the function code
    const functionCode = fs.readFileSync(
      path.join(__dirname, 'supabase/functions/extract-information/index.ts'),
      'utf-8'
    );

    console.log('Deploying Edge Function...');
    
    // Deploy the function
    const { data, error } = await supabase.functions.update('extract-information', {
      name: 'extract-information',
      body: functionCode,
      verify_jwt: true
    });

    if (error) {
      throw error;
    }

    console.log('✅ Successfully deployed Edge Function');
    console.log('Function URL:', `https://vsxbpknreazkcvjswycc.supabase.co/functions/v1/extract-information`);
  } catch (error) {
    console.error('❌ Error deploying Edge Function:');
    console.error(error);
    process.exit(1);
  }
}

deployEdgeFunction();
