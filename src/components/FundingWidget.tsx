const companies = [
  { name: 'Figure', raised: '$1.9B', logo: 'https://www.google.com/s2/favicons?domain=figure.ai&sz=128' },
  { name: 'Neura Robotics', raised: '$1.7B', logo: 'https://www.google.com/s2/favicons?domain=neurarobotics.com&sz=128' },
  { name: 'XPeng Robotics', raised: '$1.0B', logo: 'https://www.google.com/s2/favicons?domain=xpeng.com&sz=128' },
  { name: 'Galbot', raised: '$964M', logo: 'https://www.google.com/s2/favicons?domain=galbot.com&sz=128' },
  { name: 'Apptronik', raised: '$950M', logo: 'https://www.google.com/s2/favicons?domain=apptronik.com&sz=128' },
  { name: 'Rhoda', raised: '$680M', logo: 'https://www.google.com/s2/favicons?domain=rhodarobotics.com&sz=128' },
  { name: 'Agility', raised: '$570M', logo: 'https://www.google.com/s2/favicons?domain=agilityrobotics.com&sz=128' },
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
            <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={c.logo} alt={c.name} style={{ width: 32, height: 32, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${c.logo.split('/').pop()}&sz=128`; }} />
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
