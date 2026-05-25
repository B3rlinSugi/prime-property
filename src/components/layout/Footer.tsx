import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerCol}>
          <Link href="/" className={styles.footerLogo}>
            <span className={styles.logoPrime}>PRIME</span>
            <span className={styles.logoDot}>.</span>
            <span className={styles.logoProperty}>PROPERTY</span>
          </Link>
          <p className={styles.footerDescription}>
            Prime Property menghadirkan pilihan ruko dan villa premium di lokasi strategis dengan nilai investasi optimal untuk masa depan Anda.
          </p>
        </div>

        <div className={styles.footerCol}>
          <h3 className={styles.footerTitle}>Tautan Cepat</h3>
          <ul className={styles.footerLinks}>
            <li>
              <Link href="/">Beranda</Link>
            </li>
            <li>
              <Link href="/tentang-kami">Tentang Kami</Link>
            </li>
            <li>
              <Link href="/kontak">Kontak</Link>
            </li>
          </ul>
        </div>

        <div className={styles.footerCol}>
          <h3 className={styles.footerTitle}>Hubungi Kami</h3>
          <ul className={styles.footerContact}>
            <li>
              <span className={styles.contactLabel}>Alamat:</span>
              <span className={styles.contactValue}>Jl. Gatot Subroto No. 123, Medan, Sumatera Utara 20112</span>
            </li>
            <li>
              <span className={styles.contactLabel}>Telepon:</span>
              <a href="tel:+6281234567890" className={styles.contactValue}>+62 812-3456-7890</a>
            </li>
            <li>
              <span className={styles.contactLabel}>Email:</span>
              <a href="mailto:info@primeproperty.id" className={styles.contactValue}>info@primeproperty.id</a>
            </li>
            <li className={styles.waItem}>
              <a 
                href="https://wa.me/6281234567890?text=Halo%20Prime%20Property,%20saya%20tertarik%20dengan%20properti%20Anda."
                target="_blank"
                rel="noopener noreferrer"
                className={styles.waLink}
              >
                Chat via WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p className={styles.copyright}>&copy; 2026 Prime Property. All rights reserved.</p>
      </div>
    </footer>
  );
}
