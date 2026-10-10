// Daily stats report from Supabase → Slack at 20:00
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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

const sb = createClient('https://fxnpgqsztiwqbhvyokgd.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

async function main() {
  const today = new Date().toISOString().split('T')[0];
  const dateStr = new Date().toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' });

  // Today's page views
  const { data: todayData } = await sb.from('daily_views').select('count').eq('date', today).single();
  const todayViews = todayData?.count || 0;

  // Yesterday for comparison
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const { data: yesterdayData } = await sb.from('daily_views').select('count').eq('date', yesterday).single();
  const yesterdayViews = yesterdayData?.count || 0;

  // Total articles
  const { count: totalArticles } = await sb.from('articles').select('id', { count: 'exact', head: true }).eq('is_published', true);

  // Total subscribers
  const { count: totalSubs } = await sb.from('subscribers').select('id', { count: 'exact', head: true });

  // Articles published today
  const { count: todayArticles } = await sb.from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)
    .gte('published_at', today + 'T00:00:00')
    .lte('published_at', today + 'T23:59:59');

  const diff = todayViews - yesterdayViews;
  const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
  const emoji = diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️';

  let text = `*inteligencia24 - Denná štatistika* ${emoji}\n${dateStr}\n\n`;
  text += `👁 Návštevy dnes: *${todayViews.toLocaleString('sk-SK')}* (${diffStr} oproti včera)\n`;
  text += `📰 Články dnes: *${todayArticles || 0}*\n`;
  text += `📚 Celkom článkov: *${totalArticles || 0}*\n`;
  text += `📧 Odberatelia: *${totalSubs || 0}*\n`;

  console.log(text);

  if (SLACK_WEBHOOK) {
    await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    console.log('Slack sent!');
  }
}

main().catch(console.error);
