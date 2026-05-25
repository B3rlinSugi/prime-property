'use client';

import { useEffect } from 'react';
import styles from './page.module.css';

export default function TentangKamiPage() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* ─── Hero / Profil Section ─── */}
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>
          {/* Left: Brand Intro */}
          <div className={`${styles.heroContent} reveal`}>
            <span className={styles.heroLabel}>Tentang Kami</span>
            <h1 className={styles.heroTitle}>
              Membangun Nilai, <br />
              Mewujudkan <span className={styles.goldText}>Hunian</span> <br />
              <span className={styles.goldText}>Berkualitas</span>
            </h1>
            <p className={styles.heroDescription}>
              Prime Property hadir sebagai solusi pengelolaan properti premium dengan standar profesional, transparan, dan terpercaya.
            </p>
          </div>

          {/* Right: Luxury Villa Photo Mockup */}
          <div className={`${styles.heroVisual} reveal`}>
            <div className={styles.visualWrapper}>
              <img 
                src="/property-villa.png" 
                alt="Luxury Modern Villa Architecture" 
                className={styles.visualImg} 
              />
              <div className={styles.visualGlow}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Row Grid ─── */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {/* Card 1 */}
          <div className={`${styles.statCard} reveal`}>
            <div className={styles.statIconWrapper}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className={styles.statVal}>5+</div>
            <h3 className={styles.statTitle}>Tahun Pengalaman</h3>
            <p className={styles.statDesc}>Berpengalaman dalam pengelolaan properti premium.</p>
          </div>

          {/* Card 2 */}
          <div className={`${styles.statCard} reveal`}>
            <div className={styles.statIconWrapper}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className={styles.statVal}>1000+</div>
            <h3 className={styles.statTitle}>Properti Dikelola</h3>
            <p className={styles.statDesc}>Ruko, villa, dan properti premium di berbagai kawasan.</p>
          </div>

          {/* Card 3 */}
          <div className={`${styles.statCard} reveal`}>
            <div className={styles.statIconWrapper}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className={styles.statVal}>500+</div>
            <h3 className={styles.statTitle}>Klien Terpercaya</h3>
            <p className={styles.statDesc}>Dipercaya oleh investor dan pemilik properti.</p>
          </div>

          {/* Card 4 */}
          <div className={`${styles.statCard} reveal`}>
            <div className={styles.statIconWrapper}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                <line x1="12" y1="22" x2="12" y2="12" />
                <line x1="12" y1="12" x2="22" y2="8.5" />
                <line x1="12" y1="12" x2="2" y2="8.5" />
              </svg>
            </div>
            <div className={styles.statVal}>100%</div>
            <h3 className={styles.statTitle}>Komitmen Kualitas</h3>
            <p className={styles.statDesc}>Mengutamakan kepuasan klien dan nilai jangka panjang.</p>
          </div>
        </div>
      </section>

      {/* ─── Visi & Misi Section ─── */}
      <section className={styles.visiMisiSection}>
        <div className={styles.visiMisiHeader}>
          <h2 className={`${styles.sectionTitle} reveal`}>Visi & Misi</h2>
        </div>
        <div className={styles.visiMisiGrid}>
          {/* Left Cards */}
          <div className={styles.visiMisiLeft}>
            {/* Visi */}
            <div className={`${styles.visiCard} reveal`}>
              <div className={styles.cardHeaderRow}>
                <div className={styles.cardIconCircle}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <h3 className={styles.cardTitle}>Visi Kami</h3>
              </div>
              <p className={styles.cardText}>
                Menjadi perusahaan pengelola properti terdepan yang memberikan nilai tambah berkelanjutan dan menjadi mitra terpercaya dalam setiap langkah investasi properti.
              </p>
            </div>

            {/* Misi */}
            <div className={`${styles.misiCard} reveal`}>
              <div className={styles.cardHeaderRow}>
                <div className={styles.cardIconCircle}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <h3 className={styles.cardTitle}>Misi Kami</h3>
              </div>
              <ul className={styles.misiList}>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  <span>Menyediakan informasi properti yang akurat dan terpercaya.</span>
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  <span>Memberikan layanan profesional dengan integritas tinggi.</span>
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  <span>Meningkatkan nilai investasi properti klien secara berkesinambungan.</span>
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  <span>Membangun hubungan jangka panjang berdasarkan kepercayaan.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Lobby Photo */}
          <div className={`${styles.visiMisiRight} reveal`}>
            <div className={styles.lobbyImageWrapper}>
              <img 
                src="/lobby.png" 
                alt="Prime Property Corporate Office Lobby Reception" 
                className={styles.lobbyImg} 
              />
              <div className={styles.lobbyGlowOverlay}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Nilai Perusahaan Section ─── */}
      <section className={styles.valuesSection}>
        <div className={styles.valuesHeader}>
          <h2 className={`${styles.sectionTitle} reveal`}>Nilai Perusahaan Kami</h2>
        </div>
        <div className={styles.valuesGrid}>
          {/* Card 1 */}
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueIconCircle}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className={styles.valueTitle}>Integritas</h3>
            <p className={styles.valueText}>
              Berkomitmen untuk selalu jujur, transparan, dan dapat diandalkan.
            </p>
          </div>

          {/* Card 2 */}
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueIconCircle}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h3 className={styles.valueTitle}>Profesionalisme</h3>
            <p className={styles.valueText}>
              Bekerja dengan standar tertinggi dan berorientasi pada hasil.
            </p>
          </div>

          {/* Card 3 */}
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueIconCircle}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h3 className={styles.valueTitle}>Inovasi</h3>
            <p className={styles.valueText}>
              Terus berinovasi dalam teknologi dan strategi pengelolaan properti.
            </p>
          </div>

          {/* Card 4 */}
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueIconCircle}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className={styles.valueTitle}>Kolaborasi</h3>
            <p className={styles.valueText}>
              Membangun sinergi untuk menciptakan nilai yang lebih besar.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer Quote Banner Section ─── */}
      <section className={styles.quoteSection}>
        <div className={styles.quoteBg}></div>
        <div className={`${styles.quoteContent} reveal`}>
          <blockquote className={styles.blockquoteText}>
            &ldquo; Properti bukan hanya tentang bangunan, <br />
            tetapi tentang <span className={styles.goldText}>nilai, kepercayaan, dan masa depan.</span> &rdquo;
          </blockquote>
          <cite className={styles.quoteAuthor}>— Prime Property</cite>
        </div>
      </section>
    </div>
  );
}
