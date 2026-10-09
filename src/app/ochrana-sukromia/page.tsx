export const metadata = {
  title: 'Ochrana súkromia',
  description: 'Ochrana súkromia a spracovanie osobných údajov na umelainteligencia24.sk v súlade s GDPR.',
  alternates: { canonical: '/ochrana-sukromia' },
  openGraph: { title: 'Ochrana súkromia', description: 'Ochrana súkromia a spracovanie osobných údajov na umelainteligencia24.sk v súlade s GDPR.', locale: 'sk_SK', siteName: 'umelainteligencia24', countryName: 'Slovakia' },
  other: { 'geo.region': 'SK', 'content-language': 'sk' },
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Ochrana súkromia</h1>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 32 }}>Posledná aktualizácia: 7. októbra 2026</p>

      <div style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>1. Prevádzkovateľ</h2>
        <p>Prevádzkovateľom webovej stránky umelainteligencia24.sk je spoločnosť <strong>DRIXTON s.r.o.</strong></p>
        <p>E-mail: studio@drixton.com</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>2. Aké údaje zhromažďujeme</h2>
        <p>Pri návšteve našej stránky môžeme zhromažďovať nasledujúce údaje:</p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Anonymizované analytické údaje (počet návštev, zobrazenia stránok)</li>
          <li>Cookies potrebné na fungovanie webu a zobrazovanie reklám</li>
          <li>E-mailová adresa, ak sa prihlásite na odber noviniek (iba so súhlasom)</li>
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>3. Účel spracovania</h2>
        <p>Vaše údaje spracúvame na tieto účely:</p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Zabezpečenie funkčnosti webovej stránky</li>
          <li>Zobrazovanie relevantnej reklamy (Google AdSense)</li>
          <li>Zasielanie noviniek (iba so súhlasom)</li>
          <li>Zlepšovanie obsahu a používateľského zážitku</li>
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>4. Právny základ</h2>
        <p>Vaše osobné údaje spracúvame na základe:</p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Súhlasu (čl. 6 ods. 1 písm. a) GDPR) - pre cookies a odber noviniek</li>
          <li>Oprávneného záujmu (čl. 6 ods. 1 písm. f) GDPR) - pre analytiku a zabezpečenie webu</li>
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>5. Tretie strany</h2>
        <p>Na zobrazovanie reklám využívame službu Google AdSense. Google môže používať cookies na personalizáciu reklám. Viac informácií nájdete v <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#37b3f2' }}>zásadách ochrany osobných údajov spoločnosti Google</a>.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>6. Vaše práva</h2>
        <p>Máte právo na:</p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Prístup k vašim osobným údajom</li>
          <li>Opravu nesprávnych údajov</li>
          <li>Vymazanie údajov</li>
          <li>Obmedzenie spracovania</li>
          <li>Prenosnosť údajov</li>
          <li>Odvolanie súhlasu kedykoľvek</li>
          <li>Podanie sťažnosti na Úrad na ochranu osobných údajov SR</li>
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>7. Kontakt</h2>
        <p>V prípade otázok ohľadom ochrany súkromia nás kontaktujte na: <a href="mailto:studio@drixton.com" style={{ color: '#37b3f2' }}>studio@drixton.com</a></p>
      </div>
    </div>
  );
}
