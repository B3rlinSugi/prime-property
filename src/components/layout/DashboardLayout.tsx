'use client';

import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import DashboardHeader from './DashboardHeader';
import DashboardTopBar from './DashboardTopBar';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className={styles.layout}>
        <Suspense fallback={<div className="header-loading">Loading navigation...</div>}>
          <DashboardHeader />
        </Suspense>
        <div className={styles.mainArea}>
          <Suspense fallback={<div className="topbar-loading">Loading header...</div>}>
            <DashboardTopBar />
          </Suspense>
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
