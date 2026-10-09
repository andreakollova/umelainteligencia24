import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://odpwfmrllqjdzgbgrxfc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcHdmbXJsbHFqZHpnYmdyeGZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTM3MzIyNywiZXhwIjoyMTA2OTQ5MjI3fQ.YTSCLq6fJCeRmzbI4VEMDdLV90RRIgv9Ymvu5kJEjt4'
);

// Try to query articles to see if tables exist
const { data, error } = await supabase.from('articles').select('id').limit(1);
if (!error) {
  console.log('Tables already exist, articles found:', data.length);
  process.exit(0);
}

console.log('Tables do not exist yet. Please run setup-db.sql in Supabase SQL Editor.');
console.log('Go to: https://supabase.com/dashboard/project/odpwfmrllqjdzgbgrxfc/sql');
process.exit(1);
