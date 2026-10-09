export const metadata = {
  title: 'E-shop robotika24 - Merch a doplnky pre fanúšikov robotiky',
  description: 'Originálne mikiny, tričká a doplnky s motívom robotiky od robotika24. Slovenský merch pre nadšencov technológií.',
  alternates: { canonical: '/eshop' },
  openGraph: { title: 'E-shop robotika24 - Merch a doplnky pre fanúšikov robotiky', description: 'Originálne mikiny, tričká a doplnky s motívom robotiky od robotika24. Slovenský merch pre nadšencov technológií.', locale: 'sk_SK', siteName: 'umelainteligencia24', countryName: 'Slovakia' },
  other: { 'geo.region': 'SK', 'content-language': 'sk' },
};

export default function EshopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
