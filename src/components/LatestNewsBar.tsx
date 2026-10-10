import { supabase } from '@/lib/supabase';

export default async function LatestNewsBar() {
  const { data } = await supabase
    .from('articles')
    .select('title')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.title) return null;

  return (
    <div style={{ padding: '9px 20px', borderBottom: '1px solid var(--border)' }} className="bg-[var(--bg-tertiary)]">
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7, flexShrink: 0 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: '#22c55e', opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
          <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <style>{`@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`}</style>
        </span>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
          {data.title}
        </p>
      </div>
    </div>
  );
}
