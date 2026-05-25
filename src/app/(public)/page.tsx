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

// Fallback dummy properties (highly realistic)
const DUMMY_FEATURED: Property[] = [
  {
    id: 'feat-1',
    namaProperty: 'Aston Villas',
    group: 'Mentari',
    lebar: 8,
    panjang: 18,
    hadap: JSON.stringify(['Utara']),
    tipe: 'VILLA',
    tingkat: 2,
    price: '2850000000',
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
    panjang: 15,
    hadap: JSON.stringify(['Selatan']),
    tipe: 'VILLA',
    tingkat: 2,
    price: '1650000000',
    carport: true,
    status: 'IN_STOCK',
    siap: 'SIAP_HUNI',
    mapsLink: 'https://maps.google.com/?q=3.6120,98.6650',
    kawasan: JSON.stringify(['Cemara Asri']),
    unit: 'Gate siap',
  },
  {
    id: 'feat-3',
    namaProperty: 'Griya Mentari Ruko',
    group: 'Mentari',
    lebar: 4.5,
    panjang: 16,
    hadap: JSON.stringify(['Timur']),
    tipe: 'RUKO',
    tingkat: 3,
    price: '1350000000',
    carport: false,
    status: 'IN_STOCK',
    siap: 'SIAP_KOSONG',
    mapsLink: 'https://maps.google.com/?q=3.5850,98.6920',
    kawasan: JSON.stringify(['Pancing']),
    unit: 'Siap Huni',
  },
  {
    id: 'feat-4',
    namaProperty: 'Puri Indah Residence',
    group: 'Project Ville',
    lebar: 10,
    panjang: 20,
    hadap: JSON.stringify(['Barat', 'Utara']),
    tipe: 'VILLA',
    tingkat: 2,
    price: '4200000000',
    carport: true,
    status: 'IN_STOCK',
    siap: 'SIAP_HUNI_RENOVASI',
    mapsLink: 'https://maps.google.com/?q=3.5720,98.6310',
    kawasan: JSON.stringify(['Sunggal']),
    unit: 'Ready Siap huni',
  },
  {
    id: 'feat-5',
    namaProperty: 'Golden Gate Business Loft',
    group: 'Golden Gate',
    lebar: 5,
    panjang: 18,
    hadap: JSON.stringify(['Utara', 'Selatan']),
    tipe: 'RUKO',
    tingkat: 4,
    price: '3100000000',
    carport: true,
    status: 'IN_STOCK',
    siap: 'SIAP_HUNI',
    mapsLink: 'https://maps.google.com/?q=3.5910,98.6790',
    kawasan: JSON.stringify(['Helvetia']),
    unit: 'Gate siap',
  },
  {
    id: 'feat-6',
    namaProperty: 'Griya Mentari Indah',
    group: 'Mentari',
    lebar: 7,
    panjang: 16,
    hadap: JSON.stringify(['Selatan']),
    tipe: 'VILLA',
    tingkat: 1.5,
    price: '1250000000',
    carport: true,
    status: 'IN_STOCK',
    siap: 'SIAP_HUNI',
    mapsLink: null,
    kawasan: JSON.stringify(['Medan Kota']),
    unit: null,
  },
];

export default function Homepage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cursorRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // GSAP SplitText character reveal + custom cursor tracking
  useEffect(() => {
    // 1. Text Animation on Load
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
        stagger: 0.04,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.1,
      });
    }

    // 2. Custom Cursor Tracking (Desktop Only)
    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: 'power2.out',
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useEffect(() => {
    async function fetchFeaturedProperties() {
      try {
        const response = await fetch('/api/properties?featured=true');
        if (response.ok) {
          const json = await response.json();
          if (json && json.data && json.data.length > 0) {
            setProperties(json.data);
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
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

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
    
    const maxTilt = 8;
    const rx = -dy * maxTilt;
    const ry = dx * maxTilt;
    
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
    card.style.boxShadow = `0 16px 36px rgba(201, 169, 97, 0.15), 0 4px 10px rgba(0, 0, 0, 0.05)`;
    card.style.borderColor = `rgba(201, 169, 97, 0.3)`;
    card.style.transition = 'none';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    card.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.03)';
    card.style.borderColor = 'rgba(0, 0, 0, 0.05)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease, border-color 0.5s ease';
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
      {/* Custom Luxury Dot Cursor (Desktop Only) */}
      <div 
        ref={cursorRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          backgroundColor: '#C9A961',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          display: 'none',
        }}
        className="desktop-cursor"
      />

      {/* Hero Section */}
      <section className={styles.hero} onMouseMove={handleHeroMouseMove}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            Est. Prime Property &middot; Bekasi
          </div>
          <h1 ref={headingRef} className={styles.heroHeading}>
            Exclusive Property Intelligence Platform
          </h1>
          <p className={styles.heroSubheading}>
            Portal manajemen properti premium penopang investasi ruko komersial dan hunian villa mewah pilihan dengan spesifikasi teknis unggul dan legalitas bersertifikat.
          </p>
          <div className={styles.heroActions}>
            <a href="#properti-unggulan" className={`${styles.heroCta} gold-shimmer`}>
              Lihat Properti
            </a>
            <Link href="/kontak" className={styles.heroSecondaryCta}>
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="properti-unggulan" className={styles.featured}>
        <div className={`${styles.sectionHeader} reveal`}>
          <h2 className={styles.sectionTitle}>Properti Unggulan</h2>
          <p className={styles.sectionSubtitle}>
            Pilihan unit properti terbaik yang telah dikurasi oleh tim ahli kami
          </p>
        </div>

        {isLoading ? (
          <div className={styles.loadingWrapper}>
            <div className={styles.spinner}></div>
            <p>Memuat properti unggulan...</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {properties.map((property, index) => {
              const hadapArray = parseJsonArray(property.hadap);
              const kawasanArray = parseJsonArray(property.kawasan);

              return (
                <article 
                  key={property.id} 
                  className={`${styles.card} ${index === 0 || index === 4 ? styles.cardWide : ''} reveal`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className={styles.cardImagePlaceholder}>
                    <span className={styles.cardImageText}>
                      {getTipeLabel(property.tipe).toUpperCase()}
                    </span>
                    <div className={styles.cardBadges}>
                      <span className={`badge badge-primary`}>
                        {getTipeLabel(property.tipe)}
                      </span>
                      <span className={`badge ${property.status === 'IN_STOCK' ? 'badge-in-stock' : 'badge-sold-out'}`}>
                        {property.status === 'IN_STOCK' ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{property.namaProperty}</h3>
                      {property.group && (
                        <span className={styles.cardGroup}>{property.group}</span>
                      )}
                    </div>

                    <div className={styles.cardPrice}>
                      {formatRupiah(property.price)}
                    </div>

                    <div className={styles.cardSpecs}>
                      <div className={styles.cardSpecItem}>
                        <span className={styles.cardSpecIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21.3 8.11 15.89 2.7a1 1 0 0 0-1.41 0L2.7 14.48a1 1 0 0 0 0 1.41l5.41 5.41a1 1 0 0 0 1.42 0L21.3 9.52a1 1 0 0 0 0-1.41Z"/>
                            <path d="m5.5 12.5 1 1.1"/>
                            <path d="m8.5 9.5 1 1.1"/>
                            <path d="m11.5 6.5 1 1.1"/>
                            <path d="m14.5 3.5 1 1.1"/>
                          </svg>
                        </span>
                        <span>{property.lebar} &times; {property.panjang} m</span>
                      </div>
                      <div className={styles.cardSpecItem}>
                        <span className={styles.cardSpecIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                            <line x1="9" y1="22" x2="9" y2="16"/>
                            <line x1="15" y1="22" x2="15" y2="16"/>
                            <line x1="9" y1="16" x2="15" y2="16"/>
                            <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M12 6h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/>
                          </svg>
                        </span>
                        <span>{property.tingkat} Lantai</span>
                      </div>
                      <div className={styles.cardSpecItem}>
                        <span className={styles.cardSpecIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"/>
                            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                          </svg>
                        </span>
                        <span>Hadap {hadapArray.join(', ')}</span>
                      </div>
                      <div className={styles.cardSpecItem}>
                        <span className={styles.cardSpecIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                            <circle cx="7" cy="17" r="2"/>
                            <circle cx="17" cy="17" r="2"/>
                            <path d="M13 17H9M21 17H19M5 17H3"/>
                            <path d="M5 10H19"/>
                          </svg>
                        </span>
                        <span>Carport: {property.carport ? 'Ya' : 'Tidak'}</span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.cardKawasan}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', marginRight: '6px', color: '#C9A961', verticalAlign: 'middle' }} aria-hidden="true">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span style={{ verticalAlign: 'middle' }}>{kawasanArray.join(', ')}</span>
                      </div>
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

      {/* Value Proposition Section */}
      <section className={styles.valueProps}>
        <div className={`${styles.sectionHeader} reveal`}>
          <h2 className={styles.sectionTitle}>Mengapa Prime Property</h2>
          <p className={styles.sectionSubtitle}>
            Komitmen kami untuk memberikan standar kualitas tertinggi dalam setiap layanan
          </p>
        </div>

        <div className={styles.valueGrid}>
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <h3 className={styles.valueTitle}>Lokasi Strategis</h3>
            <p className={styles.valueText}>
              Seluruh portofolio properti kami terletak di kawasan-kawasan dengan aksesibilitas tinggi dan nilai pertumbuhan cepat.
            </p>
          </div>

          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 className={styles.valueTitle}>Harga Kompetitif</h3>
            <p className={styles.valueText}>
              Kami memberikan harga terbaik dengan nilai apresiasi aset jangka panjang yang tinggi untuk investasi optimal.
            </p>
          </div>

          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className={styles.valueTitle}>Terpercaya</h3>
            <p className={styles.valueText}>
              Kami telah dipercaya oleh ribuan investor dan keluarga dalam menyediakan aset properti legal dan bermutu tinggi.
            </p>
          </div>

          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </div>
            <h3 className={styles.valueTitle}>Layanan Prima</h3>
            <p className={styles.valueText}>
              Tim sales dan customer service profesional kami siap membimbing Anda dari proses pencarian hingga serah terima kunci.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaBanner}>
        <div className={`${styles.ctaContent} reveal`}>
          <h2 className={styles.ctaTitle}>Siap Menemukan Properti Terbaik?</h2>
          <p className={styles.ctaSubtitle}>
            Tim penasihat properti profesional kami siap membantu Anda memilih unit ruko atau villa yang paling sesuai dengan kebutuhan Anda.
          </p>
          <Link href="/kontak" className={`${styles.ctaBtn} gold-shimmer`}>
            Hubungi Kami
          </Link>
        </div>
      </section>
    </div>
  );
}
