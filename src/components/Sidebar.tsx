'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Article } from '@/lib/supabase';
import AdBlock from '@/components/AdBlock';
import FundingWidget from '@/components/FundingWidget';
import AIModelsWidget from '@/components/AIModelsWidget';
import WordOfDayWidget from '@/components/WordOfDayWidget';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `pred ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `pred ${hours} hod`;
  const days = Math.floor(hours / 24);
  return `pred ${days} ${days === 1 ? 'dňom' : 'dňami'}`;
}

export default function Sidebar({ articles, latestArticles }: { articles: Article[]; latestArticles?: Article[] }) {
  const [tab, setTab] = useState<'popular' | 'latest'>('popular');
  const displayArticles = tab === 'popular' ? articles : (latestArticles || articles);

  return (
    <div>
      <aside style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setTab('popular')}
            style={{
              flex: 1, padding: '12px 16px', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
              color: tab === 'popular' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: tab === 'popular' ? '2px solid #37b3f2' : '2px solid transparent',
              backgroundColor: tab === 'popular' ? 'var(--card-bg)' : 'var(--bg-secondary)',
            }}
          >
            Najčítanejšie
          </button>
          <button
            onClick={() => setTab('latest')}
            style={{
              flex: 1, padding: '12px 16px', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
              color: tab === 'latest' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: tab === 'latest' ? '2px solid #37b3f2' : '2px solid transparent',
              backgroundColor: tab === 'latest' ? 'var(--card-bg)' : 'var(--bg-secondary)',
            }}
          >
            Najnovšie
          </button>
        </div>

        <div style={{ padding: 16 }}>
          {displayArticles.map((article, i) => (
            <Link
              key={article.id}
              href={`/clanok/${article.slug}`}
              className="group"
              style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < displayArticles.length - 1 ? '1px solid var(--border-light)' : 'none', textDecoration: 'none' }}
            >
              <span style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} className="group-hover:border-[#37b3f2] group-hover:text-[#37b3f2] transition-colors">
                {i + 1}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const }} className="group-hover:text-[#37b3f2] transition-colors">
                  {article.title}
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  {timeAgo(article.published_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      <Link href="/eshop" style={{ display: 'block', marginTop: 20, borderRadius: 8, overflow: 'hidden' }}>
        <img src="/eshop-banner.png" alt="umelá inteligencia24 E-shop - Merch pre fanúšikov umelej inteligencie" style={{ width: '100%', display: 'block' }} />
      </Link>

      <div style={{ marginTop: 20 }}>
        <FundingWidget />
      </div>
      <AIModelsWidget />
      <WordOfDayWidget />

      <div style={{ marginTop: 20 }}>
        <AdBlock format="rectangle" />
      </div>
    </div>
  );
}
