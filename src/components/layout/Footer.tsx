import Link from 'next/link';
import Logo from './Logo';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Subtle blended background luxury villa image */}
      <div className={styles.footerVisualContainer}>
        <img 
          src="/luxury-villa.png" 
          alt="Luxury Villa Background" 
          className={styles.footerVisual} 
        />
      </div>

      <div className={styles.footerContent}>
        <div className={styles.footerGrid}>
          {/* Column 1: Brand & Socials */}
          <div className={styles.footerCol}>
            <Link href="/" className={styles.footerLogo} style={{ display: 'flex', alignItems: 'center' }}>
              <Logo height={44} light={true} noBackground={true} />
            </Link>
            <p className={styles.footerDescription}>
              Platform manajemen properti premium dengan standar profesional, transparan, dan terpercaya.
            </p>
            <div className={styles.socialWrapper}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className={styles.footerCol}>
            <h3 className={styles.footerTitle}>Navigasi</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/" className={styles.footerLink}>Beranda</Link>
              </li>
              <li>
                <Link href="/properti" className={styles.footerLink}>Properti</Link>
              </li>
              <li>
                <Link href="/simulasi-kpr" className={styles.footerLink}>Simulasi KPR</Link>
              </li>
              <li>
                <Link href="/tentang-kami" className={styles.footerLink}>Tentang Kami</Link>
              </li>
              <li>
                <Link href="/kontak" className={styles.footerLink}>Kontak</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className={styles.footerCol}>
            <h3 className={styles.footerTitle}>Layanan</h3>
            <ul className={styles.footerLinks}>
              <li>
                <Link href="/tentang-kami" className={styles.footerLink}>Manajemen Properti</Link>
              </li>
              <li>
                <Link href="/tentang-kami" className={styles.footerLink}>Konsultasi Investasi</Link>
              </li>
              <li>
                <Link href="/tentang-kami" className={styles.footerLink}>Pengelolaan Aset</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contacts */}
          <div className={styles.footerCol}>
            <h3 className={styles.footerTitle}>Kontak</h3>
            <ul className={styles.footerContactList}>
              <li className={styles.contactListItem}>
                <span className={styles.contactListIcon}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <a href="tel:+6281234567890" className={styles.contactListValue}>+62 812-3456-7890</a>
              </li>
              <li className={styles.contactListItem}>
                <span className={styles.contactListIcon}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <a href="mailto:info@primeproperty.id" className={styles.contactListValue}>info@primeproperty.id</a>
              </li>
              <li className={styles.contactListItem}>
                <span className={styles.contactListIcon}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className={styles.contactListValue}>Jl. Krakatau No.123, Medan, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className={styles.footerBottom}>
        <div className={styles.bottomFlex}>
          <p className={styles.footerCopyright}>
            &copy; 2026 Prime Property. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            <Link href="/tentang-kami" className={styles.bottomLink}>Privasi</Link>
            <span className={styles.bottomLinkDivider}>•</span>
            <Link href="/tentang-kami" className={styles.bottomLink}>Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
