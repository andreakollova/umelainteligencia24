import { saveArticleImage } from './save-image.mjs';
// EPFL News robotics scraper
// Respects CC BY-SA 4.0 license - proper attribution required
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const savedUrl = await saveArticleImage(imageUrl, slug || articleSlug);
      if (savedUrl) imageUrl = savedUrl;

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
    const siteUrl = process.env.SITE_URL || 'https://inteligencia24.sk';
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
