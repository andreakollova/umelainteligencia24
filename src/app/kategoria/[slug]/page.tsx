import { supabase } from '@/lib/supabase';
import type { Article } from '@/lib/supabase';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import CategorySidebar from '@/components/CategorySidebar';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!category) {
    return { title: 'Kategória nenájdená' };
  }

  const title = `${category.name} - Články o umelej inteligencii | umelá inteligencia24`;
  const description = `Najnovšie články z kategórie ${category.name}. Správy, novinky a analýzy zo sveta umelej inteligencie a moderných technológií na umelá inteligencia24.`;

  return {
    title,
    description,
    keywords: [category.name.toLowerCase(), 'umelá inteligencia', 'AI technológie', 'technológie', 'umelá inteligencia Slovensko'],
    alternates: { canonical: `/kategoria/${slug}`, languages: { 'sk-SK': `/kategoria/${slug}` } },
    openGraph: {
      title, description,
      url: `/kategoria/${slug}`,
      siteName: 'inteligencia24',
      locale: 'sk_SK',
      type: 'website',
      countryName: 'Slovakia',
    },
    other: { 'geo.region': 'SK', 'content-language': 'sk' },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!category) notFound();

  const { data: articles } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .eq('category_id', category.id)
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  // Most read in this category
  const { data: popular } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .eq('category_id', category.id)
    .eq('is_published', true)
    .order('views', { ascending: false })
    .limit(5);

  // Articles with video in this category
  const { data: withVideo } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .eq('category_id', category.id)
    .eq('is_published', true)
    .not('video_url', 'is', null)
    .order('published_at', { ascending: false })
    .limit(5);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px 0' }}>
      <div style={{ borderBottom: '2px solid #37b3f2', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', paddingBottom: 8 }}>{category.name}</h1>
      </div>

      <div className="cat-grid">
        <div>
          <div className="cat-articles">
            {(articles || []).map((article: Article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {(!articles || articles.length === 0) && (
            <p style={{ color: 'var(--text-muted)' }}>Zatiaľ žiadne články v tejto kategórii.</p>
          )}
        </div>
        <div>
          <CategorySidebar
            popular={(popular || []) as Article[]}
            withVideo={(withVideo || []) as Article[]}
          />
        </div>
      </div>
    </div>
  );
}
