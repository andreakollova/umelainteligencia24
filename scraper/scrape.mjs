import { saveArticleImage } from './save-image.mjs';
import { load } from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load env from .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const savedUrl = await saveArticleImage(imageUrl, slug || articleSlug);
      if (savedUrl) imageUrl = savedUrl;`);
    }

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
  const siteUrl = process.env.SITE_URL || 'https://inteligencia24.vercel.app';
  const igSecret = process.env.IG_PUBLISH_SECRET || 'r24igpub';

  if (slackWebhook && insertedArticles.length > 0) {
    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: `inteligencia24 - ${inserted} nových článkov`, emoji: true },
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
