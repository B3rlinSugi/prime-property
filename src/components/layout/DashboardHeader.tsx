'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from './Logo';
import styles from './DashboardHeader.module.css';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'SUPERADMIN':
      return 'Superadmin';
    case 'ADMIN':
      return 'Admin';
    default:
      return role;
  }
}

function renderIcon(iconName: string) {
  switch (iconName) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case 'properti':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'analytics':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'admin':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'audit':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      );
    case 'arsip':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'pengaturan':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'pesan':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DashboardHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(e.target as Node)
      ) {
        setMobileNavOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const user = session?.user;
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const navLinks = [
    { href: '/agent/dashboard/analytics?tab=kinerja', label: 'Dashboard', iconName: 'dashboard', visible: true },
    { href: '/agent/dashboard', label: 'Properti', iconName: 'properti', visible: true },
    { href: '/agent/dashboard/analytics?tab=eksekutif', label: 'Analytics', iconName: 'analytics', visible: true },
    { href: '/agent/dashboard/messages', label: 'Pesan Masuk', iconName: 'pesan', visible: true },
    { href: '/agent/dashboard/users', label: 'Admin', iconName: 'admin', visible: isSuperAdmin },
    { href: '/agent/dashboard/audit-log', label: 'Audit Log', iconName: 'audit', visible: isSuperAdmin },
    { href: '/agent/dashboard?archived=true', label: 'Arsip', iconName: 'arsip', visible: isSuperAdmin },
    { href: '/agent/dashboard/settings', label: 'Pengaturan', iconName: 'pengaturan', visible: true },
  ];

  function isActive(href: string): boolean {
    try {
      const url = new URL(href, 'http://localhost');
      const targetPath = url.pathname;
      
      if (pathname !== targetPath) {
        return false;
      }
      
      if (href.includes('archived=true')) {
        return searchParams.get('archived') === 'true';
      }
      if (targetPath === '/agent/dashboard' && !href.includes('archived=true')) {
        return searchParams.get('archived') !== 'true';
      }
      if (href.includes('tab=kinerja')) {
        return searchParams.get('tab') === 'kinerja' || !searchParams.get('tab');
      }
      if (href.includes('tab=eksekutif')) {
        return searchParams.get('tab') === 'eksekutif';
      }
      
      return true;
    } catch (e) {
      return pathname.startsWith(href);
    }
  }

  async function handleLogout() {
    await signOut({ callbackUrl: '/agent/login' });
  }

  return (
    <>
      <header className={styles.header}>
        {/* Mobile menu button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Menu navigasi"
          aria-expanded={mobileNavOpen}
        >
          {mobileNavOpen ? (
            <svg
              className={styles.mobileMenuIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              className={styles.mobileMenuIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        {/* Sidebar Header Container: Logo + Collapse/Close button */}
        <div className={styles.sidebarHeader}>
          <Link href="/agent/dashboard" className={styles.logo} style={{ display: 'flex', alignItems: 'center' }}>
            <Logo height={34} light={true} />
          </Link>
          <button className={styles.sidebarCollapseBtn} aria-label="Collapse Sidebar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Desktop navigation */}
        <nav className={styles.nav}>
          {navLinks
            .filter((link) => link.visible)
            .map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ''}`}
              >
                {renderIcon(link.iconName)}
                {link.label}
              </Link>
            ))}
        </nav>

        {/* Desktop Logout Button at the bottom of sidebar */}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Keluar
        </button>

        {/* User profile menu for mobile drawer / fallback */}
        <div className={styles.rightSection}>
          <div className={styles.userMenu} ref={dropdownRef}>
            <button
              className={styles.userButton}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className={styles.userAvatar}>
                {user ? getInitials(user.name) : '?'}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name ?? '—'}</span>
                <span className={styles.roleBadge}>
                  {user ? getRoleLabel(user.role) : ''}
                </span>
              </div>
              <svg
                className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownUserInfo}>
                  <div className={styles.dropdownUserName}>
                    {user?.name ?? '—'}
                  </div>
                  <div className={styles.dropdownUserEmail}>
                    {user?.email ?? '—'}
                  </div>
                  <span className={styles.dropdownUserRole}>
                    {user ? getRoleLabel(user.role) : ''}
                  </span>
                </div>

                <button
                  className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                  onClick={handleLogout}
                >
                  <svg
                    className={styles.dropdownItemIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile navigation overlay */}
      <div
        className={`${styles.mobileOverlay} ${mobileNavOpen ? styles.mobileOverlayOpen : ''}`}
        onClick={() => setMobileNavOpen(false)}
      ></div>

      {/* Mobile navigation drawer */}
      <div
        ref={mobileNavRef}
        className={`${styles.mobileNav} ${mobileNavOpen ? styles.mobileNavOpen : ''}`}
      >
        {navLinks
          .filter((link) => link.visible)
          .map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`${styles.mobileNavLink} ${isActive(link.href) ? styles.mobileNavLinkActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
        <button
          className={`${styles.mobileNavLink} ${styles.mobileLogoutBtn}`}
          onClick={handleLogout}
          style={{ color: 'var(--color-accent-red)', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          Keluar
        </button>
      </div>
    </>
  );
}
