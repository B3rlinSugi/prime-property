'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatRupiah, formatTanggalWaktu } from '@/lib/utils';
import styles from './page.module.css';

interface StatSummary {
  totalProperties: number;
  inStock: number;
  soldOut: number;
  totalPortfolioValue: string;
}

interface KawasanStat {
  name: string;
  count: number;
}

interface PriceBrackets {
  under1B: number;
  between1BAnd2B: number;
  between2BAnd3B: number;
  between3BAnd5B: number;
  over5B: number;
}

interface Distributions {
  tipe: Record<string, number>;
  kawasan: KawasanStat[];
  siap: Record<string, number>;
  priceBrackets: PriceBrackets;
}

interface UserSummary {
  name: string;
  email: string;
  role: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  changes: string | null;
  createdAt: string;
  userId: string;
  user: UserSummary;
}

interface AnalyticsData {
  summary: StatSummary;
  distributions: Distributions;
  recentActivities: AuditLogEntry[];
}

export default function AnalyticsDashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authenticate check
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/agent/login');
    }
  }, [authStatus, router]);

  // Fetch analytics data
  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    async function fetchAnalytics() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData.message || 'Gagal mengambil data analitik.');
        }
      } catch (err: any) {
        console.error('Fetch analytics error:', err);
        setError('Koneksi gagal. Silakan coba beberapa saat lagi.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [authStatus]);

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Menghitung dan memuat data analitik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorTitle}>Terjadi Kesalahan</div>
        <div className={styles.errorText}>{error}</div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, distributions, recentActivities } = data;

  // Donut chart calculations
  const rukoCount = distributions.tipe.RUKO || 0;
  const villaCount = distributions.tipe.VILLA || 0;
  const totalTipe = rukoCount + villaCount || 1;
  const rukoPercent = Math.round((rukoCount / totalTipe) * 100);
  const villaPercent = Math.round((villaCount / totalTipe) * 100);

  // Donut coordinates: r = 50, C = 2 * pi * r = 314.16
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const rukoDash = (rukoCount / totalTipe) * circumference;
  const villaDash = (villaCount / totalTipe) * circumference;

  // Max kawasan count for proportion bar
  const maxKawasanCount = Math.max(...distributions.kawasan.map((k) => k.count), 1);

  // Kesiapan labels in Indonesian
  const getSiapDisplayLabel = (key: string): string => {
    switch (key) {
      case 'SIAP_HUNI':
        return 'Siap Huni';
      case 'SIAP_KOSONG':
        return 'Siap Kosong';
      case 'SIAP_HUNI_RENOVASI':
        return 'Siap Huni Renovasi';
      default:
        return key;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Intelligence Dashboard</h1>
          <p>Portfolio pasar real-estate, penyebaran kawasan, and rekam jejak operasi.</p>
        </div>
        <div className={styles.timeRange}>
          🟢 Real-time Update
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Properti</span>
            <span className={styles.statIcon}>🏢</span>
          </div>
          <div className={styles.statValue}>{summary.totalProperties}</div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>+12.4%</span>
            <span className={styles.statSubtext}>dari bulan lalu</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Properti Tersedia</span>
            <span className={styles.statIcon}>🏷️</span>
          </div>
          <div className={styles.statValue}>{summary.inStock}</div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>+8.2%</span>
            <span className={styles.statSubtext}>unit baru terdaftar</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Properti Terjual</span>
            <span className={styles.statIcon}>🤝</span>
          </div>
          <div className={styles.statValue}>{summary.soldOut}</div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>+15.7%</span>
            <span className={styles.statSubtext}>tingkat penutupan tinggi</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Nilai Portfolio</span>
            <span className={styles.statIcon}>💰</span>
          </div>
          <div className={styles.statValue}>
            {formatRupiah(BigInt(summary.totalPortfolioValue))}
          </div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>+4.8%</span>
            <span className={styles.statSubtext}>akumulasi nilai aset</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Top Section */}
      <div className={styles.chartGrid}>
        {/* Kawasan Distribution */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Penyebaran Wilayah</h2>
            <p className={styles.cardSubtitle}>Distribusi unit properti berdasarkan kawasan strategis terpopuler.</p>
          </div>
          <div className={styles.horizontalBarList}>
            {distributions.kawasan.length === 0 ? (
              <p style={{ color: 'var(--color-text-light)', fontSize: '13px' }}>Belum ada data kawasan.</p>
            ) : (
              distributions.kawasan.map((k) => (
                <div className={styles.barRow} key={k.name}>
                  <div className={styles.barLabelRow}>
                    <span className={styles.barLabel}>{k.name}</span>
                    <span className={styles.barCount}>{k.count} Unit</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${(k.count / maxKawasanCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tipe Distribution (Donut Chart) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Komposisi Properti</h2>
            <p className={styles.cardSubtitle}>Perbandingan jenis aset Ruko dan Villa.</p>
          </div>
          <div className={styles.donutWrapper}>
            <div className={styles.donutSvgContainer}>
              <svg width="100%" height="100%" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth="12"
                />
                
                {/* Ruko segment */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="var(--color-accent-gold)"
                  strokeWidth="12"
                  strokeDasharray={`${rukoDash} ${circumference}`}
                  transform="rotate(-90 60 60)"
                />

                {/* Villa segment */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#5F4B23"
                  strokeWidth="12"
                  strokeDasharray={`${villaDash} ${circumference}`}
                  strokeDashoffset={-rukoDash}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className={styles.donutLabelCenter}>
                <div className={styles.donutValue}>{summary.totalProperties}</div>
                <div className={styles.donutLabel}>Total Aset</div>
              </div>
            </div>

            <div className={styles.legendList}>
              <div className={styles.legendItem}>
                <div className={styles.legendIndicator} style={{ background: 'var(--color-accent-gold)' }}></div>
                <div className={styles.legendInfo}>
                  <span className={styles.legendLabel}>Ruko ({rukoPercent}%)</span>
                  <span className={styles.legendValue}>{rukoCount} Unit Terdaftar</span>
                </div>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendIndicator} style={{ background: '#5F4B23' }}></div>
                <div className={styles.legendInfo}>
                  <span className={styles.legendLabel}>Villa ({villaPercent}%)</span>
                  <span className={styles.legendValue}>{villaCount} Unit Terdaftar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Bottom Section */}
      <div className={styles.bottomGrid}>
        {/* Price Distribution Histogram */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Distribusi Tier Harga</h2>
            <p className={styles.cardSubtitle}>Klasifikasi properti berdasarkan rentang nilai aset rupiah.</p>
          </div>
          
          <div className={styles.histogramContainer}>
            <div className={styles.histogramColumn}>
              <div className={styles.histogramTooltip}>{distributions.priceBrackets.under1B} Unit</div>
              <div
                className={styles.histogramBar}
                style={{ height: `${(distributions.priceBrackets.under1B / Math.max(summary.totalProperties, 1)) * 100}%` }}
              ></div>
            </div>
            <div className={styles.histogramColumn}>
              <div className={styles.histogramTooltip}>{distributions.priceBrackets.between1BAnd2B} Unit</div>
              <div
                className={styles.histogramBar}
                style={{ height: `${(distributions.priceBrackets.between1BAnd2B / Math.max(summary.totalProperties, 1)) * 100}%` }}
              ></div>
            </div>
            <div className={styles.histogramColumn}>
              <div className={styles.histogramTooltip}>{distributions.priceBrackets.between2BAnd3B} Unit</div>
              <div
                className={styles.histogramBar}
                style={{ height: `${(distributions.priceBrackets.between2BAnd3B / Math.max(summary.totalProperties, 1)) * 100}%` }}
              ></div>
            </div>
            <div className={styles.histogramColumn}>
              <div className={styles.histogramTooltip}>{distributions.priceBrackets.between3BAnd5B} Unit</div>
              <div
                className={styles.histogramBar}
                style={{ height: `${(distributions.priceBrackets.between3BAnd5B / Math.max(summary.totalProperties, 1)) * 100}%` }}
              ></div>
            </div>
            <div className={styles.histogramColumn}>
              <div className={styles.histogramTooltip}>{distributions.priceBrackets.over5B} Unit</div>
              <div
                className={styles.histogramBar}
                style={{ height: `${(distributions.priceBrackets.over5B / Math.max(summary.totalProperties, 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className={styles.histogramLabels}>
            <div className={styles.histogramLabel} title="Di bawah 1 Miliar">&lt; 1 M</div>
            <div className={styles.histogramLabel} title="1 - 2 Miliar">1B - 2B</div>
            <div className={styles.histogramLabel} title="2 - 3 Miliar">2B - 3B</div>
            <div className={styles.histogramLabel} title="3 - 5 Miliar">3B - 5B</div>
            <div className={styles.histogramLabel} title="Di atas 5 Miliar">&gt; 5 M</div>
          </div>
        </div>

        {/* Recent Audit Log Activity */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Aktivitas Operasi Terkini</h2>
            <p className={styles.cardSubtitle}>Jejak audit waktu-nyata dari modifikasi database properti.</p>
          </div>

          <div className={styles.activityList}>
            {recentActivities.length === 0 ? (
              <p style={{ color: 'var(--color-text-light)', fontSize: '13px' }}>Belum ada aktivitas terekam.</p>
            ) : (
              recentActivities.map((log) => {
                const initials = log.user ? log.user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'PP';
                return (
                  <div className={styles.activityItem} key={log.id}>
                    <div className={styles.activityAvatar}>
                      {initials}
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityUser}>{log.user?.name ?? 'Sistem'}</div>
                      <div className={styles.activityAction}>
                        {log.action === 'CREATE' && `Membuat properti baru`}
                        {log.action === 'UPDATE' && `Memperbarui rincian properti`}
                        {log.action === 'DELETE' && `Menghapus/mengarsipkan properti`}
                        {log.action === 'RESTORE' && `Memulihkan properti dari arsip`}
                        {log.action === 'CHANGE_PASSWORD' && `Mengubah kata sandi akun`}
                        {log.action === 'LOGIN_SUCCESS' && `Berhasil masuk ke dalam sistem`}
                        {log.action === 'LOGIN_FAILED' && `Gagal masuk ke sistem (percobaan gagal)`}
                        {log.action !== 'CREATE' && log.action !== 'UPDATE' && log.action !== 'DELETE' && log.action !== 'RESTORE' && log.action !== 'CHANGE_PASSWORD' && log.action !== 'LOGIN_SUCCESS' && log.action !== 'LOGIN_FAILED' && `${log.action} pada ${log.entity}`}
                      </div>
                      <div className={styles.activityMeta}>
                        <span className={styles.activityTime}>
                          {formatTanggalWaktu(log.createdAt)}
                        </span>
                        <span className={`${styles.entityTag} ${styles['tag' + log.action] || ''}`}>
                          {log.action}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
