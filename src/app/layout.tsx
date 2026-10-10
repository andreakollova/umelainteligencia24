import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/next";
import PageTracker from "@/components/PageTracker";
import CopyProtection from "@/components/CopyProtection";
import AuthGate from "@/components/AuthGate";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: {
    default: 'inteligencia24.sk - Správy zo sveta umelej inteligencie a AI na Slovensku',
    template: '%s | inteligencia24.sk',
  },
  description: 'Najnovšie správy o umelej inteligencii, jazykových modeloch, strojovom učení a AI technológiách v slovenčine. Denne prinášame novinky, analýzy a rozhovory zo sveta AI pre slovenských čitateľov.',
  keywords: [
    'umelá inteligencia', 'AI', 'strojové učenie', 'jazykové modely',
    'ChatGPT', 'Claude', 'Gemini', 'GPT', 'LLM', 'deep learning',
    'neurónové siete', 'AI Slovensko', 'AI novinky', 'generatívna AI',
    'počítačové videnie', 'NLP', 'AI nástroje', 'AI výskum',
    'OpenAI', 'Google DeepMind', 'Anthropic', 'Meta AI',
  ],
  authors: [{ name: 'inteligencia24' }],
  creator: 'inteligencia24',
  publisher: 'inteligencia24',
  metadataBase: new URL('https://inteligencia24.sk'),
  alternates: {
    canonical: '/',
    languages: {
      'sk-SK': 'https://inteligencia24.sk',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'sk_SK',
    url: 'https://inteligencia24.sk',
    siteName: 'inteligencia24',
    title: 'inteligencia24.sk - Správy zo sveta umelej inteligencie',
    description: 'Najnovšie správy o umelej inteligencii, jazykových modeloch a AI technológiách v slovenčine.',
    images: [{ url: '/logo.png', width: 1200, height: 630 }],
    countryName: 'Slovakia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'inteligencia24.sk - Správy zo sveta umelej inteligencie',
    description: 'Najnovšie správy o umelej inteligencii, jazykových modeloch a AI technológiách v slovenčine.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '1254x1254', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  other: {
    'geo.region': 'SK',
    'geo.placename': 'Slovensko',
    'content-language': 'sk',
    'distribution': 'Slovakia',
    'rating': 'general',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className={inter.className}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied',
            'wait_for_update': 500,
          });
          gtag('set', 'ads_data_redaction', true);
          gtag('set', 'url_passthrough', true);
        `}} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1548129646460327"
          crossOrigin="anonymous"
        />
        <link rel="sitemap" href="/sitemap.xml" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
        <meta name="geo.region" content="SK" />
        <meta name="geo.placename" content="Slovensko" />
        <link rel="alternate" hrefLang="sk" href="https://inteligencia24.sk" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsMediaOrganization',
              name: 'inteligencia24',
              url: 'https://inteligencia24.sk',
              logo: {
                '@type': 'ImageObject',
                url: 'https://inteligencia24.sk/logo.png',
              },
              sameAs: ['https://www.instagram.com/inteligencia24.sk/'],
              description: 'Slovenský spravodajský portál o umelej inteligencii, umelej inteligencii a moderných technológiách.',
              foundingDate: '2025',
              areaServed: {
                '@type': 'Country',
                name: 'Slovakia',
              },
              inLanguage: 'sk',
              publisher: {
                '@type': 'Organization',
                name: 'DRIXTON s.r.o.',
                email: 'studio@drixton.com',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <div id="page-wrapper">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <CopyProtection />
        <PageTracker />
        <Analytics />
        </div>
      </body>
    </html>
  );
}
