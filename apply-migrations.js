import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New Supabase credentials
const supabaseUrl = 'https://wydfkyjcbrbewwaubqno.supabase.co';
const supabaseKey = 'sb_publishable_xIJL7UfTcwcamz9yDQdYPw_NUb44JHp';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigrations() {
  const migrationsDir = path.join(__dirname, 'supabase', 'migration');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`Found ${migrationFiles.length} migration files`);

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Applying migration: ${file}`);
    
    try {
      // Note: Using the REST API directly won't work for DDL statements
      // You'll need to run these through the Supabase SQL Editor
      console.log(`SQL content for ${file}:`);
      console.log('--- START SQL ---');
      console.log(sql);
      console.log('--- END SQL ---');
      console.log('\n');
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log('\nIMPORTANT: These migrations need to be applied manually through the Supabase Dashboard:');
  console.log('1. Go to https://supabase.com/dashboard/project/wydfkyjcbrbewwaubqno');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Run each migration file in order');
  console.log('4. The SQL content for each migration has been printed above');
}

applyMigrations().catch(console.error);