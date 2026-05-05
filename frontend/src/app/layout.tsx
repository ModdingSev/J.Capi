import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MainTopBar from '@/components/layout/MainTopBar';
import CatalogTopBar from '@/components/layout/CatalogTopBar';
import Footer from '@/components/layout/Footer';
import { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jcapi.es';
const SITE_NAME = 'J. Capi';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Tienda de Electrodomésticos`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'J. Capi — Tu tienda de electrodomésticos de confianza. Frigoríficos, lavadoras, lavavajillas, hornos y más. Servicio técnico propio y envío rápido.',
  keywords: ['electrodomésticos', 'lavadoras', 'frigoríficos', 'lavavajillas', 'hornos', 'J. Capi'],
  authors: [{ name: 'J. Capi', url: SITE_URL }],
  creator: 'J. Capi',
  publisher: 'J. Capi',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Tienda de Electrodomésticos`,
    description:
      'Tu tienda de electrodomésticos de confianza. Frigoríficos, lavadoras, lavavajillas y más.',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'J. Capi Electrodomésticos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Tienda de Electrodomésticos`,
    description: 'Tu tienda de electrodomésticos de confianza.',
    images: ['/images/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-background min-h-screen flex flex-col">
        {/* JSON-LD Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'J. Capi',
              url: SITE_URL,
              logo: `${SITE_URL}/images/logo.svg`,
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+34-900-000-000',
                contactType: 'customer service',
                areaServed: 'ES',
                availableLanguage: 'Spanish',
              },
              sameAs: ['https://www.facebook.com/jcapi', 'https://www.instagram.com/jcapi'],
            }),
          }}
        />

        {/* ── Header principal (siempre visible, SIN buscador) ── */}
        <MainTopBar />

        {/* ── Segundo top bar (SOLO catálogo, CON buscador) ── */}
        <Suspense fallback={null}>
          <CatalogTopBar />
        </Suspense>

        {/* ── Contenido ── */}
        <main className="flex-1">
          {children}
        </main>

        {/* ── Footer ── */}
        <Footer />
      </body>
    </html>
  );
}
