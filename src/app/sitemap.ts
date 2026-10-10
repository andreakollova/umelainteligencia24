import { supabase } from '@/lib/supabase';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://inteligencia.sk';

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at, updated_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  const { data: categories } = await supabase
    .from('categories')
    .select('slug');

  const articleUrls = (articles || []).map((a) => ({
    url: `${baseUrl}/clanok/${a.slug}`,
    lastModified: new Date(a.updated_at || a.published_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = (categories || []).map((c) => ({
    url: `${baseUrl}/kategoria/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 1 },
    { url: `${baseUrl}/projekty`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${baseUrl}/o-nas`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/eshop`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${baseUrl}/odber`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/spolupraca`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/kontakt`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/ochrana-sukromia`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.2 },
    { url: `${baseUrl}/podmienky`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.2 },
    { url: `${baseUrl}/cookies`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.2 },
  ];

  return [
    ...staticPages,
    ...categoryUrls,
    ...articleUrls,
  ];
}
