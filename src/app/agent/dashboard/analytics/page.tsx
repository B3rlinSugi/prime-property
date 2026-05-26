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
          <h1 className={styles.dashboardTitle}>Intelligence Dashboard</h1>
          <p className={styles.dashboardSubtitle}>Monitoring keseluruhan operasional dan performa bisnis.</p>
        </div>
        <div className={styles.timeRange}>
          <span className={styles.timeRangeDot}>●</span> Real-time Update
        </div>
      </div>

      {/* 6 Key Metrics Cards Row */}
      <div className={styles.statsGrid}>
        {/* Card 1: Total Properti */}
        <div className={styles.statCard}>
          <div className={styles.statIconCircle}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Total Properti</span>
            <div className={styles.statValue}>{summary.totalProperties}</div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>▲ +12.4%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Properti Tersedia */}
        <div className={styles.statCard}>
          <div className={styles.statIconCircle}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Properti Tersedia</span>
            <div className={styles.statValue}>{summary.inStock}</div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>▲ +8.2%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Properti Terjual */}
        <div className={styles.statCard}>
          <div className={styles.statIconCircle}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2L11.5 11.5M17 6l3 3M12.5 7.5L15.5 10.5"/></svg>
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Properti Terjual</span>
            <div className={styles.statValue}>{summary.soldOut}</div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>▲ +15.7%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Nilai Portofolio */}
        <div className={styles.statCard}>
          <div className={styles.statIconCircle}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Nilai Portfolio</span>
            <div className={styles.statValue}>Rp 118.9 M</div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>▲ +4.8%</span>
            </div>
          </div>
        </div>

        {/* Card 5: Leads Baru */}
        <div className={styles.statCard}>
          <div className={styles.statIconCircle}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Leads Baru</span>
            <div className={styles.statValue}>23</div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>▲ +10.1%</span>
            </div>
          </div>
        </div>

        {/* Card 6: Transaksi Berjalan */}
        <div className={styles.statCard}>
          <div className={styles.statIconCircle}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Transaksi Berjalan</span>
            <div className={styles.statValue}>7</div>
            <div className={styles.statFooter}>
              <span className={styles.trendUp}>▲ +6.7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Bento Grid (Wilayah Map & Penjualan Chart) */}
      <div className={styles.chartGrid}>
        {/* Left Bento: Penyebaran Wilayah */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Penyebaran Wilayah</h2>
            <p className={styles.cardSubtitle}>Berdasarkan jumlah unit tersedia</p>
          </div>

          <div className={styles.mapSplitLayout}>
            {/* Outline dark vector map of Medan region with glowing gold spots */}
            <div className={styles.mapVisualWrapper}>
              <svg viewBox="0 0 320 240" className={styles.vectorMapSvg}>
                {/* Abstract pathway outlines */}
                <path d="M40 80 Q80 50, 120 70 T200 60 T280 80" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2" strokeDasharray="3 3"/>
                <path d="M60 160 Q130 140, 180 180 T260 150" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2" strokeDasharray="3 3"/>
                <path d="M120 40 L120 200" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1"/>
                <path d="M200 40 L200 200" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1"/>

                {/* Medan Region outlines (abstract stylized polygons) */}
                <polygon points="30,40 110,30 90,110 20,90" fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.5" />
                <polygon points="110,30 220,20 180,100 90,110" fill="rgba(201, 169, 97, 0.01)" stroke="rgba(201, 169, 97, 0.06)" strokeWidth="1.5" />
                <polygon points="220,20 300,50 280,130 180,100" fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.5" />
                <polygon points="20,90 90,110 70,210 10,170" fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.5" />
                <polygon points="90,110 180,100 160,220 70,210" fill="rgba(201, 169, 97, 0.02)" stroke="rgba(201, 169, 97, 0.08)" strokeWidth="1.8" />
                <polygon points="180,100 280,130 250,210 160,220" fill="rgba(255, 255, 255, 0.01)" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.5" />

                {/* Glowing Gold Spots (Location Markers) */}
                {/* Spot 1: Krakatau */}
                <circle cx="130" cy="70" r="10" fill="rgba(201, 169, 97, 0.2)" />
                <circle cx="130" cy="70" r="4" fill="#C9A961" />
                <text x="130" y="86" fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="middle" fontFamily="sans-serif">Krakatau</text>

                {/* Spot 2: Pancing */}
                <circle cx="195" cy="115" r="12" fill="rgba(201, 169, 97, 0.25)" />
                <circle cx="195" cy="115" r="5" fill="#C9A961" />
                <text x="195" y="132" fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="middle" fontFamily="sans-serif">Pancing</text>

                {/* Spot 3: Helvetia */}
                <circle cx="70" cy="80" r="8" fill="rgba(201, 169, 97, 0.15)" />
                <circle cx="70" cy="80" r="3.5" fill="#C9A961" />
                <text x="70" y="94" fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="middle" fontFamily="sans-serif">Helvetia</text>

                {/* Spot 4: Cemara Asri */}
                <circle cx="160" cy="45" r="9" fill="rgba(201, 169, 97, 0.18)" />
                <circle cx="160" cy="45" r="4" fill="#C9A961" />
                <text x="160" y="59" fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="middle" fontFamily="sans-serif">Cemara Asri</text>

                {/* Spot 5: Sunggal */}
                <circle cx="95" cy="165" r="9" fill="rgba(201, 169, 97, 0.18)" />
                <circle cx="95" cy="165" r="4" fill="#C9A961" />
                <text x="95" y="179" fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="middle" fontFamily="sans-serif">Sunggal</text>
              </svg>
            </div>

            {/* Region breakdown Table */}
            <div className={styles.mapBreakdownWrapper}>
              <table className={styles.breakdownTable}>
                <tbody>
                  <tr>
                    <td className={styles.regionName}>Krakatau</td>
                    <td className={styles.regionUnits}>7 Unit</td>
                    <td className={styles.regionPercent}>20%</td>
                  </tr>
                  <tr>
                    <td className={styles.regionName}>Pancing</td>
                    <td className={styles.regionUnits}>7 Unit</td>
                    <td className={styles.regionPercent}>20%</td>
                  </tr>
                  <tr>
                    <td className={styles.regionName}>Helvetia</td>
                    <td className={styles.regionUnits}>6 Unit</td>
                    <td className={styles.regionPercent}>17%</td>
                  </tr>
                  <tr>
                    <td className={styles.regionName}>Cemara Asri</td>
                    <td className={styles.regionUnits}>6 Unit</td>
                    <td className={styles.regionPercent}>17%</td>
                  </tr>
                  <tr>
                    <td className={styles.regionName}>Sunggal</td>
                    <td className={styles.regionUnits}>6 Unit</td>
                    <td className={styles.regionPercent}>17%</td>
                  </tr>
                  <tr>
                    <td className={styles.regionName}>Tembung</td>
                    <td className={styles.regionUnits}>5 Unit</td>
                    <td className={styles.regionPercent}>9%</td>
                  </tr>
                </tbody>
              </table>
              <button className={styles.viewAllBtn} onClick={() => router.push('/agent/dashboard')}>
                Lihat Semua
              </button>
            </div>
          </div>
        </div>

        {/* Right Bento: Performa Penjualan Custom Spline Chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <h2 className={styles.cardTitle}>Performa Penjualan</h2>
                <p className={styles.cardSubtitle}>Periode 6 Bulan Terakhir</p>
              </div>
              <div className={styles.chartLegend}>
                <div className={styles.legendIndicatorItem}>
                  <span className={styles.legendBoxGray}></span>
                  <span className={styles.legendText}>Unit Terjual</span>
                </div>
                <div className={styles.legendIndicatorItem}>
                  <span className={styles.legendBoxGold}></span>
                  <span className={styles.legendText}>Nilai (Miliar)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Vector Chart */}
          <div className={styles.vectorChartWrapper}>
            <svg viewBox="0 0 400 200" className={styles.vectorChartSvg}>
              {/* Dashed Grid Lines */}
              <line x1="30" y1="20" x2="380" y2="20" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
              <line x1="30" y1="55" x2="380" y2="55" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
              <line x1="30" y1="90" x2="380" y2="90" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
              <line x1="30" y1="125" x2="380" y2="125" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
              <line x1="30" y1="160" x2="380" y2="160" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>

              {/* Y Axis Values Left (Unit Terjual) */}
              <text x="18" y="24" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end" fontFamily="sans-serif">20</text>
              <text x="18" y="59" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end" fontFamily="sans-serif">15</text>
              <text x="18" y="94" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end" fontFamily="sans-serif">10</text>
              <text x="18" y="129" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end" fontFamily="sans-serif">5</text>
              <text x="18" y="164" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end" fontFamily="sans-serif">0</text>

              {/* Y Axis Values Right (Nilai Miliar) */}
              <text x="392" y="24" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start" fontFamily="sans-serif">120M</text>
              <text x="392" y="59" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start" fontFamily="sans-serif">90M</text>
              <text x="392" y="94" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start" fontFamily="sans-serif">60M</text>
              <text x="392" y="129" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start" fontFamily="sans-serif">30M</text>
              <text x="392" y="164" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start" fontFamily="sans-serif">0M</text>

              {/* Bar Columns (Unit Terjual) */}
              {/* Column 1: Des (Val: 6, x: 60) */}
              <rect x="52" y="118" width="16" height="42" rx="3" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              
              {/* Column 2: Jan (Val: 14, x: 130) */}
              <rect x="122" y="62" width="16" height="98" rx="3" fill="rgba(201, 169, 97, 0.15)" stroke="rgba(201, 169, 97, 0.2)" strokeWidth="1"/>

              {/* Column 3: Mar (Val: 8, x: 200) */}
              <rect x="192" y="104" width="16" height="56" rx="3" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>

              {/* Column 4: Apr (Val: 13, x: 270) */}
              <rect x="262" y="69" width="16" height="91" rx="3" fill="rgba(201, 169, 97, 0.15)" stroke="rgba(201, 169, 97, 0.2)" strokeWidth="1"/>

              {/* Column 5: Mei (Val: 12, x: 340) */}
              <rect x="332" y="76" width="16" height="84" rx="3" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>

              {/* Gold Spline Path (Nilai Miliar - Curved Spline line) */}
              {/* P1: (60, 128), P2: (130, 85), P3: (200, 115), P4: (270, 50), P5: (340, 92) */}
              <path d="M 60,128 C 95,120 95,85 130,85 C 165,85 165,115 200,115 C 235,115 235,50 270,50 C 305,50 305,92 340,92" fill="none" stroke="#C9A961" strokeWidth="2.8" strokeLinecap="round" filter="drop-shadow(0 4px 8px rgba(201,169,97,0.3))"/>

              {/* Spline Markers (Gold Circular Dots) */}
              <circle cx="60" cy="128" r="4" fill="#C9A961" stroke="#0D0D0D" strokeWidth="1.5" />
              <circle cx="130" cy="85" r="4" fill="#C9A961" stroke="#0D0D0D" strokeWidth="1.5" />
              <circle cx="200" cy="115" r="4" fill="#C9A961" stroke="#0D0D0D" strokeWidth="1.5" />
              <circle cx="270" cy="50" r="4" fill="#C9A961" stroke="#0D0D0D" strokeWidth="1.5" />
              <circle cx="340" cy="92" r="4" fill="#C9A961" stroke="#0D0D0D" strokeWidth="1.5" />

              {/* X Axis Labels */}
              <text x="60" y="184" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle" fontFamily="sans-serif">Des</text>
              <text x="130" y="184" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle" fontFamily="sans-serif">Jan</text>
              <text x="200" y="184" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle" fontFamily="sans-serif">Mar</text>
              <text x="270" y="184" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle" fontFamily="sans-serif">Apr</text>
              <text x="340" y="184" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle" fontFamily="sans-serif">Mei</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom Panel (Ringkasan Cepat) */}
      <div className={styles.summarySection}>
        <h3 className={styles.summaryTitle}>Ringkasan Cepat</h3>
        <div className={styles.summaryGrid}>
          {/* Card 1: Rata-rata Harga */}
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Rata-rata Harga</span>
            <span className={styles.summaryValue}>Rp 2.2 M</span>
          </div>

          {/* Card 2: Rata-rata Luas */}
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Rata-rata Luas</span>
            <span className={styles.summaryValue}>120 m²</span>
          </div>

          {/* Card 3: Rata-rata Tingkat */}
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Rata-rata Tingkat</span>
            <span className={styles.summaryValue}>2 Lantai</span>
          </div>

          {/* Card 4: Rata-rata Carport */}
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Rata-rata Carport</span>
            <span className={styles.summaryValue}>1.2 Mobil</span>
          </div>

          {/* Card 5: Rata-rata Hadap */}
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Rata-rata Hadap</span>
            <span className={styles.summaryValue}>Timur</span>
          </div>

          {/* Card 6: Rata-rata Status */}
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Rata-rata Status</span>
            <span className={`${styles.summaryValue} ${styles.goldHighlight}`}>Siap Huni</span>
          </div>
        </div>
      </div>
    </div>
  );
}

