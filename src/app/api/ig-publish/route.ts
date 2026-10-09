import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fxnpgqsztiwqbhvyokgd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const IG_TOKEN = process.env.IG_ACCESS_TOKEN!;
const IG_ACCOUNT = process.env.IG_BUSINESS_ACCOUNT!;
const PUBLISH_SECRET = process.env.IG_PUBLISH_SECRET || 'r24igpub';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const token = req.nextUrl.searchParams.get('token');

  if (token !== PUBLISH_SECRET) {
    return new NextResponse(html('Neplatný token.', false), { headers: { 'Content-Type': 'text/html' } });
  }
  if (!slug) {
    return new NextResponse(html('Chýba slug článku.', false), { headers: { 'Content-Type': 'text/html' } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Get article from DB
  const { data: article } = await supabase
    .from('articles')
    .select('title, slug, excerpt, image_url, category_id, categories(slug, name)')
    .eq('slug', slug)
    .single();

  if (!article) {
    return new NextResponse(html('Článok nebol nájdený.', false), { headers: { 'Content-Type': 'text/html' } });
  }

  try {
    // Dynamically import the carousel generator (ESM)
    const { generateCarousel } = await import('../../../../scraper/instagram.mjs' as string);
    const { getArticleCaption } = await import('../../../../scraper/captions.mjs' as string);

    // Determine theme (alternate by checking count of published IG posts)
    const { count } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .not('ig_post_id', 'is', null);
    const postIndex = count || 0;

    const catName = (article as any).categories?.name || 'Technológie';
    const catSlug = (article as any).categories?.slug || 'technologie';

    // If excerpt has no bold markers, add them to key terms (names, numbers)
    let excerpt = article.excerpt || article.title;
    if (!excerpt.includes('**')) {
      // Bold proper nouns (capitalized words 2+ chars not at sentence start) and numbers
      excerpt = excerpt.replace(/(?<=[.!?]\s+|\b)(\d[\d\s,.]*\d|\d+)(?=\s|[.,]|$)/g, '**$1**');
      excerpt = excerpt.replace(/(?<=\s)([A-Z][a-zA-Z]{2,}(?:\s[A-Z][a-zA-Z]+)*)/g, '**$1**');
    }

    // Generate carousel
    const result = await generateCarousel({
      title: article.title,
      excerpt,
      image_url: article.image_url,
      slug: article.slug,
      category: catName,
    }, postIndex);

    if (!result) throw new Error('Carousel generation returned null - check sharp/template availability');

    // Upload slides to Supabase Storage
    const { readFileSync } = await import('fs');
    const imageUrls: string[] = [];
    for (let i = 0; i < result.slides.length; i++) {
      const buf = readFileSync(result.slides[i]);
      const name = `${article.slug}-${i + 1}-${Date.now()}.png`;
      await supabase.storage.from('ig-assets').upload(name, buf, { contentType: 'image/png', upsert: true });
      const { data: urlData } = supabase.storage.from('ig-assets').getPublicUrl(name);
      imageUrls.push(urlData.publicUrl);
    }

    // Create IG containers
    const childIds: string[] = [];
    for (const url of imageUrls) {
      const res = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: IG_TOKEN }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      childIds.push(data.id);
    }

    // Create carousel
    const caption = getArticleCaption(postIndex, article.title, catSlug);
    const carRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_type: 'CAROUSEL', children: childIds.join(','), caption, access_token: IG_TOKEN }),
    });
    const carData = await carRes.json();
    if (carData.error) throw new Error(carData.error.message);

    // Wait for processing
    await new Promise(r => setTimeout(r, 8000));

    // Publish
    const pubRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: carData.id, access_token: IG_TOKEN }),
    });
    const pubData = await pubRes.json();
    if (pubData.error) throw new Error(pubData.error.message);

    // Save IG post ID to article
    await supabase.from('articles').update({ ig_post_id: pubData.id }).eq('slug', slug);

    // Publish story automatically
    let storyMsg = '';
    try {
      const { generateStory } = await import('../../../../scraper/instagram.mjs' as string);
      const storyBuf = await generateStory(article.image_url, article.title);
      const storyName = `story-${article.slug}-${Date.now()}.png`;
      await supabase.storage.from('ig-assets').upload(storyName, storyBuf, { contentType: 'image/png', upsert: true });
      const { data: storyUrlData } = supabase.storage.from('ig-assets').getPublicUrl(storyName);

      // Create story container
      const storyContRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: storyUrlData.publicUrl, media_type: 'STORIES', access_token: IG_TOKEN }),
      });
      const storyContData = await storyContRes.json();
      if (storyContData.error) throw new Error(storyContData.error.message);

      await new Promise(r => setTimeout(r, 5000));

      const storyPubRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: storyContData.id, access_token: IG_TOKEN }),
      });
      const storyPubData = await storyPubRes.json();
      if (storyPubData.error) throw new Error(storyPubData.error.message);
      storyMsg = '<br>Story tiež publikované!';
    } catch (storyErr: any) {
      storyMsg = `<br>Story chyba: ${storyErr.message}`;
    }

    return new NextResponse(
      html(`Článok "${article.title}" bol úspešne publikovaný na Instagram! 🎉${storyMsg}<br>Post ID: ${pubData.id}`, true),
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err: any) {
    return new NextResponse(
      html(`Chyba pri publikovaní: ${err.message}`, false),
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

function html(message: string, success: boolean) {
  const color = success ? '#166534' : '#dc2626';
  const bg = success ? '#f0fdf4' : '#fef2f2';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>umelá inteligencia24 IG</title>
<style>body{font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb}
.card{background:${bg};border:2px solid ${color};border-radius:12px;padding:32px;max-width:500px;text-align:center;color:${color}}</style></head>
<body><div class="card"><h2>${success ? '✅' : '❌'}</h2><p>${message}</p></div></body></html>`;
}
