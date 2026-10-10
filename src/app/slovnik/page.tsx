import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'Slovník AI pojmov',
  description: 'Kompletný slovník pojmov z oblasti umelej inteligencie, strojového učenia a AI technológií v slovenčine.',
  alternates: { canonical: '/slovnik' },
  openGraph: { title: 'Slovník AI pojmov', description: 'Kompletný slovník AI pojmov v slovenčine.', locale: 'sk_SK', siteName: 'inteligencia24', countryName: 'Slovakia' },
  other: { 'geo.region': 'SK', 'content-language': 'sk' },
};

export const revalidate = 60;

type Term = {
  id: string;
  term_en: string;
  term_sk: string;
  slug: string;
  explanation: string;
};

export default async function SlovnikPage() {
  const { data } = await supabase
    .from('glossary')
    .select('*')
    .eq('is_published', true)
    .order('term_en', { ascending: true });

  const terms = (data || []) as Term[];

  return (
    <div className="max-w-[900px] mx-auto px-5 pt-6 pb-20">
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Slovník AI pojmov</h1>
      <p style={{ fontSize: 15, color: 'var(--text-tertiary)', marginBottom: 32 }}>
        {terms.length} pojmov zo sveta umelej inteligencie
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {terms.map((term) => (
          <div key={term.id} id={term.slug} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{term.term_en}</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{term.term_sk}</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {term.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
