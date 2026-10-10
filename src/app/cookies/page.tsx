export const metadata = {
  title: 'Cookies',
  description: 'Informácie o používaní cookies na inteligencia.sk. Zásady spracovania súborov cookies.',
  alternates: { canonical: '/cookies' },
  openGraph: { title: 'Cookies', description: 'Informácie o používaní cookies na inteligencia.sk. Zásady spracovania súborov cookies.', locale: 'sk_SK', siteName: 'inteligencia24', countryName: 'Slovakia' },
  other: { 'geo.region': 'SK', 'content-language': 'sk' },
};

export default function CookiesPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Zásady používania cookies</h1>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 32 }}>Posledná aktualizácia: 7. októbra 2026</p>

      <div style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>Čo sú cookies?</h2>
        <p>Cookies sú malé textové súbory, ktoré sa ukladajú vo vašom prehliadači pri návšteve webovej stránky. Pomáhajú nám zabezpečiť správne fungovanie stránky a zlepšiť váš zážitok.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>Typy cookies, ktoré používame</h2>

        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginTop: 20, marginBottom: 8 }}>Nevyhnutné cookies</h3>
        <p>Tieto cookies sú potrebné na fungovanie webovej stránky. Bez nich by stránka nefungovala správne.</p>

        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginTop: 20, marginBottom: 8 }}>Analytické cookies</h3>
        <p>Pomáhajú nám pochopiť, ako návštevníci používajú našu stránku. Všetky údaje sú anonymizované.</p>

        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginTop: 20, marginBottom: 8 }}>Reklamné cookies (Google AdSense)</h3>
        <p>Tieto cookies používa Google na zobrazovanie relevantných reklám na základe vašich záujmov. Môžete ich odmietnuť prostredníctvom bannera o súhlase s cookies.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>Ako spravovať cookies</h2>
        <p>Cookies môžete spravovať v nastaveniach vášho prehliadača. Väčšina prehliadačov umožňuje:</p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Zobraziť uložené cookies</li>
          <li>Vymazať všetky alebo konkrétne cookies</li>
          <li>Blokovať cookies tretích strán</li>
          <li>Nastaviť upozornenia pri ukladaní cookies</li>
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>Kontakt</h2>
        <p>Ak máte otázky, kontaktujte nás na: <a href="mailto:studio@drixton.com" style={{ color: '#37b3f2' }}>studio@drixton.com</a></p>
      </div>
    </div>
  );
}
