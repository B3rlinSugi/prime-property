import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prime Property - Premium Real Estate',
  description: 'Prime Property - Platform properti premium. Temukan ruko dan villa terbaik untuk investasi Anda.',
  keywords: 'properti, real estate, ruko, villa, Prime Property, Indonesia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
