// Scrape robotics projects from growbotics.ai and sync to Supabase
// Keeps top 20 projects by stars, links to growbotics.ai pages
import { createClient } from '@supabase/supabase-js';
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

async function scrapeProjects() {
  console.log('Fetching projects from growbotics.ai...');

  const res = await fetch('https://robotics.growbotics.ai/api/projects');
  if (!res.ok) {
    console.error('Failed to fetch:', res.status);
    return;
  }

  const allProjects = await res.json();
  console.log(`Fetched ${allProjects.length} projects total`);

  // Only published, sort by stars, take top 20
  const top = allProjects
    .filter(p => p.status === 'published' && p.slug)
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, 20);

  console.log(`Selected top ${top.length} by stars`);

  // Get existing projects to avoid duplicates
  const { data: existing } = await sb.from('projects').select('external_url');
  const existingUrls = new Set((existing || []).map(p => p.external_url));

  const categoryMap = {
    'foundation-model': 'Foundation Models',
    'software': 'Software',
    'hardware': 'Hardware',
    'dataset': 'Dataset',
    'benchmark': 'Benchmark',
    'simulator': 'Simulator',
  };

  const newProjects = top
    .filter(p => !existingUrls.has(`https://robotics.growbotics.ai/project/${p.slug}`))
    .map(p => ({
      title: p.name,
      description: p.shortDescription || '',
      category: categoryMap[p.projectType] || p.projectType,
      subcategory: p.category || '',
      tags: (p.tags || []).slice(0, 6),
      stars: p.stars || 0,
      license: p.license || '',
      external_url: `https://robotics.growbotics.ai/projects/${{ simulator: 'simulators', 'foundation-model': 'foundation-models', dataset: 'datasets', benchmark: 'benchmarks' }[p.projectType] || p.projectType || 'software'}/${p.slug}`,
      image_url: p.imageUrl || null,
      source_name: 'growbotics.ai',
      is_published: true,
      is_new: true,
    }));

  if (newProjects.length === 0) {
    console.log('No new projects to add.');
    return;
  }

  // Mark old "new" projects as not new (older than 7 days)
  await sb.from('projects')
    .update({ is_new: false })
    .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const { error } = await sb.from('projects').insert(newProjects);
  if (error) {
    console.error('Insert error:', error.message);
  } else {
    console.log(`Inserted ${newProjects.length} projects`);
  }
}

scrapeProjects().catch(console.error);
