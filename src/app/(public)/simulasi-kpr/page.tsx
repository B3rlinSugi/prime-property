'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import styles from './page.module.css';

export default function PublicKprCalculatorPage() {
  // Input states
  const [propertyPrice, setPropertyPrice] = useState<number>(2000000000); // Rp 2 Miliar default
  const [dpPercent, setDpPercent] = useState<number>(20); // 20% default
  const [interestRate, setInterestRate] = useState<number>(6.5); // 6.5% flat default
  const [tenureYears, setTenureYears] = useState<number>(15); // 15 Tahun default

  // Computed states
  const [dpAmount, setDpAmount] = useState<number>(4000000000);
  const [loanPrincipal, setLoanPrincipal] = useState<number>(1600000000);
  const [monthlyInstallment, setMonthlyInstallment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  // Re-calculate mortgage whenever inputs change
  useEffect(() => {
    const calculatedDp = (propertyPrice * dpPercent) / 100;
    const principal = propertyPrice - calculatedDp;
    setDpAmount(calculatedDp);
    setLoanPrincipal(principal);

    // Monthly interest rate
    const r = (interestRate / 100) / 12;
    // Total number of payment periods (months)
    const n = tenureYears * 12;

    let installment = 0;
    if (r === 0) {
      installment = principal / n;
    } else {
      // Standard Annuity Installment Formula: (P * r * (1+r)^n) / ((1+r)^n - 1)
      installment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const calculatedTotalPayment = installment * n;
    const calculatedTotalInterest = calculatedTotalPayment - principal;

    setMonthlyInstallment(installment);
    setTotalPayment(calculatedTotalPayment);
    setTotalInterest(calculatedTotalInterest);
  }, [propertyPrice, dpPercent, interestRate, tenureYears]);

  // Donut chart calculations
  const principalShare = loanPrincipal || 1;
  const interestShare = totalInterest || 0;
  const totalShare = principalShare + interestShare;
  
  const principalPercent = Math.round((principalShare / totalShare) * 100);
  const interestPercent = Math.round((interestShare / totalShare) * 100);

  // SVG parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // 314.16
  const principalStrokeDash = (principalPercent / 100) * circumference;
  const interestStrokeDash = (interestPercent / 100) * circumference;

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
                  {/* Empty base background ring */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="12" />
                  
                  {/* Principal Share (Gray Column overlay) */}
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

                  {/* Interest Share (Gold accent ring) */}
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

            <Link href="/properti" className={`${styles.actionSearchPropertiesBtn} gold-shimmer`}>
              Cari Unit di Katalog Properti
            </Link>
          </div>
        </div>
      </section>

      {/* Advisory section */}
      <section className={styles.calcAdvisorySection}>
        <div className={styles.advisoryCard}>
          <span className={styles.advisoryIcon}>💡</span>
          <div className={styles.advisoryContent}>
            <h4 className={styles.advisoryTitle}>Catatan Penting Simulasi KPR:</h4>
            <p className={styles.advisoryText}>
              Perhitungan simulasi KPR ini menggunakan metode anuitas bulanan standar dengan suku bunga tetap (flat). Hasil nominal di atas bersifat estimasi kasar/simulasi awal. Suku bunga riil dari institusi perbankan pemberi KPR dapat bervariasi bergantung pada syarat ketentuan, masa promosi, suku bunga floating, serta penilaian kelayakan kredit (BI checking).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
