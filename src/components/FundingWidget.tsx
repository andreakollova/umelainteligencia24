const companies = [
  { name: 'Figure', raised: '$1.9B', color: '#1a73e8' },
  { name: 'Neura Robotics', raised: '$1.7B', color: '#e53935' },
  { name: 'XPeng Robotics', raised: '$1.0B', color: '#43a047' },
  { name: 'Galbot', raised: '$964M', color: '#8e24aa' },
  { name: 'Apptronik', raised: '$950M', color: '#f4511e' },
  { name: 'Rhoda', raised: '$680M', color: '#00897b' },
  { name: 'Agility', raised: '$570M', color: '#3949ab' },
];

export default function FundingWidget() {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-light)' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#37b3f2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Humanoidná robotika</span>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: 1.4 }}>
          Najviac financované spoločnosti v humanoidnej robotike
        </p>
      </div>
      <div>
        {companies.map((c) => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--border-light)', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, backgroundColor: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>
              {c.name[0]}
            </div>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{c.raised}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '8px 14px', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5, textAlign: 'center' }}>
        Údaje o financovaní vychádzajú z verejne dostupných oznámení spoločností.
        <br />Posledná aktualizácia: 9. 10. 2026.
      </div>
    </div>
  );
}
