// Fix article titles - longer, no colons, no dashes, natural Slovak
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
});

const sb = createClient('https://fxnpgqsztiwqbhvyokgd.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const { data: articles } = await sb.from('articles')
  .select('id, title, excerpt, content')
  .eq('is_published', true)
  .order('published_at', { ascending: false });

console.log(`Fixing ${articles.length} articles...\n`);

for (const art of articles) {
  const prompt = `Prepíš nadpis a excerpt tohto článku. Nadpis bude dlhší, prirodzený, informatívny (10-15 slov). Excerpt bude 3-4 vety bez **boldov**.

STRIKTNÉ PRAVIDLÁ:
- NADPIS: Žiadna dvojbodka, žiadna pomlčka, žiadne úvodzovky. Plynulá slovenská veta. 10-15 slov. Správna diakritika.
- EXCERPT: 3-4 vety, prirodzená slovenčina, bez **hviezdičiek**. Žiadne boldy. Čistý text.
- NIKDY neprekladaj mená ľudí a názvy firiem. Názvy robotov skloňuj po slovensky.
- Žiadne dlhé pomlčky.

Vráť JSON (bez markdown blokov):
{"title": "dlhší nadpis bez dvojbodiek", "excerpt": "excerpt bez boldov"}

AKTUÁLNY NADPIS: ${art.title}
AKTUÁLNY EXCERPT: ${art.excerpt}
OBSAH: ${(art.content || '').substring(0, 1500)}`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });
    const text = res.choices[0].message.content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const parsed = JSON.parse(text);
    parsed.title = parsed.title.replace(/[—–]/g, '-').replace(/:/g, '').replace(/"/g, '');
    parsed.excerpt = parsed.excerpt.replace(/[—–]/g, '-').replace(/\*\*/g, '');

    await sb.from('articles').update({ title: parsed.title, excerpt: parsed.excerpt }).eq('id', art.id);
    console.log('OK:', parsed.title);
    console.log('   ', parsed.excerpt.substring(0, 100) + '...\n');

    await new Promise(r => setTimeout(r, 1000));
  } catch (err) {
    console.error('Error:', art.title.substring(0, 40), err.message, '\n');
  }
}

console.log('Done!');
