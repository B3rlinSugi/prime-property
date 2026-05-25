'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroDecorativeLine}></div>
          <h1 className={styles.heroHeading}>
            Temukan Properti<br />
            <span className={styles.heroHeadingAccent}>Impian Anda</span>
          </h1>
          <p className={styles.heroSubheading}>
            Prime Property menghadirkan pilihan ruko dan villa premium di lokasi-lokasi paling berkembang dan strategis untuk investasi dan tempat tinggal masa depan Anda.
          </p>
          <a href="#properti-unggulan" className={styles.heroCta}>
            Lihat Properti
          </a>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="properti-unggulan" className={styles.featured}>
        <div className={styles.sectionHeader}>
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
            {properties.map((property) => {
              const hadapArray = parseJsonArray(property.hadap);
              const kawasanArray = parseJsonArray(property.kawasan);

              return (
                <article key={property.id} className={styles.card}>
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
                        <span className={styles.cardSpecIcon}>📐</span>
                        <span>{property.lebar} &times; {property.panjang} m</span>
                      </div>
                      <div className={styles.cardSpecItem}>
                        <span className={styles.cardSpecIcon}>🏢</span>
                        <span>{property.tingkat} Lantai</span>
                      </div>
                      <div className={styles.cardSpecItem}>
                        <span className={styles.cardSpecIcon}>🧭</span>
                        <span>Hadap {hadapArray.join(', ')}</span>
                      </div>
                      <div className={styles.cardSpecItem}>
                        <span className={styles.cardSpecIcon}>🚗</span>
                        <span>Carport: {property.carport ? 'Ya' : 'Tidak'}</span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.cardKawasan}>
                        📍 {kawasanArray.join(', ')}
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
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Mengapa Prime Property</h2>
          <p className={styles.sectionSubtitle}>
            Komitmen kami untuk memberikan standar kualitas tertinggi dalam setiap layanan
          </p>
        </div>

        <div className={styles.valueGrid}>
          <div className={styles.valueCard}>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <h3 className={styles.valueTitle}>Lokasi Strategis</h3>
            <p className={styles.valueText}>
              Seluruh portofolio properti kami terletak di kawasan-kawasan dengan aksesibilitas tinggi dan nilai pertumbuhan cepat.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 className={styles.valueTitle}>Harga Kompetitif</h3>
            <p className={styles.valueText}>
              Kami memberikan harga terbaik dengan nilai apresiasi aset jangka panjang yang tinggi untuk investasi optimal.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className={styles.valueTitle}>Terpercaya</h3>
            <p className={styles.valueText}>
              Kami telah dipercaya oleh ribuan investor dan keluarga dalam menyediakan aset properti legal dan bermutu tinggi.
            </p>
          </div>

          <div className={styles.valueCard}>
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
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Siap Menemukan Properti Terbaik?</h2>
          <p className={styles.ctaSubtitle}>
            Tim penasihat properti profesional kami siap membantu Anda memilih unit ruko atau villa yang paling sesuai dengan kebutuhan Anda.
          </p>
          <Link href="/kontak" className={styles.ctaBtn}>
            Hubungi Kami
          </Link>
        </div>
      </section>
    </div>
  );
}
