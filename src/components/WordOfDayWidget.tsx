import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function WordOfDayWidget() {
  const { data: terms } = await supabase
    .from('glossary')
    .select('*')
    .eq('is_published', true);

  if (!terms || terms.length === 0) return null;

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const term = terms[dayOfYear % terms.length];

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginTop: 20 }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#37b3f2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Slovo dňa</span>
        <Link href={`/slovnik#${term.slug}`} style={{ fontSize: 11, color: '#37b3f2', textDecoration: 'none', fontWeight: 600 }}>Viac →</Link>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{term.term_en}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{term.term_sk}</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {term.explanation.length > 200 ? term.explanation.substring(0, 200) + '...' : term.explanation}
        </p>
      </div>
    </div>
  );
}
