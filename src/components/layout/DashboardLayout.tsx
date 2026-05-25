'use client';

import { SessionProvider } from 'next-auth/react';
import DashboardHeader from './DashboardHeader';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className={styles.layout}>
        <DashboardHeader />
        <main className={styles.content}>{children}</main>
      </div>
    </SessionProvider>
  );
}
