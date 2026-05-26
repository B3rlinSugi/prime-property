'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import styles from './page.module.css';

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
  const [activeModalTab, setActiveModalTab] = useState<'gallery' | 'video'>('gallery');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

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
    if (selectedProperty || showBudgetModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProperty, showBudgetModal]);

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

            <button
              onClick={() => setShowBudgetModal(true)}
              className={styles.actionSearchPropertiesBtn}
            >
              Cari Unit Sesuai Budget KPR
            </button>
          </div>
        </div>
      </section>

      {/* Jadwal Amortisasi KPR Section */}
      {amortizationSchedule.length > 0 && (
        <section className={styles.amortizationSection}>
          <div className={styles.amortizationCard}>
            <div className={styles.amortizationHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 className={styles.amortizationTitle}>📈 Jadwal Amortisasi KPR Tahunan</h3>
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

      {/* Glassmorphic Property Detail Modal overlay (Directly on KPR page) */}
      {selectedProperty && (() => {
        const imageIndex = getPropertyImageIndex(selectedProperty.id);
        const slideImages = [
          { url: `/property-villa-${imageIndex}.png`, label: 'FASAD DEPAN (FACADE)' },
          { url: '/lobby.png', label: 'LOBI RESEPSIONIS (LOBBY)' },
          { url: `/property-villa-${((imageIndex) % 6) + 1}.png`, label: 'RUANG DALAM (INTERIOR)' },
          { url: `/property-villa-${((imageIndex + 1) % 6) + 1}.png`, label: 'AREA TERBUKA (OUTDOOR)' },
          { url: `/property-villa-${((imageIndex + 2) % 6) + 1}.png`, label: 'AREA DINAMIS & SOSIAL' }
        ];

        return (
          <div className={styles.modalBackdrop} onClick={() => setSelectedProperty(null)} data-lenis-prevent>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.modalCloseBtn} onClick={() => setSelectedProperty(null)}>
                ✕
              </button>

              <div className={styles.modalGrid}>
                {/* Media Showcase */}
                <div className={styles.modalVisualCol}>
                  <div className={styles.modalTabWrapper}>
                    <div className={styles.segmentedControl}>
                      <button 
                        className={`${styles.controlTabBtn} ${activeModalTab === 'gallery' ? styles.controlTabActive : ''}`}
                        onClick={() => setActiveModalTab('gallery')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.tabIconSvg}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        JELAJAH RUANG
                      </button>
                      <button 
                        className={`${styles.controlTabBtn} ${activeModalTab === 'video' ? styles.controlTabActive : ''}`}
                        onClick={() => {
                          setActiveModalTab('video');
                          setActiveSlideIndex(0);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.tabIconSvg}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                        TUR SINEMATIK
                        <span className={styles.recordingDot}></span>
                      </button>
                    </div>
                  </div>

                  {activeModalTab === 'gallery' ? (
                    <div className={styles.modalGalleryContainer}>
                      <div 
                        className={styles.modalSlider}
                        style={{ backgroundImage: `url(${slideImages[activeSlideIndex].url})` }}
                      >
                        <div className={styles.modalSlideLabel}>
                          <span className={styles.slideDot}>●</span> {slideImages[activeSlideIndex].label}
                        </div>
                        <button className={`${styles.modalNavBtn} ${styles.modalNavBtnLeft}`} onClick={() => setActiveSlideIndex((prev) => (prev - 1 + 5) % 5)}>
                          ‹
                        </button>
                        <button className={`${styles.modalNavBtn} ${styles.modalNavBtnRight}`} onClick={() => setActiveSlideIndex((prev) => (prev + 1) % 5)}>
                          ›
                        </button>
                        <div className={styles.modalSlideCount}>
                          0{activeSlideIndex + 1} / 05
                        </div>
                      </div>

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
                    <div className={styles.modalVideoContainer}>
                      <iframe
                        src="https://www.youtube.com/embed/tPe9n8P6Azo?autoplay=1&mute=1"
                        title="Cinematic Property Tour Video Walkthrough"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  {/* Location Map */}
                  <div className={styles.modalMapWrapper}>
                    <h4 className={styles.modalMapTitle}>Lokasi Properti</h4>
                    <div className={styles.modalMapIframeContainer}>
                      <iframe
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedProperty.namaProperty + ' ' + parseJsonArray(selectedProperty.kawasan).join(' ') + ' Medan')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className={styles.modalGoogleMap}
                      ></iframe>
                    </div>
                  </div>
                </div>

                {/* Details Meta */}
                <div className={styles.modalDetailsCol}>
                  <div className={styles.modalHeaderSec}>
                    <div className={styles.modalHeaderTop}>
                      <div className={styles.modalHeaderLeftGroup}>
                        <span className={styles.modalKawasan}>{parseJsonArray(selectedProperty.kawasan).join(', ')}</span>
                        <div className={styles.modalBadges}>
                          <span className={selectedProperty.status === 'IN_STOCK' ? styles.modalBadgeInStock : styles.modalBadgeSoldOut}>
                            {selectedProperty.status === 'IN_STOCK' ? 'In Stock' : 'Sold Out'}
                          </span>
                          <span className={styles.modalBadgeType}>
                            {getTipeLabel(selectedProperty.tipe)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h2 className={styles.modalTitle}>{selectedProperty.namaProperty}</h2>
                    <div className={styles.modalPrice}>
                      {formatRupiah(typeof selectedProperty.price === 'string' ? BigInt(selectedProperty.price) : selectedProperty.price)}
                    </div>
                  </div>

                  <div className={styles.modalSpecsGrid}>
                    <div className={styles.modalSpecCard}>
                      <span className={styles.specIcon}>📐</span>
                      <div className={styles.modalSpecMeta}>
                        <span className={styles.modalSpecLabel}>DIMENSI</span>
                        <span className={styles.modalSpecVal}>{selectedProperty.lebar} &times; {selectedProperty.panjang} m</span>
                      </div>
                    </div>
                    <div className={styles.modalSpecCard}>
                      <span className={styles.specIcon}>🏢</span>
                      <div className={styles.modalSpecMeta}>
                        <span className={styles.modalSpecLabel}>TINGKAT</span>
                        <span className={styles.modalSpecVal}>{selectedProperty.tingkat} Lantai</span>
                      </div>
                    </div>
                    <div className={styles.modalSpecCard}>
                      <span className={styles.specIcon}>🧭</span>
                      <div className={styles.modalSpecMeta}>
                        <span className={styles.modalSpecLabel}>HADAP</span>
                        <span className={styles.modalSpecVal}>{parseJsonArray(selectedProperty.hadap).join(', ')}</span>
                      </div>
                    </div>
                    <div className={styles.modalSpecCard}>
                      <span className={styles.specIcon}>🚗</span>
                      <div className={styles.modalSpecMeta}>
                        <span className={styles.modalSpecLabel}>CARPORT</span>
                        <span className={styles.modalSpecVal}>{selectedProperty.carport ? 'Tersedia' : 'Tidak Ada'}</span>
                      </div>
                    </div>
                    <div className={styles.modalSpecCard}>
                      <span className={styles.specIcon}>🔑</span>
                      <div className={styles.modalSpecMeta}>
                        <span className={styles.modalSpecLabel}>STATUS UNIT</span>
                        <span className={styles.modalSpecVal}>{getSiapLabel(selectedProperty.siap)}</span>
                      </div>
                    </div>
                    <div className={styles.modalSpecCard}>
                      <span className={styles.specIcon}>ℹ️</span>
                      <div className={styles.modalSpecMeta}>
                        <span className={styles.modalSpecLabel}>INFO TAMBAHAN</span>
                        <span className={styles.modalSpecVal}>{selectedProperty.unit || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.modalDescSection}>
                    <h4 className={styles.modalSectionSub}>Deskripsi Properti</h4>
                    <p className={styles.modalDescText}>
                      {selectedProperty.tipe === 'VILLA' 
                        ? 'Villa mewah dengan desain arsitektur modern kontemporer yang menyajikan kenyamanan eksklusif bagi keluarga Anda. Berlokasi di kawasan premium bebas banjir dengan sistem keamanan terpadu 24 jam dan akses langsung ke fasilitas utama kota.'
                        : 'Ruko komersial strategis yang sangat cocok untuk kantor bisnis, outlet retail premium, maupun investasi jangka panjang. Memiliki tingkat traffic harian yang sangat tinggi dan area parkir luas.'}
                    </p>
                  </div>

                  <a 
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Prime Property, saya sangat tertarik dengan unit *${selectedProperty.namaProperty}* di kawasan *${parseJsonArray(selectedProperty.kawasan).join(', ')}* yang ditawarkan dengan harga *${formatRupiah(typeof selectedProperty.price === 'string' ? BigInt(selectedProperty.price) : selectedProperty.price)}*. Apakah unit ini masih tersedia untuk jadwal survey lokasi?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.modalWaBtn} gold-shimmer`}
                  >
                    Hubungi Agen via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
