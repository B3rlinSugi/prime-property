'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/lib/utils';
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

interface AnalyticsData {
  summary: StatSummary;
  distributions: Distributions;
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

  const { summary, distributions } = data;

  return (
    <div className={styles.container}>
      {/* ─── Premium Header Section (Mockup 2) ─── */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.dashboardTitle}>
            Hello, {session?.user?.name || 'Super Admin'} 👋
          </h1>
          <p className={styles.dashboardSubtitle}>
            Berikut insight penting untuk bisnis Anda hari ini.
          </p>
        </div>
        <div className={styles.timeRange}>
          <span className={styles.timeRangeDot}>●</span> Real-time Update
        </div>
      </div>

      {/* ─── Banner Metrics / Ringkasan Cepat Row (Quick Stats from Mockups) ─── */}
      <div className={styles.statsGrid}>
        {/* Stat 1: Total Portofolio (Kinerja Bulan Ini Sparkline style) */}
        <div className={`${styles.statCard} ${styles.portfolioCard}`}>
          <div className={styles.statIconCircle}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Total Portofolio</span>
            <div className={styles.statValue}>Rp 118.9 M</div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>▲ +14.8% <span className={styles.trendPeriod}>bln lalu</span></span>
            </div>
          </div>
          {/* Glowing Vector Sparkline Background */}
          <div className={styles.sparklineBg}>
            <svg viewBox="0 0 140 40" width="100%" height="100%" preserveAspectRatio="none">
              <path d="M 0,35 Q 20,30 40,32 T 80,18 T 120,8 L 140,5" fill="none" stroke="rgba(201, 169, 97, 0.25)" strokeWidth="2" />
              <path d="M 0,35 Q 20,30 40,32 T 80,18 T 120,8 L 140,5 L 140,40 L 0,40 Z" fill="rgba(201, 169, 97, 0.03)" />
            </svg>
          </div>
        </div>

        {/* Stat 2: Total Properti */}
        <div className={styles.statCard}>
          <div className={styles.statIconCircle}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Total Properti</span>
            <div className={styles.statValue}>{summary.totalProperties || 54}</div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>▲ +12.4%</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Unit Terjual */}
        <div className={styles.statCard}>
          <div className={styles.statIconCircle}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Unit Terjual</span>
            <div className={styles.statValue}>{summary.soldOut || 9}</div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>▲ +15.7%</span>
            </div>
          </div>
        </div>

        {/* Stat 4: Leads Baru */}
        <div className={styles.statCard}>
          <div className={styles.statIconCircle}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Leads Baru</span>
            <div className={styles.statValue}>23</div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>▲ +10.1%</span>
            </div>
          </div>
        </div>

        {/* Stat 5: Transaksi Berjalan */}
        <div className={styles.statCard}>
          <div className={styles.statIconCircle}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Transaksi Berjalan</span>
            <div className={styles.statValue}>7</div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>▲ +6.7%</span>
            </div>
          </div>
        </div>

        {/* Stat 6: Properti Tersedia */}
        <div className={styles.statCard}>
          <div className={styles.statIconCircle}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Properti Tersedia</span>
            <div className={styles.statValue}>{summary.inStock || 45}</div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>▲ +8.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 1: AI Insight + Sales Performa + Region Map (Mockup 2 layout) ─── */}
      <div className={styles.bentoGrid3Col}>
        {/* Column 1: AI Insight */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>AI Insight</h2>
            <p className={styles.cardSubtitle}>Analisis performa bisnis otomatis hari ini.</p>
          </div>
          
          <div className={styles.aiInsightsList}>
            {/* Insight 1 */}
            <div className={styles.insightItem}>
              <div className={`${styles.insightIconWrapper} ${styles.greenTheme}`}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <div className={styles.insightText}>
                <strong>Penjualan naik 15.7%</strong> dibanding bulan lalu. Pertahankan momentum ini!
              </div>
            </div>

            {/* Insight 2 */}
            <div className={styles.insightItem}>
              <div className={`${styles.insightIconWrapper} ${styles.goldTheme}`}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div className={styles.insightText}>
                <strong>Area Krakatau</strong> menunjukkan performa terbaik dengan 7 unit terjual.
              </div>
            </div>

            {/* Insight 3 */}
            <div className={styles.insightItem}>
              <div className={`${styles.insightIconWrapper} ${styles.blueTheme}`}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                  <polyline points="17 18 23 18 23 12"/>
                </svg>
              </div>
              <div className={styles.insightText}>
                <strong>Leads turun 3.4%</strong> dibanding minggu lalu. Perlu optimasi saluran iklan.
              </div>
            </div>

            {/* Insight 4 */}
            <div className={styles.insightItem}>
              <div className={`${styles.insightIconWrapper} ${styles.purpleTheme}`}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className={styles.insightText}>
                <strong>Tingkat konversi leads 39%</strong> dari total leads bulan ini. Masih bisa ditingkatkan.
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Performa Penjualan Spline & Column bar */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.legendHeaderRow}>
              <div>
                <h2 className={styles.cardTitle}>Performa Penjualan</h2>
                <p className={styles.cardSubtitle}>Unit & Nilai dalam Miliar (6 Bln Terakhir)</p>
              </div>
              <div className={styles.chartLegend}>
                <div className={styles.legendIndicatorItem}>
                  <span className={styles.legendBoxGray}></span>
                  <span className={styles.legendText}>Unit Terjual</span>
                </div>
                <div className={styles.legendIndicatorItem}>
                  <span className={styles.legendBoxGold}></span>
                  <span className={styles.legendText}>Nilai (M)</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.vectorChartWrapper}>
            <svg viewBox="0 0 400 200" className={styles.vectorChartSvg}>
              {/* Dashed Grid Lines */}
              <line x1="30" y1="20" x2="370" y2="20" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
              <line x1="30" y1="55" x2="370" y2="55" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
              <line x1="30" y1="90" x2="370" y2="90" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
              <line x1="30" y1="125" x2="370" y2="125" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
              <line x1="30" y1="160" x2="370" y2="160" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1"/>

              {/* Y Axis Values Left */}
              <text x="18" y="24" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">20</text>
              <text x="18" y="59" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">15</text>
              <text x="18" y="94" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">10</text>
              <text x="18" y="129" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">5</text>
              <text x="18" y="164" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">0</text>

              {/* Y Axis Values Right */}
              <text x="382" y="24" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">120M</text>
              <text x="382" y="59" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">90M</text>
              <text x="382" y="94" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">60M</text>
              <text x="382" y="129" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">30M</text>
              <text x="382" y="164" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">0M</text>

              {/* Bar Columns (Unit Terjual) */}
              <rect x="52" y="118" width="16" height="42" rx="3" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              <rect x="122" y="62" width="16" height="98" rx="3" fill="rgba(201, 169, 97, 0.15)" stroke="rgba(201, 169, 97, 0.2)" strokeWidth="1"/>
              <rect x="192" y="104" width="16" height="56" rx="3" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              <rect x="262" y="69" width="16" height="91" rx="3" fill="rgba(201, 169, 97, 0.15)" stroke="rgba(201, 169, 97, 0.2)" strokeWidth="1"/>
              <rect x="332" y="76" width="16" height="84" rx="3" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>

              {/* Gold Spline Path */}
              <path d="M 60,128 C 95,120 95,85 130,85 C 165,85 165,115 200,115 C 235,115 235,50 270,50 C 305,50 305,92 340,92" fill="none" stroke="#C9A961" strokeWidth="2.8" strokeLinecap="round" />

              {/* Spline Markers */}
              <circle cx="60" cy="128" r="3.5" fill="#C9A961" stroke="#121212" strokeWidth="1.5" />
              <circle cx="130" cy="85" r="3.5" fill="#C9A961" stroke="#121212" strokeWidth="1.5" />
              <circle cx="200" cy="115" r="3.5" fill="#C9A961" stroke="#121212" strokeWidth="1.5" />
              <circle cx="270" cy="50" r="3.5" fill="#C9A961" stroke="#121212" strokeWidth="1.5" />
              <circle cx="340" cy="92" r="3.5" fill="#C9A961" stroke="#121212" strokeWidth="1.5" />

              {/* X Axis Labels */}
              <text x="60" y="182" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Des</text>
              <text x="130" y="182" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Jan</text>
              <text x="200" y="182" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Feb</text>
              <text x="270" y="182" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Apr</text>
              <text x="340" y="182" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Mei</text>
            </svg>
          </div>
        </div>

        {/* Column 3: Performa Area Medan Vector Map */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Performa Area</h2>
            <p className={styles.cardSubtitle}>Berdasarkan unit properti terjual.</p>
          </div>

          <div className={styles.mapVisualWrapper}>
            <svg viewBox="0 0 320 200" className={styles.vectorMapSvg}>
              {/* stylized neon polygon outlines matching mockup */}
              <polygon points="50,20 120,15 140,65 70,70" fill="rgba(201, 169, 97, 0.05)" stroke="rgba(201, 169, 97, 0.2)" strokeWidth="1" />
              <polygon points="120,15 220,10 240,60 140,65" fill="rgba(201, 169, 97, 0.12)" stroke="rgba(201, 169, 97, 0.4)" strokeWidth="1.5" />
              <polygon points="220,10 290,25 300,75 240,60" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
              
              <polygon points="30,70 90,85 70,150 10,130" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
              <polygon points="90,85 180,75 160,170 70,150" fill="rgba(201, 169, 97, 0.28)" stroke="#C9A961" strokeWidth="1.8" />
              <polygon points="180,75 280,65 260,150 160,170" fill="rgba(201, 169, 97, 0.07)" stroke="rgba(201, 169, 97, 0.25)" strokeWidth="1" />

              {/* Gold glowing hotspots */}
              <circle cx="150" cy="115" r="8" fill="rgba(201, 169, 97, 0.4)" />
              <circle cx="150" cy="115" r="3" fill="#C9A961" />
              
              <circle cx="170" cy="40" r="10" fill="rgba(201, 169, 97, 0.25)" />
              <circle cx="170" cy="40" r="4.5" fill="#C9A961" />

              {/* Map Legend Overlay */}
              <g transform="translate(260, 90)">
                <text x="24" y="10" fill="rgba(255,255,255,0.4)" fontSize="7">Tinggi</text>
                <defs>
                  <linearGradient id="legendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A961" />
                    <stop offset="100%" stopColor="rgba(201,169,97,0.1)" />
                  </linearGradient>
                </defs>
                <rect x="12" y="12" width="6" height="50" fill="url(#legendGrad)" rx="1"/>
                <text x="24" y="62" fill="rgba(255,255,255,0.4)" fontSize="7">Rendah</text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* ─── Row 2: Target Bulanan + Sumber Leads + Top Area (Mockup 1 layout) ─── */}
      <div className={styles.bentoGrid3Col}>
        {/* Column 1: Target Bulanan Semi-Circular Gauge */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Target Bulanan</h2>
            <p className={styles.cardSubtitle}>Realisasi pencapaian target portofolio.</p>
          </div>

          <div className={styles.gaugeContainer}>
            <svg viewBox="0 0 160 100" className={styles.gaugeSvg}>
              {/* Background Arch */}
              <path d="M 20,80 A 60,60 0 0,1 140,80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round"/>
              {/* Gold Progress Arch (78% of ~188.5 length) */}
              <path d="M 20,80 A 60,60 0 0,1 140,80" fill="none" stroke="url(#goldGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="41.4"/>
              
              <text x="80" y="65" className={styles.gaugeTextValue}>78%</text>
              <text x="80" y="80" className={styles.gaugeTextLabel}>Total Leads</text>
            </svg>
            
            <div className={styles.gaugeTargetStats}>
              <strong>Rp 118.9 M</strong> / <span className={styles.targetTotal}>Rp 150 M</span>
            </div>
          </div>
        </div>

        {/* Column 2: Sumber Leads Donut Chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Sumber Leads</h2>
            <p className={styles.cardSubtitle}>Periode Mei 2025</p>
          </div>

          <div className={styles.donutSplitLayout}>
            {/* Donut graphic */}
            <div className={styles.donutGraphicContainer}>
              <svg viewBox="0 0 120 120" className={styles.donutSvg}>
                {/* Website 35%: Dash = 0.35 * 314.16 = 110 */}
                <circle cx="60" cy="60" r="50" fill="none" stroke="#C9A961" strokeWidth="10" strokeDasharray="314.16" strokeDashoffset="0" />
                {/* Marketplace 30%: Dash = 0.30 * 314.16 = 94.2. Offset = 110 */}
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(201, 169, 97, 0.6)" strokeWidth="10" strokeDasharray="314.16" strokeDashoffset="110" />
                {/* Iklan 20%: Dash = 62.8. Offset = 204.2 */}
                <circle cx="60" cy="60" r="50" fill="none" stroke="#4CAF50" strokeWidth="10" strokeDasharray="314.16" strokeDashoffset="204.2" />
                {/* Referensi 15%: Dash = 47.1. Offset = 267 */}
                <circle cx="60" cy="60" r="50" fill="none" stroke="#9C27B0" strokeWidth="10" strokeDasharray="314.16" strokeDashoffset="267" />
                
                <text x="60" y="55" className={styles.donutCenterValue}>23</text>
                <text x="60" y="72" className={styles.donutCenterLabel}>Total Leads</text>
              </svg>
            </div>

            {/* Legends list */}
            <div className={styles.donutLegendList}>
              <div className={styles.donutLegendItem}>
                <span className={`${styles.donutBullet} ${styles.webColor}`}></span>
                <span className={styles.donutLabel}>Website</span>
                <span className={styles.donutVal}>35%</span>
              </div>
              <div className={styles.donutLegendItem}>
                <span className={`${styles.donutBullet} ${styles.marketColor}`}></span>
                <span className={styles.donutLabel}>Marketplace</span>
                <span className={styles.donutVal}>30%</span>
              </div>
              <div className={styles.donutLegendItem}>
                <span className={`${styles.donutBullet} ${styles.adsColor}`}></span>
                <span className={styles.donutLabel}>Iklan</span>
                <span className={styles.donutVal}>20%</span>
              </div>
              <div className={styles.donutLegendItem}>
                <span className={`${styles.donutBullet} ${styles.refColor}`}></span>
                <span className={styles.donutLabel}>Referensi</span>
                <span className={styles.donutVal}>15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Top Area Rank list */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Top Area</h2>
            <p className={styles.cardSubtitle}>Berdasarkan Unit Terjual.</p>
          </div>

          <div className={styles.topAreaList}>
            {/* Rank 1 */}
            <div className={styles.areaRankItem}>
              <div className={styles.rankBadge}>1</div>
              <div className={styles.areaRankMeta}>
                <div className={styles.areaRankNameRow}>
                  <span className={styles.areaRankName}>Krakatau</span>
                  <span className={styles.areaRankUnits}>7 Unit</span>
                </div>
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressBarFill} style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            {/* Rank 2 */}
            <div className={styles.areaRankItem}>
              <div className={styles.rankBadge}>2</div>
              <div className={styles.areaRankMeta}>
                <div className={styles.areaRankNameRow}>
                  <span className={styles.areaRankName}>Pancing</span>
                  <span className={styles.areaRankUnits}>7 Unit</span>
                </div>
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressBarFill} style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            {/* Rank 3 */}
            <div className={styles.areaRankItem}>
              <div className={styles.rankBadge}>3</div>
              <div className={styles.areaRankMeta}>
                <div className={styles.areaRankNameRow}>
                  <span className={styles.areaRankName}>Helvetia</span>
                  <span className={styles.areaRankUnits}>6 Unit</span>
                </div>
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressBarFill} style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>

            {/* Rank 4 */}
            <div className={styles.areaRankItem}>
              <div className={styles.rankBadge}>4</div>
              <div className={styles.areaRankMeta}>
                <div className={styles.areaRankNameRow}>
                  <span className={styles.areaRankName}>Cemara Asri</span>
                  <span className={styles.areaRankUnits}>6 Unit</span>
                </div>
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressBarFill} style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>

            {/* Rank 5 */}
            <div className={styles.areaRankItem}>
              <div className={styles.rankBadge}>5</div>
              <div className={styles.areaRankMeta}>
                <div className={styles.areaRankNameRow}>
                  <span className={styles.areaRankName}>Sunggal</span>
                  <span className={styles.areaRankUnits}>6 Unit</span>
                </div>
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressBarFill} style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: Ringkasan Cepat Outlined Cards (Mockup 1 style) ─── */}
      <div className={styles.summarySection}>
        <h3 className={styles.summaryTitle}>Ringkasan Cepat</h3>
        <div className={styles.summaryGrid}>
          {/* Card 1: Rata-rata Harga */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryCardHeader}>
              <div className={styles.summaryIconWrapper}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
              </div>
              <span className={styles.summaryLabel}>Rata-rata Harga</span>
            </div>
            <span className={styles.summaryValue}>Rp 2.2 M</span>
            <span className={styles.summarySubtext}>per unit</span>
          </div>

          {/* Card 2: Rata-rata Luas */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryCardHeader}>
              <div className={styles.summaryIconWrapper}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                  <line x1="15" y1="3" x2="15" y2="21"/>
                </svg>
              </div>
              <span className={styles.summaryLabel}>Rata-rata Luas</span>
            </div>
            <span className={styles.summaryValue}>120 m²</span>
            <span className={styles.summarySubtext}>per unit</span>
          </div>

          {/* Card 3: Rata-rata Tingkat */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryCardHeader}>
              <div className={styles.summaryIconWrapper}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                  <polyline points="2 17 12 22 22 17"/>
                  <polyline points="2 12 12 17 22 12"/>
                </svg>
              </div>
              <span className={styles.summaryLabel}>Rata-rata Tingkat</span>
            </div>
            <span className={styles.summaryValue}>2 Lantai</span>
            <span className={styles.summarySubtext}>per unit</span>
          </div>

          {/* Card 4: Rata-rata Carport */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryCardHeader}>
              <div className={styles.summaryIconWrapper}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <span className={styles.summaryLabel}>Rata-rata Carport</span>
            </div>
            <span className={styles.summaryValue}>1.2 Mobil</span>
            <span className={styles.summarySubtext}>per unit</span>
          </div>

          {/* Card 5: Rata-rata Hadap */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryCardHeader}>
              <div className={styles.summaryIconWrapper}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="4.22" x2="19.78" y2="5.64"/>
                </svg>
              </div>
              <span className={styles.summaryLabel}>Rata-rata Hadap</span>
            </div>
            <span className={styles.summaryValue}>Timur</span>
            <span className={styles.summarySubtext}>paling banyak</span>
          </div>

          {/* Card 6: Rata-rata Status */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryCardHeader}>
              <div className={styles.summaryIconWrapper}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <span className={styles.summaryLabel}>Rata-rata Status</span>
            </div>
            <span className={`${styles.summaryValue} ${styles.goldHighlight}`}>Siap Huni</span>
            <span className={styles.summarySubtext}>unit terbanyak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
