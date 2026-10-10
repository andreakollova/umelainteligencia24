export const metadata = {
  title: 'E-shop umelá inteligencia24 - Merch a doplnky pre fanúšikov umelej inteligencie',
  description: 'Originálne mikiny, tričká a doplnky s motívom umelej inteligencie od umelá inteligencia24. Slovenský merch pre nadšencov technológií.',
  alternates: { canonical: '/eshop' },
  openGraph: { title: 'E-shop umelá inteligencia24 - Merch a doplnky pre fanúšikov umelej inteligencie', description: 'Originálne mikiny, tričká a doplnky s motívom umelej inteligencie od umelá inteligencia24. Slovenský merch pre nadšencov technológií.', locale: 'sk_SK', siteName: 'inteligencia24', countryName: 'Slovakia' },
  other: { 'geo.region': 'SK', 'content-language': 'sk' },
};

export default function EshopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
