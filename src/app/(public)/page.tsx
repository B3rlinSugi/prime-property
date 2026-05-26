'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import styles from './page.module.css';
import { SkeletonCard } from '@/components/ui/Skeleton';

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

// Deterministic image mapper to prevent invalid indices (e.g. /property-villa-0.png)
const getPropertyImageIndex = (propertyId: string): number => {
  if (propertyId.startsWith('feat-')) {
    const num = parseInt(propertyId.split('-')[1], 10);
    if (!isNaN(num)) return ((num - 1) % 6) + 1;
  }
  let hash = 0;
  for (let i = 0; i < propertyId.length; i++) {
    hash = propertyId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 6) + 1;
};

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
    namaProperty: 'Banyan Tree (Blok A)',
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
    namaProperty: 'Permai 123',
    group: 'Permai 123',
    lebar: 5,
    panjang: 17,
    hadap: JSON.stringify(['Barat']),
    tipe: 'VILLA',
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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'gallery' | 'video'>('gallery');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // GSAP line-level reveal animation
  useEffect(() => {
    if (headingRef.current) {
      const lines = headingRef.current.querySelectorAll('span');
      gsap.fromTo(lines, 
        { opacity: 0, y: 32 }, 
        { opacity: 1, y: 0, stagger: 0.2, duration: 1, ease: 'power4.out', delay: 0.1 }
      );
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

  // Lock background scroll when modal is open to prevent double scrollbar behavior
  useEffect(() => {
    if (selectedProperty) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProperty]);

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
      {/* Hero Section — Cinematic 3D Orbit Swirling Villa */}
      <section className={styles.hero} onMouseMove={handleHeroMouseMove}>
        {/* Swirling glow grid mesh background */}
        <div className={styles.gridMesh}></div>
        <div className={styles.heroContent}>
          {/* Left Column: Headline details */}
          <div className={styles.heroText}>
            <div className={styles.heroWelcome}>
              Welcome to Prime Property
            </div>
            <h1 ref={headingRef} className={styles.heroHeading}>
              <span className={styles.heroHeadingLine1}>Exclusive Property</span>
              <span className={styles.heroHeadingLine2}>Intelligence Platform</span>
            </h1>
            <p className={styles.heroSubheading}>
              Kelola inventory properti premium dengan cepat, presisi, dan elegan. Semua data dalam satu platform.
            </p>
            <div className={styles.heroActions}>
              <a href="#properti-unggulan" className={`${styles.heroCta} gold-shimmer`}>
                Lihat Properti <span className={styles.ctaArrow}>→</span>
              </a>
              <Link href="/kontak" className={styles.heroSecondaryCta}>
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Breathtaking Cinematic Modern Villa */}
        <div className={styles.heroVisual}>
          <div className={styles.visualContainer}>
            {/* Modern Dark Luxury Villa Image */}
            <img 
              src="/luxury-villa.png" 
              alt="Luxury Modern Villa Architecture" 
              className={styles.visualImg} 
            />
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="properti-unggulan" className={styles.featured}>
        <div className={`${styles.sectionHeader} reveal`}>
          <div>
            <h2 className={styles.sectionTitle}>PROPERTI UNGGULAN</h2>
            <p className={styles.sectionSubtitle}>
              Pilihan properti terbaik dengan lokasi strategis dan nilai investasi tinggi.
            </p>
          </div>
          <Link href="/properti" className={styles.sectionLink}>
            Lihat Semua <span className={styles.sectionLinkArrow}>➔</span>
          </Link>
        </div>

        {isLoading ? (
          <div className={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className={styles.grid}>
            {(properties.length > 0 ? properties : DUMMY_FEATURED).map((property, idx) => {
              const hadapArray = parseJsonArray(property.hadap);
              const kawasanArray = parseJsonArray(property.kawasan);
              const imageIndex = getPropertyImageIndex(property.id);
              const imageUrl = `/property-villa-${imageIndex}.png`;

              return (
                <article 
                  key={property.id} 
                  className={`${styles.card} reveal`}
                  onClick={() => setSelectedProperty(property)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Property Visual Box utilizing generated listing photo placeholder */}
                  <div 
                    className={styles.cardImagePlaceholder}
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  >
                    <div className={styles.cardBadges}>
                      <span className={property.status === 'IN_STOCK' ? styles.cardBadgeInStock : styles.cardBadgeSoldOut}>
                        {property.status === 'IN_STOCK' ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>

                    {/* Image wishlist overlay heart */}
                    <button 
                      className={styles.wishlistBtnImg} 
                      aria-label="Save Property"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`${property.namaProperty} ditambahkan ke wishlist!`);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.heartIcon}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                  </div>

                  {/* Card Data Content */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitleRow}>
                      <h3 className={styles.cardTitle}>{property.namaProperty}</h3>
                      <button 
                        className={styles.wishlistBtnTitle} 
                        aria-label="Favorite"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`${property.namaProperty} difavoritkan!`);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.heartIconSmall}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </button>
                    </div>

                    <div className={styles.cardKawasan}>
                      {kawasanArray.join(', ')}
                    </div>

                    <div className={styles.cardPrice}>
                      {formatRupiah(property.price)}
                    </div>

                    {/* Symmetrical specification footer details aligned left & right */}
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
          setActiveSlideIndex((prev) => (prev + 1) % 5);
        };

        const handlePrevSlide = () => {
          setActiveSlideIndex((prev) => (prev - 1 + 5) % 5);
        };

        return (
          <div className={styles.modalBackdrop} onClick={() => {
            setSelectedProperty(null);
            setActiveModalTab('gallery');
            setActiveSlideIndex(0);
          }}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button 
                className={styles.modalCloseBtn} 
                onClick={() => {
                  setSelectedProperty(null);
                  setActiveModalTab('gallery');
                  setActiveSlideIndex(0);
                }} 
                aria-label="Tutup Detail"
              >
                ✕
              </button>
              
              <div className={styles.modalGrid}>
                {/* Left Column: Media Gallery / Video Walkthrough & Location Map */}
                <div className={styles.modalVisualCol}>
                  {/* Media Tab Selector */}
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

                  {/* Media Display Block */}
                  {activeModalTab === 'gallery' ? (
                    <div className={styles.modalGalleryContainer}>
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

                  {/* Real Google Map styled Dark for this Property */}
                  <div className={styles.modalMapWrapper}>
                    <h4 className={styles.modalMapTitle}>Lokasi Properti</h4>
                    <div className={styles.modalMapIframeContainer}>
                      <iframe
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedProperty.namaProperty + ' ' + parseJsonArray(selectedProperty.kawasan).join(' ') + ' Medan')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className={styles.modalGoogleMap}
                      ></iframe>
                    </div>
                  </div>
                </div>

                {/* Right Column: Key Details & Actions */}
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
                    <div className={styles.modalPrice}>{formatRupiah(selectedProperty.price)}</div>
                  </div>

                  {/* High-fidelity horizontal specifications cards with custom gold SVGs */}
                  <div className={styles.modalSpecsGrid}>
                    {/* Dimension Spec */}
                    <div className={styles.modalSpecCard}>
                      <div className={styles.modalSpecIconWrapper}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.modalSpecIconSvg}><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                      </div>
                      <div className={styles.modalSpecMeta}>
                        <span className={styles.modalSpecLabel}>DIMENSI</span>
                        <span className={styles.modalSpecVal}>{selectedProperty.lebar} &times; {selectedProperty.panjang} m</span>
                      </div>
                    </div>

                    {/* Level/Floor Spec */}
                    <div className={styles.modalSpecCard}>
                      <div className={styles.modalSpecIconWrapper}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.modalSpecIconSvg}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                      </div>
                      <div className={styles.modalSpecMeta}>
                        <span className={styles.modalSpecLabel}>TINGKAT</span>
                        <span className={styles.modalSpecVal}>{selectedProperty.tingkat} Lantai</span>
                      </div>
                    </div>

                    {/* Facing Direction Spec */}
                    <div className={styles.modalSpecCard}>
                      <div className={styles.modalSpecIconWrapper}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.modalSpecIconSvg}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                      </div>
                      <div className={styles.modalSpecMeta}>
                        <span className={styles.modalSpecLabel}>HADAP</span>
                        <span className={styles.modalSpecVal}>{parseJsonArray(selectedProperty.hadap).join(', ')}</span>
                      </div>
                    </div>

                    {/* Carport Spec */}
                    <div className={styles.modalSpecCard}>
                      <div className={styles.modalSpecIconWrapper}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.modalSpecIconSvg}><rect x="1" y="3" width="22" height="13" rx="2" ry="2"/><polyline points="2 21 4 21 4 16 20 16 20 21 22 21"/><path d="M5 9h14M8 6h8"/></svg>
                      </div>
                      <div className={styles.modalSpecMeta}>
                        <span className={styles.modalSpecLabel}>CARPORT</span>
                        <span className={styles.modalSpecVal}>{selectedProperty.carport ? 'Tersedia' : 'Tidak Ada'}</span>
                      </div>
                    </div>

                    {/* Readiness Spec */}
                    <div className={styles.modalSpecCard}>
                      <div className={styles.modalSpecIconWrapper}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.modalSpecIconSvg}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm0 0L20 4l2 2-1.61 1.61"/></svg>
                      </div>
                      <div className={styles.modalSpecMeta}>
                        <span className={styles.modalSpecLabel}>STATUS UNIT</span>
                        <span className={styles.modalSpecVal}>{getSiapLabel(selectedProperty.siap)}</span>
                      </div>
                    </div>

                    {/* Additional Info Spec */}
                    <div className={styles.modalSpecCard}>
                      <div className={styles.modalSpecIconWrapper}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.modalSpecIconSvg}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                      </div>
                      <div className={styles.modalSpecMeta}>
                        <span className={styles.modalSpecLabel}>INFO TAMBAHAN</span>
                        <span className={styles.modalSpecVal}>{selectedProperty.unit || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className={styles.modalDescSection}>
                    <h4 className={styles.modalSectionSub}>Deskripsi Properti</h4>
                    <p className={styles.modalDescText}>
                      {selectedProperty.tipe === 'VILLA' 
                        ? 'Villa mewah dengan desain arsitektur modern kontemporer yang menyajikan kenyamanan eksklusif bagi keluarga Anda. Berlokasi di kawasan premium bebas banjir dengan sistem keamanan terpadu 24 jam dan akses langsung ke fasilitas utama kota. Hunian ideal dengan tata ruang yang lapang, sirkulasi udara sejuk, serta pencahayaan alami optimal untuk kualitas hidup premium.' 
                        : 'Ruko komersial strategis yang sangat cocok untuk kantor bisnis, outlet retail premium, maupun investasi jangka panjang. Memiliki tingkat traffic harian yang sangat tinggi, area parkir luas untuk kenyamanan pelanggan, serta berada di pusat pertumbuhan ekonomi utama kota dengan potensi capital gain yang luar biasa berkembang.'}
                    </p>
                  </div>

                  {/* WhatsApp Action Button */}
                  <a 
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Prime Property, saya sangat tertarik dengan unit *${selectedProperty.namaProperty}* di kawasan *${parseJsonArray(selectedProperty.kawasan).join(', ')}* yang ditawarkan dengan harga *${formatRupiah(selectedProperty.price)}*. Apakah unit ini masih tersedia untuk jadwal survey lokasi?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.modalWaBtn} gold-shimmer`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.modalWaIconSvg}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
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

