import Link from 'next/link';
import type { Article } from '@/lib/supabase';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `pred ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `pred ${hours} hod`;
  const days = Math.floor(hours / 24);
  return `pred ${days} ${days === 1 ? 'dňom' : 'dňami'}`;
}

export default function ArticleCard({
  article,
  size = 'normal',
}: {
  article: Article;
  size?: 'hero' | 'normal' | 'small';
}) {
  const categoryName = article.categories?.name;

  // Hero - big card with overlay like SportNet main article
  if (size === 'hero') {
    return (
      <Link href={`/clanok/${article.slug}`} className="group block relative">
        <div className="relative overflow-hidden rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', paddingBottom: '62.5%' }}>
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              className="group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
            {categoryName && (
              <span style={{ display: 'inline-block', backgroundColor: '#37b3f2', color: '#ffffff', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3, marginBottom: 8, letterSpacing: '0.06em' }}>
                {categoryName}
              </span>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-2">
              {article.title}
            </h2>
            <div className="flex items-center gap-2 text-gray-400 text-[11px]">
              <span>{article.author}</span>
              <span>|</span>
              <span>{timeAgo(article.published_at)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Small - horizontal card for sidebar-like lists
  if (size === 'small') {
    return (
      <Link href={`/clanok/${article.slug}`} className="group flex gap-3 items-start py-3 border-b border-gray-100 last:border-0">
        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-[100px] h-[66px] rounded object-cover shrink-0 group-hover:opacity-80 transition-opacity"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-bold text-[#052136] leading-tight group-hover:text-[#37b3f2] transition-colors line-clamp-3">
            {article.title}
          </h3>
          <span className="text-[11px] text-gray-400 mt-1 block">{timeAgo(article.published_at)}</span>
        </div>
      </Link>
    );
  }

  // Normal - vertical card like SportNet grid articles
  return (
    <Link href={`/clanok/${article.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg mb-3 relative" style={{ backgroundColor: 'var(--bg-tertiary)', paddingBottom: '62.5%' }}>
        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            className="group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>
      {categoryName && (
        <span className="text-[#37b3f2] text-[11px] font-bold uppercase tracking-wider">{categoryName}</span>
      )}
      <h3 className="text-[15px] font-bold text-[#052136] leading-snug mt-1 group-hover:text-[#37b3f2] transition-colors line-clamp-3">
        {article.title}
      </h3>
      <div className="flex items-center gap-2 mt-2 text-gray-400 text-[11px]">
        <span className="font-medium text-gray-500">{article.author}</span>
        <span>|</span>
        <span>{timeAgo(article.published_at)}</span>
      </div>
    </Link>
  );
}
