'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import styles from './page.module.css';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { generatePropertyBrochure } from '@/lib/pdfGenerator';

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
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'gallery' | 'floorplan' | 'location' | 'investment'>('overview');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
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
              <span className={styles.heroHeadingLine1}>Hunian Eksklusif untuk</span>
              <span className={styles.heroHeadingLine2}>Gaya Hidup Modern</span>
            </h1>
            <p className={styles.heroSubheading}>
              Temukan properti premium yang dikurasi khusus untuk kenyamanan dan investasi masa depan Anda.
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
              src="/luxury-villa-hd-4k.png" 
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
          <h2 className={styles.sectionTitle}>
            Mengapa <span className={styles.titleGold}>Prime Property</span>?
          </h2>
          <div className={styles.titleDivider}></div>
          <p className={styles.sectionSubtitle}>
            Komitmen kami untuk memberikan standar kualitas tertinggi dalam setiap layanan
          </p>
        </div>

        <div className={styles.valueGrid}>
          {/* Proposition 1: Data Akurat & Terpercaya */}
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueImageWrapper}>
              <img 
                src="/why_us_accuracy.png" 
                alt="Data Akurat & Terpercaya" 
                className={styles.valueCardImage}
              />
            </div>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 11 11 13 15 9" />
              </svg>
            </div>
            <div className={styles.valueTextWrapper}>
              <h3 className={styles.valueTitle}>Data Akurat & Terpercaya</h3>
              <p className={styles.valueText}>
                Informasi diverifikasi dan selalu diperbarui.
              </p>
            </div>
          </div>

          {/* Proposition 2: Inventory Premium */}
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueImageWrapper}>
              <img 
                src="/why_us_premium.png" 
                alt="Inventory Premium" 
                className={styles.valueCardImage}
              />
            </div>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                <polyline points="12 22 12 12" />
                <line x1="12" y1="12" x2="22" y2="8.5" />
                <line x1="12" y1="12" x2="2" y2="8.5" />
              </svg>
            </div>
            <div className={styles.valueTextWrapper}>
              <h3 className={styles.valueTitle}>Inventory Premium</h3>
              <p className={styles.valueText}>
                Koleksi unit premium di lokasi strategis.
              </p>
            </div>
          </div>

          {/* Proposition 3: Manajemen Mudah */}
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueImageWrapper}>
              <img 
                src="/why_us_management.png" 
                alt="Manajemen Mudah" 
                className={styles.valueCardImage}
              />
            </div>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <path d="M3 20h18" />
                <polyline points="12 4 18 10" />
              </svg>
            </div>
            <div className={styles.valueTextWrapper}>
              <h3 className={styles.valueTitle}>Manajemen Mudah</h3>
              <p className={styles.valueText}>
                Kelola, filter, dan lacak dengan mudah.
              </p>
            </div>
          </div>

          {/* Proposition 4: Keamanan Terjamin */}
          <div className={`${styles.valueCard} reveal`}>
            <div className={styles.valueImageWrapper}>
              <img 
                src="/why_us_security.png" 
                alt="Keamanan Terjamin" 
                className={styles.valueCardImage}
              />
            </div>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.iconSvg}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className={styles.valueTextWrapper}>
              <h3 className={styles.valueTitle}>Keamanan Terjamin</h3>
              <p className={styles.valueText}>
                Keamanan berlapis dan terstruktur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaBanner}>
        {/* Subtle blended background living room image */}
        <div className={styles.ctaVisualContainer}>
          <img 
            src="/cta_luxury_living.png" 
            alt="Luxury Living Room" 
            className={styles.ctaVisual} 
          />
        </div>

        <div className={`${styles.ctaContent} reveal`}>
          <div className={styles.ctaAccentBar}></div>
          <h2 className={styles.ctaTitle}>
            Siap Menemukan Properti <span className={styles.titleGold}>Terbaik?</span>
          </h2>
          <p className={styles.ctaSubtitle}>
            Hubungi tim konsultan properti profesional kami untuk membantu Anda menemukan properti impian Anda.
          </p>
          <Link href="/kontak" className={styles.ctaBtn}>
            Hubungi Kami <span className={styles.ctaBtnArrow}>&rarr;</span>
          </Link>
        </div>

        {/* Horizontal light glow divider */}
        <div className={styles.ctaDividerGlow}></div>

        {/* 3 Symmetrical features listed below with dividers */}
        <div className={`${styles.ctaFeaturesRow} reveal`}>
          <div className={styles.ctaFeatureItem}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.ctaFeatureIcon}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className={styles.ctaFeatureText}>Terpercaya</span>
          </div>
          
          <div className={styles.ctaFeatureDivider}></div>

          <div className={styles.ctaFeatureItem}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.ctaFeatureIcon}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span className={styles.ctaFeatureText}>Profesional</span>
          </div>

          <div className={styles.ctaFeatureDivider}></div>

          <div className={styles.ctaFeatureItem}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={styles.ctaFeatureIcon}>
              <circle cx="12" cy="8" r="7"/>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>
            <span className={styles.ctaFeatureText}>Berpengalaman</span>
          </div>
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
                            <rect x="260" y="245" width="200" height="40" rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
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
                          href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Prime Property, saya sangat tertarik dengan unit *${selectedProperty.namaProperty}* di kawasan *${parseJsonArray(selectedProperty.kawasan).join(', ')}* yang ditawarkan dengan harga *${formatRupiah(selectedProperty.price)}*. Apakah unit ini masih tersedia untuk jadwal survey lokasi?`)}`}
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

