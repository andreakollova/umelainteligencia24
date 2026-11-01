// Daily glossary publisher - runs at 12:00, publishes 1 glossary term to IG + sends Slack notification
// Usage: node scraper/glossary-daily.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateGlossaryCarousel } from './instagram.mjs';
import { glossaryTerms } from './glossary-terms.mjs';
import { getGlossaryCaption } from './captions.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envFile = readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
} catch {}

const SUPABASE_URL = 'https://fxnpgqsztiwqbhvyokgd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IG_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_ACCOUNT = process.env.IG_BUSINESS_ACCOUNT;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

const supabase = SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Track which terms have been posted — never repeat
const STATE_FILE = resolve(__dirname, '../.glossary-posted.json');
function loadPosted() {
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); }
  catch { return { posted: [] }; }
}
function savePosted(state) { writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); }

async function main() {
  console.log('=== inteligencia24 Daily Glossary ===');
  console.log(`Time: ${new Date().toISOString()}`);

  const state = loadPosted();
  const remaining = glossaryTerms.filter(t => !state.posted.includes(t.slug));

  if (remaining.length === 0) {
    console.log('All', glossaryTerms.length, 'terms posted. Add new terms to continue.');
    return;
  }

  const term = remaining[0];
  const termIdx = glossaryTerms.indexOf(term);

  console.log(`Term ${termIdx + 1}/${glossaryTerms.length} (${remaining.length} remaining): ${term.en}`);

  // Generate carousel
  const result = await generateGlossaryCarousel(term);
  if (!result) {
    console.error('Failed to generate carousel');
    process.exit(1);
  }

  // Upload slides to Supabase Storage
  const imageUrls = [];
  for (let i = 0; i < result.slides.length; i++) {
    const buf = readFileSync(result.slides[i]);
    const name = `glossary-${term.slug}-${i + 1}-${Date.now()}.png`;
    await supabase.storage.from('ig-assets').upload(name, buf, { contentType: 'image/png', upsert: true });
    const { data } = supabase.storage.from('ig-assets').getPublicUrl(name);
    imageUrls.push(data.publicUrl);
    console.log(`  Uploaded slide ${i + 1}`);
  }

  // Create IG containers
  const childIds = [];
  for (const url of imageUrls) {
    const res = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: IG_TOKEN }),
    });
    const data = await res.json();
    if (data.error) { console.error('Container error:', data.error); process.exit(1); }
    childIds.push(data.id);
  }

  // Create carousel + publish
  const caption = getGlossaryCaption(termIdx, term.en);
  const carRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: 'CAROUSEL', children: childIds.join(','), caption, access_token: IG_TOKEN }),
  });
  const carData = await carRes.json();
  if (carData.error) { console.error('Carousel error:', carData.error); process.exit(1); }

  console.log('  Waiting 8s...');
  await new Promise(r => setTimeout(r, 8000));

  const pubRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: carData.id, access_token: IG_TOKEN }),
  });
  const pubData = await pubRes.json();
  if (pubData.error) { console.error('Publish error:', pubData.error); process.exit(1); }

  console.log(`  Published! Post ID: ${pubData.id}`);

  // Send Slack notification
  if (SLACK_WEBHOOK) {
    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `Slovníček - ${term.en}`, emoji: true },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Vieš, čo je to... ${term.en}?*\n${term.sk}\n\n${term.explanation.replace(/\*\*/g, '*')}`,
        },
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `Publikované na Instagram o ${new Date().toLocaleTimeString('sk-SK')} | Post ID: ${pubData.id}` },
        ],
      },
    ];

    await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });
    console.log('  Slack notification sent!');
  }

  // Mark as posted — never repeat
  state.posted.push(term.slug);
  savePosted(state);
  console.log('Done! Remaining:', glossaryTerms.length - state.posted.length);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
