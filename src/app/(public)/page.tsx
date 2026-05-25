'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import styles from './page.module.css';

interface Property {
  id: string;
  namaProperty: string;
  group: string | null;
  lebar: number;
  panjang: number;
  hadap: string; // JSON string
  tipe: string; // RUKO or VILLA
  tingkat: number;
  price: string | number;
  carport: boolean;
  status: string; // IN_STOCK or SOLD_OUT
  siap: string;
  mapsLink: string | null;
  kawasan: string; // JSON string
  unit: string | null;
}

// Fallback dummy properties (highly realistic, matching screenshot data)
const DUMMY_FEATURED: Property[] = [
  {
    id: 'feat-1',
    namaProperty: 'Aston Villas',
    group: 'Mentari',
    lebar: 4.5,
    panjang: 21.5,
    hadap: JSON.stringify(['Utara']),
    tipe: 'VILLA',
    tingkat: 2,
    price: '1350000000',
    carport: true,
    status: 'IN_STOCK',
    siap: 'SIAP_HUNI',
    mapsLink: 'https://maps.google.com/?q=3.5952,98.6722',
    kawasan: JSON.stringify(['Krakatau']),
    unit: 'Ready Siap huni',
  },
  {
    id: 'feat-2',
    namaProperty: 'Banyan Tree Blok A',
    group: 'Permai 123',
    lebar: 6,
    panjang: 20,
    hadap: JSON.stringify(['Selatan']),
    tipe: 'VILLA',
    tingkat: 2,
    price: '2750000000',
    carport: true,
    status: 'IN_STOCK',
    siap: 'SIAP_HUNI',
    mapsLink: 'https://maps.google.com/?q=3.6120,98.6650',
    kawasan: JSON.stringify(['Pancing']),
    unit: 'Gate siap',
  },
  {
    id: 'feat-3',
    namaProperty: 'Mentari Residence',
    group: 'Mentari',
    lebar: 4,
    panjang: 17,
    hadap: JSON.stringify(['Timur']),
    tipe: 'RUKO',
    tingkat: 1,
    price: '950000000',
    carport: false,
    status: 'SOLD_OUT',
    siap: 'SIAP_KOSONG',
    mapsLink: 'https://maps.google.com/?q=3.5850,98.6920',
    kawasan: JSON.stringify(['Tembung']),
    unit: 'Siap Huni',
  },
  {
    id: 'feat-4',
    namaProperty: 'Permai Square',
    group: 'Permai 123',
    lebar: 5,
    panjang: 18,
    hadap: JSON.stringify(['Barat']),
    tipe: 'RUKO',
    tingkat: 2.5,
    price: '1850000000',
    carport: true,
    status: 'IN_STOCK',
    siap: 'SIAP_HUNI',
    mapsLink: 'https://maps.google.com/?q=3.5720,98.6310',
    kawasan: JSON.stringify(['Helvetia']),
    unit: 'Ready Siap huni',
  },
  {
    id: 'feat-5',
    namaProperty: 'Cemara Asri',
    group: 'Cemara Asri',
    lebar: 4.25,
    panjang: 16,
    hadap: JSON.stringify(['Utara']),
    tipe: 'VILLA',
    tingkat: 2,
    price: '1250000000',
    carport: true,
    status: 'IN_STOCK',
    siap: 'SIAP_KOSONG',
    mapsLink: 'https://maps.google.com/?q=3.5910,98.6790',
    kawasan: JSON.stringify(['Kuala']),
    unit: 'Gate siap',
  },
  {
    id: 'feat-6',
    namaProperty: 'Project Ville',
    group: 'Project Ville',
    lebar: 6,
    panjang: 25,
    hadap: JSON.stringify(['Selatan']),
    tipe: 'VILLA',
    tingkat: 3.5,
    price: '3250000000',
    carport: true,
    status: 'SOLD_OUT',
    siap: 'SIAP_HUNI',
    mapsLink: null,
    kawasan: JSON.stringify(['Krakatau']),
    unit: null,
  },
];

export default function Homepage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // GSAP SplitText character reveal
  useEffect(() => {
    if (headingRef.current) {
      const text = headingRef.current.innerText;
      headingRef.current.innerHTML = '';
      
      const chars = text.split('').map((char) => {
        const span = document.createElement('span');
        span.innerText = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(24px) rotate(4deg)';
        headingRef.current?.appendChild(span);
        return span;
      });

      gsap.to(chars, {
        opacity: 1,
        y: 0,
        rotation: 0,
        stagger: 0.03,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.1,
      });
    }
  }, []);

  useEffect(() => {
    async function fetchFeaturedProperties() {
      try {
        const response = await fetch('/api/properties?featured=true');
        if (response.ok) {
          const json = await response.json();
          if (json && json.data && json.data.length > 0) {
            setProperties(json.data.slice(0, 6));
          } else {
            setProperties(DUMMY_FEATURED);
          }
        } else {
          setProperties(DUMMY_FEATURED);
        }
      } catch (err) {
        console.error('Failed to fetch properties:', err);
        setProperties(DUMMY_FEATURED);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeaturedProperties();
  }, []);

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
  }, [properties, isLoading]);

  // Formatting helpers
  const formatRupiah = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseInt(amount, 10) : amount;
    if (isNaN(num)) return 'Rp 0';
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  const getTipeLabel = (tipe: string) => {
    return tipe === 'RUKO' ? 'Ruko' : 'Villa';
  };

  const getSiapLabel = (siap: string) => {
    switch (siap) {
      case 'SIAP_HUNI':
        return 'Siap Huni';
      case 'SIAP_KOSONG':
        return 'Siap Kosong';
      case 'SIAP_HUNI_RENOVASI':
        return 'Siap Huni Renovasi';
      default:
        return siap;
    }
  };

  const parseJsonArray = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = (x - xc) / xc;
    const dy = (y - yc) / yc;
    
    const maxTilt = 5;
    const rx = -dy * maxTilt;
    const ry = dx * maxTilt;
    
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    card.style.boxShadow = `0 12px 30px rgba(201, 169, 97, 0.12), 0 4px 10px rgba(0, 0, 0, 0.3)`;
    card.style.borderColor = `rgba(201, 169, 97, 0.25)`;
    card.style.transition = 'none';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    card.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    card.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease, border-color 0.4s ease';
  };

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const hero = e.currentTarget;
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hero.style.setProperty('--mouse-x', `${x}px`);
    hero.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className={styles.container}>
      {/* Hero Section — Split Screen 2 Columns with 3D Dashboard Preview */}
      <section className={styles.hero} onMouseMove={handleHeroMouseMove}>
        <div className={styles.heroContent}>
          {/* Left Column: Headline details */}
          <div className={styles.heroText}>
            <div className={styles.heroWelcome}>
              Welcome to Prime Property
            </div>
            <h1 ref={headingRef} className={styles.heroHeading}>
              Exclusive Property Intelligence Platform
            </h1>
            <p className={styles.heroSubheading}>
              Kelola inventory premium dengan cepat, presisi, dan elegan.
            </p>
            <div className={styles.heroActions}>
              <a href="#properti-unggulan" className={`${styles.heroCta} gold-shimmer`}>
                Explore Properties <span className={styles.ctaArrow}>→</span>
              </a>
              <Link href="/agent/login" className={styles.heroSecondaryCta}>
                Login Agent
              </Link>
            </div>
          </div>

          {/* Right Column: Next-Gen 3D Floating Dashboard Preview */}
          <div className={styles.heroVisual}>
            <div className={styles.dashboardContainer}>
              {/* Radial glow background mesh */}
              <div className={styles.dashboardGlow}></div>
              
              {/* Main OS Panel */}
              <div className={styles.mainDashboardPanel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelDots}>
                    <span className={styles.dotRed}></span>
                    <span className={styles.dotYellow}></span>
                    <span className={styles.dotGreen}></span>
                  </div>
                  <div className={styles.panelTitle}>Prime Property OS</div>
                  <div className={styles.panelBadge}>✦ LIVE</div>
                </div>
                <div className={styles.panelBody}>
                  {/* Grid layout within the panel */}
                  <div className={styles.miniStats}>
                    <div className={styles.miniStatCard}>
                      <span className={styles.miniStatLabel}>Portfolio Value</span>
                      <span className={styles.miniStatValue}>Rp 148.5B</span>
                      <span className={styles.miniStatTrend}>+12.4%</span>
                    </div>
                    <div className={styles.miniStatCard}>
                      <span className={styles.miniStatLabel}>Active Listings</span>
                      <span className={styles.miniStatValue}>42 Units</span>
                      <span className={styles.miniStatTrend} style={{ color: '#4CAF50' }}>92% Stock</span>
                    </div>
                  </div>
                  
                  {/* SVG mini chart showing growth curve */}
                  <div className={styles.miniChartContainer}>
                    <svg className={styles.miniChart} viewBox="0 0 200 60">
                      <defs>
                        <linearGradient id="goldGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C9A961" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M0,50 Q30,20 60,35 T120,15 T180,25 L200,10 L200,60 L0,60 Z" 
                        fill="url(#goldGlow)"
                      />
                      <path 
                        d="M0,50 Q30,20 60,35 T120,15 T180,25 L200,10" 
                        fill="none" 
                        stroke="#C9A961" 
                        strokeWidth="2.5" 
                      />
                      <circle cx="200" cy="10" r="4" fill="#C9A961" className={styles.pulsingDot} />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Floating Property Card 1 (Aston Villas mockup overlay) */}
              <div className={`${styles.floatingCard} ${styles.floatCard1}`}>
                <div className={styles.floatingCardImg} style={{ backgroundImage: 'url(/property-villa.png)' }}></div>
                <div className={styles.floatingCardInfo}>
                  <span className={styles.floatingCardTitle}>Aston Villas</span>
                  <span className={styles.floatingCardPrice}>Rp 1.35B</span>
                  <div className={styles.floatingCardSpec}>
                    <span>📐 4.5 &times; 21.5 m</span>
                  </div>
                </div>
              </div>

              {/* Floating Property Card 2 (Yield Score Intelligence Overlay) */}
              <div className={`${styles.floatingCard} ${styles.floatCard2}`}>
                <div className={styles.intelligenceIcon}>✦</div>
                <div>
                  <div className={styles.intelligenceTitle}>Intelligence Score</div>
                  <div className={styles.intelligenceRating}>AAA Premium Investment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Bento Grid Section */}
      <section id="properti-unggulan" className={styles.featured}>
        <div className={`${styles.sectionHeader} reveal`}>
          <h2 className={styles.sectionTitle}>Featured Properties</h2>
          <p className={styles.sectionSubtitle}>
            Premium assets curated for private consultants and elite investment portfolios
          </p>
        </div>

        {isLoading ? (
          <div className={styles.loadingWrapper}>
            <div className="spinner"></div>
            <p>Memuat properti unggulan...</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {properties.map((property, idx) => {
              const hadapArray = parseJsonArray(property.hadap);
              const kawasanArray = parseJsonArray(property.kawasan);
              
              // Symmetrical yet dynamic Bento grid classifications
              const bentoClass = 
                idx === 0 
                  ? `${styles.card} ${styles.bentoWide} reveal` 
                  : idx === 3 
                  ? `${styles.card} ${styles.bentoTall} reveal` 
                  : `${styles.card} ${styles.bentoStandard} reveal`;

              return (
                <article 
                  key={property.id} 
                  className={bentoClass}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Property Visual Box utilizing generated listing photo placeholder */}
                  <div 
                    className={styles.cardImagePlaceholder}
                    style={{ backgroundImage: 'url(/property-villa.png)' }}
                  >
                    <div className={styles.cardBadges}>
                      <span className={`badge ${
                        property.status === 'IN_STOCK' 
                          ? 'badge-in-stock' 
                          : 'badge-sold-out'
                      }`}>
                        {property.status === 'IN_STOCK' ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>
                  </div>

                  {/* Card Data Content */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{property.namaProperty}</h3>
                      {property.group && (
                        <span className={styles.cardGroup}>{property.group}</span>
                      )}
                    </div>
                    
                    <div className={styles.cardKawasan}>
                      {kawasanArray.join(', ')}
                    </div>

                    <div className={styles.cardPrice}>
                      {formatRupiah(property.price)}
                    </div>

                    {/* Symmetrical specification footer details */}
                    <div className={styles.cardSpecs}>
                      <div className={styles.cardSpecItem}>
                        <span className={styles.cardSpecIcon}>📐</span>
                        <span>{property.lebar} &times; {property.panjang} m</span>
                      </div>
                      <div className={styles.cardSpecItem}>
                        <span className={styles.cardSpecIcon}>🏢</span>
                        <span>{property.tingkat} Lt</span>
                      </div>
                      <div className={styles.cardSpecItem}>
                        <span className={styles.cardSpecIcon}>🧭</span>
                        <span>Hadap {hadapArray.join(', ')}</span>
                      </div>
                      <div className={styles.cardSpecItem}>
                        <span className={styles.cardSpecIcon}>🚗</span>
                        <span>Carport {property.carport ? '✓' : '—'}</span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={`badge ${
                        property.siap === 'SIAP_HUNI' 
                          ? 'badge-siap-huni' 
                          : property.siap === 'SIAP_KOSONG' 
                          ? 'badge-siap-kosong' 
                          : 'badge-siap-renovasi'
                      }`}>
                        {getSiapLabel(property.siap)}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section className={styles.valueProps}>
        <div className={`${styles.sectionHeader} reveal`}>
          <h2 className={styles.sectionTitle}>Mengapa Prime Property?</h2>
          <p className={styles.sectionSubtitle}>
            Komitmen kami untuk memberikan standar kualitas tertinggi dalam setiap layanan
          </p>
        </div>

        <div className={styles.valueGrid}>
          {/* Proposition 1 */}
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className={styles.valueTitle}>Data Akurat & Terpercaya</h3>
            <p className={styles.valueText}>
              Semua informasi properti diverifikasi secara ketat dan selalu diperbarui untuk menjamin legalitas aset.
            </p>
          </div>

          {/* Proposition 2 */}
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" /><polyline points="12 22 12 12" /><line x1="12" y1="12" x2="22" y2="8.5" /><line x1="12" y1="12" x2="2" y2="8.5" /></svg>
            </div>
            <h3 className={styles.valueTitle}>Inventory Premium</h3>
            <p className={styles.valueText}>
              Koleksi unit ruko komersial dan villa mewah pilihan di lokasi-lokasi paling strategis dengan capital gain tinggi.
            </p>
          </div>

          {/* Proposition 3 */}
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
            </div>
            <h3 className={styles.valueTitle}>Manajemen Mudah</h3>
            <p className={styles.valueText}>
              Portal platform agen internal yang intuitif untuk mengelola, menyaring, dan melacak seluruh data listing properti.
            </p>
          </div>

          {/* Proposition 4 */}
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <h3 className={styles.valueTitle}>Keamanan Terjamin</h3>
            <p className={styles.valueText}>
              Sistem keamanan berlapis, database-backed limiter, audit log security, dan otorisasi role terenskripsi.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaBanner}>
        <div className={`${styles.ctaContent} reveal`}>
          <h2 className={styles.ctaTitle}>Siap Menemukan Properti Terbaik?</h2>
          <p className={styles.ctaSubtitle}>
            Hubungi tim konsultan properti profesional kami untuk memilih unit ruko komersial atau villa premium impian Anda.
          </p>
          <Link href="/kontak" className={`${styles.ctaBtn} gold-shimmer`}>
            Hubungi Kami
          </Link>
        </div>
      </section>
    </div>
  );
}
