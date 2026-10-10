// IG Repost: Monitor Slack channel for photos + text, generate carousel, publish to IG
// Usage: node scraper/ig-repost.mjs
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
try {
  const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length && !process.env[key.trim()]) process.env[key.trim()] = vals.join('=').trim();
  });
} catch {}

// Setup fonts
const fontsDir = resolve(__dirname, 'fonts');
if (existsSync(fontsDir)) {
  const tmpFonts = '/tmp/fonts';
  if (!existsSync(tmpFonts)) mkdirSync(tmpFonts, { recursive: true });
  try { require('fs').copyFileSync(resolve(fontsDir, 'Inter.ttf'), resolve(tmpFonts, 'Inter.ttf')); } catch {}
  process.env.FONTCONFIG_PATH = tmpFonts;
}

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL = process.env.SLACK_REPOST_CHANNEL;
const IG_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_ACCOUNT = process.env.IG_BUSINESS_ACCOUNT;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fxnpgqsztiwqbhvyokgd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const W = 1086;
const H = 1448;
const STATE_FILE = resolve(__dirname, '../.repost-state.json');

function loadState() {
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); }
  catch { return { lastTs: '0' }; }
}
function saveState(state) { writeFileSync(STATE_FILE, JSON.stringify(state)); }

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

async function translateText(text) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Prelož do slovenčiny. Krátke, pútavé. Max 6 viet. Dôležité slová označ **bold** (1-3 slová naraz, nie celé vety). Správna diakritika. Vráť IBA preložený text.\n\n' + text }],
    temperature: 0.3, max_tokens: 500,
  });
  return res.choices[0].message.content.trim();
}

async function generateSlide1(photoPath, title) {
  const templatePath = resolve(__dirname, 'templates/carousel/slide1.png');
  const template = readFileSync(templatePath);

  // Download photo
  const photoBuf = readFileSync(photoPath);
  
  const photoResized = await sharp(photoBuf).resize(W, H, { fit: 'cover' }).toBuffer();

  // Title overlay
  const titleLines = wrapText(title, 22);
  const lineHeight = 80;
  const titleStartY = H - 260 - titleLines.length * lineHeight;
  const titleSvg = titleLines.map((line, i) =>
    `<text x="80" y="${titleStartY + i * lineHeight + 70}" font-family="Inter, sans-serif" font-size="72" font-weight="800" fill="#ffffff">${escapeXml(line)}</text>`
  ).join('\n');

  const gradientSvg = Buffer.from(`<svg width="${W}" height="${H}">
    <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.4" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.75" stop-color="#000" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.9"/>
    </linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#fade)"/>
    ${titleSvg}
  </svg>`);

  return sharp(photoResized)
    .composite([
      { input: gradientSvg, top: 0, left: 0 },
      { input: template, top: 0, left: 0 },
    ])
    .png().toBuffer();
}

async function generateSlideNoText(photoPath) {
  const templatePath = resolve(__dirname, 'templates/carousel/slide-notext.png');
  const template = readFileSync(templatePath);

  const photoBuf = readFileSync(photoPath);
  
  const photoResized = await sharp(photoBuf).resize(W, H, { fit: 'cover' }).toBuffer();

  return sharp(photoResized)
    .composite([{ input: template, top: 0, left: 0 }])
    .png().toBuffer();
}

async function main() {
  console.log('=== IG Repost Check ===');
  console.log('Time:', new Date().toISOString());

  if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL) {
    console.log('Missing SLACK_BOT_TOKEN or SLACK_REPOST_CHANNEL');
    return;
  }

  const state = loadState();

  // Get messages from channel since last check
  const res = await fetch(`https://slack.com/api/conversations.history?channel=${SLACK_CHANNEL}&oldest=${state.lastTs}&limit=5`, {
    headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}` },
  });
  const data = await res.json();

  if (!data.ok) {
    console.log('Slack error:', data.error);
    return;
  }

  const messages = (data.messages || []).filter(m => !m.bot_id && (m.files?.length > 0 || m.text));

  if (messages.length === 0) {
    console.log('No new messages');
    return;
  }

  for (const msg of messages.reverse()) {
    const files = (msg.files || []).filter(f => f.mimetype?.startsWith('image/'));
    if (files.length === 0) continue;

    console.log('Processing:', files.length, 'photos');
    console.log('Text:', (msg.text || '').substring(0, 100));

    // Download all photos
    const photoUrls = [];
    for (const f of files) {
      const dlRes = await fetch(f.url_private_download || f.url_private, {
        headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}` },
      });
      const buf = Buffer.from(await dlRes.arrayBuffer());
      const tmpPath = `/tmp/repost-${Date.now()}-${photoUrls.length}.png`;
      writeFileSync(tmpPath, buf);
      photoUrls.push(tmpPath);
    }

    // Translate caption
    const caption = msg.text || '';
    let skCaption = caption;
    if (caption.length > 10) {
      skCaption = await translateText(caption);
    }

    // Generate title (first line of translation)
    const title = skCaption.split('.')[0].replace(/\*\*/g, '') + '.';

    // Generate slides
    const outputDir = '/tmp/repost-slides';
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

    const slides = [];

    // Slide 1: first photo + template + title
    const slide1 = await generateSlide1(photoUrls[0], title);
    const s1path = `${outputDir}/slide1.png`;
    writeFileSync(s1path, slide1);
    slides.push(s1path);

    // Slide 2+: remaining photos with no-text template
    for (let i = 1; i < photoUrls.length; i++) {
      const slide = await generateSlideNoText(photoUrls[i]);
      const spath = `${outputDir}/slide${i + 1}.png`;
      writeFileSync(spath, slide);
      slides.push(spath);
    }

    // Last slide
    const lastPath = resolve(__dirname, 'templates/carousel/slide-last.png');
    slides.push(lastPath);

    console.log('Generated', slides.length, 'slides');

    // Upload to Supabase Storage
    const imageUrls = [];
    for (let i = 0; i < slides.length; i++) {
      const buf = readFileSync(slides[i]);
      const name = `repost-${Date.now()}-${i + 1}.png`;
      await supabase.storage.from('ig-assets').upload(name, buf, { contentType: 'image/png', upsert: true });
      const { data: urlData } = supabase.storage.from('ig-assets').getPublicUrl(name);
      imageUrls.push(urlData.publicUrl);
    }

    // Publish to IG
    if (IG_TOKEN && IG_ACCOUNT) {
      try {
        const childIds = [];
        for (const url of imageUrls) {
          const r = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: IG_TOKEN }),
          });
          const d = await r.json();
          if (d.error) throw new Error(d.error.message);
          childIds.push(d.id);
        }

        const igCaption = skCaption.replace(/\*\*/g, '') + '\n\n#inteligencia24 #AI #umelainteligencia #technologie';

        const carRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_type: 'CAROUSEL', children: childIds.join(','), caption: igCaption, access_token: IG_TOKEN }),
        });
        const carData = await carRes.json();
        if (carData.error) throw new Error(carData.error.message);

        await new Promise(r => setTimeout(r, 6000));

        const pubRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media_publish`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creation_id: carData.id, access_token: IG_TOKEN }),
        });
        const pubData = await pubRes.json();
        if (pubData.error) throw new Error(pubData.error.message);

        console.log('Published! Post ID:', pubData.id);

        // Notify in Slack
        if (SLACK_WEBHOOK) {
          await fetch(SLACK_WEBHOOK, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'IG Repost publikovaný! ' + slides.length + ' slidov\n' + skCaption.substring(0, 100) }),
          }).catch(() => {});
        }
      } catch (err) {
        console.error('IG error:', err.message);
      }
    } else {
      console.log('[DRY RUN] Would publish', slides.length, 'slides');
    }

    state.lastTs = msg.ts;
    saveState(state);
  }

  console.log('Done!');
}

main().catch(console.error);
