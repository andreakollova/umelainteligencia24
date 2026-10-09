import { supabase } from '@/lib/supabase';
import type { Article } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import AnnouncementBar from '@/components/AnnouncementBar';
import ProjectsSection from '@/components/ProjectsSection';
import NewsletterBanner from '@/components/NewsletterBanner';

export const revalidate = 60;

async function getArticles() {
  const { data: all } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(30);

  const { data: popularRaw } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .eq('is_published', true)
    .order('views', { ascending: false })
    .limit(10);

  const articles = (all || []) as Article[];
  const allPopular = (popularRaw || []) as Article[];

  const announcement = articles.slice(0, 4);
  const hero = articles[4] || articles[0];
  const heroSide = articles[5] || articles[1];
  const heroIds = new Set([hero?.id, heroSide?.id]);

  const popular = allPopular.filter(a => !heroIds.has(a.id)).slice(0, 5);
  const latest = articles.filter(a => !heroIds.has(a.id)).slice(0, 5);
  const grid = articles.filter(a => !heroIds.has(a.id)).slice(0, 20);

  return { announcement, hero, heroSide, grid, popular, latest };
}

export default async function Home() {
  const { announcement, hero, heroSide, grid, popular, latest } = await getArticles();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'umelainteligencia24',
    url: 'https://umelainteligencia24.sk',
    description: 'Slovenský spravodajský portál o robotike, umelej inteligencii a moderných technológiách.',
    inLanguage: 'sk',
    publisher: {
      '@type': 'Organization',
      name: 'umelainteligencia24',
      logo: { '@type': 'ImageObject', url: 'https://umelainteligencia24.sk/logo.png' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AnnouncementBar articles={announcement} />

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
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#052136', paddingBottom: 8 }}>Najnovšie správy</h2>
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
