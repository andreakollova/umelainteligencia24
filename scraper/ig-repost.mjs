// IG Repost: Monitor Slack channel for photos + text, generate carousel, publish to IG
// Format in Slack:
//   Line 1: Nadpis po slovensky
//   (empty line)
//   Rest: Text/caption (will be translated if in English)
//
// Photos: upload clean photos without text overlays
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length && !process.env[key.trim()]) process.env[key.trim()] = vals.join('=').trim();
  });
} catch {}

// Fonts
const fontsDir = resolve(__dirname, 'fonts');
if (existsSync(fontsDir)) {
  const tmpFonts = '/tmp/fonts';
  if (!existsSync(tmpFonts)) mkdirSync(tmpFonts, { recursive: true });
  const fontFile = resolve(fontsDir, 'Inter.ttf');
  if (existsSync(fontFile)) copyFileSync(fontFile, resolve(tmpFonts, 'Inter.ttf'));
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

// Slide 1: clean photo + template overlay + title text
async function generateSlide1(photoPath, title) {
  const templatePath = resolve(__dirname, 'templates/carousel/slide1.png');
  const template = readFileSync(templatePath);
  const photoBuf = readFileSync(photoPath);
  const photoResized = await sharp(photoBuf).resize(W, H, { fit: 'cover' }).toBuffer();

  const titleLines = wrapText(title, 26);
  const lineHeight = 76;
  const titleBlockHeight = titleLines.length * lineHeight;
  const titleStartY = H - 180 - titleBlockHeight;
  const titleSvg = titleLines.map((line, i) =>
    `<text x="${W / 2}" y="${titleStartY + i * lineHeight + 66}" font-family="Inter, sans-serif" font-size="64" font-weight="800" fill="#ffffff" text-anchor="middle">${escapeXml(line)}</text>`
  ).join('\n');

  const titleOnlySvg = Buffer.from(`<svg width="${W}" height="${H}">${titleSvg}</svg>`);

  // Layer order: photo → template → title on top (no gradient)
  return sharp(photoResized)
    .composite([
      { input: template, top: 0, left: 0 },
      { input: titleOnlySvg, top: 0, left: 0 },
    ])
    .png().toBuffer();
}

// Slide 2+: clean photo + no-text template overlay
async function generateSlidePhoto(photoPath) {
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

  const res = await fetch(`https://slack.com/api/conversations.history?channel=${SLACK_CHANNEL}&oldest=${state.lastTs}&limit=5`, {
    headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}` },
  });
  const data = await res.json();

  if (!data.ok) { console.log('Slack error:', data.error); return; }

  // Only messages with photos from humans (not bots)
  const messages = (data.messages || []).filter(m => !m.bot_id && m.files?.some(f => f.mimetype?.startsWith('image/')));

  if (messages.length === 0) { console.log('No new messages with photos'); return; }

  for (const msg of messages.reverse()) {
    const files = msg.files.filter(f => f.mimetype?.startsWith('image/'));
    if (files.length === 0) continue;

    // Parse text: first line = title, rest = caption
    const rawText = (msg.text || '').replace(/<[^>]+>/g, '').trim();
    const parts = rawText.split(/\n\n+/);
    const title = parts[0] || 'Nový príspevok';
    const captionText = parts.slice(1).join('\n\n') || title;

    console.log('Title:', title);
    console.log('Photos:', files.length);

    // Translate caption if needed
    let skCaption = captionText;
    if (/[a-z]{3,}/i.test(captionText) && !/[áéíóúýčďľňřšťžô]/i.test(captionText)) {
      skCaption = await translateText(captionText);
    }

    // Download photos
    const photoPaths = [];
    const outputDir = '/tmp/repost-slides';
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

    for (const f of files) {
      const dlRes = await fetch(f.url_private_download || f.url_private, {
        headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}` },
      });
      const buf = Buffer.from(await dlRes.arrayBuffer());
      const path = `${outputDir}/photo-${Date.now()}-${photoPaths.length}.jpg`;
      writeFileSync(path, buf);
      photoPaths.push(path);
    }

    // Generate slides
    const slides = [];

    // Slide 1: first photo + template + title
    const s1 = await generateSlide1(photoPaths[0], title);
    const s1path = `${outputDir}/s1-${Date.now()}.png`;
    writeFileSync(s1path, s1);
    slides.push(s1path);

    // Slide 2+: remaining photos with no-text template
    for (let i = 1; i < photoPaths.length; i++) {
      const s = await generateSlidePhoto(photoPaths[i]);
      const spath = `${outputDir}/s${i + 1}-${Date.now()}.png`;
      writeFileSync(spath, s);
      slides.push(spath);
    }

    // Last slide: "posli kamosovi"
    slides.push(resolve(__dirname, 'templates/carousel/slide-last.png'));

    console.log('Generated', slides.length, 'slides');

    // Upload to Supabase Storage
    const imageUrls = [];
    for (let i = 0; i < slides.length; i++) {
      const buf = readFileSync(slides[i]);
      const name = `repost-${Date.now()}-${i}.png`;
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
            body: JSON.stringify({ text: 'IG Repost publikovaný! ' + slides.length + ' slidov\nNadpis: ' + title }),
          }).catch(() => {});
        }

        // Reply in repost channel
        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: SLACK_CHANNEL, thread_ts: msg.ts, text: '✅ Publikované na Instagram! ' + slides.length + ' slidov.' }),
        }).catch(() => {});

      } catch (err) {
        console.error('IG error:', err.message);
        // Notify error in channel
        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: SLACK_CHANNEL, thread_ts: msg.ts, text: '❌ Chyba: ' + err.message }),
        }).catch(() => {});
      }
    }

    state.lastTs = msg.ts;
    saveState(state);
  }

  console.log('Done!');
}

main().catch(console.error);
