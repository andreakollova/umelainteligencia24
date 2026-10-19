// Migration: Download all images from Supabase Storage → public/images/
// Run once: node scraper/migrate-images.mjs
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
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

const SUPABASE_URL = 'https://fxnpgqsztiwqbhvyokgd.supabase.co';
const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const imgDir = resolve(__dirname, '../public/images');
if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });

async function main() {
  console.log('=== Migrate Images: Supabase Storage → public/images/ ===');

  const { data: articles, error } = await supabase
    .from('articles').select('id, slug, image_url')
    .eq('is_published', true);

  if (error) { console.error('DB Error:', error.message); process.exit(1); }

  const toMigrate = articles.filter(a => a.image_url?.includes('supabase.co'));
  console.log(`Found ${toMigrate.length} articles with Supabase images`);

  let ok = 0, fail = 0;
  for (const a of toMigrate) {
    const filename = a.image_url.split('/').pop();
    const localPath = resolve(imgDir, filename);

    try {
      const res = await fetch(a.image_url);
      if (!res.ok) { console.log('FAIL:', filename, res.status); fail++; continue; }

      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(localPath, buf);

      const newUrl = `/images/${filename}`;
      await supabase.from('articles').update({ image_url: newUrl }).eq('id', a.id);
      console.log('OK:', filename, Math.round(buf.length / 1024) + 'KB');
      ok++;
    } catch (e) {
      console.log('ERR:', filename, e.message);
      fail++;
    }
  }

  console.log(`\nDone! OK: ${ok}, Failed: ${fail}`);
}

main().catch(console.error);
