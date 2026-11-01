// Keep only the newest 50 articles, delete the rest + their images
// Runs daily via GitHub Actions
import { createClient } from '@supabase/supabase-js';
import { unlinkSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const envFile = (await import('fs')).readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length && !process.env[key.trim()]) process.env[key.trim()] = vals.join('=').trim();
  });
} catch {}

const supabase = createClient(
  'https://fxnpgqsztiwqbhvyokgd.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const KEEP = 50;

async function main() {
  console.log('=== Cleanup: keep newest', KEEP, 'articles ===');

  const { data: all } = await supabase
    .from('articles')
    .select('id, image_url, slug')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (!all) { console.log('No articles found'); return; }
  console.log('Total articles:', all.length);

  if (all.length <= KEEP) { console.log('Nothing to delete'); return; }

  const toDelete = all.slice(KEEP);
  console.log('Deleting:', toDelete.length, 'old articles');

  for (const a of toDelete) {
    // Delete image file if local
    if (a.image_url?.startsWith('/images/')) {
      const imgPath = resolve(__dirname, '..', 'public', a.image_url.substring(1));
      if (existsSync(imgPath)) {
        unlinkSync(imgPath);
        console.log('  DEL image:', a.image_url.split('/').pop());
      }
    }

    // Delete from DB
    await supabase.from('articles').delete().eq('id', a.id);
  }

  console.log('Done! Kept', KEEP, ', deleted', toDelete.length);
}

main().catch(console.error);
