import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GlassRevealIntro from '@/components/ui/GlassRevealIntro';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlassRevealIntro />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
