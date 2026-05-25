import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description: 'Mengenal lebih dekat visi, misi, nilai perusahaan, dan komitmen Prime Property dalam menyediakan pilihan properti ruko dan villa premium terpercaya di Indonesia.',
};

export default function TentangKamiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
