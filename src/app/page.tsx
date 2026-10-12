import { supabase } from '@/lib/supabase';
import type { Article } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import ProjectsSection from '@/components/ProjectsSection';
import NewsletterBanner from '@/components/NewsletterBanner';
import Link from 'next/link';

export const revalidate = 600;

const fields = 'id, title, slug, excerpt, image_url, author, views, published_at, video_url, categories(name, slug)';

async function getArticles() {
  const [{ data: all }, { data: popularRaw }, { data: videoRaw }] = await Promise.all([
    supabase.from('articles').select(fields).eq('is_published', true).order('published_at', { ascending: false }),
    supabase.from('articles').select(fields).eq('is_published', true).order('views', { ascending: false }).limit(10),
    supabase.from('articles').select(fields).eq('is_published', true).not('video_url', 'is', null).order('published_at', { ascending: false }).limit(6),
  ]);

  const articles = (all || []) as unknown as Article[];
  const allPopular = (popularRaw || []) as unknown as Article[];
  const videoArticles = (videoRaw || []) as unknown as Article[];

  const hero = articles[0];
  const heroSide = articles[1];
  const heroIds = new Set([hero?.id, heroSide?.id]);

  const grid = articles.filter(a => !heroIds.has(a.id)).slice(0, 12);
  const gridIds = new Set([...heroIds, ...grid.map(a => a.id)]);

  const popular = allPopular.filter(a => !heroIds.has(a.id)).slice(0, 5);
  const latest = articles.filter(a => !heroIds.has(a.id)).slice(0, 10);

  // Category sections — articles NOT already shown in hero or grid
  const remaining = articles.filter(a => !gridIds.has(a.id));
  const byCategory: Record<string, Article[]> = {};
  for (const a of remaining) {
    const catSlug = (a as any).categories?.slug || 'ostatne';
    if (!byCategory[catSlug]) byCategory[catSlug] = [];
    if (byCategory[catSlug].length < 4) byCategory[catSlug].push(a);
  }

  return { hero, heroSide, grid, popular, latest, byCategory, videoArticles };
}

export default async function Home() {
  const { hero, heroSide, grid, popular, latest, byCategory, videoArticles } = await getArticles();

  const categoryNames: Record<string, string> = {
    modely: 'Modely', vyskum: 'Výskum', nastroje: 'Nástroje',
    biznis: 'Biznis', sport: 'Šport',
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'inteligencia24',
    url: 'https://inteligencia24.sk',
    description: 'Slovenský spravodajský portál o umelej inteligencii a moderných technológiách.',
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
        {/* Hero cards */}
        {hero && (
          <section style={{ marginBottom: 24 }}>
            <div className="hero-cards">
              <ArticleCard article={hero} size="hero" />
              {heroSide && <ArticleCard article={heroSide} size="hero" />}
            </div>
          </section>
        )}

        {/* Najnovšie správy - 12 articles grid + sidebar */}
        <div style={{ borderBottom: '2px solid #37b3f2', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', paddingBottom: 8 }}>Najnovšie správy</h2>
        </div>

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

        {/* Category sections */}
        {Object.entries(byCategory).map(([slug, articles]) => {
          const name = categoryNames[slug] || slug;
          if (articles.length === 0) return null;
          return (
            <section key={slug} style={{ marginTop: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #37b3f2', marginBottom: 16, paddingBottom: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</h2>
                <Link href={`/kategoria/${slug}`} style={{ fontSize: 13, fontWeight: 600, color: '#37b3f2', textDecoration: 'none' }}>Zobraziť všetky</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} size="small" />
                ))}
              </div>
            </section>
          );
        })}

        {/* Články s videom */}
        {videoArticles.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <div style={{ borderBottom: '2px solid #37b3f2', marginBottom: 16, paddingBottom: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Články s videom</h2>
            </div>
            <div className="articles-grid">
              {videoArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Eshop Banner */}
      <section style={{ maxWidth: 1280, margin: '32px auto 0', padding: '0 20px' }}>
        <Link href="/eshop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 24px', borderRadius: 12, backgroundColor: '#37b3f2', color: '#fff', fontSize: 18, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
          E-shop - Merch pre fanúšikov AI
        </Link>
      </section>

      <NewsletterBanner />
      <ProjectsSection />
    </>
  );
}
