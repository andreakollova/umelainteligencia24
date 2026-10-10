export const metadata = {
  title: 'Podmienky používania',
  description: 'Podmienky používania spravodajského portálu inteligencia.sk o umelej inteligencii a technológiách.',
  alternates: { canonical: '/podmienky' },
  openGraph: { title: 'Podmienky používania', description: 'Podmienky používania spravodajského portálu inteligencia.sk o umelej inteligencii a technológiách.', locale: 'sk_SK', siteName: 'inteligencia24', countryName: 'Slovakia' },
  other: { 'geo.region': 'SK', 'content-language': 'sk' },
};

export default function PodmienkyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Podmienky používania</h1>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 32 }}>Posledná aktualizácia: 7. októbra 2026</p>

      <div style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>1. Prevádzkovateľ</h2>
        <p>Webovú stránku inteligencia.sk prevádzkuje spoločnosť <strong>DRIXTON s.r.o.</strong></p>
        <p>E-mail: studio@drixton.com</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>2. Obsah stránky</h2>
        <p>Obsah na inteligencia.sk je určený na informačné účely. Články sú prekladmi a úpravami pôvodných článkov zo zahraničných zdrojov. Originálne zdroje sú vždy uvedené pri každom článku.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>3. Duševné vlastníctvo</h2>
        <p>Logo, dizajn a grafické prvky stránky sú majetkom DRIXTON s.r.o. Obsah článkov je prekladom zo zdrojov, ktoré sú riadne citované. Obrázky v článkoch patria ich pôvodným autorom.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>4. Obmedzenie zodpovednosti</h2>
        <p>Informácie na tejto stránke sú poskytované "tak ako sú" bez záruky akéhokoľvek druhu. DRIXTON s.r.o. nenesie zodpovednosť za prípadné škody vzniknuté používaním informácií z tejto stránky.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>5. Externé odkazy</h2>
        <p>Stránka môže obsahovať odkazy na externé webové stránky. Za obsah týchto stránok nenesieme zodpovednosť.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>6. Zmeny podmienok</h2>
        <p>Vyhradzujeme si právo kedykoľvek zmeniť tieto podmienky. Zmeny nadobúdajú účinnosť okamihom zverejnenia na tejto stránke.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 32, marginBottom: 12 }}>7. Kontakt</h2>
        <p>V prípade otázok nás kontaktujte na: <a href="mailto:studio@drixton.com" style={{ color: '#37b3f2' }}>studio@drixton.com</a></p>
      </div>
    </div>
  );
}
