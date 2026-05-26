'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './DashboardTopBar.module.css';

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

export default function DashboardTopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: '📩',
      text: 'Pesan Kontak Baru masuk dari Berlin Sugiyanto',
      time: 'Baru saja',
      unread: true,
    },
    {
      id: 2,
      icon: '🏢',
      text: 'Properti "Amplas Trade Center" berhasil ditambahkan',
      time: '1 jam yang lalu',
      unread: true,
    },
    {
      id: 3,
      icon: '🔑',
      text: 'Password Akun direset oleh Superadmin',
      time: '4 jam yang lalu',
      unread: false,
    },
    {
      id: 4,
      icon: '✨',
      text: 'Sistem Prime Property v1.1 aktif dan berjalan lancar',
      time: 'Kemarin',
      unread: false,
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotifClick = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  // Sync state with URL parameter (for external resets/back button)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  // Sync search input typing to URL query parameter with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const currentParams = new URLSearchParams(window.location.search);
      const prevSearch = currentParams.get('search') || '';
      
      if (search.trim() !== prevSearch.trim()) {
        if (search.trim()) {
          currentParams.set('search', search.trim());
        } else {
          currentParams.delete('search');
        }
        currentParams.set('page', '1');
        
        // Push to properties page if not already there, else just update query
        if (window.location.pathname.startsWith('/agent/dashboard') && !window.location.pathname.includes('/analytics') && !window.location.pathname.includes('/settings') && !window.location.pathname.includes('/users') && !window.location.pathname.includes('/audit-log')) {
          router.push(`/agent/dashboard?${currentParams.toString()}`);
        } else {
          router.push(`/agent/dashboard?${currentParams.toString()}`);
        }
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, router]);

  // Keyboard shortcut listener (CMD+K or Ctrl+K to focus search)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const user = session?.user;

  async function handleLogout() {
    await signOut({ callbackUrl: '/agent/login' });
  }

  return (
    <div className={styles.topBar}>
      {/* Search Input Box */}
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          ref={searchInputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Cari properti, group, kawasan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className={styles.searchShortcut}>⌘K</span>
      </div>

      {/* Right Controls: Notifications & User profile */}
      <div className={styles.controlsWrapper}>
        {/* Notification Bell with Dropdown Container */}
        <div className={styles.notifWrapper} ref={notifDropdownRef}>
          <button 
            className={styles.notificationBtn} 
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setDropdownOpen(false);
            }}
            aria-label="Notifikasi"
            aria-expanded={notifDropdownOpen}
          >
            {/* Professional thin Gold Line SVG Icon */}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#C9A961" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className={styles.notificationDot}></span>}
          </button>

          {/* Interactive Notifications List Dropdown */}
          {notifDropdownOpen && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Notifikasi Terbaru</span>
                {unreadCount > 0 && (
                  <button className={styles.notifClearBtn} onClick={handleMarkAllRead}>
                    Tandai dibaca
                  </button>
                )}
              </div>
              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div className={styles.notifEmpty}>
                    <span>📭</span>
                    <span>Tidak ada notifikasi baru</span>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`${styles.notifItem} ${notif.unread ? styles.notifItemUnread : ''}`}
                      onClick={() => handleNotifClick(notif.id)}
                    >
                      <span className={styles.notifIcon}>{notif.icon}</span>
                      <div className={styles.notifContent}>
                        <span className={styles.notifText}>{notif.text}</span>
                        <span className={styles.notifTime}>{notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <div className={styles.userMenu} ref={dropdownRef}>
          <button
            className={styles.userButton}
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifDropdownOpen(false);
            }}
            aria-expanded={dropdownOpen}
          >
            {/* Avatar Photo Mockup */}
            <div className={styles.userAvatar}>
              {user ? getInitials(user.name) : '?'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {user?.name ?? 'Superadmin'}
                <svg className={styles.chevron} viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
              <span className={styles.userRole}>
                {user ? getRoleLabel(user.role) : 'Superadmin'}
              </span>
            </div>
          </button>

          {/* User Account Dropdown Options */}
          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownName}>{user?.name ?? 'Superadmin'}</div>
                <div className={styles.dropdownEmail}>{user?.email ?? 'super@primeproperty.id'}</div>
                <span className={styles.dropdownBadge}>
                  {user ? getRoleLabel(user.role) : 'Superadmin'}
                </span>
              </div>
              <button className={styles.dropdownItem} onClick={() => router.push('/agent/dashboard/settings')}>
                ⚙️ Pengaturan Akun
              </button>
              <div className={styles.dropdownDivider}></div>
              <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={handleLogout}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
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
    </div>
  );
}
