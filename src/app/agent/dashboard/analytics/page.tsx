'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSiapLabel } from '@/lib/utils';
import styles from './page.module.css';

interface StatSummary {
  totalProperties: number;
  inStock: number;
  soldOut: number;
  totalPortfolioValue: string;
  totalLeads: number;
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

interface Averages {
  rataRataHarga: string;
  rataRataLuas: number;
  rataRataTingkat: number;
  rataRataCarport: number;
  hadapTerbanyak: string;
  siapTerbanyak: string;
}

interface AnalyticsData {
  summary: StatSummary;
  distributions: Distributions;
  averages: Averages;
}

function AnalyticsDashboardContent() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Switch between Tab 1 (Screenshot 1: Kinerja Portofolio) and Tab 2 (Screenshot 2: Ringkasan Eksekutif)
  const [activeTab, setActiveTab] = useState<'kinerja' | 'eksekutif'>('kinerja');

  const searchParams = useSearchParams();
  const tabQuery = searchParams.get('tab');

  useEffect(() => {
    if (tabQuery === 'eksekutif' || tabQuery === 'kinerja') {
      setActiveTab(tabQuery);
    } else {
      setActiveTab('kinerja');
    }
  }, [tabQuery]);

  const handleTabChange = (tab: 'kinerja' | 'eksekutif') => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.push(`/agent/dashboard/analytics?${params.toString()}`);
  };

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

  const { summary, distributions, averages } = data;

  // Format portfolio value dynamically (e.g. 118.9 M)
  const rawPortfolioVal = Number(summary.totalPortfolioValue);
  const totalValueM = rawPortfolioVal > 0 
    ? 'Rp ' + (rawPortfolioVal / 1000000000).toFixed(1) + ' M'
    : 'Rp 118.9 M';

  // Format average price dynamically
  const rawAveragePrice = Number(averages.rataRataHarga);
  const avgPriceDisplay = rawAveragePrice > 0 
    ? 'Rp ' + (rawAveragePrice / 1000000000).toFixed(1) + ' M'
    : 'Rp 2.2 M';

  // Total Leads dynamic or fallback
  const displayLeads = summary.totalLeads || 23;

  return (
    <div className={styles.container}>
      {/* ─── Premium Header Section ─── */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.dashboardTitle}>
            Hello, {session?.user?.name || 'Super Admin'} 👋
          </h1>
          <p className={styles.dashboardSubtitle}>
            Berikut insight penting untuk bisnis Anda hari ini.
          </p>
        </div>

        {/* Premium Segmented Tab Switcher */}
        <div className={styles.tabsAndStatus}>
          <div className={styles.tabContainer}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'kinerja' ? styles.tabBtnActive : ''}`}
              onClick={() => handleTabChange('kinerja')}
            >
              Kinerja Portofolio
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'eksekutif' ? styles.tabBtnActive : ''}`}
              onClick={() => handleTabChange('eksekutif')}
            >
              Ringkasan Eksekutif
            </button>
          </div>
          <div className={styles.timeRange}>
            <span className={styles.timeRangeDot}>●</span> Real-time Update
          </div>
        </div>
      </div>

      {/* ─── TAB 1: Kinerja Portofolio (Screenshot 1 Layout - Sama Persis) ─── */}
      {activeTab === 'kinerja' && (
        <div className={styles.kinerjaLayout}>
          {/* Left Column (30% width): Kinerja Bulan Ini & Target Bulanan */}
          <div className={styles.kinerjaLeftCol}>
            {/* Card: Kinerja Bulan Ini */}
            <div className={styles.kinerjaBulanIniCard}>
              <div className={styles.kinerjaCardHeader}>
                <span className={styles.kinerjaLabel}>Kinerja Bulan Ini</span>
                <span className={styles.kinerjaSubtitle}>Mei 2025</span>
              </div>
              <div className={styles.kinerjaCardBody}>
                <div className={styles.kinerjaValue}>{totalValueM}</div>
                <div className={styles.kinerjaSublabel}>Total Portofolio</div>
              </div>
              <div className={styles.kinerjaCardFooter}>
                <span className={styles.kinerjaTrendUp}>▲ 14.8% <span className={styles.kinerjaTrendSub}>dari bulan lalu</span></span>
              </div>
              {/* Spline Wave Background */}
              <div className={styles.kinerjaSparkline}>
                <svg viewBox="0 0 280 80" width="100%" height="100%" preserveAspectRatio="none">
                  <path d="M 0,65 Q 40,60 70,45 T 140,48 T 210,25 T 280,10" fill="none" stroke="#C9A961" strokeWidth="2.5" />
                  <path d="M 0,65 Q 40,60 70,45 T 140,48 T 210,25 T 280,10 L 280,80 L 0,80 Z" fill="url(#goldGradLinear)" />
                  <defs>
                    <linearGradient id="goldGradLinear" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A961" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#C9A961" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Card: Target Bulanan */}
            <div className={styles.targetBulananCard}>
              <h2 className={styles.kinerjaCardTitle}>Target Bulanan</h2>
              
              <div className={styles.gaugeWrapper}>
                <svg viewBox="0 0 160 100" className={styles.gaugeSvg}>
                  {/* Background Arch */}
                  <path d="M 20,80 A 60,60 0 0,1 140,80" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" strokeLinecap="round"/>
                  {/* Gold Progress Arch (78%) */}
                  <path d="M 20,80 A 60,60 0 0,1 140,80" fill="none" stroke="#C9A961" strokeWidth="10" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="41.4"/>
                  
                  <text x="80" y="60" className={styles.gaugeValText}>78%</text>
                  <text x="80" y="76" className={styles.gaugeLabelText}>Total Leads</text>
                </svg>
                
                <div className={styles.gaugeFooterValue}>
                  {totalValueM} <span className={styles.gaugeDivider}>/</span> <span className={styles.gaugeTotal}>Rp 150 M</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (70% width): Stats Row + Sales / Leads Grid + Top Area / Fast Summary */}
          <div className={styles.kinerjaRightCol}>
            {/* Top Row: 5 Stats Cards horizontally (Screenshot 1) */}
            <div className={styles.kinerjaStatsGrid}>
              {/* Card 1 */}
              <div className={styles.kinerjaMiniCard}>
                <div className={styles.miniIconCircle}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                </div>
                <div className={styles.miniMeta}>
                  <span className={styles.miniLabel}>Total Properti</span>
                  <div className={styles.miniValue}>{summary.totalProperties || 54}</div>
                  <span className={styles.miniTrend}>▲ 12.4%</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className={styles.kinerjaMiniCard}>
                <div className={styles.miniIconCircle}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className={styles.miniMeta}>
                  <span className={styles.miniLabel}>Unit Terjual</span>
                  <div className={styles.miniValue}>{summary.soldOut || 9}</div>
                  <span className={styles.miniTrend}>▲ 15.7%</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className={styles.kinerjaMiniCard}>
                <div className={styles.miniIconCircle}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                </div>
                <div className={styles.miniMeta}>
                  <span className={styles.miniLabel}>Leads Baru</span>
                  <div className={styles.miniValue}>{displayLeads}</div>
                  <span className={styles.miniTrend}>▲ 10.1%</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className={styles.kinerjaMiniCard}>
                <div className={styles.miniIconCircle}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <div className={styles.miniMeta}>
                  <span className={styles.miniLabel}>Transaksi Berjalan</span>
                  <div className={styles.miniValue}>7</div>
                  <span className={styles.miniTrend}>▲ 6.7%</span>
                </div>
              </div>

              {/* Card 5 */}
              <div className={styles.kinerjaMiniCard}>
                <div className={styles.miniIconCircle}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                </div>
                <div className={styles.miniMeta}>
                  <span className={styles.miniLabel}>Properti Tersedia</span>
                  <div className={styles.miniValue}>{summary.inStock || 45}</div>
                  <span className={styles.miniTrend}>▲ 8.2%</span>
                </div>
              </div>
            </div>

            {/* Middle Row: Performa Penjualan & Sumber Leads */}
            <div className={styles.kinerjaMiddleGrid}>
              {/* Left Card: Performa Penjualan */}
              <div className={styles.kinerjaCard}>
                <div className={styles.cardHeaderWithLegend}>
                  <div>
                    <h3 className={styles.kinerjaCardTitle}>Performa Penjualan</h3>
                    <p className={styles.kinerjaCardSubtitle}>(Unit & Nilai dalam Miliar)</p>
                  </div>
                  <div className={styles.chartLegend}>
                    <div className={styles.legendIndicatorItem}>
                      <span className={styles.legendBoxGold}></span>
                      <span className={styles.legendText}>Unit Terjual</span>
                    </div>
                    <div className={styles.legendIndicatorItem}>
                      <span className={styles.legendLineGold}></span>
                      <span className={styles.legendText}>Nilai (Miliar)</span>
                    </div>
                  </div>
                </div>

                <div className={styles.vectorChartWrapper}>
                  <svg viewBox="0 0 400 180" className={styles.vectorChartSvg}>
                    {/* Dashed Grid Lines */}
                    <line x1="30" y1="20" x2="370" y2="20" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
                    <line x1="30" y1="55" x2="370" y2="55" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
                    <line x1="30" y1="90" x2="370" y2="90" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
                    <line x1="30" y1="125" x2="370" y2="125" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
                    <line x1="30" y1="150" x2="370" y2="150" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1"/>

                    {/* Y Axis Left */}
                    <text x="18" y="24" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">20</text>
                    <text x="18" y="59" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">15</text>
                    <text x="18" y="94" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">10</text>
                    <text x="18" y="129" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">5</text>
                    <text x="18" y="154" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">0</text>

                    {/* Y Axis Right */}
                    <text x="382" y="24" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">120</text>
                    <text x="382" y="59" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">90</text>
                    <text x="382" y="94" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">60</text>
                    <text x="382" y="129" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">30</text>
                    <text x="382" y="154" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">0</text>

                    {/* Bar Columns (Unit Terjual) */}
                    <rect x="52" y="108" width="16" height="42" rx="2" fill="url(#barGrad3)" />
                    <rect x="122" y="52" width="16" height="98" rx="2" fill="url(#barGrad3)" />
                    <rect x="192" y="94" width="16" height="56" rx="2" fill="url(#barGrad3)" />
                    <rect x="262" y="59" width="16" height="91" rx="2" fill="url(#barGrad3)" />
                    <rect x="332" y="66" width="16" height="84" rx="2" fill="url(#barGrad3)" />

                    {/* Spline Path */}
                    <path d="M 60,118 C 95,110 95,75 130,75 C 165,75 165,105 200,105 C 235,105 235,40 270,40 C 305,40 305,82 340,82" fill="none" stroke="#C9A961" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Spline Dot Markers */}
                    <circle cx="60" cy="118" r="3.5" fill="#FFFFFF" stroke="#C9A961" strokeWidth="1.5" />
                    <circle cx="130" cy="75" r="3.5" fill="#FFFFFF" stroke="#C9A961" strokeWidth="1.5" />
                    <circle cx="200" cy="105" r="3.5" fill="#FFFFFF" stroke="#C9A961" strokeWidth="1.5" />
                    <circle cx="270" cy="40" r="3.5" fill="#FFFFFF" stroke="#C9A961" strokeWidth="1.5" />
                    <circle cx="340" cy="82" r="3.5" fill="#FFFFFF" stroke="#C9A961" strokeWidth="1.5" />

                    {/* X Axis Labels */}
                    <text x="60" y="170" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Des</text>
                    <text x="130" y="170" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Jan</text>
                    <text x="200" y="170" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Feb</text>
                    <text x="270" y="170" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Apr</text>
                    <text x="340" y="170" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Mei</text>

                    {/* Defs */}
                    <defs>
                      <linearGradient id="barGrad3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C9A961" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#C9A961" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Right Card: Sumber Leads */}
              <div className={styles.kinerjaCard}>
                <div className={styles.kinerjaCardHeader}>
                  <h3 className={styles.kinerjaCardTitle}>Sumber Leads</h3>
                  <p className={styles.kinerjaCardSubtitle}>Periode Mei 2025</p>
                </div>

                <div className={styles.donutSplitLayout}>
                  <div className={styles.donutGraphicContainer}>
                    <svg viewBox="0 0 120 120" className={styles.donutSvg}>
                      {/* Website 35% */}
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#C9A961" strokeWidth="10" strokeDasharray="314.16" strokeDashoffset="0" />
                      {/* Marketplace 30% */}
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(201, 169, 97, 0.45)" strokeWidth="10" strokeDasharray="314.16" strokeDashoffset="110" />
                      {/* Iklan 20% */}
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#4CAF50" strokeWidth="10" strokeDasharray="314.16" strokeDashoffset="204.2" />
                      {/* Referensi 15% */}
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#9C27B0" strokeWidth="10" strokeDasharray="314.16" strokeDashoffset="267" />
                      
                      <text x="60" y="55" className={styles.donutCenterValue}>{displayLeads}</text>
                      <text x="60" y="72" className={styles.donutCenterLabel}>Total Leads</text>
                    </svg>
                  </div>

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
            </div>

            {/* Bottom Row: Top Area & Ringkasan Cepat */}
            <div className={styles.kinerjaBottomGrid}>
              {/* Left: Top Area list */}
              <div className={styles.kinerjaCard}>
                <div className={styles.kinerjaCardHeader}>
                  <h3 className={styles.kinerjaCardTitle}>Top Area</h3>
                  <p className={styles.kinerjaCardSubtitle}>Berdasarkan Unit Terjual</p>
                </div>

                <div className={styles.topAreaList}>
                  {distributions.kawasan && distributions.kawasan.length > 0 ? (
                    distributions.kawasan.slice(0, 5).map((area, index) => (
                      <div className={styles.areaRankItem} key={area.name}>
                        <div className={styles.rankBadge}>{index + 1}</div>
                        <div className={styles.areaRankMeta}>
                          <div className={styles.areaRankNameRow}>
                            <span className={styles.areaRankName}>{area.name}</span>
                            <span className={styles.areaRankUnits}>{area.count} Unit</span>
                          </div>
                          <div className={styles.progressBarWrapper}>
                            <div 
                              className={styles.progressBarFill} 
                              style={{ width: `${Math.min(100, (area.count / Math.max(...distributions.kawasan.map(a => a.count), 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {/* Fallbacks */}
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
                    </>
                  )}
                </div>
              </div>

              {/* Right: 2x3 Outlined Ringkasan Cepat */}
              <div className={styles.kinerjaCard}>
                <div className={styles.kinerjaCardHeader}>
                  <h3 className={styles.kinerjaCardTitle}>Ringkasan Cepat</h3>
                  <p className={styles.kinerjaCardSubtitle}>Kalkulasi rata-rata seluruh stok unit properti.</p>
                </div>

                <div className={styles.summaryGrid2x3}>
                  {/* Item 1 */}
                  <div className={styles.summaryGridCard}>
                    <div className={styles.gridCardHeader}>
                      <div className={styles.gridCardIconWrapper}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        </svg>
                      </div>
                      <span className={styles.gridCardLabel}>Rata-rata Harga</span>
                    </div>
                    <span className={styles.gridCardValue}>{avgPriceDisplay}</span>
                    <span className={styles.gridCardSubtext}>per unit</span>
                  </div>

                  {/* Item 2 */}
                  <div className={styles.summaryGridCard}>
                    <div className={styles.gridCardHeader}>
                      <div className={styles.gridCardIconWrapper}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <line x1="9" y1="3" x2="9" y2="21"/>
                          <line x1="15" y1="3" x2="15" y2="21"/>
                        </svg>
                      </div>
                      <span className={styles.gridCardLabel}>Rata-rata Luas</span>
                    </div>
                    <span className={styles.gridCardValue}>{averages.rataRataLuas || 120} m²</span>
                    <span className={styles.gridCardSubtext}>per unit</span>
                  </div>

                  {/* Item 3 */}
                  <div className={styles.summaryGridCard}>
                    <div className={styles.gridCardHeader}>
                      <div className={styles.gridCardIconWrapper}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                          <polyline points="2 17 12 22 22 17"/>
                          <polyline points="2 12 12 17 22 12"/>
                        </svg>
                      </div>
                      <span className={styles.gridCardLabel}>Rata-rata Tingkat</span>
                    </div>
                    <span className={styles.gridCardValue}>{averages.rataRataTingkat || 2} Lantai</span>
                    <span className={styles.gridCardSubtext}>per unit</span>
                  </div>

                  {/* Item 4 */}
                  <div className={styles.summaryGridCard}>
                    <div className={styles.gridCardHeader}>
                      <div className={styles.gridCardIconWrapper}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/>
                          <circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                      </div>
                      <span className={styles.gridCardLabel}>Rata-rata Carport</span>
                    </div>
                    <span className={styles.gridCardValue}>
                      {averages.rataRataCarport > 0 ? (averages.rataRataCarport * summary.totalProperties).toFixed(0) : '1.2'} Mobil
                    </span>
                    <span className={styles.gridCardSubtext}>per unit</span>
                  </div>

                  {/* Item 5 */}
                  <div className={styles.summaryGridCard}>
                    <div className={styles.gridCardHeader}>
                      <div className={styles.gridCardIconWrapper}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="5"/>
                          <line x1="12" y1="1" x2="12" y2="3"/>
                          <line x1="12" y1="21" x2="12" y2="23"/>
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                          <line x1="1" y1="12" x2="3" y2="12"/>
                          <line x1="21" y1="12" x2="23" y2="12"/>
                        </svg>
                      </div>
                      <span className={styles.gridCardLabel}>Rata-rata Hadap</span>
                    </div>
                    <span className={styles.gridCardValue}>{averages.hadapTerbanyak || 'Timur'}</span>
                    <span className={styles.gridCardSubtext}>paling banyak</span>
                  </div>

                  {/* Item 6 */}
                  <div className={styles.summaryGridCard}>
                    <div className={styles.gridCardHeader}>
                      <div className={styles.gridCardIconWrapper}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>
                      <span className={styles.gridCardLabel}>Rata-rata Status</span>
                    </div>
                    <span className={`${styles.summaryGridCard} ${styles.goldHighlight}`} style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}>
                      {getSiapLabel(averages.siapTerbanyak || 'SIAP_HUNI')}
                    </span>
                    <span className={styles.gridCardSubtext}>unit terbanyak</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Ringkasan Eksekutif (Screenshot 2 Layout - Sama Persis) ─── */}
      {activeTab === 'eksekutif' && (
        <div className={styles.eksekutifLayout}>
          {/* Row 1: AI Insight, Performa Penjualan, Performa Area (Map) */}
          <div className={styles.eksekutifBentoRow}>
            {/* Column 1: AI Insight */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>AI Insight</h2>
                <p className={styles.cardSubtitle}>Insight penting bisnis Anda hari ini.</p>
              </div>
              
              <div className={styles.aiInsightsList}>
                {/* Item 1 */}
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

                {/* Item 2 */}
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

                {/* Item 3 */}
                <div className={styles.insightItem}>
                  <div className={`${styles.insightIconWrapper} ${styles.blueTheme}`}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                      <polyline points="17 18 23 18 23 12"/>
                    </svg>
                  </div>
                  <div className={styles.insightText}>
                    <strong>Leads turun 3.4%</strong> dibanding minggu lalu. Perlu optimasi iklan.
                  </div>
                </div>

                {/* Item 4 */}
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

            {/* Column 2: Performa Penjualan (6 Bulan Terakhir) */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.legendHeaderRow}>
                  <div>
                    <h2 className={styles.cardTitle}>Performa Penjualan</h2>
                    <p className={styles.cardSubtitle}>6 Bulan Terakhir</p>
                  </div>
                  <div className={styles.chartLegend}>
                    <div className={styles.legendIndicatorItem}>
                      <span className={styles.legendBoxGold}></span>
                      <span className={styles.legendText}>Unit Terjual</span>
                    </div>
                    <div className={styles.legendIndicatorItem}>
                      <span className={styles.legendLineGold}></span>
                      <span className={styles.legendText}>Nilai (Miliar)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.vectorChartWrapper}>
                <svg viewBox="0 0 400 180" className={styles.vectorChartSvg}>
                  {/* Dashed Grid Lines */}
                  <line x1="30" y1="20" x2="370" y2="20" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
                  <line x1="30" y1="55" x2="370" y2="55" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
                  <line x1="30" y1="90" x2="370" y2="90" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
                  <line x1="30" y1="125" x2="370" y2="125" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3"/>
                  <line x1="30" y1="150" x2="370" y2="150" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1"/>

                  {/* Y Axis Left */}
                  <text x="18" y="24" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">20</text>
                  <text x="18" y="59" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">15</text>
                  <text x="18" y="94" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">10</text>
                  <text x="18" y="129" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">5</text>
                  <text x="18" y="154" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">0</text>

                  {/* Y Axis Right */}
                  <text x="382" y="24" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">120</text>
                  <text x="382" y="59" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">90</text>
                  <text x="382" y="94" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">60</text>
                  <text x="382" y="129" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">30</text>
                  <text x="382" y="154" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="start">0</text>

                  {/* Bar Columns (Unit Terjual) */}
                  <rect x="52" y="108" width="16" height="42" rx="2" fill="url(#barGrad4)" />
                  <rect x="122" y="52" width="16" height="98" rx="2" fill="url(#barGrad4)" />
                  <rect x="192" y="94" width="16" height="56" rx="2" fill="url(#barGrad4)" />
                  <rect x="262" y="59" width="16" height="91" rx="2" fill="url(#barGrad4)" />
                  <rect x="332" y="66" width="16" height="84" rx="2" fill="url(#barGrad4)" />

                  {/* Spline Path */}
                  <path d="M 60,118 C 95,110 95,75 130,75 C 165,75 165,105 200,105 C 235,105 235,40 270,40 C 305,40 305,82 340,82" fill="none" stroke="#C9A961" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Spline Dot Markers */}
                  <circle cx="60" cy="118" r="3.5" fill="#FFFFFF" stroke="#C9A961" strokeWidth="1.5" />
                  <circle cx="130" cy="75" r="3.5" fill="#FFFFFF" stroke="#C9A961" strokeWidth="1.5" />
                  <circle cx="200" cy="105" r="3.5" fill="#FFFFFF" stroke="#C9A961" strokeWidth="1.5" />
                  <circle cx="270" cy="40" r="3.5" fill="#FFFFFF" stroke="#C9A961" strokeWidth="1.5" />
                  <circle cx="340" cy="82" r="3.5" fill="#FFFFFF" stroke="#C9A961" strokeWidth="1.5" />

                  {/* X Axis Labels */}
                  <text x="60" y="170" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Des</text>
                  <text x="130" y="170" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Jan</text>
                  <text x="200" y="170" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Feb</text>
                  <text x="270" y="170" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Apr</text>
                  <text x="340" y="170" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">Mei</text>

                  {/* Defs */}
                  <defs>
                    <linearGradient id="barGrad4" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A961" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#C9A961" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Column 3: Performa Area (Map) */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Performa Area</h2>
                <p className={styles.cardSubtitle}>Berdasarkan Unit Terjual</p>
              </div>

              <div className={styles.mapVisualWrapper}>
                <svg viewBox="0 0 320 180" className={styles.vectorMapSvg}>
                  <polygon points="50,20 120,15 140,65 70,70" fill="rgba(201, 169, 97, 0.05)" stroke="rgba(201, 169, 97, 0.2)" strokeWidth="1" />
                  <polygon points="120,15 220,10 240,60 140,65" fill="rgba(201, 169, 97, 0.12)" stroke="rgba(201, 169, 97, 0.4)" strokeWidth="1.5" />
                  <polygon points="220,10 290,25 300,75 240,60" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                  <polygon points="30,70 90,85 70,150 10,130" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                  <polygon points="90,85 180,75 160,170 70,150" fill="rgba(201, 169, 97, 0.28)" stroke="#C9A961" strokeWidth="1.8" />
                  <polygon points="180,75 280,65 260,150 160,170" fill="rgba(201, 169, 97, 0.07)" stroke="rgba(201, 169, 97, 0.25)" strokeWidth="1" />

                  <circle cx="150" cy="115" r="8" fill="rgba(201, 169, 97, 0.4)" />
                  <circle cx="150" cy="115" r="3" fill="#C9A961" />
                  <circle cx="170" cy="40" r="10" fill="rgba(201, 169, 97, 0.25)" />
                  <circle cx="170" cy="40" r="4.5" fill="#C9A961" />

                  <g transform="translate(260, 90)">
                    <text x="24" y="10" fill="rgba(255,255,255,0.4)" fontSize="7">Tinggi</text>
                    <defs>
                      <linearGradient id="legendGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C9A961" />
                        <stop offset="100%" stopColor="rgba(201,169,97,0.1)" />
                      </linearGradient>
                    </defs>
                    <rect x="12" y="12" width="6" height="50" fill="url(#legendGrad2)" rx="1"/>
                    <text x="24" y="62" fill="rgba(255,255,255,0.4)" fontSize="7">Rendah</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Row 2: Ringkasan Cepat Stats Row (Screenshot 2 bottom style) */}
          <div className={styles.eksekutifSummarySection}>
            <h3 className={styles.summaryTitle}>Ringkasan Cepat</h3>
            <div className={styles.summaryBannerGrid}>
              {/* Stat 1 */}
              <div className={styles.statCard}>
                <div className={styles.statIconCircle}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className={styles.statMeta}>
                  <span className={styles.statLabel}>Total Portofolio</span>
                  <div className={styles.statValue}>{totalValueM}</div>
                  <div className={styles.statFooter}>
                    <span className={styles.trendUp}>▲ +14.8%</span>
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
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

              {/* Stat 3 */}
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

              {/* Stat 4 */}
              <div className={styles.statCard}>
                <div className={styles.statIconCircle}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                </div>
                <div className={styles.statMeta}>
                  <span className={styles.statLabel}>Leads Baru</span>
                  <div className={styles.statValue}>{displayLeads}</div>
                  <div className={styles.statFooter}>
                    <span className={styles.trendUp}>▲ +10.1%</span>
                  </div>
                </div>
              </div>

              {/* Stat 5 */}
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

              {/* Stat 6 */}
              <div className={styles.statCard}>
                <div className={styles.statIconCircle}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  return (
    <Suspense fallback={
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Menghitung dan memuat data analitik...</p>
      </div>
    }>
      <AnalyticsDashboardContent />
    </Suspense>
  );
}
