import { supabase } from '@/lib/supabase';
import type { Article } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ArticleSidebar from '@/components/ArticleSidebar';
import ShareLinks from '@/components/ShareLinks';
import AboutAuthor from '@/components/AboutAuthor';
import type { Metadata } from 'next';
import AdBlock from '@/components/AdBlock';

export const revalidate = 300;

const BASE_URL = 'https://inteligencia24.sk';

async function getArticle(slug: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  return data as Article | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: 'Článok nenájdený | umelá inteligencia24' };
  }

  const canonicalUrl = `${BASE_URL}/clanok/${article.slug}`;
  const description = article.excerpt?.replace(/\*\*/g, '') || '';

  const categoryName = (article as any).categories?.name || 'Umelá inteligencia';

  return {
    title: article.title,
    description,
    authors: article.author ? [{ name: article.author }] : undefined,
    keywords: [
      categoryName.toLowerCase(), 'umelá inteligencia', 'AI technológie', 'umelá inteligencia',
      'umelá inteligencia Slovensko', 'technológie', article.source_name || '',
    ].filter(Boolean),
    openGraph: {
      title: article.title,
      description,
      url: canonicalUrl,
      siteName: 'inteligencia24',
      locale: 'sk_SK',
      type: 'article',
      publishedTime: article.published_at,
      modifiedTime: article.updated_at || article.published_at,
      authors: article.author ? [article.author] : undefined,
      section: categoryName,
      countryName: 'Slovakia',
      images: article.image_url
        ? [{ url: article.image_url, width: 1200, height: 630, alt: article.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.image_url ? [article.image_url] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: { 'sk-SK': canonicalUrl },
    },
    other: {
      'geo.region': 'SK',
      'geo.placename': 'Slovensko',
      'content-language': 'sk',
      'article:section': categoryName,
      'article:published_time': article.published_at,
      'article:author': article.author || 'umelá inteligencia24',
    },
  };
}

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const article = await getArticle(slug);

  if (!article) notFound();

  // Increment views
  await supabase
    .from('articles')
    .update({ views: (article as Article).views + 1 })
    .eq('id', article.id);

  const { data: related } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .eq('is_published', true)
    .neq('id', article.id)
    .order('published_at', { ascending: false })
    .limit(5);

  const a = article as Article;
  const categoryName = a.categories?.name;
  const articleUrl = `https://inteligencia24.sk/clanok/${a.slug}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: a.title,
      description: a.excerpt?.replace(/\*\*/g, '') || '',
      image: a.image_url || undefined,
      datePublished: a.published_at,
      dateModified: (a as any).updated_at || a.published_at,
      inLanguage: 'sk',
      author: { '@type': 'Person', name: a.author },
      publisher: {
        '@type': 'Organization',
        name: 'inteligencia24',
        logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Domov', item: BASE_URL },
        ...(categoryName ? [{ '@type': 'ListItem', position: 2, name: categoryName, item: `${BASE_URL}/kategoria/${a.categories?.slug}` }] : []),
        { '@type': 'ListItem', position: categoryName ? 3 : 2, name: a.title },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <article className="lg:col-span-2">
          {categoryName && (
            <Link
              href={`/kategoria/${a.categories?.slug}`}
              style={{ display: 'inline-block', backgroundColor: '#37b3f2', color: '#ffffff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 4, marginBottom: 16, textDecoration: 'none', letterSpacing: '0.05em' }}
            >
              {categoryName}
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {a.title}
          </h1>
          <div className="flex items-center gap-3 text-gray-500 text-sm mb-2">
            <span>{a.author}</span>
            <span>-</span>
            <span>
              {new Date(a.published_at).toLocaleDateString('sk-SK', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <ShareLinks url={articleUrl} title={a.title} />

          {a.image_url && (
            <div className="rounded-lg overflow-hidden mb-2">
              <img src={a.image_url} alt={a.title} className="w-full aspect-video object-cover" />
            </div>
          )}

          {a.source_name && a.source_url && (
            <p className="text-xs text-gray-400 mb-6">
              Zdroj:{' '}
              <a
                href={a.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#37b3f2] transition-colors underline"
              >
                {a.source_name}
              </a>
              {a.original_author && ` - ${a.original_author}`}
              {a.original_date && ` | ${new Date(a.original_date).toLocaleDateString('sk-SK')}`}
            </p>
          )}

          {a.video_url && (
            <div className="mb-8 rounded-lg overflow-hidden aspect-video">
              <iframe
                src={a.video_url}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}

          {a.excerpt && (
            <p className="text-lg text-gray-600 leading-relaxed mb-6 font-medium border-l-4 border-[#37b3f2] pl-4">
              {renderBold(a.excerpt || '')}
            </p>
          )}

          {/* Hidden watermark for copy detection */}
          <span style={{ position: 'absolute', opacity: 0, fontSize: 0, pointerEvents: 'none' }} aria-hidden="true">
            {`©inteligencia24.sk/${a.slug}`}
          </span>

          {a.content && (
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">
              {a.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-3">
                      {line.replace('## ', '')}
                    </h2>
                  );
                }
                if (line.startsWith('- ')) {
                  return (
                    <p key={i} className="pl-4 mb-1">
                      <span className="text-[#37b3f2] mr-2">-</span>
                      {renderBold(line.replace('- ', ''))}
                    </p>
                  );
                }
                if (line.trim()) {
                  return <p key={i} className="mb-4">{renderBold(line)}</p>;
                }
                return null;
              })}
            </div>
          )}

          {!a.content && (
            <p className="text-gray-400 italic">Plný obsah článku bude dostupný čoskoro.</p>
          )}

          <div className="my-8">
            <AdBlock format="horizontal" />
          </div>

          {a.source_name && a.source_url && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">
                Tento článok bol pôvodne publikovaný na{' '}
                <a
                  href={a.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#37b3f2] hover:underline font-medium"
                >
                  {a.source_name}
                </a>
                . Preklad a úprava: {a.author}, umelá inteligencia24.
              </p>
            </div>
          )}

          <div className="mt-8">
            <ShareLinks url={articleUrl} title={a.title} />
          </div>

          <AboutAuthor authorName={a.author} />
        </article>

        <div>
          <ArticleSidebar articles={(related || []) as Article[]} />
        </div>
      </div>
    </div>
    </>
  );
}
