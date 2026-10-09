export const metadata = {
  title: 'Odoberajte novinky zo sveta robotiky - Newsletter robotika24',
  description: 'Prihláste sa na odber najnovších správ o robotike, umelej inteligencii a moderných technológiách. Novinky priamo do vášho e-mailu.',
  alternates: { canonical: '/odber' },
  openGraph: { title: 'Odoberajte novinky zo sveta robotiky - Newsletter robotika24', description: 'Prihláste sa na odber najnovších správ o robotike, umelej inteligencii a moderných technológiách. Novinky priamo do vášho e-mailu.', locale: 'sk_SK', siteName: 'umelainteligencia24', countryName: 'Slovakia' },
  other: { 'geo.region': 'SK', 'content-language': 'sk' },
};

export default function OdberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
