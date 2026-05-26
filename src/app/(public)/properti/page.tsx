'use client';

import { useState, useEffect, useRef } from 'react';
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

export default function PublicPropertiCatalogPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL'); // ALL, VILLA, RUKO
  const [selectedKawasan, setSelectedKawasan] = useState('ALL'); // ALL, Krakatau, Pancing, etc.
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // ALL, IN_STOCK, SOLD_OUT
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);

  // Dropdown Toggles
  const [typeOpen, setTypeOpen] = useState(false);
  const [kawasanOpen, setKawasanOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  // Dropdown Refs (for closing on click outside)
  const typeRef = useRef<HTMLDivElement>(null);
  const kawasanRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Property Comparison State
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [compareDrawerOpen, setCompareDrawerOpen] = useState(false);

  // Modal Detail State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'gallery' | 'video'>('gallery');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Image load tracking
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Fetch properties
  useEffect(() => {
    async function fetchAllProperties() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/properties?limit=100');
        if (res.ok) {
          const json = await res.json();
          setProperties(json.data || []);
          setFilteredProperties(json.data || []);
        }
      } catch (err) {
        console.error('Error fetching properties catalog:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllProperties();
  }, []);

  // Parse budget parameter from KPR simulation URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const budgetParam = searchParams.get('budget');
    if (budgetParam) {
      const budgetVal = parseInt(budgetParam, 10);
      if (!isNaN(budgetVal) && budgetVal > 0) {
        setBudgetFilter(budgetVal);
      }
    }
  }, []);

  // Close dropdowns on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setTypeOpen(false);
      }
      if (kawasanRef.current && !kawasanRef.current.contains(event.target as Node)) {
        setKawasanOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...properties];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.namaProperty.toLowerCase().includes(q) ||
          (p.group && p.group.toLowerCase().includes(q))
      );
    }

    if (selectedType !== 'ALL') {
      result = result.filter((p) => p.tipe === selectedType);
    }

    if (selectedKawasan !== 'ALL') {
      result = result.filter((p) => {
        const kawasans = parseJsonArray(p.kawasan);
        return kawasans.some((k) => k.toLowerCase() === selectedKawasan.toLowerCase());
      });
    }

    if (selectedStatus !== 'ALL') {
      result = result.filter((p) => p.status === selectedStatus);
    }

    if (budgetFilter) {
      result = result.filter((p) => {
        const priceNum = typeof p.price === 'string' ? parseInt(p.price, 10) : Number(p.price);
        return priceNum <= budgetFilter;
      });
    }

    setFilteredProperties(result);
  }, [search, selectedType, selectedKawasan, selectedStatus, budgetFilter, properties]);

  // Scroll Lock Helper
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

  // Parse JSON Helper
  function parseJsonArray(jsonStr: string): string[] {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }

  // Map deterministic images based on Property ID
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

  // Handle image load tracking
  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Compare properties trigger
  const toggleCompare = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    
    const exists = compareList.find((p) => p.id === property.id);
    if (exists) {
      setCompareList((prev) => prev.filter((p) => p.id !== property.id));
    } else {
      if (compareList.length >= 3) {
        alert('Anda hanya dapat membandingkan maksimal 3 properti sekaligus.');
        return;
      }
      setCompareList((prev) => [...prev, property]);
      setCompareDrawerOpen(true);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Editorial Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroLinesGrid}>
          <div className={styles.lineVertical} style={{ left: '25%' }}></div>
          <div className={styles.lineVertical} style={{ left: '75%' }}></div>
        </div>
        <div className={styles.heroContent}>
          <span className={styles.topBadge}>PORTFOLIO UNIT</span>
          <h1 className={styles.editorialTitle}>
            Jelajahi Listing <span>Properti Premium</span>
          </h1>
          <p className={styles.editorialSubtitle}>
            Menyajikan koleksi lengkap unit ruko komersial strategis dan villa mewah impian Anda di kawasan utama terkurasi.
          </p>
        </div>
      </section>

      {/* Filter Controls Panel (With Premium Custom Dropdowns) */}
      <section className={styles.controlsSection}>
        <div className={styles.controlsPanel}>
          {/* Search Box */}
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Cari nama properti atau grup..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch('')}>
                ✕
              </button>
            )}
          </div>

          {/* Premium Custom Type Dropdown */}
          <div className={styles.customSelectWrapper} ref={typeRef}>
            <label className={styles.filterLabel}>TIPE</label>
            <div 
              className={styles.customSelectTrigger} 
              onClick={() => {
                setTypeOpen(!typeOpen);
                setKawasanOpen(false);
                setStatusOpen(false);
              }}
            >
              <span>{selectedType === 'ALL' ? 'Semua Tipe' : selectedType === 'VILLA' ? 'Villa Premium' : 'Ruko Komersial'}</span>
              <span className={`${styles.selectArrow} ${typeOpen ? styles.arrowRotate : ''}`}>▾</span>
            </div>
            {typeOpen && (
              <ul className={styles.customOptionsList} data-lenis-prevent>
                <li 
                  className={selectedType === 'ALL' ? styles.optionActive : ''}
                  onClick={() => { setSelectedType('ALL'); setTypeOpen(false); }}
                >
                  Semua Tipe
                </li>
                <li 
                  className={selectedType === 'VILLA' ? styles.optionActive : ''}
                  onClick={() => { setSelectedType('VILLA'); setTypeOpen(false); }}
                >
                  Villa Premium
                </li>
                <li 
                  className={selectedType === 'RUKO' ? styles.optionActive : ''}
                  onClick={() => { setSelectedType('RUKO'); setTypeOpen(false); }}
                >
                  Ruko Komersial
                </li>
              </ul>
            )}
          </div>

          {/* Premium Custom Kawasan Dropdown */}
          <div className={styles.customSelectWrapper} ref={kawasanRef}>
            <label className={styles.filterLabel}>KAWASAN</label>
            <div 
              className={styles.customSelectTrigger} 
              onClick={() => {
                setKawasanOpen(!kawasanOpen);
                setTypeOpen(false);
                setStatusOpen(false);
              }}
            >
              <span>{selectedKawasan === 'ALL' ? 'Semua Wilayah' : selectedKawasan}</span>
              <span className={`${styles.selectArrow} ${kawasanOpen ? styles.arrowRotate : ''}`}>▾</span>
            </div>
            {kawasanOpen && (
              <ul className={styles.customOptionsList} data-lenis-prevent>
                {['ALL', 'Krakatau', 'Pancing', 'Helvetia', 'Cemara Asri', 'Sunggal', 'Tembung'].map((kaw) => (
                  <li 
                    key={kaw}
                    className={selectedKawasan === kaw ? styles.optionActive : ''}
                    onClick={() => { setSelectedKawasan(kaw); setKawasanOpen(false); }}
                  >
                    {kaw === 'ALL' ? 'Semua Wilayah' : kaw}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Premium Custom Status Dropdown */}
          <div className={styles.customSelectWrapper} ref={statusRef}>
            <label className={styles.filterLabel}>STATUS</label>
            <div 
              className={styles.customSelectTrigger} 
              onClick={() => {
                setStatusOpen(!statusOpen);
                setTypeOpen(false);
                setKawasanOpen(false);
              }}
            >
              <span>{selectedStatus === 'ALL' ? 'Semua Status' : selectedStatus === 'IN_STOCK' ? 'Tersedia' : 'Terjual'}</span>
              <span className={`${styles.selectArrow} ${statusOpen ? styles.arrowRotate : ''}`}>▾</span>
            </div>
            {statusOpen && (
              <ul className={styles.customOptionsList} data-lenis-prevent>
                <li 
                  className={selectedStatus === 'ALL' ? styles.optionActive : ''}
                  onClick={() => { setSelectedStatus('ALL'); setStatusOpen(false); }}
                >
                  Semua Status
                </li>
                <li 
                  className={selectedStatus === 'IN_STOCK' ? styles.optionActive : ''}
                  onClick={() => { setSelectedStatus('IN_STOCK'); setStatusOpen(false); }}
                >
                  Tersedia
                </li>
                <li 
                  className={selectedStatus === 'SOLD_OUT' ? styles.optionActive : ''}
                  onClick={() => { setSelectedStatus('SOLD_OUT'); setStatusOpen(false); }}
                >
                  Terjual
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Dynamic Golden Active KPR Budget Tag */}
        {budgetFilter && (
          <div className={styles.activeBudgetBadgeWrapper}>
            <div className={styles.activeBudgetBadge}>
              <span className={styles.badgeLabel}>⚡ BUDGET KPR AKTIF</span>
              <span className={styles.badgeVal}>Maksimal {formatRupiah(budgetFilter)}</span>
              <button 
                className={styles.clearBudgetBtn} 
                onClick={() => {
                  setBudgetFilter(null);
                  // Remove budget from URL query params
                  window.history.pushState({}, '', window.location.pathname);
                }}
                title="Hapus filter budget"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Main Grid Catalog */}
      <section className={styles.gridSection}>
        {isLoading ? (
          /* High-Fidelity Skeletons */
          <div className={styles.catalogGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonTextTitle} />
                <div className={styles.skeletonTextSub} />
                <div className={styles.skeletonTextPrice} />
                <div className={styles.skeletonSpecs} />
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          /* Custom budget-specific Empty State */
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>💰</span>
            <h3 className={styles.emptyTitle}>
              {budgetFilter ? 'Melebihi Budget Anda' : 'Properti Tidak Ditemukan'}
            </h3>
            <p className={styles.emptyText}>
              {budgetFilter 
                ? `Tidak ada properti premium kami yang memiliki harga di bawah ${formatRupiah(budgetFilter)} saat ini. Silakan naikkan budget KPR Anda atau cari tipe unit lain.`
                : 'Tidak ada ruko atau villa yang cocok dengan pencarian dan filter aktif Anda saat ini.'
              }
            </p>
            <div className={styles.emptyActionsRow}>
              {budgetFilter && (
                <button 
                  className={styles.resetFiltersBtn} 
                  onClick={() => {
                    setBudgetFilter(null);
                    window.history.pushState({}, '', window.location.pathname);
                  }}
                >
                  Hapus Filter Budget KPR
                </button>
              )}
              <button
                className={`${styles.resetFiltersBtn} ${styles.outlineBtn}`}
                onClick={() => {
                  setSearch('');
                  setSelectedType('ALL');
                  setSelectedKawasan('ALL');
                  setSelectedStatus('ALL');
                }}
              >
                Reset Filter Lainnya
              </button>
            </div>
          </div>
        ) : (
          /* Symmetrical Cards Grid with optimized smooth image loaders */
          <div className={styles.catalogGrid}>
            {filteredProperties.map((property) => {
              const imageIndex = getPropertyImageIndex(property.id);
              const kawasanArray = parseJsonArray(property.kawasan);
              const isComparing = !!compareList.find((p) => p.id === property.id);
              
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
                  {/* Real Image tag styled with dark placeholder and fade-in loaded class */}
                  <div className={styles.cardImageContainer}>
                    <img 
                      src={`/property-villa-${imageIndex}.png`} 
                      alt={property.namaProperty} 
                      className={`${styles.cardImageTag} ${loadedImages[property.id] ? styles.imageLoaded : ''}`}
                      onLoad={() => handleImageLoad(property.id)}
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

                    {/* Compare Selection Overlay */}
                    <button
                      className={`${styles.compareSelectBtn} ${isComparing ? styles.compareActive : ''}`}
                      onClick={(e) => toggleCompare(e, property)}
                      title="Bandingkan properti ini"
                    >
                      {isComparing ? '✓ Terpilih' : '+ Bandingkan'}
                    </button>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{property.namaProperty}</h3>
                      <button
                        className={styles.wishlistBtn}
                        aria-label="Favorite"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`${property.namaProperty} ditambahkan ke favorit!`);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.heartIcon}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </button>
                    </div>

                    <div className={styles.cardKawasan}>{kawasanArray.join(', ')}</div>
                    <div className={styles.cardPrice}>{formatRupiah(typeof property.price === 'string' ? BigInt(property.price) : property.price)}</div>

                    <div className={styles.cardSpecs}>
                      <div className={styles.cardSpecItem}>
                        <span className={styles.cardSpecIcon}>📐</span>
                        <span>{property.lebar} &times; {property.panjang} m</span>
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

      {/* ─── Compare Properties Drawer ─── */}
      {compareList.length > 0 && compareDrawerOpen && (
        <div className={styles.compareDrawer}>
          <div className={styles.drawerHeader}>
            <div className={styles.drawerTitleCol}>
              <h4 className={styles.drawerTitle}>Bandingkan Unit Properti</h4>
              <span className={styles.drawerCount}>{compareList.length} dari 3 unit terpilih</span>
            </div>
            <div className={styles.drawerActions}>
              <button 
                className={styles.clearAllCompareBtn}
                onClick={() => setCompareList([])}
              >
                Hapus Semua
              </button>
              <button 
                className={styles.closeDrawerBtn}
                onClick={() => setCompareDrawerOpen(false)}
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div className={styles.compareGridWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th className={styles.specLabelCell}>METRIK BANDING</th>
                  {compareList.map((item) => (
                    <th key={item.id} className={styles.compareHeaderCell}>
                      <div className={styles.compareHeaderMeta}>
                        <img 
                          src={`/property-villa-${getPropertyImageIndex(item.id)}.png`}
                          alt={item.namaProperty}
                          className={styles.compareMetaImg}
                        />
                        <span className={styles.compareMetaTitle}>{item.namaProperty}</span>
                        <button 
                          className={styles.removeCompareItemBtn}
                          onClick={() => setCompareList((prev) => prev.filter((p) => p.id !== item.id))}
                        >
                          Hapus
                        </button>
                      </div>
                    </th>
                  ))}
                  {compareList.length < 3 && (
                    <th className={styles.comparePlaceholderCell}>
                      <div className={styles.placeholderBox}>
                        <span>+ Tambah unit lain</span>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.specLabelCell}>HARGA UNIT</td>
                  {compareList.map((item) => (
                    <td key={item.id} className={styles.specValueCellGold}>
                      {formatRupiah(typeof item.price === 'string' ? BigInt(item.price) : item.price)}
                    </td>
                  ))}
                  {compareList.length < 3 && <td>-</td>}
                </tr>
                <tr>
                  <td className={styles.specLabelCell}>TIPE PROPERTI</td>
                  {compareList.map((item) => (
                    <td key={item.id} className={styles.specValueCell}>
                      {getTipeLabel(item.tipe)}
                    </td>
                  ))}
                  {compareList.length < 3 && <td>-</td>}
                </tr>
                <tr>
                  <td className={styles.specLabelCell}>DIMENSI UNIT</td>
                  {compareList.map((item) => (
                    <td key={item.id} className={styles.specValueCell}>
                      {item.lebar} &times; {item.panjang} meter
                    </td>
                  ))}
                  {compareList.length < 3 && <td>-</td>}
                </tr>
                <tr>
                  <td className={styles.specLabelCell}>TINGKAT LANTAI</td>
                  {compareList.map((item) => (
                    <td key={item.id} className={styles.specValueCell}>
                      {item.tingkat} Lantai
                    </td>
                  ))}
                  {compareList.length < 3 && <td>-</td>}
                </tr>
                <tr>
                  <td className={styles.specLabelCell}>ARAH HADAP</td>
                  {compareList.map((item) => (
                    <td key={item.id} className={styles.specValueCell}>
                      {parseJsonArray(item.hadap).join(', ')}
                    </td>
                  ))}
                  {compareList.length < 3 && <td>-</td>}
                </tr>
                <tr>
                  <td className={styles.specLabelCell}>CARPORT</td>
                  {compareList.map((item) => (
                    <td key={item.id} className={styles.specValueCell}>
                      {item.carport ? 'Tersedia' : 'Tidak Ada'}
                    </td>
                  ))}
                  {compareList.length < 3 && <td>-</td>}
                </tr>
                <tr>
                  <td className={styles.specLabelCell}>KAWASAN / WILAYAH</td>
                  {compareList.map((item) => (
                    <td key={item.id} className={styles.specValueCell}>
                      {parseJsonArray(item.kawasan).join(', ')}
                    </td>
                  ))}
                  {compareList.length < 3 && <td>-</td>}
                </tr>
                <tr>
                  <td className={styles.specLabelCell}>KESIAPAN HUNI</td>
                  {compareList.map((item) => (
                    <td key={item.id} className={styles.specValueCell}>
                      {getSiapLabel(item.siap)}
                    </td>
                  ))}
                  {compareList.length < 3 && <td>-</td>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating comparison drawer toggle button */}
      {compareList.length > 0 && !compareDrawerOpen && (
        <button 
          className={styles.compareFloatingToggle}
          onClick={() => setCompareDrawerOpen(true)}
        >
          ⚖ Bandingkan Unit ({compareList.length})
        </button>
      )}

      {/* Glassmorphic Property Detail Modal overlay */}
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
                  <div className={styles.modalHeaderTop}>
                    <div className={styles.modalHeaderLeftGroup}>
                      <span className={styles.modalKawasan}>
                        {parseJsonArray(selectedProperty.kawasan).join(', ')}
                      </span>
                      <div className={styles.modalBadges}>
                        <span className={`${styles.modalBadgeStatus} ${selectedProperty.status === 'IN_STOCK' ? styles.badgeInStock : styles.badgeSoldOut}`}>
                          {selectedProperty.status === 'IN_STOCK' ? 'In Stock' : 'Sold Out'}
                        </span>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <span className={styles.modalBadgeType}>
                            {getTipeLabel(selectedProperty.tipe)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', width: '100%', marginTop: '12px' }}>
                      <div>
                        <h2 className={styles.modalTitle} style={{ margin: 0 }}>{selectedProperty.namaProperty}</h2>
                        <div className={styles.modalPrice} style={{ marginTop: '4px', marginBottom: 0 }}>{formatRupiah(typeof selectedProperty.price === 'string' ? BigInt(selectedProperty.price) : selectedProperty.price)}</div>
                      </div>
                      <button 
                        onClick={() => window.print()} 
                        className={styles.modalPrintBtn}
                        title="Unduh Brosur Properti PDF"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Cetak Brosur PDF
                      </button>
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

                  {/* Interactive Floor Plan Section */}
                  <div className={styles.floorPlanSection}>
                    <h4 className={styles.modalSectionSub}>📐 Denah & Tata Letak Eksklusif</h4>
                    <p className={styles.floorPlanSub}>Jelajahi denah tata letak 2D interaktif unit kami dengan presisi tata ruang tinggi.</p>
                    
                    <div className={styles.floorPlanVisualWrapper}>
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
