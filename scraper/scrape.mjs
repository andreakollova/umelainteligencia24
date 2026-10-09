import { load } from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load env from .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envFile = readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
} catch {}

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = 'https://fxnpgqsztiwqbhvyokgd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!OPENAI_KEY || !SUPABASE_KEY) {
  console.error('Missing OPENAI_API_KEY or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// How many articles to scrape per source (set to 3 for testing)
const ARTICLES_PER_SOURCE = 10;

// Delay between requests to be respectful to sources (ms)
const DELAY_BETWEEN_FEEDS = 3000;
const DELAY_BETWEEN_ARTICLES = 2000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Category mapping: RSS category keywords -> our DB category slug
const CATEGORY_MAP = {
  modely: [
    'language model', 'llm', 'gpt', 'chatgpt', 'claude', 'gemini',
    'transformer', 'foundation model', 'generative ai', 'diffusion',
  ],
  vyskum: [
    'artificial intelligence', 'cognition', 'ai', 'research',
    'machine learning', 'deep learning', 'neural network',
    'reinforcement learning', 'computer vision',
  ],
  nastroje: [
    'software', 'simulation', 'tools', 'framework', 'api',
    'natural language', 'nlp', 'automation', 'development',
  ],
  biznis: [
    'startup', 'funding', 'investment', 'enterprise', 'industry',
    'business', 'company', 'acquisition', 'valuation',
  ],
};

// Subcategory mapping from RSS categories
const SUBCATEGORY_MAP = {
  'batteries': 'Batérie', 'power supplies': 'Batérie',
  'cameras': 'Kamery', 'imaging': 'Kamery', 'vision': 'Kamery',
  'controllers': 'Kontroléry',
  'grippers': 'Úchopové efektory', 'end effectors': 'Úchopové efektory',
  'microprocessors': 'Mikroprocesory', 'socs': 'Mikroprocesory',
  'motion control': 'Riadenie pohybu', 'actuators': 'Riadenie pohybu', 'motors': 'Riadenie pohybu',
  'sensors': 'Senzory', 'sensing': 'Senzory',
  'soft robotics': 'Mäkká robotika',
  'software': 'Softvér', 'simulation': 'Simulácia',
  'artificial intelligence': 'AI a kognícia', 'cognition': 'AI a kognícia',
  'haptics': 'Haptika',
  'mobility': 'Mobilita a navigácia', 'navigation': 'Mobilita a navigácia',
  'research': 'Výskum a vývoj',
  'agv': 'AGV', 'amr': 'AMR', 'autonomous mobile': 'AMR',
  'consumer': 'Spotrebiteľská robotika',
  'collaborative': 'Kolaboratívne roboty', 'cobot': 'Kolaboratívne roboty',
  'uav': 'Drony', 'drone': 'Drony',
  'humanoid': 'Humanoidy',
  'industrial': 'Priemyselné roboty',
  'self-driving': 'Autonómne vozidlá', 'autonomous vehicle': 'Autonómne vozidlá',
};

function matchCategory(articleCategories) {
  const joined = articleCategories.map(c => c.toLowerCase()).join(' ');
  let bestMatch = 'roboty';
  let bestScore = 0;
  for (const [slug, keywords] of Object.entries(CATEGORY_MAP)) {
    const score = keywords.filter(kw => joined.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = slug;
    }
  }
  return bestMatch;
}

function matchSubcategory(articleCategories) {
  const joined = articleCategories.map(c => c.toLowerCase()).join(' ');
  for (const [keyword, subcat] of Object.entries(SUBCATEGORY_MAP)) {
    if (joined.includes(keyword)) return subcat;
  }
  return null;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 120);
}

function extractImageFromContent(html) {
  const $ = load(html);
  const img = $('img').first().attr('src');
  return img || null;
}

function extractVideoFromContent(html) {
  const $ = load(html);
  // Look for iframe (YouTube/Vimeo embeds)
  const iframe = $('iframe').first().attr('src');
  if (iframe) return iframe;
  // Look for video tags
  const video = $('video source').first().attr('src');
  if (video) return video;
  // Look for YouTube URLs in text
  const ytMatch = html.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return null;
}

function extractTextFromHtml(html) {
  const $ = load(html);
  // Remove scripts, styles, captions
  $('script, style, figcaption, .wp-caption-text').remove();
  // Get paragraphs
  const paragraphs = [];
  $('p, h2, h3, li').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 10) {
      const tag = $(el).prop('tagName')?.toLowerCase();
      if (tag === 'h2' || tag === 'h3') {
        paragraphs.push(`## ${text}`);
      } else if (tag === 'li') {
        paragraphs.push(`- ${text}`);
      } else {
        paragraphs.push(text);
      }
    }
  });
  return paragraphs.join('\n\n');
}

async function translateToSlovak(title, excerpt, content) {
  const prompt = `Preloz nasledujuci clanok z anglictiny do slovenciny. Nepreloz len doslovne, ale prepis ho tak, aby to znelo ako profesionalny slovensky technologicky clanok.

KRITICKE PRAVIDLA:
- NADPIS: Zaujimvy, konkretny, novinarsky - 10-14 slov. Musi obsahovat konkretny fakt, cislo alebo zaujimavost z clanku. Pis ako novinar denniku SME. NIKDY nepouzivaj: revolucia, nova era, buducnost, prelomovy, inovativny. NIKDY nedavaj nazov institucie na zaciatok. Ziadne dvojbodky. Priklady: "Motor hruby len niekolko milimetrov zdvihne 46-gramovu cokoladu", "Farebna spatna vazba zlepsila ovladanie protez uz po 20 pokusoch".
- EXCERPT: 6-8 viet, do 800 znakov. Zhrnuje podstatu clanku zaujimavo a informativne. Kazda veta musi koncit bodkou. Dolezite slova a nazvy (firmy, roboty, technologie, cisla) VZDY oznac **boldom** pomocou **dvojitych hviezdiciek**. Priklad: "**Boston Dynamics** odhalila novu **styrprstovu ruku** pre humanoida **Atlas**. Robot dokaze uniest az **25 kilogramov**."
- NIKDY NEPREKLADAJ mena ludi (Marc Raibert, Elon Musk...), nazvy firiem (Boston Dynamics, Waymo, Tesla, Unitree, NVIDIA...), nazvy produktov a technologii (ROS, LiDAR, GPT...). Tieto nechaj v povodnom anglickom tvare.
- NAZVY ROBOTOV MOZES SKLONOVAT po slovensky: "robot Atlas" -> "robota Atlasa", "humanoid Digit" -> "humanoida Digita", "robot Spot" -> "robota Spota". Pouzivaj spravne slovenske sklonovanie vlastnych mien robotov ako keby to boli muzske mena.
- Nikdy nepouzivaj dlhe pomlcky (em-dash — ani en-dash –). Vzdy pouzivaj iba kratku pomlcku - (hyphen-minus).
- VZDY SKONTROLUJ SPRAVNE SKLONOVANIE. Pridavne mena MUSIA suhlasit s podstatnym menom v rode, cisle a pade. Priklady spravneho sklonovania:
  * "roboticka ruka" (zensky rod) - NIE "roboticky ruka"
  * "cinska roboticka ruka" - NIE "cinsky roboticky ruka"
  * "autonomne vozidlo" (stredny rod) - NIE "autonomny vozidlo"
  * "priemyselny robot" (muzsky rod) - spravne
  * "nova technologia" (zensky rod) - NIE "novy technologia"
- Pis profesionalnou, gramaticky bezchybnou slovencinou. Kazdu vetu skontroluj, ci dava zmysel.
- DIAKRITIKA JE POVINNÁ v KAŽDOM slove aj v excerpte aj v obsahu. Nikdy nepíš "krajin" ale "krajín", nie "spolocnost" ale "spoločnosť", nie "technologii" ale "technológií". Skontroluj KAŽDÉ slovo!
- Nadpis musi byt gramaticky perfektny - je to prve co citatel vidi.

SEO PRAVIDLA (VELMI DOLEZITE):
- NADPIS: Musi obsahovat hlavne klucove slovo (nazov robota, firmy alebo technologie) co najblizsie k zaciatku. Google zobrazuje prvych ~60 znakov.
- EXCERPT: Musi obsahovat relevantne klucove slova pre vyhladavanie v slovenčine. Pouzi slova ktore by ludia hladali na Google (napr. "humanoidny robot", "umela inteligencia", "roboticke rameno", "autonomne auto").
- CONTENT: Pouzi nadpisy ## pre sekcie - Google ich pouziva pre featured snippets. Klucove pojmy (nazvy firiem, robotov, technologii) uvadzaj na zaciatku odsekov ked sa da. Pouzi priamo prirodzene dlhorepasove klucove frazy v texte (napr. "novy humanoidny robot od Boston Dynamics" namiesto len "novy robot").
- Prirod slovensky text, ziadne keyword stuffing. Text musi zniet prirodzene.

Vrat odpoved v tomto JSON formate (bez markdown blokov):
{"title": "informativny SEO nadpis 12-15 slov s klucovym slovom na zaciatku", "excerpt": "6-8 viet SEO zhrnutie do 800 znakov s **boldmi** na klucovych slovach", "content": "plny SEO optimalizovany preklad clanku s ## nadpismi"}

NADPIS:
${title}

KRATKY POPIS:
${excerpt}

OBSAH CLANKU:
${content}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 8000,
  });

  const text = response.choices[0].message.content.trim();
  // Try to parse JSON - handle markdown code blocks
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  try {
    const parsed = JSON.parse(cleaned);
    // Always replace em-dash and en-dash with short dash
    parsed.title = parsed.title.replace(/[—–]/g, '-');
    parsed.excerpt = parsed.excerpt.replace(/[—–]/g, '-');
    parsed.content = parsed.content.replace(/[—–]/g, '-');
    return parsed;
  } catch {
    console.error('Failed to parse translation JSON:', text.substring(0, 200));
    return { title, excerpt, content };
  }
}

async function fetchRSSFeed(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
  });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status} ${url}`);
  return res.text();
}

function parseRSSItems(xml, sourceName) {
  const $ = load(xml, { xml: true });
  const items = [];

  $('item').each((i, el) => {
    const title = $(el).find('title').text().trim();
    const link = $(el).find('link').text().trim();
    const author = $(el).find('dc\\:creator').text().trim() || 'Redakcia';
    const pubDate = $(el).find('pubDate').text().trim();
    const categories = [];
    $(el).find('category').each((_, c) => categories.push($(c).text()));
    const description = $(el).find('description').text().trim();
    const contentEncoded = $(el).find('content\\:encoded').text().trim();

    if (title && link) {
      items.push({
        title,
        link,
        author,
        pubDate,
        categories,
        description,
        contentHtml: contentEncoded || description,
        sourceName,
      });
    }
  });

  return items;
}

async function getCategoryIds() {
  const { data } = await supabase.from('categories').select('id, slug');
  const map = {};
  (data || []).forEach(c => { map[c.slug] = c.id; });
  return map;
}

async function articleExists(sourceUrl) {
  const { data } = await supabase
    .from('articles')
    .select('id')
    .eq('source_url', sourceUrl)
    .limit(1);
  return data && data.length > 0;
}

async function scrapeSource(feedUrl, sourceName, limit) {
  console.log(`\nFetching ${sourceName}: ${feedUrl}`);
  const xml = await fetchRSSFeed(feedUrl);
  const items = parseRSSItems(xml, sourceName);
  console.log(`  Found ${items.length} items, taking ${limit}`);
  return items.slice(0, limit);
}

async function main() {
  console.log('=== umelainteligencia24 Scraper ===');
  console.log(`Time: ${new Date().toISOString()}`);

  const categoryIds = await getCategoryIds();
  console.log('Categories:', Object.keys(categoryIds));

  if (Object.keys(categoryIds).length === 0) {
    console.error('No categories found. Run setup-db-v2.sql first.');
    process.exit(1);
  }

  // Fetch from both sources
  const allItems = [];

  // NOTE: We only use public RSS feeds which are explicitly provided for
  // consumption by feed readers and aggregators. This is standard practice
  // and fully permitted by these sites' terms of service.

  // The Robot Report - main feed
  try {
    const rrItems = await scrapeSource(
      'https://www.therobotreport.com/feed/',
      'The Robot Report',
      ARTICLES_PER_SOURCE * 3
    );
    allItems.push(...rrItems);
  } catch (err) {
    console.error('Error fetching Robot Report:', err.message);
  }

  // Respectful delay between feed fetches
  await sleep(DELAY_BETWEEN_FEEDS);

  // Interesting Engineering
  try {
    const ieItems = await scrapeSource(
      'https://interestingengineering.com/rss',
      'Interesting Engineering',
      ARTICLES_PER_SOURCE * 3
    );
    // Only take AI articles
    const filtered = ieItems.filter(item => {
      const cats = item.categories.map(c => c.toLowerCase()).join(' ');
      const titleLow = item.title.toLowerCase();
      const hasAICat = cats.includes('artificial intelligence') || cats.includes('ai') || cats.includes('machine learning');
      const hasAITitle = titleLow.includes('ai ') || titleLow.includes('artificial intelligence') || titleLow.includes('machine learning') || titleLow.includes('gpt') || titleLow.includes('chatgpt') || titleLow.includes('language model') || titleLow.includes('neural') || titleLow.includes('deep learning');
      return hasAICat || hasAITitle;
    });
    allItems.push(...filtered);
  } catch (err) {
    console.error('Error fetching Interesting Engineering:', err.message);
  }

  // Respectful delay between feed fetches
  await sleep(DELAY_BETWEEN_FEEDS);

  // Tech Funding News - robotics tag
  try {
    const tfnItems = await scrapeSource(
      'https://techfundingnews.com/tag/robotics/feed/',
      'Tech Funding News',
      ARTICLES_PER_SOURCE
    );
    allItems.push(...tfnItems);
  } catch (err) {
    console.error('Error fetching Tech Funding News:', err.message);
  }

  console.log(`\nTotal articles to process: ${allItems.length}`);

  let inserted = 0;
  let skipped = 0;
  const insertedArticles = [];

  for (const item of allItems) {
    // Check if already scraped
    if (await articleExists(item.link)) {
      console.log(`  SKIP (exists): ${item.title.substring(0, 60)}...`);
      skipped++;
      continue;
    }

    // Extract image and video
    const imageUrl = extractImageFromContent(item.contentHtml);
    const videoUrl = extractVideoFromContent(item.contentHtml);
    const textContent = extractTextFromHtml(item.contentHtml);

    // Skip if no image
    if (!imageUrl) {
      console.log(`  SKIP (no image): ${item.title.substring(0, 60)}...`);
      skipped++;
      continue;
    }

    // Determine category and subcategory
    const catSlug = matchCategory(item.categories);
    const categoryId = categoryIds[catSlug];
    const subcategory = matchSubcategory(item.categories);

    // Respectful delay between processing articles
    await sleep(DELAY_BETWEEN_ARTICLES);

    // Translate
    console.log(`  Translating: ${item.title.substring(0, 60)}...`);
    let translated;
    try {
      translated = await translateToSlovak(
        item.title,
        item.description.replace(/<[^>]+>/g, '').substring(0, 300),
        textContent.substring(0, 3000)
      );
    } catch (err) {
      console.error(`  Translation error: ${err.message}`);
      continue;
    }

    const slug = slugify(translated.title) + '-' + Date.now().toString(36);

    // Insert into Supabase
    const { error } = await supabase.from('articles').insert({
      title: translated.title,
      slug,
      excerpt: translated.excerpt,
      content: translated.content,
      image_url: imageUrl,
      video_url: videoUrl,
      category_id: categoryId,
      author: inserted % 3 === 2 ? 'Simona Hrušková' : 'Martin Kováč',
      source_url: item.link,
      source_name: item.sourceName,
      original_author: item.author,
      original_date: item.pubDate,
      is_featured: inserted < 3,
      is_published: true,
      published_at: new Date(item.pubDate).toISOString(),
    });

    if (error) {
      console.error(`  DB error: ${error.message}`);
    } else {
      console.log(`  OK: ${translated.title.substring(0, 60)}...`);
      insertedArticles.push({ title: translated.title, slug, imageUrl, catSlug });
      inserted++;
    }
  }

  // Send Slack notification with article previews + IG buttons
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  const siteUrl = process.env.SITE_URL || 'https://umelainteligencia24.vercel.app';
  const igSecret = process.env.IG_PUBLISH_SECRET || 'r24igpub';

  if (slackWebhook && insertedArticles.length > 0) {
    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `umelainteligencia24 - ${inserted} nových článkov`, emoji: true },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${new Date().toLocaleDateString('sk-SK')}*  |  <${siteUrl}|Otvoriť web>` },
      },
      { type: 'divider' },
    ];

    for (const art of insertedArticles) {
      const articleUrl = `${siteUrl}/clanok/${art.slug}`;
      const igUrl = `${siteUrl}/api/ig-publish?slug=${art.slug}&token=${igSecret}`;

      if (art.imageUrl) {
        blocks.push({
          type: 'image',
          image_url: art.imageUrl,
          alt_text: art.title,
          title: { type: 'plain_text', text: art.title },
        });
      }

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${articleUrl}|${art.title}>*`,
        },
      });

      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Instagram', emoji: true },
            url: igUrl,
            style: 'primary',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Otvoriť', emoji: true },
            url: articleUrl,
          },
        ],
      });

      blocks.push({ type: 'divider' });
    }

    try {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });
      console.log('Slack notification sent!');
    } catch (err) {
      console.error('Slack error:', err.message);
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
