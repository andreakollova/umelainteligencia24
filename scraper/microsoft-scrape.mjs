// Microsoft Source AI news scraper
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
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

const supabase = createClient('https://fxnpgqsztiwqbhvyokgd.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;
const LIMIT = parseInt(process.argv[2] || '10');
const USER_AGENT = 'inteligencia24-bot/1.0 (+https://inteligencia24.sk; studio@drixton.com)';
const AI_KEYWORDS = ['ai', 'artificial intelligence', 'machine learning', 'copilot', 'language model', 'neural', 'deep learning', 'generative', 'agent', 'llm'];

function slugify(t) { return t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60); }
function stripHtml(h) { return (h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

async function articleExists(url) {
  const { data } = await supabase.from('articles').select('id').eq('source_url', url).limit(1);
  return data && data.length > 0;
}

async function writeArticle(title, content, source) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Na základe faktov napíš VLASTNÝ slovenský článok. V texte vždy jasne uveď akú firmu alebo inštitúciu sa článok týka. Nadpis 10-14 slov, zaujímavý, s faktom. Excerpt 6-8 viet s **bold**. Content s ## nadpismi. Na konci: ## Zdroj\nZdroj: ' + source + '\nSpracovanie: Redakcia inteligencia24\n\nVráť JSON: {"title":"...","excerpt":"...","content":"..."}\n\nFakty:\n' + title + '\n' + content }],
    temperature: 0.4, max_tokens: 4000,
  });
  const text = res.choices[0].message.content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const parsed = JSON.parse(text);
  parsed.title = parsed.title.replace(/[—–:]/g, '');
  return parsed;
}

async function main() {
  console.log('=== Microsoft AI Scraper ===');
  console.log('Time:', new Date().toISOString());

  const res = await fetch('https://news.microsoft.com/source/tag/ai/feed/', { headers: { 'User-Agent': USER_AGENT } });
  const xml = await res.text();
  const $ = load(xml, { xmlMode: true });

  const items = [];
  $('item').each((_, el) => {
    const title = $(el).find('title').text();
    const link = $(el).find('link').text();
    const desc = stripHtml($(el).find('description').text());
    const date = $(el).find('pubDate').text();
    if (AI_KEYWORDS.some(k => (title + ' ' + desc).toLowerCase().includes(k)) && link.includes('microsoft.com')) {
      items.push({ title, link, desc, date });
    }
  });

  console.log('Found', items.length, 'AI articles\n');

  const { data: cat } = await supabase.from('categories').select('id').eq('slug', 'nastroje').single();
  const categoryId = cat?.id;
  let inserted = 0;
  const insertedArticles = [];

  for (const item of items) {
    if (inserted >= LIMIT) break;
    if (await articleExists(item.link)) { console.log('  SKIP:', item.title.substring(0, 50)); continue; }

    let imageUrl = null;
    try {
      const artRes = await fetch(item.link, { headers: { 'User-Agent': USER_AGENT } });
      const artHtml = await artRes.text();
      const ogMatch = artHtml.match(/property="og:image"[^>]*content="([^"]+)"/);
      if (ogMatch) imageUrl = ogMatch[1];
    } catch {}

    if (!imageUrl) { console.log('  SKIP (no image):', item.title.substring(0, 50)); continue; }

    console.log('  Writing:', item.title.substring(0, 50) + '...');
    try {
      const article = await writeArticle(item.title, item.desc, 'Microsoft');
      const slug = slugify(article.title) + '-' + Date.now().toString(36);
      await supabase.from('articles').insert({
        title: article.title, slug, excerpt: article.excerpt, content: article.content,
        image_url: imageUrl, category_id: categoryId,
        author: inserted % 2 === 0 ? 'Martin Kováč' : 'Simona Hrušková',
        source_url: item.link, source_name: 'Microsoft',
        is_featured: inserted < 2, is_published: true,
        published_at: new Date(item.date || Date.now()).toISOString(),
      });
      console.log('  OK:', article.title.substring(0, 60));
      insertedArticles.push({ title: article.title, slug, imageUrl });
      inserted++;
    } catch (err) { console.error('  Error:', err.message); }
    await new Promise(r => setTimeout(r, 3000));
  }

  if (SLACK_WEBHOOK && insertedArticles.length > 0) {
    const siteUrl = process.env.SITE_URL || 'https://inteligencia24.sk';
    const blocks = [{ type: 'header', text: { type: 'plain_text', text: 'Microsoft - ' + inserted + ' nových článkov' } }, { type: 'divider' }];
    for (const art of insertedArticles) {
      const url = siteUrl + '/clanok/' + art.slug;
      if (art.imageUrl) blocks.push({ type: 'image', image_url: art.imageUrl, alt_text: art.title, title: { type: 'plain_text', text: art.title } });
      blocks.push({ type: 'section', text: { type: 'mrkdwn', text: '*<' + url + '|' + art.title + '>*' } });
      blocks.push({ type: 'divider' });
    }
    await fetch(SLACK_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blocks }) }).catch(() => {});
    console.log('\nSlack sent!');
  }

  console.log('\nDone! Inserted:', inserted);
}

main().catch(console.error);
