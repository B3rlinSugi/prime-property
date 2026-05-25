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

export default function DashboardHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

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
  const searchParams = useSearchParams();

  const navLinks = [
    { href: '#', label: 'Dashboard', icon: '📊', visible: true, dummy: true },
    { href: '/agent/dashboard', label: 'Properti', icon: '🏢', visible: true, dummy: false },
    { href: '#', label: 'Analytics', icon: '📈', visible: true, dummy: true },
    { href: '/agent/dashboard/users', label: 'Admin', icon: '👤', visible: isSuperAdmin, dummy: false },
    { href: '/agent/dashboard/audit-log', label: 'Audit Log', icon: '📝', visible: isSuperAdmin, dummy: false },
    { href: '/agent/dashboard?archived=true', label: 'Arsip', icon: '📁', visible: isSuperAdmin, dummy: false },
    { href: '#', label: 'Pengaturan', icon: '⚙️', visible: true, dummy: true },
  ];

  function isActive(href: string): boolean {
    if (href.includes('archived=true')) {
      return pathname === '/agent/dashboard' && searchParams.get('archived') === 'true';
    }
    if (href === '/agent/dashboard') {
      return pathname === '/agent/dashboard' && searchParams.get('archived') !== 'true';
    }
    return pathname.startsWith(href);
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

        {/* Logo */}
        <Link href="/agent/dashboard" className={styles.logo} style={{ display: 'flex', alignItems: 'center' }}>
          <Logo height={32} light={true} />
        </Link>

        {/* Desktop navigation */}
        <nav className={styles.nav}>
          {navLinks
            .filter((link) => link.visible)
            .map((link) => {
              if (link.dummy) {
                return (
                  <button
                    key={link.label}
                    className={styles.navLink}
                    onClick={() => alert(`${link.label} is part of the Prime Property OS Enterprise Suite.`)}
                  >
                    <span style={{ marginRight: '10px' }}>{link.icon}</span>
                    {link.label}
                  </button>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ''}`}
                >
                  <span style={{ marginRight: '10px' }}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
        </nav>

        {/* Right section — user menu */}
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
        ref={mobileNavRef}
        className={`${styles.mobileNav} ${mobileNavOpen ? styles.mobileNavOpen : ''}`}
      >
        {navLinks
          .filter((link) => link.visible)
          .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileNavLink} ${isActive(link.href) ? styles.mobileNavLinkActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
      </div>
    </>
  );
}
