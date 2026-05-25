'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
      <Link href="/" className={styles.logo}>
        <span className={styles.logoPrime}>PRIME</span>
        <span className={styles.logoDot}>.</span>
        <span className={styles.logoProperty}>PROPERTY</span>
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
        className={styles.hamburger} 
        onClick={toggleMobileMenu} 
        aria-label="Toggle Navigation Menu"
        aria-expanded={mobileMenuOpen}
      >
        <span className={`${styles.bar} ${mobileMenuOpen ? styles.bar1 : ''}`}></span>
        <span className={`${styles.bar} ${mobileMenuOpen ? styles.bar2 : ''}`}></span>
        <span className={`${styles.bar} ${mobileMenuOpen ? styles.bar3 : ''}`}></span>
      </button>

      {/* Mobile Navigation Drawer */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <nav className={styles.mobileNav}>
          <Link href="/" className={isActive('/')} onClick={() => setMobileMenuOpen(false)}>
            Beranda
          </Link>
          <Link href="/tentang-kami" className={isActive('/tentang-kami')} onClick={() => setMobileMenuOpen(false)}>
            Tentang Kami
          </Link>
          <Link href="/kontak" className={isActive('/kontak')} onClick={() => setMobileMenuOpen(false)}>
            Kontak
          </Link>
          <Link href="/agent/login" className={styles.mobileLoginBtn} onClick={() => setMobileMenuOpen(false)}>
            Login Agent
          </Link>
        </nav>
      </div>
    </header>
  );
}
