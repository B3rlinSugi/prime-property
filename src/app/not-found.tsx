import Link from 'next/link';
import Logo from '@/components/layout/Logo';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      {/* Grid background visual */}
      <div className={styles.gridMesh}></div>

      <div className={styles.content}>
        {/* Brand logo */}
        <div className={styles.logoWrapper}>
          <Logo height={40} light={true} />
        </div>

        {/* Cinematic 404 text */}
        <div className={styles.errorCode}>404</div>

        {/* Headings */}
        <h1 className={styles.title}>Halaman Tidak Ditemukan</h1>
        <p className={styles.description}>
          Sesi navigasi Anda terputus atau alamat tautan yang Anda tuju telah dipindahkan ke direktori arsip internal Prime Property OS.
        </p>

        {/* CTA Shimmer Link */}
        <Link href="/" className={`${styles.ctaButton} gold-shimmer`}>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
