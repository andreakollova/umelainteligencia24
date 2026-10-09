// EPFL News robotics scraper
// Respects CC BY-SA 4.0 license - proper attribution required
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
} catch {}

const supabase = createClient('https://fxnpgqsztiwqbhvyokgd.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

const ROBOT_KEYWORDS = ['robot', 'robotic', 'drone', 'humanoid', 'actuator', 'soft robot', 'gripper', 'manipulat', 'locomotion', 'exoskeleton', 'prosthe', 'walking robot', 'flying robot', 'flapping', 'motor'];
const LIMIT = parseInt(process.argv[2] || '15');
const USER_AGENT = 'umelainteligencia24-bot/1.0 (+https://umelainteligencia24.sk; studio@drixton.com)';
const REQUEST_DELAY = 3000; // 3s between requests - respectful crawling

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60);
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function articleExists(sourceUrl) {
  const { data } = await supabase.from('articles').select('id').eq('source_url', sourceUrl).limit(1);
  return data && data.length > 0;
}

async function fetchEPFLRoboticsArticles() {
  const results = [];
  for (let offset = 0; offset < 500; offset += 100) {
    const res = await fetch(`https://actu.epfl.ch/api/v1/channels/1/news/?format=json&limit=100&offset=${offset}&lang=en`);
    const data = await res.json();
    if (!data.results || data.results.length === 0) break;

    for (const a of data.results) {
      const searchText = ((a.title || '') + ' ' + (a.subtitle || '') + ' ' + stripHtml(a.text || '').substring(0, 500)).toLowerCase();
      if (ROBOT_KEYWORDS.some(k => searchText.includes(k))) {
        const authorNames = (a.authors || []).map(au => au.first_name + ' ' + au.last_name).join(', ') || 'EPFL';
        results.push({
          title: a.title,
          url: a.news_url,
          date: a.publish_date,
          author: authorNames,
          image: a.visual_url ? (a.visual_url.startsWith('http') ? a.visual_url.replace('{options}', '1440x810') : `https://actu.epfl.ch${a.visual_url.replace('{options}', '1440x810')}`) : null,
          imageCredit: a.visual_description || '',
          summary: stripHtml(a.subtitle || a.text || '').substring(0, 500),
          fullText: stripHtml(a.text || '').substring(0, 4000),
          isCC: a.is_under_cc_license === true,
          carouselImages: a.carousel_images || [],
        });
      }
    }
    if (results.length >= LIMIT * 3) break;
  }
  return results;
}

async function translateArticle(title, summary, content, originalAuthor, sourceUrl) {
  const prompt = `Prelož nasledujúci článok z angličtiny do slovenčiny. Prepíš ho tak, aby to znelo ako profesionálny slovenský technologický článok.

KRITICKÉ PRAVIDLÁ:
- NADPIS: Zaujímavý, konkrétny, novinársky - 10-14 slov. Musí obsahovať konkrétny fakt, číslo alebo zaujímavosť z článku. Píš ako novinár denníka SME. NIKDY nepoužívaj: revolúcia, nová éra, budúcnosť, prelomový, inovatívny. NIKDY nedávaj názov inštitúcie na začiatok. Žiadne dvojbodky. Príklady dobrých nadpisov: "Motor hrubý len niekoľko milimetrov zdvihne 46-gramovú čokoládu", "Farebná spätná väzba zlepšila ovládanie protéz už po 20 pokusoch".
- EXCERPT: 6-8 viet, do 800 znakov. Každá veta musí končiť bodkou. Dôležité slová a názvy (firmy, roboty, technológie, čísla) VŽDY označ **boldom**.
- CONTENT: Plný preklad s ## nadpismi pre sekcie. Kľúčové pojmy boldni.
- NIKDY NEPREKLADAJ mená ľudí a názvy firiem/technológií.
- DIAKRITIKA JE POVINNÁ v KAŽDOM slove.
- Správne skloňovanie: "robotická ruka" (nie "robotický ruka").

SEO PRAVIDLÁ:
- NADPIS: Hlavné kľúčové slovo na začiatku.
- EXCERPT: Relevantné kľúčové slová pre vyhľadávanie v slovenčine.
- CONTENT: ## nadpisy pre sekcie. Prirodzené dlhorepásové kľúčové frázy.

Na konci obsahu VŽDY pridaj tento blok:

## Zdroj
Autor pôvodného článku: ${originalAuthor}
Zdroj: EPFL News
Originál: ${sourceUrl}
Preklad a úprava: Redakcia umelainteligencia24
Licencia: CC BY-SA 4.0

Vráť odpoveď v JSON formáte (bez markdown blokov):
{"title": "informatívny nadpis 12-15 slov", "excerpt": "6-8 viet s **boldmi**", "content": "plný preklad s ## nadpismi a zdrojom na konci"}

NADPIS:
${title}

KRÁTKY POPIS:
${summary}

OBSAH ČLÁNKU:
${content}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 8000,
  });

  const text = response.choices[0].message.content.trim();
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const parsed = JSON.parse(cleaned);
  parsed.title = parsed.title.replace(/[—–]/g, '-');
  parsed.excerpt = parsed.excerpt.replace(/[—–]/g, '-');
  parsed.content = parsed.content.replace(/[—–]/g, '-');
  return parsed;
}

async function getCategoryId(slug) {
  const { data } = await supabase.from('categories').select('id').eq('slug', slug).single();
  return data?.id;
}

async function main() {
  console.log('=== EPFL Robotics Scraper ===');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Target: ${LIMIT} articles\n`);

  const articles = await fetchEPFLRoboticsArticles();
  console.log(`Found ${articles.length} robotics articles from EPFL\n`);

  const categoryId = await getCategoryId('vyvoj') || await getCategoryId('roboty');
  let inserted = 0;
  const insertedArticles = [];

  for (const article of articles) {
    if (inserted >= LIMIT) break;

    if (await articleExists(article.url)) {
      console.log(`  SKIP (exists): ${article.title.substring(0, 50)}...`);
      continue;
    }

    // Check image license - only use CC-licensed images, never iStock/Getty/©[person]
    let imageUrl = null;
    const imgCredit = article.imageCredit.toLowerCase();
    const isStock = imgCredit.includes('istock') || imgCredit.includes('getty') || imgCredit.includes('shutterstock') || imgCredit.includes('adobe stock');
    const hasCC = imgCredit.includes('cc by') || imgCredit.includes('cc-by');
    const isEPFL = imgCredit.includes('epfl') && !isStock;

    if (article.isCC && article.image && !isStock && (hasCC || isEPFL)) {
      imageUrl = article.image;
    }
    // Check carousel images for CC ones
    if (!imageUrl && article.carouselImages.length > 0) {
      for (const ci of article.carouselImages) {
        const ciCredit = (ci.description || '').toLowerCase();
        const ciStock = ciCredit.includes('istock') || ciCredit.includes('getty') || ciCredit.includes('shutterstock');
        const ciCC = ciCredit.includes('cc by') || ciCredit.includes('cc-by');
        const ciEPFL = ciCredit.includes('epfl') && !ciStock;
        if (!ciStock && (ciCC || ciEPFL)) {
          const ciUrl = ci.url || '';
          imageUrl = ciUrl.startsWith('http') ? ciUrl.replace('{options}', '1440x810') : ciUrl ? `https://actu.epfl.ch${ciUrl.replace('{options}', '1440x810')}` : null;
          break;
        }
      }
    }

    // Skip articles without CC-licensed image
    if (!imageUrl) {
      console.log(`  SKIP (no CC image): ${article.title.substring(0, 50)}...`);
      continue;
    }

    console.log(`  Translating: ${article.title.substring(0, 50)}...`);

    try {
      const translated = await translateArticle(
        article.title,
        article.summary,
        article.fullText || article.summary,
        article.author,
        article.url
      );

      const articleSlug = slugify(translated.title) + '-' + Date.now().toString(36);

      const { error } = await supabase.from('articles').insert({
        title: translated.title,
        slug: articleSlug,
        excerpt: translated.excerpt,
        content: translated.content,
        image_url: imageUrl,
        category_id: categoryId,
        author: inserted % 2 === 0 ? 'Martin Kováč' : 'Simona Hrušková',
        source_url: article.url,
        source_name: 'EPFL News',
        original_author: article.author,
        original_date: article.date,
        is_featured: inserted < 3,
        is_published: true,
        published_at: new Date(article.date).toISOString(),
      });

      if (error) {
        console.error(`  DB error: ${error.message}`);
      } else {
        console.log(`  OK: ${translated.title.substring(0, 60)}...`);
        insertedArticles.push({ title: translated.title, slug: articleSlug, imageUrl });
        inserted++;
      }
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, REQUEST_DELAY));
  }

  // Slack notification
  if (SLACK_WEBHOOK && insertedArticles.length > 0) {
    const siteUrl = process.env.SITE_URL || 'https://umelainteligencia24.sk';
    const igSecret = process.env.IG_PUBLISH_SECRET || 'r24igpub2026';

    const blocks = [
      { type: 'header', text: { type: 'plain_text', text: `EPFL - ${inserted} nových článkov` } },
      { type: 'divider' },
    ];

    for (const art of insertedArticles) {
      const articleUrl = `${siteUrl}/clanok/${art.slug}`;
      const igUrl = `${siteUrl}/api/ig-publish?slug=${art.slug}&token=${igSecret}`;

      if (art.imageUrl) {
        blocks.push({ type: 'image', image_url: art.imageUrl, alt_text: art.title, title: { type: 'plain_text', text: art.title } });
      }
      blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*<${articleUrl}|${art.title}>*` } });
      blocks.push({ type: 'actions', elements: [
        { type: 'button', text: { type: 'plain_text', text: 'Instagram' }, url: igUrl, style: 'primary' },
        { type: 'button', text: { type: 'plain_text', text: 'Otvoriť' }, url: articleUrl },
      ]});
      blocks.push({ type: 'divider' });
    }

    try {
      await fetch(SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });
      console.log('\nSlack notification sent!');
    } catch {}
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${articles.length - inserted}`);
}

main().catch(console.error);
