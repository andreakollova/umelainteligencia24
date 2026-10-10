import { supabase } from '@/lib/supabase';

export default async function WordOfDay() {
  const { data: terms } = await supabase
    .from('glossary')
    .select('*')
    .eq('is_published', true);

  if (!terms || terms.length === 0) return null;

  // Pick term based on day of year (same term all day)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const term = terms[dayOfYear % terms.length];

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 32px' }}>
      <div style={{ border: '2px solid #cb1e26', borderRadius: 12, padding: '24px 28px', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#cb1e26', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Slovo dňa</span>
          <h3 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0', lineHeight: 1.2 }}>{term.term_en}</h3>
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{term.term_sk}</span>
        </div>
        <div style={{ flex: 1, minWidth: 250 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {term.explanation}
          </p>
        </div>
      </div>
    </section>
  );
}
