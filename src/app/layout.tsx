import type { Metadata } from 'next';
import SmoothScrollProvider from '@/components/property/SmoothScrollProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Prime Property | Modern Luxury Property Intelligence',
    template: '%s | Prime Property',
  },
  description: 'Prime Property - Cinematic real estate platform. Temukan ruko dan villa premium dengan data akurat dan visual terdepan.',
  keywords: 'properti, real estate, ruko, villa, Prime Property, Indonesia, properti mewah, investasi properti',
  authors: [{ name: 'Prime Property Group' }],
  metadataBase: new URL('https://prime-property.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Prime Property | Modern Luxury Property Intelligence',
    description: 'Cinematic real estate platform. Temukan ruko dan villa premium dengan data akurat dan visual terdepan.',
    url: 'https://prime-property.vercel.app',
    siteName: 'Prime Property',
    images: [
      {
        url: '/luxury-villa.png',
        width: 1200,
        height: 630,
        alt: 'Prime Property Luxury Portfolio',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prime Property | Modern Luxury Property Intelligence',
    description: 'Cinematic real estate platform. Temukan ruko dan villa premium dengan data akurat.',
    images: ['/luxury-villa.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
