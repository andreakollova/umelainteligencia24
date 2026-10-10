import { supabase } from '@/lib/supabase';
import type { Article } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import ProjectsSection from '@/components/ProjectsSection';
import NewsletterBanner from '@/components/NewsletterBanner';
import WordOfDay from '@/components/WordOfDay';

export const revalidate = 600;

async function getArticles() {
  const { data: all } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, image_url, author, views, published_at, categories(name, slug)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(20);

  const { data: popularRaw } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, image_url, author, views, published_at, categories(name, slug)')
    .eq('is_published', true)
    .order('views', { ascending: false })
    .limit(10);

  const articles = (all || []) as unknown as Article[];
  const allPopular = (popularRaw || []) as unknown as Article[];

  const announcement = articles.slice(0, 4);
  const hero = articles[4] || articles[0];
  const heroSide = articles[5] || articles[1];
  const heroIds = new Set([hero?.id, heroSide?.id]);

  const popular = allPopular.filter(a => !heroIds.has(a.id)).slice(0, 5);
  const latest = articles.filter(a => !heroIds.has(a.id)).slice(0, 5);
  const grid = articles.filter(a => !heroIds.has(a.id)).slice(0, 12);

  return { announcement, hero, heroSide, grid, popular, latest };
}

export default async function Home() {
  const { announcement, hero, heroSide, grid, popular, latest } = await getArticles();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'inteligencia24',
    url: 'https://inteligencia24.sk',
    description: 'Slovenský spravodajský portál o umelej inteligencii, umelej inteligencii a moderných technológiách.',
    inLanguage: 'sk',
    publisher: {
      '@type': 'Organization',
      name: 'inteligencia24',
      logo: { '@type': 'ImageObject', url: 'https://inteligencia24.sk/logo.png' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ maxWidth: 1280, margin: '0 auto' }} className="px-5 sm:px-5 pt-6">
        {/* Hero cards - full width, side by side */}
        {hero && (
          <section style={{ marginBottom: 24 }}>
            <div className="hero-cards">
              <ArticleCard article={hero} size="hero" />
              {heroSide && <ArticleCard article={heroSide} size="hero" />}
            </div>
          </section>
        )}

        {/* Divider */}
        <div style={{ borderBottom: '2px solid #37b3f2', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#051722', paddingBottom: 8 }}>Najnovšie správy</h2>
        </div>

        {/* Grid + Sidebar */}
        <div className="content-layout">
          <section className="articles-grid">
            {grid.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </section>
          <aside>
            <Sidebar articles={popular} latestArticles={latest} />
          </aside>
        </div>
      </div>

      {/* Newsletter CTA */}
      <NewsletterBanner />

      <ProjectsSection />
    </>
  );
}
