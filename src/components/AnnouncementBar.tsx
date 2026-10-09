import Link from 'next/link';
import type { Article } from '@/lib/supabase';

export default function AnnouncementBar({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  return (
    <div style={{ backgroundColor: '#052136', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 24, overflowX: 'scroll', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }} className="scrollbar-hide">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/clanok/${article.slug}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, textDecoration: 'none' }}
              className="group"
            >
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  style={{ width: 56, height: 40, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#e5e7eb',
                  maxWidth: 180,
                  lineHeight: '1.3',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                }}
                className="group-hover:text-[#37b3f2] transition-colors"
              >
                {article.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
