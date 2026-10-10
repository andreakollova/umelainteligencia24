import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Kontakt',
  description: 'Kontaktujte redakciu Umelá inteligencia24. Tip na článok, spolupráca, tlačové správy.',
  alternates: { canonical: '/kontakt' },
  openGraph: { title: 'Kontakt', description: 'Kontaktujte redakciu Umelá inteligencia24. Tip na článok, spolupráca, tlačové správy.', locale: 'sk_SK', siteName: 'inteligencia24', countryName: 'Slovakia' },
  other: { 'geo.region': 'SK', 'content-language': 'sk' },
};

export default function KontaktPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Kontakt</h1>
      <p style={{ fontSize: 15, color: 'var(--text-tertiary)', marginBottom: 32, lineHeight: 1.6 }}>
        Máte tip na článok, otázku, pripomienku alebo záujem o spoluprácu? Napíšte nám.
      </p>

      <ContactForm />

      <div style={{ marginTop: 40, color: 'var(--text-tertiary)', fontSize: 14, lineHeight: 1.8 }}>
        <p>E-mail: <a href="mailto:studio@drixton.com" style={{ color: '#37b3f2' }}>studio@drixton.com</a></p>
        <p style={{ marginTop: 8 }}>
          <a href="https://inteligencia.sk" style={{ color: '#37b3f2' }}>inteligencia.sk</a> | <a href="https://inteligencia.cz" style={{ color: '#37b3f2' }}>inteligencia.cz</a>
        </p>
      </div>
    </div>
  );
}
