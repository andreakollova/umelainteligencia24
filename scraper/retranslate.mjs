// Re-translate all articles with GPT-4o for better quality
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

console.log(`Retranslating ${articles.length} articles with GPT-4o...\n`);

for (const art of articles) {
  const prompt = `Prepíš tento slovenský článok tak, aby to znelo ako kvalitný profesionálny slovenský technologický portál. NIE doslovný preklad, ale prirodzená slovenčina.

PRAVIDLÁ:
- NADPIS: Krátky, max 8 slov, pútavý, so správnou diakritikou. Nesmie byť dlhší ako 60 znakov.
- EXCERPT: 3-4 vety, do 400 znakov, zaujímavý a informatívny. Dôležité slová označ **boldom**. Každá veta končí bodkou.
- NIKDY NEPREKLADAJ mená ľudí, názvy firiem, názvy produktov a technológií.
- NÁZVY ROBOTOV MÔŽEŠ SKLOŇOVAŤ po slovensky (Atlasa, Spota, Digita).
- Používaj správnu slovenskú diakritiku a gramatiku.
- Nikdy nepoužívaj dlhé pomlčky (— ani –), iba krátku -.

Vráť odpoveď v JSON (bez markdown blokov):
{"title": "nadpis", "excerpt": "excerpt s **boldmi**"}

AKTUÁLNY NADPIS: ${art.title}
AKTUÁLNY EXCERPT: ${art.excerpt}
OBSAH: ${(art.content || '').substring(0, 2000)}`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });
    const text = res.choices[0].message.content.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const parsed = JSON.parse(text);
    parsed.title = parsed.title.replace(/[—–]/g, '-');
    parsed.excerpt = parsed.excerpt.replace(/[—–]/g, '-');

    const { error } = await sb.from('articles').update({
      title: parsed.title,
      excerpt: parsed.excerpt,
    }).eq('id', art.id);

    if (error) console.log('DB error:', error.message);
    else console.log('OK:', parsed.title);
    console.log('   ', parsed.excerpt.substring(0, 120) + '...\n');

    await new Promise(r => setTimeout(r, 1000));
  } catch (err) {
    console.error('Error for', art.title.substring(0, 40), ':', err.message, '\n');
  }
}

console.log('Done!');
