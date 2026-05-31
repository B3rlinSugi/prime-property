'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import styles from './page.module.css';
import { generatePropertyBrochure } from '@/lib/pdfGenerator';

interface Property {
  id: string;
  namaProperty: string;
  group: string | null;
  lebar: number;
  panjang: number;
  hadap: string; // JSON string array
  tipe: string; // RUKO | VILLA
  tingkat: number;
  price: string | number;
  carport: boolean;
  status: string; // IN_STOCK | SOLD_OUT
  siap: string;
  mapsLink: string | null;
  kawasan: string; // JSON string array
  unit: string | null;
}

interface AmortizationYear {
  year: number;
  annualInstallment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  years: number,
  monthlyInstallment: number
): AmortizationYear[] {
  if (!years || years <= 0 || !monthlyInstallment || monthlyInstallment <= 0 || !principal || principal <= 0) {
    return [];
  }
  const schedule: AmortizationYear[] = [];
  let remainingBalance = principal;
  const r = (annualRate / 100) / 12;
  const maxYears = Math.min(years, 50); // Cap at 50 years for safety

  for (let year = 1; year <= maxYears; year++) {
    let annualInstallmentTotal = 0;
    let annualPrincipalPaid = 0;
    let annualInterestPaid = 0;

    for (let month = 1; month <= 12; month++) {
      if (remainingBalance <= 0) break;
      
      const interestPaidMonth = remainingBalance * r;
      let principalPaidMonth = monthlyInstallment - interestPaidMonth;
      
      if (principalPaidMonth > remainingBalance) {
        principalPaidMonth = remainingBalance;
      }
      if (principalPaidMonth < 0) {
        principalPaidMonth = 0;
      }
      
      remainingBalance -= principalPaidMonth;
      
      annualInstallmentTotal += (principalPaidMonth + interestPaidMonth);
      annualPrincipalPaid += principalPaidMonth;
      annualInterestPaid += interestPaidMonth;
    }

    schedule.push({
      year,
      annualInstallment: annualInstallmentTotal,
      principalPaid: annualPrincipalPaid,
      interestPaid: annualInterestPaid,
      remainingBalance: Math.max(0, remainingBalance),
    });

    if (remainingBalance <= 0) break;
  }

  return schedule;
}

export default function PublicKprCalculatorPage() {
  // Input states
  const [propertyPrice, setPropertyPrice] = useState<number>(2000000000); // Rp 2 Miliar default
  const [dpPercent, setDpPercent] = useState<number>(20); // 20% default
  const [interestRate, setInterestRate] = useState<number>(6.5); // 6.5% flat default
  const [tenureYears, setTenureYears] = useState<number>(15); // 15 Tahun default

  // Computed states
  const [dpAmount, setDpAmount] = useState<number>(400000000);
  const [loanPrincipal, setLoanPrincipal] = useState<number>(1600000000);
  const [monthlyInstallment, setMonthlyInstallment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  // Property Listing & Filter States
  const [properties, setProperties] = useState<Property[]>([]);
  const [matchingProperties, setMatchingProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Modal Detail States
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'gallery' | 'floorplan' | 'location' | 'investment'>('overview');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async (property: any) => {
    setIsDownloadingPdf(true);
    try {
      await generatePropertyBrochure(property);
    } catch (e) {
      console.error('Failed to generate PDF brochure:', e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showApplyKprModal, setShowApplyKprModal] = useState(false);
  const [applyKprName, setApplyKprName] = useState('');
  const [applyKprPhone, setApplyKprPhone] = useState('');
  const [applyKprBank, setApplyKprBank] = useState('BCA');
  const [applyKprSubmitted, setApplyKprSubmitted] = useState(false);

  // Fetch all properties from DB on mount
  useEffect(() => {
    async function fetchAllProperties() {
      try {
        setIsLoadingProperties(true);
        const res = await fetch('/api/properties?limit=100');
        if (res.ok) {
          const json = await res.json();
          setProperties(json.data || []);
        }
      } catch (err) {
        console.error('Error fetching properties on KPR page:', err);
      } finally {
        setIsLoadingProperties(false);
      }
    }
    fetchAllProperties();
  }, []);

  // Re-calculate mortgage parameters
  useEffect(() => {
    const calculatedDp = (propertyPrice * dpPercent) / 100;
    const principal = propertyPrice - calculatedDp;
    setDpAmount(calculatedDp);
    setLoanPrincipal(principal);

    const r = (interestRate / 100) / 12;
    const n = tenureYears * 12;

    let installment = 0;
    if (r === 0) {
      installment = principal / n;
    } else {
      installment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const calculatedTotalPayment = installment * n;
    const calculatedTotalInterest = calculatedTotalPayment - principal;

    setMonthlyInstallment(installment);
    setTotalPayment(calculatedTotalPayment);
    setTotalInterest(calculatedTotalInterest);
  }, [propertyPrice, dpPercent, interestRate, tenureYears]);

  // Real-time property filtering inside Simulasi KPR page based on selected propertyPrice budget
  useEffect(() => {
    const result = properties.filter((p) => {
      const priceNum = typeof p.price === 'string' ? parseInt(p.price, 10) : Number(p.price);
      return priceNum <= propertyPrice;
    });
    setMatchingProperties(result);
  }, [propertyPrice, properties]);

  // Body scroll lock
  useEffect(() => {
    if (selectedProperty || showBudgetModal || showApplyKprModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProperty, showBudgetModal, showApplyKprModal]);

  // Donut chart calculations
  const principalShare = loanPrincipal || 1;
  const interestShare = totalInterest || 0;
  const totalShare = principalShare + interestShare;
  
  const principalPercent = Math.round((principalShare / totalShare) * 100);
  const interestPercent = Math.round((interestShare / totalShare) * 100);

  const radius = 50;
  const circumference = 2 * Math.PI * radius; // 314.16
  const principalStrokeDash = (principalPercent / 100) * circumference;
  const interestStrokeDash = (interestPercent / 100) * circumference;

  // Generate annual amortization schedule dynamically
  const amortizationSchedule = generateAmortizationSchedule(
    loanPrincipal,
    interestRate,
    tenureYears,
    monthlyInstallment
  );

  // JSON parsing helper
  function parseJsonArray(jsonStr: string): string[] {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }

  // Deterministic images mapper
  function getPropertyImageIndex(id: string): number {
    let sum = 0;
    for (let i = 0; i < id.length; i++) {
      sum += id.charCodeAt(i);
    }
    return (sum % 6) + 1;
  }

  function getTipeLabel(tipe: string): string {
    return tipe === 'VILLA' ? 'Villa' : 'Ruko';
  }

  function getSiapLabel(siap: string): string {
    const map: Record<string, string> = {
      SIAP_HUNI: 'Siap Huni',
      SIAP_KOSONG: 'Siap Kosong',
      SIAP_HUNI_RENOVASI: 'Siap Huni Renovasi',
    };
    return map[siap] || siap;
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Editorial Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroLinesGrid}>
          <div className={styles.lineVertical} style={{ left: '30%' }}></div>
          <div className={styles.lineVertical} style={{ left: '70%' }}></div>
        </div>
        <div className={styles.heroContent}>
          <span className={styles.topBadge}>SIMULATOR INTERAKTIF</span>
          <h1 className={styles.editorialTitle}>
            Simulasi Kredit Pemilikan <span>KPR & Ruko</span>
          </h1>
          <p className={styles.editorialSubtitle}>
            Hitung perkiraan angsuran bulanan Anda dengan kalkulator KPR premium kami. Rencanakan investasi properti Anda secara cermat.
          </p>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <section className={styles.calculatorSection}>
        <div className={styles.calcGrid}>
          {/* Left Column: Input Forms */}
          <div className={styles.calcFormCard}>
            <h3 className={styles.cardHeaderTitle}>Parameter Kredit KPR</h3>
            <p className={styles.cardHeaderSub}>Sesuaikan data di bawah untuk menghitung angsuran</p>

            <div className={styles.formGroup}>
              <div className={styles.fieldHeaderRow}>
                <label className={styles.fieldLabel}>HARGA PROPERTI (RUPIAH)</label>
                <span className={styles.fieldValueDisplay}>{formatRupiah(propertyPrice)}</span>
              </div>
              <input
                type="range"
                min={500000000}
                max={10000000000}
                step={100000000}
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(parseInt(e.target.value))}
                className={styles.rangeSlider}
              />
              <div className={styles.sliderLimitsRow}>
                <span>Rp 500 Jt</span>
                <span>Rp 10 M</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.fieldHeaderRow}>
                <label className={styles.fieldLabel}>UANG MUKA (DP %)</label>
                <span className={styles.fieldValueDisplay}>{dpPercent}% ({formatRupiah(dpAmount)})</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={dpPercent}
                onChange={(e) => setDpPercent(parseInt(e.target.value))}
                className={styles.rangeSlider}
              />
              <div className={styles.sliderLimitsRow}>
                <span>Min 10%</span>
                <span>Max 90%</span>
              </div>
            </div>

            <div className={styles.formRowTwoCol}>
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>SUKU BUNGA PER TAHUN (% FLAT)</label>
                <div className={styles.inputWithUnitWrapper}>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    step={0.1}
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                    className={styles.numInput}
                  />
                  <span className={styles.inputUnit}>%</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>TENOR PINJAMAN (TAHUN)</label>
                <div className={styles.inputWithUnitWrapper}>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    step={1}
                    value={tenureYears}
                    onChange={(e) => setTenureYears(parseInt(e.target.value) || 0)}
                    className={styles.numInput}
                  />
                  <span className={styles.inputUnit}>Thn</span>
                </div>
              </div>
            </div>

            {/* Quick Presets row */}
            <div className={styles.quickTenurePresets}>
              <span className={styles.presetsLabel}>Tenor Cepat:</span>
              <button 
                className={`${styles.presetBtn} ${tenureYears === 5 ? styles.presetBtnActive : ''}`} 
                onClick={() => setTenureYears(5)}
              >
                5 Thn
              </button>
              <button 
                className={`${styles.presetBtn} ${tenureYears === 10 ? styles.presetBtnActive : ''}`} 
                onClick={() => setTenureYears(10)}
              >
                10 Thn
              </button>
              <button 
                className={`${styles.presetBtn} ${tenureYears === 15 ? styles.presetBtnActive : ''}`} 
                onClick={() => setTenureYears(15)}
              >
                15 Thn
              </button>
              <button 
                className={`${styles.presetBtn} ${tenureYears === 20 ? styles.presetBtnActive : ''}`} 
                onClick={() => setTenureYears(20)}
              >
                20 Thn
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Results & SVG Donut Share Breakdown */}
          <div className={styles.calcResultsCard}>
            <div className={styles.resultsMainHeader}>
              <span className={styles.resultLabel}>ESTIMASI ANGSURAN BULANAN</span>
              <h2 className={styles.resultValue}>{formatRupiah(monthlyInstallment)} <span className={styles.perMonth}>/ Bln</span></h2>
            </div>

            {/* Split Visual Section */}
            <div className={styles.visualBreakdownBlock}>
              {/* Donut Chart */}
              <div className={styles.donutChartWrapper}>
                <svg viewBox="0 0 120 120" className={styles.donutSvg}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="12" />
                  
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.12)" 
                    strokeWidth="12" 
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - principalStrokeDash}
                    transform="rotate(-90 60 60)"
                    strokeLinecap="round"
                    className={styles.donutSegment}
                  />

                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    fill="none" 
                    stroke="#C9A961" 
                    strokeWidth="12" 
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - interestStrokeDash}
                    transform={`rotate(${principalPercent * 3.6 - 90} 60 60)`}
                    strokeLinecap="round"
                    className={styles.donutSegmentGold}
                  />
                </svg>
                <div className={styles.donutCenterText}>
                  <span className={styles.centerPercent}>{tenureYears}</span>
                  <span className={styles.centerLabel}>TAHUN</span>
                </div>
              </div>

              {/* Legends & Details */}
              <div className={styles.legendsList}>
                <div className={styles.legendItem}>
                  <span className={styles.legendBoxGray}></span>
                  <div className={styles.legendMeta}>
                    <span className={styles.legendTitle}>Pinjaman Pokok ({principalPercent}%)</span>
                    <span className={styles.legendValue}>{formatRupiah(loanPrincipal)}</span>
                  </div>
                </div>

                <div className={styles.legendItem}>
                  <span className={styles.legendBoxGold}></span>
                  <div className={styles.legendMeta}>
                    <span className={styles.legendTitle}>Bunga Dibayarkan ({interestPercent}%)</span>
                    <span className={styles.legendValue}>{formatRupiah(totalInterest)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick statistics data rows */}
            <div className={styles.quickStatsDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Harga Unit Properti</span>
                <span className={styles.detailValue}>{formatRupiah(propertyPrice)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Uang Muka Terbayar (DP)</span>
                <span className={styles.detailValue}>{formatRupiah(dpAmount)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Pokok Hutang Pinjaman</span>
                <span className={styles.detailValue}>{formatRupiah(loanPrincipal)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total Pembayaran KPR</span>
                <span className={`${styles.detailValue} ${styles.goldTotal}`}>{formatRupiah(totalPayment)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowBudgetModal(true)}
                className={styles.actionSearchPropertiesBtn}
                style={{ flex: 1, marginTop: 0, minWidth: '180px' }}
              >
                Cari Unit Sesuai Budget KPR
              </button>
              <button
                onClick={() => setShowApplyKprModal(true)}
                className={styles.actionApplyKprBtn}
                style={{ flex: 1, minWidth: '180px' }}
              >
                🏦 Ajukan KPR Sekarang
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Jadwal Amortisasi KPR Section */}
      {amortizationSchedule.length > 0 && (
        <section className={styles.amortizationSection}>
          <div className={styles.amortizationCard}>
            <div className={styles.amortizationHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <h3 className={styles.amortizationTitle} style={{ margin: 0 }}>📈 Jadwal Amortisasi KPR Tahunan</h3>
                  <span className={matchingProperties.length > 0 ? styles.integratedBadge : styles.genericBadge}>
                    {matchingProperties.length > 0 ? '✨ Portofolio Terintegrasi' : '📊 Simulasi Kredit Umum'}
                  </span>
                </div>
                <p className={styles.amortizationSub}>
                  Rincian alokasi angsuran tahunan Anda antara pembayaran saldo pokok hutang dan porsi bunga.
                </p>
              </div>
              <button 
                onClick={() => window.print()} 
                className={styles.printBtn}
                title="Cetak atau Simpan PDF Jadwal Cicilan KPR"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Cetak / Simpan PDF
              </button>
            </div>
            
            <div className={styles.tableWrapper} data-lenis-prevent="true">
              <table className={styles.amortizationTable}>
                <thead>
                  <tr>
                    <th>Tahun</th>
                    <th>Angsuran Tahunan</th>
                    <th>Cicilan Pokok</th>
                    <th>Bunga Dibayar</th>
                    <th>Sisa Pokok Hutang</th>
                  </tr>
                </thead>
                <tbody>
                  {amortizationSchedule.map((row) => (
                    <tr key={row.year}>
                      <td className={styles.yearCol}>Tahun {row.year}</td>
                      <td className={styles.valCol}>{formatRupiah(row.annualInstallment)}</td>
                      <td className={`${styles.valCol} ${styles.principalCol}`}>{formatRupiah(row.principalPaid)}</td>
                      <td className={`${styles.valCol} ${styles.interestCol}`}>{formatRupiah(row.interestPaid)}</td>
                      <td className={`${styles.valCol} ${styles.balanceCol}`}>{formatRupiah(row.remainingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Advisory section */}
      <section className={styles.calcAdvisorySection}>
        <div className={styles.advisoryCard}>
          <span className={styles.advisoryIcon}>💡</span>
          <div className={styles.advisoryContent}>
            <h4 className={styles.advisoryTitle}>Catatan Penting Simulasi KPR:</h4>
            <p className={styles.advisoryText}>
              Perhitungan simulasi KPR ini menggunakan metode anuitas bulanan standar dengan suku bunga tetap (flat). Hasil nominal di atas bersifat estimasi kasar/simulasi awal. Suku bunga riil dari bank dapat bervariasi bergantung pada syarat ketentuan pihak pemberi pinjaman KPR.
            </p>
          </div>
        </div>
      </section>

      {/* ─── REAL-TIME BUDGET PORTFOLIO GLASS OVERLAY MODAL ─── */}
      {showBudgetModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowBudgetModal(false)} data-lenis-prevent>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => setShowBudgetModal(false)}>
              ✕
            </button>

            <div className={styles.matchingSectionHeader} style={{ paddingRight: '48px' }}>
              <h3 className={styles.matchingSectionTitle}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', marginTop: '-2px' }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>Portofolio Unit dalam Budget KPR Anda</h3>
              <p className={styles.matchingSectionSubtitle}>
                Menampilkan properti premium dengan harga maksimal <strong>{formatRupiah(propertyPrice)}</strong> terhitung secara real-time.
              </p>
            </div>

            {isLoadingProperties ? (
              /* High-Fidelity loading skeletons */
              <div className={styles.catalogGrid}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonTextTitle} />
                    <div className={styles.skeletonTextSub} />
                    <div className={styles.skeletonTextPrice} />
                    <div className={styles.skeletonSpecs} />
                  </div>
                ))}
              </div>
            ) : matchingProperties.length === 0 ? (
              /* Elegant warning empty state if budget is too low */
              <div className={styles.emptyBudgetState}>
                <span className={styles.emptyBudgetIcon}>❌</span>
                <h4 className={styles.emptyBudgetTitle}>Properti Tidak Tersedia</h4>
                <p className={styles.emptyBudgetText}>
                  Maaf, saat ini tidak ada unit ruko komersial atau villa mewah kami yang memiliki harga di kisaran atau di bawah <strong>{formatRupiah(propertyPrice)}</strong>.
                </p>
                <p className={styles.emptyBudgetAdvice}>
                  💡 <em>Tips: Geser slider "HARGA PROPERTI" ke kanan untuk menaikkan budget KPR Anda guna menjelajahi properti premium kami.</em>
                </p>
              </div>
            ) : (
              /* Symmetrical premium cards grid showing only matching properties */
              <div className={styles.catalogGrid}>
                {matchingProperties.map((property) => {
                  const imageIndex = getPropertyImageIndex(property.id);
                  const kawasanArray = parseJsonArray(property.kawasan);
                  const isLoaded = loadedImages[property.id];

                  return (
                    <article
                      key={property.id}
                      className={styles.propertyCard}
                      onClick={() => {
                        setSelectedProperty(property);
                        setActiveSlideIndex(0);
                        setActiveModalTab('gallery');
                      }}
                    >
                      <div className={styles.cardImageContainer}>
                        <img 
                          src={`/property-villa-${imageIndex}.png`} 
                          alt={property.namaProperty} 
                          className={`${styles.cardImageTag} ${isLoaded ? styles.imageLoaded : ''}`}
                          onLoad={() => setLoadedImages((prev) => ({ ...prev, [property.id]: true }))}
                          loading="lazy"
                        />
                        
                        <div className={styles.cardBadgeContainer}>
                          <span className={property.status === 'IN_STOCK' ? styles.badgeInStock : styles.badgeSoldOut}>
                            {property.status === 'IN_STOCK' ? 'In Stock' : 'Sold Out'}
                          </span>
                          <span className={styles.badgeType}>
                            {getTipeLabel(property.tipe)}
                          </span>
                        </div>
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                          <h3 className={styles.cardTitle}>{property.namaProperty}</h3>
                          <button
                            className={styles.wishlistBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`${property.namaProperty} ditambahkan ke favorit!`);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.heartIcon}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                          </button>
                        </div>

                        <div className={styles.cardKawasan}>{kawasanArray.join(', ')}</div>
                        <div className={styles.cardPrice}>
                          {formatRupiah(typeof property.price === 'string' ? BigInt(property.price) : property.price)}
                        </div>

                        <div className={styles.cardSpecs}>
                          <div className={styles.cardSpecItem}>
                            <span className={styles.cardSpecIcon}>📐</span>
                            <span>{property.lebar} &times; {property.panjang}</span>
                          </div>
                          <div className={styles.cardSpecItem}>
                            <span className={styles.cardSpecIcon}>🏢</span>
                            <span>{property.tingkat} Lt</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── REFERRAL APPLICATION KPR GLASS OVERLAY MODAL ─── */}
      {showApplyKprModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowApplyKprModal(false)} data-lenis-prevent>
          <div className={styles.kprFormCard} onClick={(e) => e.stopPropagation()} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', maxWidth: '520px', width: '100%', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }}>
            <button className={styles.modalCloseBtn} onClick={() => setShowApplyKprModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', color: '#fff', width: '32px', height: '32px', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>&times;</button>
            
            <h3 className={styles.matchingSectionTitle} style={{ color: '#C9A961', fontSize: '1.4rem', fontWeight: 600, marginBottom: '6px', textAlign: 'left' }}>🏦 Formulir Pengajuan KPR</h3>
            <p className={styles.matchingSectionSubtitle} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginBottom: '24px', textAlign: 'left', lineHeight: '1.5' }}>Rencanakan KPR Anda bersama bank mitra Prime Property pilihan Anda secara instan.</p>
            
            {applyKprSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(76,175,80,0.1)', border: '2px solid #4CAF50', color: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>✓</div>
                <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, marginBottom: '10px' }}>Pengajuan KPR Berhasil!</h4>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '24px' }}>
                  Terima kasih <strong>{applyKprName}</strong>, data simulasi KPR Anda untuk properti senilai <strong>{formatRupiah(propertyPrice)}</strong> telah dikirimkan ke tim analis KPR mitra <strong>Bank {applyKprBank}</strong>. Tim KPR kami akan menghubungi Anda melalui WhatsApp di nomor <strong>{applyKprPhone}</strong> dalam 1&times;24 jam.
                </p>
                <button 
                  className={styles.actionSearchPropertiesBtn}
                  style={{ width: '100%', marginTop: 0 }}
                  onClick={() => {
                    setApplyKprSubmitted(false);
                    setShowApplyKprModal(false);
                    setApplyKprName('');
                    setApplyKprPhone('');
                  }}
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!applyKprName.trim() || !applyKprPhone.trim()) return;
                  setApplyKprSubmitted(true);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <label className={styles.fieldLabel} style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>NAMA LENGKAP</label>
                  <input 
                    type="text" 
                    required 
                    value={applyKprName} 
                    onChange={(e) => setApplyKprName(e.target.value)} 
                    placeholder="Contoh: Berlin Sugiyanto" 
                    className="form-input" 
                    style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.08)', color: '#fff', width: '100%', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }} 
                  />
                </div>
                
                <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <label className={styles.fieldLabel} style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>NOMOR WHATSAPP</label>
                  <input 
                    type="tel" 
                    required 
                    value={applyKprPhone} 
                    onChange={(e) => setApplyKprPhone(e.target.value)} 
                    placeholder="Contoh: 081234567890" 
                    className="form-input" 
                    style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.08)', color: '#fff', width: '100%', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }} 
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div className={styles.formGroup} style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                    <label className={styles.fieldLabel} style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>PILIH BANK MITRA</label>
                    <select 
                      value={applyKprBank} 
                      onChange={(e) => setApplyKprBank(e.target.value)}
                      className="form-select" 
                      style={{ background: 'rgba(18,18,18,0.95)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', width: '100%', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      <option value="BCA">Bank BCA</option>
                      <option value="Mandiri">Bank Mandiri</option>
                      <option value="CIMB Niaga">Bank CIMB Niaga</option>
                      <option value="BRI">Bank BRI</option>
                      <option value="BNI">Bank BNI</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup} style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                    <label className={styles.fieldLabel} style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>TENOR SIMULASI</label>
                    <input 
                      type="text" 
                      disabled 
                      value={`${tenureYears} Tahun`} 
                      className="form-input" 
                      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', width: '100%', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }} 
                    />
                  </div>
                </div>

                <div className={styles.quickStatsDetails} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', marginTop: '8px', marginBottom: '8px' }}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Harga Properti</span>
                    <span className={styles.detailValue}>{formatRupiah(propertyPrice)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Uang Muka (DP)</span>
                    <span className={styles.detailValue}>{formatRupiah(dpAmount)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Estimasi Angsuran</span>
                    <span className={styles.detailValue} style={{ color: '#C9A961', fontWeight: 700 }}>{formatRupiah(monthlyInstallment)} / Bln</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={styles.actionSearchPropertiesBtn}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #C9A961 0%, #B8974D 100%)', color: '#000', fontWeight: 700, marginTop: '8px' }}
                >
                  Kirim Pengajuan KPR
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── Premium Glassmorphic Property Detail Modal ─── */}
      {selectedProperty && (() => {
        const imageIndex = getPropertyImageIndex(selectedProperty.id);

        // Generate 5 distinct high-quality images deterministically for each property
        const slideImages = [
          { url: `/property-villa-${imageIndex}.png`, label: 'FASAD DEPAN (FACADE)' },
          { url: '/lobby.png', label: 'LOBI RESEPSIONIS (LOBBY)' },
          { url: `/property-villa-${((imageIndex) % 6) + 1}.png`, label: 'RUANG DALAM (INTERIOR)' },
          { url: `/property-villa-${((imageIndex + 1) % 6) + 1}.png`, label: 'AREA TERBUKA (OUTDOOR)' },
          { url: `/property-villa-${((imageIndex + 2) % 6) + 1}.png`, label: 'AREA DINAMIS & SOSIAL' }
        ];

        const handleNextSlide = () => {
          if (activeSlideIndex === -1) return;
          setActiveSlideIndex((prev) => (prev + 1) % 5);
        };

        const handlePrevSlide = () => {
          if (activeSlideIndex === -1) return;
          setActiveSlideIndex((prev) => (prev - 1 + 5) % 5);
        };

        return (
          <div className={styles.modalBackdrop} onClick={() => {
            setSelectedProperty(null);
            setActiveModalTab('overview');
            setActiveSlideIndex(0);
          }} data-lenis-prevent>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button 
                className={styles.modalCloseBtn} 
                onClick={() => {
                  setSelectedProperty(null);
                  setActiveModalTab('overview');
                  setActiveSlideIndex(0);
                }} 
                aria-label="Tutup Detail"
              >
                ✕
              </button>
              
              <div className={styles.modalGrid}>
                {/* 1. Left Sidebar Navigation Column */}
                <div className={styles.modalSidebarCol}>
                  <button 
                    className={`${styles.sidebarTabBtn} ${activeModalTab === 'overview' ? styles.sidebarTabActive : ''}`}
                    onClick={() => setActiveModalTab('overview')}
                  >
                    <span className={styles.tabNumber}>01</span>
                    <span className={styles.tabLabel}>Overview</span>
                  </button>
                  <button 
                    className={`${styles.sidebarTabBtn} ${activeModalTab === 'gallery' ? styles.sidebarTabActive : ''}`}
                    onClick={() => {
                      setActiveModalTab('gallery');
                      setActiveSlideIndex(0);
                    }}
                  >
                    <span className={styles.tabNumber}>02</span>
                    <span className={styles.tabLabel}>Gallery</span>
                  </button>
                  <button 
                    className={`${styles.sidebarTabBtn} ${activeModalTab === 'floorplan' ? styles.sidebarTabActive : ''}`}
                    onClick={() => setActiveModalTab('floorplan')}
                  >
                    <span className={styles.tabNumber}>03</span>
                    <span className={styles.tabLabel}>Floor Plan</span>
                  </button>
                  <button 
                    className={`${styles.sidebarTabBtn} ${activeModalTab === 'location' ? styles.sidebarTabActive : ''}`}
                    onClick={() => setActiveModalTab('location')}
                  >
                    <span className={styles.tabNumber}>04</span>
                    <span className={styles.tabLabel}>Location</span>
                  </button>
                  <button 
                    className={`${styles.sidebarTabBtn} ${activeModalTab === 'investment' ? styles.sidebarTabActive : ''}`}
                    onClick={() => setActiveModalTab('investment')}
                  >
                    <span className={styles.tabNumber}>05</span>
                    <span className={styles.tabLabel}>Investment</span>
                  </button>
                </div>

                {/* 2. Middle Media Panel Column */}
                <div className={styles.modalMediaCol}>
                  {activeModalTab === 'overview' && (
                    <div className={styles.overviewCoverWrapper}>
                      <img 
                        src={`/property-villa-${imageIndex}.png`} 
                        alt={selectedProperty.namaProperty} 
                        className={styles.overviewCoverImg}
                      />
                    </div>
                  )}

                  {activeModalTab === 'gallery' && (
                    <div className={styles.modalGalleryContainer}>
                      {/* Media Tab Selector */}
                      <div className={styles.modalTabWrapper}>
                        <div className={styles.segmentedControl}>
                          <button 
                            className={`${styles.controlTabBtn} ${activeSlideIndex !== -1 ? styles.controlTabActive : ''}`}
                            onClick={() => setActiveSlideIndex(0)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.tabIconSvg}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            JELAJAH RUANG
                          </button>
                          <button 
                            className={`${styles.controlTabBtn} ${activeSlideIndex === -1 ? styles.controlTabActive : ''}`}
                            onClick={() => setActiveSlideIndex(-1)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.tabIconSvg}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                            TUR SINEMATIK
                            <span className={styles.recordingDot}></span>
                          </button>
                        </div>
                      </div>

                      {activeSlideIndex !== -1 ? (
                        <div className={styles.modalGalleryContainer} style={{ padding: 0, background: 'none', border: 'none', boxShadow: 'none' }}>
                          {/* Active Slide Box (Clean without overlaid type badges) */}
                          <div 
                            className={styles.modalSlider}
                            style={{ backgroundImage: `url(${slideImages[activeSlideIndex].url})` }}
                          >
                            <div className={styles.modalSlideLabel}>
                              <span className={styles.slideDot}>●</span> {slideImages[activeSlideIndex].label}
                            </div>

                            {/* Slide Navigation Arrows */}
                            <button className={`${styles.modalNavBtn} ${styles.modalNavBtnLeft}`} onClick={handlePrevSlide} aria-label="Slide Sebelumnya">
                              ‹
                            </button>
                            <button className={`${styles.modalNavBtn} ${styles.modalNavBtnRight}`} onClick={handleNextSlide} aria-label="Slide Berikutnya">
                              ›
                            </button>

                            {/* Slide counter formatted with leading zero */}
                            <div className={styles.modalSlideCount}>
                              0{activeSlideIndex + 1} / 05
                            </div>
                          </div>

                          {/* Horizontal Scrollable Thumbnails below visual slider */}
                          <div className={styles.modalThumbRow}>
                            {slideImages.map((slide, idx) => (
                              <div 
                                key={idx}
                                className={`${styles.modalThumbWrapper} ${activeSlideIndex === idx ? styles.modalThumbWrapperActive : ''}`}
                                onClick={() => setActiveSlideIndex(idx)}
                              >
                                <img src={slide.url} alt={slide.label} className={styles.modalThumbImg} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Video Walkthrough Player */
                        <div className={styles.modalVideoWrapper}>
                          <div className={styles.modalVideoContainer}>
                            <iframe
                              src="https://www.youtube.com/embed/tPe9n8P6Azo?autoplay=1&mute=1"
                              title="Cinematic Property Tour Video Walkthrough"
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen={true}
                            ></iframe>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeModalTab === 'floorplan' && (
                    <div className={styles.floorPlanVisualWrapper} style={{ height: '100%', minHeight: '350px', display: 'flex', alignItems: 'center' }}>
                      {selectedProperty.tipe === 'VILLA' ? (
                        /* Villa interactive floor plan SVG */
                        <svg viewBox="0 0 600 320" className={styles.floorPlanSvg}>
                          {/* Outer walls */}
                          <rect x="20" y="20" width="560" height="280" rx="10" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                          
                          {/* Swimming pool section */}
                          <g className={styles.planRoom} tabIndex={0}>
                            <rect x="40" y="40" width="220" height="90" rx="6" fill="rgba(0,180,216,0.04)" stroke="rgba(0,180,216,0.2)" strokeWidth="1.5" />
                            <text x="150" y="80" className={styles.planRoomText}>SWIMMING POOL</text>
                            <text x="150" y="100" className={styles.planRoomSize}>9.0 &times; 3.0 m</text>
                          </g>

                          {/* Master Bedroom */}
                          <g className={styles.planRoom} tabIndex={0}>
                            <rect x="280" y="40" width="280" height="110" rx="6" fill="rgba(201,169,97,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                            <text x="420" y="90" className={styles.planRoomText}>MASTER BEDROOM</text>
                            <text x="420" y="110" className={styles.planRoomSize}>6.5 &times; 4.0 m</text>
                          </g>

                          {/* Living Room */}
                          <g className={styles.planRoom} tabIndex={0}>
                            <rect x="40" y="150" width="300" height="130" rx="6" fill="rgba(201,169,97,0.04)" stroke="rgba(201,169,97,0.15)" strokeWidth="1.5" />
                            <text x="190" y="210" className={styles.planRoomTextGold}>LIVING & DINING ROOM</text>
                            <text x="190" y="230" className={styles.planRoomSizeGold}>7.5 &times; 5.0 m</text>
                          </g>

                          {/* Bedroom 2 */}
                          <g className={styles.planRoom} tabIndex={0}>
                            <rect x="360" y="170" width="200" height="110" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                            <text x="460" y="220" className={styles.planRoomText}>GUEST BEDROOM</text>
                            <text x="460" y="240" className={styles.planRoomSize}>4.0 &times; 3.5 m</text>
                          </g>
                        </svg>
                      ) : (
                        /* Ruko interactive floor plan SVG */
                        <svg viewBox="0 0 600 320" className={styles.floorPlanSvg}>
                          {/* Outer walls */}
                          <rect x="120" y="20" width="360" height="280" rx="10" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                          
                          {/* Front Parking / Carport */}
                          <g className={styles.planRoom} tabIndex={0}>
                            <rect x="140" y="40" width="320" height="70" rx="6" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                            <text x="300" y="70" className={styles.planRoomText}>FRONT CARPORT</text>
                            <text x="300" y="90" className={styles.planRoomSize}>8.0 &times; 4.5 m</text>
                          </g>

                          {/* Main Retail Hall */}
                          <g className={styles.planRoom} tabIndex={0}>
                            <rect x="140" y="130" width="320" height="100" rx="6" fill="rgba(201,169,97,0.04)" stroke="rgba(201,169,97,0.15)" strokeWidth="1.5" />
                            <text x="300" y="175" className={styles.planRoomTextGold}>MAIN BUSINESS HALL</text>
                            <text x="300" y="195" className={styles.planRoomSizeGold}>10.0 &times; 4.5 m</text>
                          </g>

                          {/* Toilet */}
                          <g className={styles.planRoom} tabIndex={0}>
                            <rect x="140" y="245" width="100" height="40" rx="4" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                            <text x="190" y="270" className={styles.planRoomText} style={{ fontSize: '9px' }}>TOILET</text>
                          </g>

                          {/* Backyard */}
                          <g className={styles.planRoom} tabIndex={0}>
                            <rect x="260" y="245" width="200" height="40" rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                            <text x="360" y="270" className={styles.planRoomText} style={{ fontSize: '9px' }}>BACKYARD GARDEN</text>
                          </g>
                        </svg>
                      )}
                    </div>
                  )}

                  {activeModalTab === 'location' && (
                    <div className={styles.modalMapIframeContainer} style={{ height: '100%', minHeight: '380px' }}>
                      <iframe
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedProperty.namaProperty + ' ' + parseJsonArray(selectedProperty.kawasan).join(' ') + ' Medan')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0, minHeight: '380px' }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className={styles.modalGoogleMap}
                      ></iframe>
                    </div>
                  )}

                  {activeModalTab === 'investment' && (
                    <div className={styles.investmentChartWrapper}>
                      <div className={styles.investmentVisualCard}>
                        <h4 className={styles.investmentChartTitle}>ESTIMASI KINERJA INVESTASI</h4>
                        <div className={styles.chartPlaceholder}>
                          <svg viewBox="0 0 400 200" className={styles.investmentSvg}>
                            <rect x="10" y="10" width="380" height="180" rx="6" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.05)" />
                            <line x1="40" y1="40" x2="360" y2="40" stroke="rgba(255,255,255,0.03)" />
                            <line x1="40" y1="90" x2="360" y2="90" stroke="rgba(255,255,255,0.03)" />
                            <line x1="40" y1="140" x2="360" y2="140" stroke="rgba(255,255,255,0.03)" />
                            <rect x="60" y="90" width="30" height="70" rx="3" fill="rgba(255,255,255,0.1)" />
                            <rect x="120" y="70" width="30" height="90" rx="3" fill="rgba(255,255,255,0.15)" />
                            <rect x="180" y="50" width="30" height="110" rx="3" fill="rgba(255,255,255,0.2)" />
                            <rect x="240" y="30" width="30" height="130" rx="3" fill="rgba(201,169,97,0.4)" />
                            <rect x="300" y="15" width="30" height="145" rx="3" fill="url(#goldGradient)" />
                            <defs>
                              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#E8D09B" />
                                <stop offset="100%" stopColor="#C9A961" stopOpacity="0.8" />
                              </linearGradient>
                            </defs>
                            <text x="75" y="180" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle">Thn 1</text>
                            <text x="135" y="180" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle">Thn 2</text>
                            <text x="195" y="180" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle">Thn 3</text>
                            <text x="255" y="180" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">Thn 4</text>
                            <text x="315" y="180" fill="#C9A961" fontSize="9" textAnchor="middle" fontWeight="bold">Thn 5</text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Right Information Column */}
                <div className={styles.modalDetailsCol}>
                  {activeModalTab === 'overview' && (
                    <div className={styles.infoColOverview}>
                      <span className={styles.modalKawasan}>{parseJsonArray(selectedProperty.kawasan).join(', ')}</span>
                      <h2 className={styles.modalTitle}>{selectedProperty.namaProperty}</h2>
                      <span className={styles.modalSubtitle}>
                        {selectedProperty.tipe === 'VILLA' ? 'Luxury Residential Property' : 'Luxury Commercial Property'}
                      </span>
                      <div className={styles.ctaAccentBar} style={{ margin: '14px 0', alignSelf: 'flex-start' }}></div>
                      
                      <p className={styles.modalDescText} style={{ margin: '10px 0 20px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                        {selectedProperty.tipe === 'VILLA' 
                          ? 'Villa mewah dengan desain arsitektur modern kontemporer yang menyajikan kenyamanan eksklusif bagi keluarga Anda. Berlokasi di kawasan premium bebas banjir dengan sistem keamanan terpadu.' 
                          : 'Ruko komersial strategis yang sangat cocok untuk kantor bisnis, outlet retail premium, maupun investasi jangka panjang. Memiliki tingkat traffic harian yang sangat tinggi.'}
                      </p>

                      {/* Specifications Grid */}
                      <div className={styles.mockupSpecsGrid}>
                        <div className={styles.mockupSpecItem}>
                          <div className={styles.mockupSpecIconWrapper}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.modalSpecIconSvg}><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                          </div>
                          <div className={styles.mockupSpecMeta}>
                            <span className={styles.mockupSpecLabel}>Dimensi</span>
                            <span className={styles.mockupSpecVal}>{selectedProperty.lebar} &times; {selectedProperty.panjang} m</span>
                          </div>
                        </div>
                        <div className={styles.mockupSpecItem}>
                          <div className={styles.mockupSpecIconWrapper}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.modalSpecIconSvg}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                          </div>
                          <div className={styles.mockupSpecMeta}>
                            <span className={styles.mockupSpecLabel}>Tingkat</span>
                            <span className={styles.mockupSpecVal}>{selectedProperty.tingkat} Lantai</span>
                          </div>
                        </div>
                        <div className={styles.mockupSpecItem}>
                          <div className={styles.mockupSpecIconWrapper}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.modalSpecIconSvg}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                          </div>
                          <div className={styles.mockupSpecMeta}>
                            <span className={styles.mockupSpecLabel}>Hadap</span>
                            <span className={styles.mockupSpecVal}>{parseJsonArray(selectedProperty.hadap).join(', ')}</span>
                          </div>
                        </div>
                        <div className={styles.mockupSpecItem}>
                          <div className={styles.mockupSpecIconWrapper}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.modalSpecIconSvg}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm0 0L20 4l2 2-1.61 1.61"/></svg>
                          </div>
                          <div className={styles.mockupSpecMeta}>
                            <span className={styles.mockupSpecLabel}>Status Unit</span>
                            <span className={styles.mockupSpecVal}>{getSiapLabel(selectedProperty.siap)}</span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Row */}
                      <div className={styles.mockupCtaRow}>
                        <a 
                          href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Prime Property, saya sangat tertarik dengan unit *${selectedProperty.namaProperty}* di kawasan *${parseJsonArray(selectedProperty.kawasan).join(', ')}* yang ditawarkan dengan harga *${formatRupiah(typeof selectedProperty.price === 'string' ? BigInt(selectedProperty.price) : selectedProperty.price)}*. Apakah unit ini masih tersedia untuk jadwal survey lokasi?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.mockupGoldBtn}
                        >
                          Jelajahi Detail <span className={styles.arrowIcon}>→</span>
                        </a>
                        <div className={styles.playVideoCol}>
                          <button 
                            className={styles.playVideoBtn}
                            onClick={() => {
                              setActiveModalTab('gallery');
                              setActiveSlideIndex(-1); // Switch to video walkthrough
                            }}
                            aria-label="Lihat Video"
                          >
                            ▷
                          </button>
                          <span className={styles.playLabel}>Lihat Video</span>
                        </div>
                      </div>

                      {/* PDF Brochure Download Action */}
                      <button
                        disabled={isDownloadingPdf}
                        onClick={() => handleDownloadPdf(selectedProperty)}
                        className={styles.downloadPdfBtn}
                      >
                        {isDownloadingPdf ? (
                          <>
                            <div className={styles.spinnerMini}></div>
                            <span>Menyiapkan Brosur...</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            <span>Unduh E-Brosur PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {activeModalTab === 'gallery' && (
                    <div className={styles.infoColOverview}>
                      <span className={styles.modalKawasan}>{parseJsonArray(selectedProperty.kawasan).join(', ')}</span>
                      <h2 className={styles.modalTitle}>Galeri & Tur Virtual</h2>
                      <span className={styles.modalSubtitle}>Spatial Exploration Showcase</span>
                      <div className={styles.ctaAccentBar} style={{ margin: '14px 0', alignSelf: 'flex-start' }}></div>
                      <p className={styles.modalDescText} style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                        Jelajahi visualisasi mendalam ruko komersial atau villa mewah kami. Anda dapat melihat lobi resepsionis, area interior, luar ruangan, dan eksterior facade secara interaktif.
                      </p>
                      <button 
                        onClick={() => window.print()} 
                        className={styles.modalPrintBtn}
                        style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }}
                      >
                        Cetak Brosur PDF
                      </button>
                    </div>
                  )}

                  {activeModalTab === 'floorplan' && (
                    <div className={styles.infoColOverview}>
                      <span className={styles.modalKawasan}>{parseJsonArray(selectedProperty.kawasan).join(', ')}</span>
                      <h2 className={styles.modalTitle}>Denah Arsitektural</h2>
                      <span className={styles.modalSubtitle}>Precision Spatial Floor Plan</span>
                      <div className={styles.ctaAccentBar} style={{ margin: '14px 0', alignSelf: 'flex-start' }}></div>
                      <p className={styles.modalDescText} style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                        Setiap unit dirancang dengan detail arsitektur modern kontemporer yang efisien. Memiliki sirkulasi udara optimal dan tata ruang fungsional tinggi untuk produktivitas atau hunian.
                      </p>
                      <div className={styles.floorPlanDimensions} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                        <div><strong>Luas Tanah:</strong> {selectedProperty.lebar * selectedProperty.panjang} m²</div>
                        <div><strong>Tipe Bangunan:</strong> {selectedProperty.tipe} ({selectedProperty.tingkat} Lantai)</div>
                      </div>
                    </div>
                  )}

                  {activeModalTab === 'location' && (
                    <div className={styles.infoColOverview}>
                      <span className={styles.modalKawasan}>{parseJsonArray(selectedProperty.kawasan).join(', ')}</span>
                      <h2 className={styles.modalTitle}>Akses & Lokasi</h2>
                      <span className={styles.modalSubtitle}>Strategic Connectivity Hub</span>
                      <div className={styles.ctaAccentBar} style={{ margin: '14px 0', alignSelf: 'flex-start' }}></div>
                      <p className={styles.modalDescText} style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                        Berlokasi di kawasan strategis Medan dengan tingkat aksesibilitas tinggi. Dekat dengan tol bandara, pusat perbelanjaan, sekolah internasional, dan pusat komersial bisnis terpadu.
                      </p>
                      <a 
                        href={selectedProperty.mapsLink || `https://maps.google.com/?q=${encodeURIComponent(selectedProperty.namaProperty + ' Medan')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.modalPrintBtn}
                        style={{ marginTop: '20px', width: '100%', justifyContent: 'center', textAlign: 'center', textDecoration: 'none' }}
                      >
                        Buka di Google Maps 🗺️
                      </a>
                    </div>
                  )}

                  {activeModalTab === 'investment' && (
                    <div className={styles.infoColOverview}>
                      <span className={styles.modalKawasan}>{parseJsonArray(selectedProperty.kawasan).join(', ')}</span>
                      <h2 className={styles.modalTitle}>Analisis Investasi</h2>
                      <span className={styles.modalSubtitle}>Investment Return & Financing</span>
                      <div className={styles.ctaAccentBar} style={{ margin: '14px 0', alignSelf: 'flex-start' }}></div>
                      <p className={styles.modalDescText} style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                        Unit ini memiliki capital gain luar biasa tinggi sebesar 8-12% pertahun dengan potensi yield sewa tahunan berkisar antara 7-9%. Investasi ideal jangka panjang yang sangat solid.
                      </p>
                      <Link 
                        href={`/simulasi-kpr?price=${selectedProperty.price}`}
                        className={styles.modalPrintBtn}
                        style={{ marginTop: '20px', width: '100%', justifyContent: 'center', textAlign: 'center', textDecoration: 'none' }}
                      >
                        Mulai Simulasi KPR 💰
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
