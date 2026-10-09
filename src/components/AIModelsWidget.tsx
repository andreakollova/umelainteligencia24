const models = [
  { category: 'Inteligencia', name: 'Claude Opus 4.6', logo: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128' },
  { category: 'Rýchlosť', name: 'Gemini 2.5 Flash', logo: 'https://www.google.com/s2/favicons?domain=deepmind.google&sz=128' },
  { category: 'Latencia', name: 'Gemini Flash-Lite', logo: 'https://www.google.com/s2/favicons?domain=deepmind.google&sz=128' },
  { category: 'Najlacnejší', name: 'GPT-6 Luna', logo: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128' },
];

export default function AIModelsWidget() {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginTop: 20 }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-light)' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#37b3f2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Modely</span>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: 1.4 }}>Najlepšie AI modely podľa Artificial Analysis</p>
      </div>
      <div>
        {models.map((m) => (
          <div key={m.category} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--border-light)', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={m.logo} alt={m.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{m.category}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '8px 14px', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5, textAlign: 'center' }}>
        Zdroj: <a href="https://artificialanalysis.ai/leaderboards/models" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Artificial Analysis</a>.
        Poradie vychádza z nezávislých benchmarkov.
        <br />Posledná aktualizácia: 9. 10. 2026.
      </div>
    </div>
  );
}
