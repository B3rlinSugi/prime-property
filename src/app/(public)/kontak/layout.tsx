import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description: 'Hubungi tim konsultan ahli Prime Property untuk berkonsultasi gratis mengenai investasi ruko atau hunian villa mewah impian Anda di Indonesia.',
};

export default function KontakLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
