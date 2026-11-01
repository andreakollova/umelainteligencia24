// The Robot Report scraper - IG ONLY, never on website
// Scrapes articles, generates IG carousel, publishes to Instagram, then deletes from DB
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';
import { generateCarousel } from './instagram.mjs';
import { getArticleCaption } from './captions.mjs';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length && !process.env[key.trim()]) process.env[key.trim()] = vals.join('=').trim();
  });
} catch {}

const SUPABASE_URL = 'https://fxnpgqsztiwqbhvyokgd.supabase.co';
const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const IG_TOKEN = process.env.IG_ACCESS_TOKEN;
const IG_ACCOUNT = process.env.IG_BUSINESS_ACCOUNT;
const IG_ENABLED = process.env.IG_ENABLED === 'true';
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;
const USER_AGENT = 'inteligencia24-bot/1.0 (+https://inteligencia24.sk; studio@drixton.com)';

function slugify(t) { return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 60); }
function stripHtml(h) { return (h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

// Track last posted URL in Supabase - just ONE record, updated each time
async function getLastPosted() {
  const { data } = await supabase.from('articles').select('source_url').eq('slug', 'ig-last-posted').single();
  return data?.source_url || '';
}
async function setLastPosted(url) {
  const { data } = await supabase.from('articles').select('id').eq('slug', 'ig-last-posted').single();
  if (data) {
    await supabase.from('articles').update({ source_url: url }).eq('slug', 'ig-last-posted');
  } else {
    await supabase.from('articles').insert({
      title: 'IG-LAST', slug: 'ig-last-posted', source_url: url, source_name: 'system',
      is_published: false, published_at: new Date().toISOString(),
      author: 'bot', image_url: null, excerpt: null, content: null,
    });
  }
}

async function writeArticle(title, content) {
  const prompt = `Na základe faktov napíš VLASTNÝ slovenský spravodajský článok VLASTNÝMI SLOVAMI.

KRITICKÉ PRAVIDLÁ:
- NIKDY nepoužívaj dvojbodku v nadpise ani v podnadpisoch. Vždy píš plynulé vety.
- NADPIS: 10-14 slov, zaujímavý, s konkrétnym faktom. Plynulá veta bez dvojbodky.
- EXCERPT: 6-8 viet s **bold** na dôležitých slovách. Každá veta musí končiť bodkou.
- CONTENT: Vlastný článok s ## nadpismi. Kľúčové pojmy boldni.
- NIKDY NEPREKLADAJ mená ľudí a názvy firiem/technológií.
- DIAKRITIKA JE POVINNÁ v KAŽDOM slove.
- Nikdy nepoužívaj dlhé pomlčky. Vždy iba krátku pomlčku -.
- NIKDY nepoužívaj slovo "kontrola" ani "kontrolovať".

Vráť VÝHRADNE JSON: {"title":"...","excerpt":"...","content":"..."}

Fakty:
${title}
${content}`;

  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = res.content[0].text.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const parsed = JSON.parse(text);
  parsed.title = parsed.title.replace(/[—–]/g, '-');
  parsed.excerpt = parsed.excerpt.replace(/[—–]/g, '-');
  parsed.content = parsed.content.replace(/[—–]/g, '-');
  return parsed;
}

// Upload slide to Supabase ig-assets for IG API (needs public URL)
async function uploadSlideForIG(filePath, fileName) {
  const buf = readFileSync(filePath);
  await supabase.storage.from('ig-assets').upload(`ig/${fileName}`, buf, { contentType: 'image/png', upsert: true });
  const { data } = supabase.storage.from('ig-assets').getPublicUrl(`ig/${fileName}`);
  return data.publicUrl;
}

// Publish carousel to Instagram
async function publishToIG(slides, caption, slug) {
  if (!IG_TOKEN || !IG_ACCOUNT) { console.log('  [NO IG CREDENTIALS]'); return null; }

  const imageUrls = [];
  for (let i = 0; i < slides.length; i++) {
    const url = await uploadSlideForIG(slides[i], `${slug}-${i + 1}-${Date.now()}.png`);
    imageUrls.push(url);
  }

  // Create carousel children
  const childIds = [];
  for (const url of imageUrls) {
    const res = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: IG_TOKEN }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    childIds.push(data.id);
  }

  // Create carousel
  const carRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: 'CAROUSEL', children: childIds.join(','), caption, access_token: IG_TOKEN }),
  });
  const carData = await carRes.json();
  if (carData.error) throw new Error(carData.error.message);

  await new Promise(r => setTimeout(r, 5000));

  // Publish
  const pubRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media_publish`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: carData.id, access_token: IG_TOKEN }),
  });
  const pubData = await pubRes.json();
  if (pubData.error) throw new Error(pubData.error.message);
  return pubData.id;
}

async function main() {
  console.log('=== The Decoder → IG Only ===');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Mode: ${IG_ENABLED ? 'LIVE' : 'DRY RUN'}`);

  const lastPostedUrl = await getLastPosted();
  console.log('Last posted:', lastPostedUrl?.substring(0, 60) || 'none');

  // Fetch from The Decoder
  const items = [];
  try {
    const res = await fetch('https://the-decoder.com/feed/', { headers: { 'User-Agent': USER_AGENT } });
    const xml = await res.text();
    const rss$ = load(xml, { xml: true });
    rss$('item').each((_, el) => {
      const title = rss$(el).find('title').text().trim();
      const link = rss$(el).find('link').text().trim();
      const desc = stripHtml(rss$(el).find('description').text());
      const contentHtml = rss$(el).find('content\\:encoded').text();
      const pubDate = rss$(el).find('pubDate').text().trim();
      if (title && link) items.push({ title, link, desc, contentHtml, pubDate, source: 'The Decoder' });
    });
    console.log(`The Decoder: ${items.length} items`);
  } catch (e) { console.error('The Decoder error:', e.message); }


  console.log(`Total: ${items.length} items`);

  // Filter: no military topics, must be different from last posted
  const SKIP_TOPICS = ['military', 'warfare', 'weapon', 'defense', 'defence', 'army', 'airspace', 'surveillance', 'missile', 'nato', 'pentagon'];
  const newItems = items.filter(i => {
    if (i.link === lastPostedUrl) return false;
    const text = (i.title + ' ' + i.desc).toLowerCase();
    return !SKIP_TOPICS.some(t => text.includes(t));
  });
  console.log(`New: ${newItems.length}`);

  let published = 0;
  const limit = 1; // Max 1 post per run (3 runs/day = 3 posts with 2h+ gaps)

  for (const item of newItems) {
    if (published >= limit) break;

    // Extract image - try RSS content first, then fetch OG image from article page
    const content$ = load(item.contentHtml || '');
    let imageUrl = content$('img').first().attr('src');
    if (!imageUrl) {
      try {
        const pageRes = await fetch(item.link, { headers: { 'User-Agent': USER_AGENT } });
        if (pageRes.ok) {
          const html = await pageRes.text();
          const match = html.match(/og:image[^>]*content="([^"]+)"/);
          if (match) imageUrl = match[1];
        }
      } catch {}
    }
    if (!imageUrl) { console.log(`  SKIP (no image): ${item.title.substring(0, 50)}`); continue; }

    const textContent = stripHtml(item.contentHtml || item.desc).substring(0, 3000);

    await new Promise(r => setTimeout(r, 3000 + Math.random() * 4000));

    console.log(`\nProcessing: ${item.title.substring(0, 50)}...`);

    try {
      // Write article
      const article = await writeArticle(item.title, textContent);
      const slug = slugify(article.title) + '-' + Date.now().toString(36);

      // Save image locally for IG carousel
      // Save full quality image for IG (not for web - gets deleted after publish)
      let savedUrl = null;
      try {
        const imgRes = await fetch(imageUrl, { redirect: 'follow' });
        if (imgRes.ok) {
          const rawBuf = Buffer.from(await imgRes.arrayBuffer());
          const buf = await sharp(rawBuf).resize(2000, 1400, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 95 }).toBuffer();
          const filename = slug.substring(0, 80) + '.jpg';
          const { mkdirSync, writeFileSync, existsSync } = await import('fs');
          const imgDir = resolve(__dirname, '../public/ig-images');
          if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });
          writeFileSync(resolve(imgDir, filename), buf);
          savedUrl = `/ig-images/${filename}`;
          console.log(`  IG image saved (${Math.round(buf.length / 1024)}KB)`);
        }
      } catch (e) { console.error('  Image error:', e.message); }

      // Temporarily insert into DB for carousel generation (is_published: false!)
      await supabase.from('articles').insert({
        title: article.title, slug, excerpt: article.excerpt, content: article.content,
        image_url: savedUrl || imageUrl,
        author: 'Martin Kováč', source_url: item.link, source_name: 'The Decoder',
        is_featured: false, is_published: false, // NEVER on website!
        published_at: new Date(item.pubDate || Date.now()).toISOString(),
      });

      // Generate IG carousel
      const articleForIG = {
        title: article.title, slug, excerpt: article.excerpt,
        image_url: savedUrl || imageUrl, source_name: 'The Decoder',
        categories: { name: 'AI', slug: 'nastroje' },
      };
      const result = await generateCarousel(articleForIG, published);

      if (result && IG_ENABLED) {
        const caption = getArticleCaption(published, article.title, 'technologie') + `\n\nZdroj: ${item.source}`;
        const postId = await publishToIG(result.slides, caption, result.slug);
        console.log(`  IG Published! Post ID: ${postId}`);
      } else if (result) {
        console.log(`  [DRY RUN] Carousel generated: ${result.slides.length} slides`);
      }

      // Delete from DB after IG publish
      await supabase.from('articles').delete().eq('slug', slug);
      console.log(`  Deleted from DB (IG-only, not on website)`);

      // Clean up slide files
      if (result?.slides) result.slides.forEach(s => { try { unlinkSync(s); } catch {} });
      if (result?.storyPath) { try { unlinkSync(result.storyPath); } catch {} }

      // Mark as posted
      await setLastPosted(item.link);

      published++;
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }

  // Posted URLs tracked in Supabase (no local state file needed)

  // Slack notification
  if (SLACK_WEBHOOK && published > 0) {
    await fetch(SLACK_WEBHOOK, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `The Robot Report → IG: ${published} nových postov publikovaných` }),
    }).catch(() => {});
  }

  console.log(`\nDone! Published to IG: ${published}`);
}

main().catch(console.error);
