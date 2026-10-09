// Instagram Graph API publisher for umelainteligencia24
// Posts carousels (articles + glossary) to Instagram Business Account
//
// Required env vars:
//   IG_ACCESS_TOKEN     - Long-lived Facebook/Instagram access token
//   IG_BUSINESS_ACCOUNT - Instagram Business Account ID
//   IG_ENABLED          - Set to "true" to actually publish (dry-run by default)
//
// Usage:
//   node ig-publish.mjs                    # publish next queued posts
//   node ig-publish.mjs --generate-only    # only generate images, no publishing
//   node ig-publish.mjs --glossary-only    # only publish glossary post

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateCarousel, generateGlossaryCarousel } from './instagram.mjs';
import { glossaryTerms } from './glossary-terms.mjs';
import { getArticleCaption, getGlossaryCaption } from './captions.mjs';

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
const IG_ENABLED = process.env.IG_ENABLED === 'true';

const supabase = SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// State file to track what's been posted
const STATE_FILE = resolve(__dirname, '../.ig-state.json');

function loadState() {
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { lastArticleIndex: 0, lastGlossaryIndex: 0, postedSlugs: [] };
  }
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Upload image to Instagram container (requires publicly accessible URL)
// Images must be hosted publicly - we'll upload to Supabase Storage first
async function uploadToSupabaseStorage(filePath, fileName) {
  if (!supabase) throw new Error('Supabase not configured');

  const fileBuffer = readFileSync(filePath);
  const storagePath = `ig/${fileName}`;

  const { error } = await supabase.storage
    .from('ig-assets')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) throw new Error(`Storage upload error: ${error.message}`);

  const { data } = supabase.storage.from('ig-assets').getPublicUrl(storagePath);
  return data.publicUrl;
}

// Create Instagram carousel container
async function createCarouselContainer(imageUrls, caption) {
  if (!IG_TOKEN || !IG_ACCOUNT) throw new Error('IG_ACCESS_TOKEN or IG_BUSINESS_ACCOUNT not set');

  // Step 1: Create individual image containers
  const childIds = [];
  for (const url of imageUrls) {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: url,
          is_carousel_item: true,
          access_token: IG_TOKEN,
        }),
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(`IG container error: ${data.error.message}`);
    childIds.push(data.id);
  }

  // Step 2: Create carousel container
  const carouselRes = await fetch(
    `https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption,
        access_token: IG_TOKEN,
      }),
    }
  );
  const carouselData = await carouselRes.json();
  if (carouselData.error) throw new Error(`IG carousel error: ${carouselData.error.message}`);

  return carouselData.id;
}

// Publish a created container
async function publishContainer(containerId) {
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: IG_TOKEN,
      }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(`IG publish error: ${data.error.message}`);
  return data.id;
}

// Publish a carousel to Instagram
async function publishCarousel(slides, caption, slugPrefix) {
  console.log(`  Publishing carousel with ${slides.length} slides...`);

  // Upload all slides to Supabase Storage to get public URLs
  const imageUrls = [];
  for (let i = 0; i < slides.length; i++) {
    const fileName = `${slugPrefix}-${i + 1}-${Date.now()}.png`;
    console.log(`    Uploading slide ${i + 1}...`);
    const url = await uploadToSupabaseStorage(slides[i], fileName);
    imageUrls.push(url);
  }

  // Create and publish carousel
  const containerId = await createCarouselContainer(imageUrls, caption);
  console.log(`    Container created: ${containerId}`);

  // Wait for processing
  await new Promise(r => setTimeout(r, 5000));

  const postId = await publishContainer(containerId);
  console.log(`    Published! Post ID: ${postId}`);
  return postId;
}

// ============================================================
// MAIN FLOWS
// ============================================================

// Publish article posts (up to 4 per run)
async function publishArticlePosts(count = 4) {
  if (!supabase) {
    console.error('Supabase not configured');
    return;
  }

  const state = loadState();

  // Get recent unpublished articles with category
  const { data: articles } = await supabase
    .from('articles')
    .select('title, slug, excerpt, image_url, category_id, categories(slug)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(20);

  if (!articles || articles.length === 0) {
    console.log('No articles to post.');
    return;
  }

  // Filter out already posted
  const unposted = articles.filter(a => !state.postedSlugs.includes(a.slug));
  const toPost = unposted.slice(0, count);

  if (toPost.length === 0) {
    console.log('All recent articles already posted.');
    return;
  }

  console.log(`\n=== Publishing ${toPost.length} article posts ===`);

  for (const article of toPost) {
    const postIdx = state.lastArticleIndex;
    console.log(`\n[${postIdx + 1}] ${article.title.substring(0, 60)}...`);

    // Generate carousel images
    const result = await generateCarousel(article, postIdx);
    if (!result) continue;

    const catSlug = article.categories?.slug || 'technologie';
    const caption = getArticleCaption(postIdx, article.title, catSlug);

    if (IG_ENABLED) {
      try {
        await publishCarousel(result.slides, caption, result.slug);
        state.postedSlugs.push(article.slug);
        state.lastArticleIndex++;
        saveState(state);
        console.log('  Done!');
      } catch (err) {
        console.error(`  Publish error: ${err.message}`);
      }
    } else {
      console.log('  [DRY RUN] Would publish carousel with caption:');
      console.log(`  ${caption.substring(0, 80)}...`);
      state.postedSlugs.push(article.slug);
      state.lastArticleIndex++;
      saveState(state);
    }
  }
}

// Publish glossary post (1 per run)
async function publishGlossaryPost() {
  const state = loadState();
  const termIdx = state.lastGlossaryIndex % glossaryTerms.length;
  const term = glossaryTerms[termIdx];

  console.log(`\n=== Publishing glossary: ${term.en} ===`);

  const result = await generateGlossaryCarousel(term);
  if (!result) return;

  const caption = getGlossaryCaption(termIdx, term.en);

  if (IG_ENABLED) {
    try {
      await publishCarousel(result.slides, caption, `glossary-${result.slug}`);
      state.lastGlossaryIndex++;
      saveState(state);
      console.log('  Done!');
    } catch (err) {
      console.error(`  Publish error: ${err.message}`);
    }
  } else {
    console.log('  [DRY RUN] Would publish glossary carousel with caption:');
    console.log(`  ${caption.substring(0, 80)}...`);
    state.lastGlossaryIndex++;
    saveState(state);
  }
}

// Main
const args = process.argv.slice(2);
const generateOnly = args.includes('--generate-only');
const glossaryOnly = args.includes('--glossary-only');

console.log('=== umelainteligencia24 Instagram Publisher ===');
console.log(`Time: ${new Date().toISOString()}`);
console.log(`Mode: ${IG_ENABLED ? 'LIVE' : 'DRY RUN'}`);

if (generateOnly) {
  // Just generate all glossary carousels for preview
  console.log('\nGenerating all glossary carousels...');
  for (const term of glossaryTerms) {
    await generateGlossaryCarousel(term);
  }
  console.log('\nDone! Check /public/ig/glossary/');
} else if (glossaryOnly) {
  await publishGlossaryPost();
} else {
  // Default: 4 articles + 1 glossary
  await publishArticlePosts(4);
  await publishGlossaryPost();
}

console.log('\nFinished!');
