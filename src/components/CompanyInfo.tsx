const companies: Record<string, { name: string; flag: string; country: string; info: string }> = {
  'EPFL News': {
    name: 'EPFL',
    flag: '🇨🇭',
    country: 'Švajčiarsko',
    info: 'EPFL (École polytechnique fédérale de Lausanne) je jedna z najlepších technických univerzít v Európe. Sídli v Lausanne vo Švajčiarsku a patrí medzi svetových lídrov vo výskume umelej inteligencie, strojového učenia a dátovej vedy. Na EPFL pôsobí viac ako 380 laboratórií a výskumných skupín.',
  },
  'Microsoft': {
    name: 'Microsoft',
    flag: '🇺🇸',
    country: 'USA',
    info: 'Microsoft je americká technologická spoločnosť so sídlom v Redmonde, Washington. Je jedným z najväčších investorov do umelej inteligencie na svete. Microsoft vyvinul Azure AI, GitHub Copilot a investoval viac ako 13 miliárd dolárov do OpenAI. Firma má viac ako 220 000 zamestnancov vo vyše 190 krajinách.',
  },
  'The Robot Report': {
    name: 'The Robot Report',
    flag: '🇺🇸',
    country: 'USA',
    info: 'The Robot Report je americký online spravodajský portál zameraný na robotiku, automatizáciu a umelú inteligenciu. Prináša novinky o najnovších trendoch v technologickom priemysle.',
  },
  'Interesting Engineering': {
    name: 'Interesting Engineering',
    flag: '🇺🇸',
    country: 'USA',
    info: 'Interesting Engineering je globálny technologický portál so sídlom v USA, ktorý pokrýva inovácie v oblasti AI, inžinierstva, vedy a technológií. Má viac ako 15 miliónov čitateľov mesačne.',
  },
};

export default function CompanyInfo({ sourceName }: { sourceName: string | null }) {
  if (!sourceName) return null;
  const company = companies[sourceName];
  if (!company) return null;

  return (
    <div style={{ marginTop: 32, padding: 20, borderRadius: 12, border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 24 }}>{company.flag}</span>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>O spoločnosti {company.name}</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{company.country}</span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
        {company.info}
      </p>
    </div>
  );
}
