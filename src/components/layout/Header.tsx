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
        <Logo height={44} light={true} />
      </Link>

      {/* Desktop Navigation (Floating Center Capsule) */}
      <nav className={styles.nav}>
        <Link href="/" className={isActive('/')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Beranda
        </Link>
        
        <div className={styles.navDivider}></div>
        
        <Link href="/properti" className={isActive('/properti')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
            <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
            <path d="M9 22V12h6v10" />
            <path d="M8 7h2v2H8z" />
            <path d="M14 7h2v2h-2z" />
            <path d="M8 12h2v2H8z" />
            <path d="M14 12h2v2h-2z" />
          </svg>
          Properti
        </Link>
        
        <div className={styles.navDivider}></div>
        
        <Link href="/simulasi-kpr" className={isActive('/simulasi-kpr')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="16" y2="14" />
            <line x1="8" y1="18" x2="16" y2="18" />
            <line x1="12" y1="10" x2="12" y2="18" />
          </svg>
          Simulasi KPR
        </Link>
        
        <div className={styles.navDivider}></div>
        
        <Link href="/tentang-kami" className={isActive('/tentang-kami')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Tentang Kami
        </Link>
        
        <div className={styles.navDivider}></div>
        
        <Link href="/kontak" className={isActive('/kontak')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Kontak
        </Link>
      </nav>

      {/* Desktop Login Button */}
      <Link href="/agent/login" className={styles.loginBtn}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.loginIcon}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Login Agent
      </Link>

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
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`} data-lenis-prevent>
        <nav className={styles.mobileNav}>
          <Link 
            href="/" 
            className={`${styles.mobileNavLink} ${pathname === '/' ? styles.mobileNavLinkActive : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.mobileNavIcon}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Beranda
          </Link>
          <Link 
            href="/properti" 
            className={`${styles.mobileNavLink} ${pathname === '/properti' ? styles.mobileNavLinkActive : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.mobileNavIcon}>
              <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
              <path d="M9 22V12h6v10" />
              <path d="M8 7h2v2H8z" />
              <path d="M14 7h2v2h-2z" />
              <path d="M8 12h2v2H8z" />
              <path d="M14 12h2v2h-2z" />
            </svg>
            Properti
          </Link>
          <Link 
            href="/simulasi-kpr" 
            className={`${styles.mobileNavLink} ${pathname === '/simulasi-kpr' ? styles.mobileNavLinkActive : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.mobileNavIcon}>
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="16" y2="14" />
              <line x1="8" y1="18" x2="16" y2="18" />
              <line x1="12" y1="10" x2="12" y2="18" />
            </svg>
            Simulasi KPR
          </Link>
          <Link 
            href="/tentang-kami" 
            className={`${styles.mobileNavLink} ${pathname === '/tentang-kami' ? styles.mobileNavLinkActive : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.mobileNavIcon}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Tentang Kami
          </Link>
          <Link 
            href="/kontak" 
            className={`${styles.mobileNavLink} ${pathname === '/kontak' ? styles.mobileNavLinkActive : ''}`} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.mobileNavIcon}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Kontak
          </Link>
          <Link 
            href="/agent/login" 
            className={styles.mobileLoginBtn} 
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.mobileNavIcon} style={{ stroke: '#C9A961' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Login Agent
          </Link>
        </nav>
      </div>
    </header>
  );
}
