const companies: Record<string, { name: string; countryCode: string; country: string; info: string }> = {
  'EPFL News': {
    name: 'EPFL',
    countryCode: 'ch',
    country: 'Švajčiarsko',
    info: 'EPFL (École polytechnique fédérale de Lausanne) je jedna z najlepších technických univerzít v Európe. Sídli v Lausanne vo Švajčiarsku a patrí medzi svetových lídrov vo výskume umelej inteligencie, strojového učenia a dátovej vedy. Na EPFL pôsobí viac ako 380 laboratórií a výskumných skupín.',
  },
  'Microsoft': {
    name: 'Microsoft',
    countryCode: 'us',
    country: 'USA',
    info: 'Microsoft je americká technologická spoločnosť so sídlom v Redmonde, Washington. Je jedným z najväčších investorov do umelej inteligencie na svete. Microsoft vyvinul Azure AI, GitHub Copilot a investoval viac ako 13 miliárd dolárov do OpenAI. Firma má viac ako 220 000 zamestnancov vo vyše 190 krajinách.',
  },
  'The Robot Report': {
    name: 'The Robot Report',
    countryCode: 'us',
    country: 'USA',
    info: 'The Robot Report je americký online spravodajský portál zameraný na robotiku, automatizáciu a umelú inteligenciu. Prináša novinky o najnovších trendoch v technologickom priemysle.',
  },
  'Interesting Engineering': {
    name: 'Interesting Engineering',
    countryCode: 'us',
    country: 'USA',
    info: 'Interesting Engineering je globálny technologický portál so sídlom v USA, ktorý pokrýva inovácie v oblasti AI, inžinierstva, vedy a technológií. Má viac ako 15 miliónov čitateľov mesačne.',
  },
};

export default function CompanyInfo({ sourceName }: { sourceName: string | null }) {
  if (!sourceName) return null;
  const company = companies[sourceName];
  if (!company) return null;

  return (
    <div style={{ marginTop: 24, padding: '16px 18px', borderRadius: 10, border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <img
          src={`https://flagcdn.com/w40/${company.countryCode}.png`}
          alt={company.country}
          width={24}
          height={16}
          style={{ borderRadius: 2, objectFit: 'cover' }}
        />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{company.name}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{company.country}</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6, margin: 0 }}>
        {company.info}
      </p>
    </div>
  );
}
