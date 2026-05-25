'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import styles from './Header.module.css';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    return pathname === path ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo} style={{ display: 'flex', alignItems: 'center' }}>
        <Logo height={38} light={true} />
      </Link>

      {/* Desktop Navigation */}
      <nav className={styles.nav}>
        <Link href="/" className={isActive('/')}>
          Beranda
        </Link>
        <Link href="/tentang-kami" className={isActive('/tentang-kami')}>
          Tentang Kami
        </Link>
        <Link href="/kontak" className={isActive('/kontak')}>
          Kontak
        </Link>
        <Link href="/agent/login" className={styles.loginBtn}>
          Login Agent
        </Link>
      </nav>

      {/* Mobile Hamburger Menu Icon */}
      <button 
        className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ''}`} 
        onClick={toggleMobileMenu} 
        aria-label="Toggle Navigation Menu"
        aria-expanded={mobileMenuOpen}
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {/* Mobile Navigation Drawer Overlay */}
      <div 
        className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.mobileOverlayOpen : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Mobile Navigation Drawer */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <nav className={styles.mobileNav}>
          <Link 
            href="/" 
            className={`${styles.mobileNavLink} ${pathname === '/' ? styles.mobileNavLinkActive : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            Beranda
          </Link>
          <Link 
            href="/tentang-kami" 
            className={`${styles.mobileNavLink} ${pathname === '/tentang-kami' ? styles.mobileNavLinkActive : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            Tentang Kami
          </Link>
          <Link 
            href="/kontak" 
            className={`${styles.mobileNavLink} ${pathname === '/kontak' ? styles.mobileNavLinkActive : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            Kontak
          </Link>
          <Link 
            href="/agent/login" 
            className={styles.mobileLoginBtn} 
            onClick={() => setMobileMenuOpen(false)}
          >
            Login Agent
          </Link>
        </nav>
      </div>
    </header>
  );
}
