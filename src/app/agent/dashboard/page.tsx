'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  formatRupiah, 
  formatDimensi, 
  parseJsonArray, 
  formatHadap, 
  formatKawasan, 
  getStatusLabel, 
  getSiapLabel, 
  getTipeLabel, 
  formatTanggalWaktu 
} from '@/lib/utils';
import styles from './page.module.css';

interface Property {
  id: string;
  namaProperty: string;
  group: string | null;
  lebar: number;
  panjang: number;
  hadap: string; // JSON string
  tipe: string;
  tingkat: number;
  price: string; // BigInt serialized as string
  carport: boolean;
  status: string;
  siap: string;
  mapsLink: string | null;
  kawasan: string; // JSON string
  unit: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: { name: string; email: string };
}

const KAWASAN_OPTIONS = [
  'Krakatau', 'Pancing', 'Tembung', 'Helvetia', 'Cemara Asri', 
  'Sunggal', 'Marelan', 'Amplas', 'Johor', 'Medan Kota'
];

const HADAP_OPTIONS = ['Utara', 'Selatan', 'Timur', 'Barat'];

const SIAP_OPTIONS = [
  { value: 'SIAP_HUNI', label: 'Siap Huni' },
  { value: 'SIAP_KOSONG', label: 'Siap Kosong' },
  { value: 'SIAP_HUNI_RENOVASI', label: 'Siap Huni Renovasi' }
];

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="loading-state"><div className="spinner"></div><p>Memuat dashboard...</p></div>}>
      <DashboardPageContent />
    </Suspense>
  );
}

function DashboardPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // User Role Check
  const isSuperadmin = session?.user?.role === 'SUPERADMIN';

  // UI States
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [newPropertyId, setNewPropertyId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Active overlays
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter States (initialized from URL query parameters)
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [limit, setLimit] = useState(parseInt(searchParams.get('limit') || '50', 10));
  const [sort, setSort] = useState(searchParams.get('sort') || 'created_desc');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedKawasan, setSelectedKawasan] = useState<string[]>(
    searchParams.get('kawasan') ? searchParams.get('kawasan')!.split(',') : []
  );
  const [selectedHadap, setSelectedHadap] = useState<string[]>(
    searchParams.get('hadap') ? searchParams.get('hadap')!.split(',') : []
  );
  const [selectedSiap, setSelectedSiap] = useState<string[]>(
    searchParams.get('siap') ? searchParams.get('siap')!.split(',') : []
  );
  const [lebarMin, setLebarMin] = useState(searchParams.get('lebarMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [tipe, setTipe] = useState(searchParams.get('tipe') || 'Semua'); // Semua | RUKO | VILLA
  const [status, setStatus] = useState(searchParams.get('status') || 'Semua'); // Semua | IN_STOCK | SOLD_OUT
  const [carport, setCarport] = useState(searchParams.get('carport') || 'Semua'); // Semua | Ya | Tidak

  // Watch for newly created property flag from navigation state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNewId = sessionStorage.getItem('newlyCreatedPropertyId');
      if (storedNewId) {
        setNewPropertyId(storedNewId);
        sessionStorage.removeItem('newlyCreatedPropertyId');
        // Clear highlight after 4 seconds
        setTimeout(() => setNewPropertyId(null), 4000);
      }
    }
  }, []);

  // Fetch properties on filters/params change
  useEffect(() => {
    async function fetchProperties() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', limit.toString());
        params.set('sort', sort);
        
        if (search) params.set('search', search);
        if (selectedKawasan.length > 0) params.set('kawasan', selectedKawasan.join(','));
        if (selectedHadap.length > 0) params.set('hadap', selectedHadap.join(','));
        if (selectedSiap.length > 0) params.set('siap', selectedSiap.join(','));
        if (lebarMin) params.set('lebarMin', lebarMin);
        if (priceMax) params.set('priceMax', priceMax);
        if (tipe !== 'Semua') params.set('tipe', tipe);
        if (status !== 'Semua') params.set('status', status);
        if (carport === 'Ya') params.set('carport', 'true');
        if (carport === 'Tidak') params.set('carport', 'false');
        if (showArchived) params.set('archived', 'true');

        // Sync to URL address bar
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        const res = await fetch(`/api/properties?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setProperties(json.data || []);
          setTotalCount(json.pagination?.total || 0);
        } else {
          showToast('error', 'Gagal memuat daftar properti.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        showToast('error', 'Koneksi gagal. Silakan coba beberapa saat lagi.');
      } finally {
        setIsLoading(false);
      }
    }

    // Debounce the search input by 300ms
    const delayDebounce = setTimeout(() => {
      fetchProperties();
    }, search ? 300 : 0);

    return () => clearTimeout(delayDebounce);
  }, [
    page, limit, sort, search, selectedKawasan, 
    selectedHadap, selectedSiap, lebarMin, priceMax, 
    tipe, status, carport, showArchived
  ]);

  // Toast handler
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearch('');
    setSelectedKawasan([]);
    setSelectedHadap([]);
    setSelectedSiap([]);
    setLebarMin('');
    setPriceMax('');
    setTipe('Semua');
    setStatus('Semua');
    setCarport('Semua');
    setPage(1);
    setSort('created_desc');
  };

  // Handle individual chip removal
  const removeKawasan = (k: string) => setSelectedKawasan(selectedKawasan.filter((item) => item !== k));
  const removeHadap = (h: string) => setSelectedHadap(selectedHadap.filter((item) => item !== h));
  const removeSiap = (s: string) => setSelectedSiap(selectedSiap.filter((item) => item !== s));

  // Handle Sort Change
  const handleSortClick = (field: string) => {
    if (sort === `${field}_asc`) {
      setSort(`${field}_desc`);
    } else {
      setSort(`${field}_asc`);
    }
    setPage(1);
  };

  // Soft Delete execution
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/properties/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('success', `Properti "${deleteTarget.namaProperty}" berhasil dihapus.`);
        setDeleteTarget(null);
        setSelectedProperty(null); // close drawer if active
        // Refresh properties list
        setProperties(properties.filter((p) => p.id !== deleteTarget.id));
        setTotalCount((c) => c - 1);
      } else {
        const json = await res.json();
        showToast('error', json.message || 'Gagal menghapus properti.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Koneksi gagal saat menghapus properti.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore property execution
  const handleRestore = async (property: Property) => {
    try {
      const res = await fetch(`/api/properties/${property.id}/restore`, {
        method: 'PATCH',
      });

      if (res.ok) {
        showToast('success', `Properti "${property.namaProperty}" berhasil dipulihkan dari arsip.`);
        setSelectedProperty(null);
        setProperties(properties.filter((p) => p.id !== property.id));
        setTotalCount((c) => c - 1);
      } else {
        const json = await res.json();
        showToast('error', json.message || 'Gagal memulihkan properti.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Koneksi gagal saat memulihkan properti.');
    }
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      {/* Toast Alert */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => setToast(null)}>&times;</button>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>{showArchived ? 'Arsip Properti (Terhapus)' : 'Daftar Properti'}</h1>
          <span className={styles.countBadge}>{totalCount} Unit</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isSuperadmin && (
            <>
              <button 
                className="btn btn-secondary"
                onClick={() => { setShowArchived(!showArchived); setPage(1); }}
              >
                📁 {showArchived ? 'Lihat Listing Aktif' : 'Lihat Arsip Terhapus'}
              </button>
              {!showArchived && (
                <Link href="/agent/dashboard/property/new" className="btn btn-primary">
                  + Tambah Properti
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <button 
        className={styles.filterToggleBtn} 
        onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
      >
        🔎 {mobileFilterOpen ? 'Tutup Filter' : 'Buka Panel Filter'}
      </button>

      {/* Collapsible Filter Panel */}
      <div className={`${styles.filterPanel} ${mobileFilterOpen ? styles.filterPanelOpen : ''}`}>
        <div className={styles.filterGrid}>
          {/* Row 1 */}
          <div className="form-group">
            <label className="form-label">Cari Properti</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Nama, group, atau kawasan..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kawasan</label>
            <div className="form-select-wrapper">
              <select 
                className="form-select"
                onChange={(e) => {
                  if (e.target.value && !selectedKawasan.includes(e.target.value)) {
                    setSelectedKawasan([...selectedKawasan, e.target.value]);
                    setPage(1);
                  }
                  e.target.value = '';
                }}
              >
                <option value="">Pilih Kawasan...</option>
                {KAWASAN_OPTIONS.map((k) => (
                  <option key={k} value={k} disabled={selectedKawasan.includes(k)}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hadap</label>
            <div className="form-select-wrapper">
              <select 
                className="form-select"
                onChange={(e) => {
                  if (e.target.value && !selectedHadap.includes(e.target.value)) {
                    setSelectedHadap([...selectedHadap, e.target.value]);
                    setPage(1);
                  }
                  e.target.value = '';
                }}
              >
                <option value="">Pilih Hadap...</option>
                {HADAP_OPTIONS.map((h) => (
                  <option key={h} value={h} disabled={selectedHadap.includes(h)}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kesiapan Unit</label>
            <div className="form-select-wrapper">
              <select 
                className="form-select"
                onChange={(e) => {
                  if (e.target.value && !selectedSiap.includes(e.target.value)) {
                    setSelectedSiap([...selectedSiap, e.target.value]);
                    setPage(1);
                  }
                  e.target.value = '';
                }}
              >
                <option value="">Pilih Kesiapan...</option>
                {SIAP_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} disabled={selectedSiap.includes(s.value)}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-group">
            <label className="form-label">Lebar Min. (m)</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="Lebar..." 
              value={lebarMin}
              onChange={(e) => { setLebarMin(e.target.value); setPage(1); }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Harga Max. (Rupiah)</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="Harga max..." 
              value={priceMax}
              onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
            />
            {priceMax && (
              <span className="form-hint" style={{ color: 'var(--color-accent-gold)', fontWeight: 600 }}>
                {formatRupiah(Number(priceMax))}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Carport</label>
            <div className="form-select-wrapper">
              <select 
                className="form-select"
                value={carport}
                onChange={(e) => { setCarport(e.target.value); setPage(1); }}
              >
                <option value="Semua">Semua</option>
                <option value="Ya">Ya</option>
                <option value="Tidak">Tidak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Footer row: radio groups + clear buttons */}
        <div className={styles.filterRowFull}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Tipe Properti</label>
              <div className={styles.radioGroup}>
                {['Semua', 'RUKO', 'VILLA'].map((t) => (
                  <button 
                    key={t}
                    className={`${styles.radioBtn} ${tipe === t ? styles.radioBtnActive : ''}`}
                    onClick={() => { setTipe(t); setPage(1); }}
                  >
                    {t === 'Semua' ? 'Semua' : t === 'RUKO' ? 'Ruko' : 'Villa'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Status Unit</label>
              <div className={styles.radioGroup}>
                {['Semua', 'IN_STOCK', 'SOLD_OUT'].map((s) => (
                  <button 
                    key={s}
                    className={`${styles.radioBtn} ${status === s ? styles.radioBtnActive : ''}`}
                    onClick={() => { setStatus(s); setPage(1); }}
                  >
                    {s === 'Semua' ? 'Semua' : s === 'IN_STOCK' ? 'In Stock' : 'Sold Out'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.filterActions}>
            <button className="btn btn-secondary" onClick={handleResetFilters}>
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Display */}
      {(selectedKawasan.length > 0 || selectedHadap.length > 0 || selectedSiap.length > 0 || search || lebarMin || priceMax || tipe !== 'Semua' || status !== 'Semua' || carport !== 'Semua') && (
        <div className={styles.chipsContainer}>
          <span className={styles.chipsLabel}>Filter Aktif:</span>
          {search && (
            <span className="chip">
              Cari: &ldquo;{search}&rdquo;
              <button className="chip-remove" onClick={() => setSearch('')}>&times;</button>
            </span>
          )}
          {tipe !== 'Semua' && (
            <span className="chip">
              Tipe: {getTipeLabel(tipe)}
              <button className="chip-remove" onClick={() => setTipe('Semua')}>&times;</button>
            </span>
          )}
          {status !== 'Semua' && (
            <span className="chip">
              Status: {getStatusLabel(status)}
              <button className="chip-remove" onClick={() => setStatus('Semua')}>&times;</button>
            </span>
          )}
          {carport !== 'Semua' && (
            <span className="chip">
              Carport: {carport}
              <button className="chip-remove" onClick={() => setCarport('Semua')}>&times;</button>
            </span>
          )}
          {lebarMin && (
            <span className="chip">
              Lebar &ge; {lebarMin}m
              <button className="chip-remove" onClick={() => setLebarMin('')}>&times;</button>
            </span>
          )}
          {priceMax && (
            <span className="chip">
              Harga &le; {formatRupiah(Number(priceMax))}
              <button className="chip-remove" onClick={() => setPriceMax('')}>&times;</button>
            </span>
          )}
          {selectedKawasan.map((k) => (
            <span key={k} className="chip">
              Kawasan: {k}
              <button className="chip-remove" onClick={() => removeKawasan(k)}>&times;</button>
            </span>
          ))}
          {selectedHadap.map((h) => (
            <span key={h} className="chip">
              Hadap: {h}
              <button className="chip-remove" onClick={() => removeHadap(h)}>&times;</button>
            </span>
          ))}
          {selectedSiap.map((s) => (
            <span key={s} className="chip">
              Kesiapan: {getSiapLabel(s)}
              <button className="chip-remove" onClick={() => removeSiap(s)}>&times;</button>
            </span>
          ))}
          <button className={styles.chipReset} onClick={handleResetFilters}>
            Hapus Semua
          </button>
        </div>
      )}

      {/* Property Table */}
      <div className="table-wrapper" style={{ minHeight: '300px' }}>
        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)' }}>Memuat data properti...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="table-empty">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗃️</div>
            <h3>Tidak Ada Properti Ditemukan</h3>
            <p>Silakan sesuaikan filter pencarian atau buat properti baru.</p>
            <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={handleResetFilters}>
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSortClick('nama')}>
                  Nama Properti {sort === 'nama_asc' ? '▲' : sort === 'nama_desc' ? '▼' : ''}
                </th>
                <th>Group</th>
                <th>Dimensi (L&times;P)</th>
                <th>Hadap</th>
                <th>Tipe</th>
                <th>Lantai</th>
                <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSortClick('price')}>
                  Harga {sort === 'price_asc' ? '▲' : sort === 'price_desc' ? '▼' : ''}
                </th>
                <th>Carport</th>
                <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSortClick('status')}>
                  Status {sort === 'status_asc' ? '▲' : sort === 'status_desc' ? '▼' : ''}
                </th>
                <th>Kesiapan</th>
                <th>Kawasan</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => {
                const hadapList = parseJsonArray(property.hadap);
                const kawasanList = parseJsonArray(property.kawasan);
                const isNew = property.id === newPropertyId;

                return (
                  <tr 
                    key={property.id} 
                    onClick={() => setSelectedProperty(property)}
                    style={{ 
                      cursor: 'pointer',
                      animation: isNew ? 'highlight 4s ease-out' : 'none'
                    }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                      {property.namaProperty}
                    </td>
                    <td>{property.group || '—'}</td>
                    <td>{formatDimensi(property.lebar, property.panjang)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{hadapList.join(', ')}</td>
                    <td>
                      <span className={`badge ${property.tipe === 'RUKO' ? 'badge-primary' : 'badge-secondary'}`} style={{ opacity: 0.9 }}>
                        {getTipeLabel(property.tipe)}
                      </span>
                    </td>
                    <td>{property.tingkat}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-accent-gold)', whiteSpace: 'nowrap' }}>
                      {formatRupiah(Number(property.price))}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                      {property.carport ? '✓' : '—'}
                    </td>
                    <td>
                      <span className={`badge ${property.status === 'IN_STOCK' ? 'badge-in-stock' : 'badge-sold-out'}`}>
                        {getStatusLabel(property.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        property.siap === 'SIAP_HUNI' 
                          ? 'badge-siap-huni' 
                          : property.siap === 'SIAP_KOSONG' 
                          ? 'badge-siap-kosong' 
                          : 'badge-siap-renovasi'
                      }`}>
                        {getSiapLabel(property.siap)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {kawasanList.map((k) => (
                          <span key={k} className="chip" style={{ margin: 0, padding: '2px 8px', fontSize: '0.75rem' }}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Bar */}
      {!isLoading && properties.length > 0 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Tampilkan:</span>
            <div className="form-select-wrapper" style={{ width: '80px', marginBottom: 0 }}>
              <select 
                className="form-select" 
                style={{ padding: '6px 24px 6px 12px' }}
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              dari {totalCount} properti
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '8px 16px' }}
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Sebelumnya
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
              Halaman {page} dari {Math.ceil(totalCount / limit) || 1}
            </span>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '8px 16px' }}
              disabled={page >= Math.ceil(totalCount / limit)}
              onClick={() => setPage(page + 1)}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Detail Drawer Backdrop */}
      <div 
        className={`${styles.drawerBackdrop} ${selectedProperty ? styles.drawerBackdropActive : ''}`}
        onClick={() => setSelectedProperty(null)}
      ></div>

      {/* Detail Drawer */}
      <div className={`${styles.drawer} ${selectedProperty ? styles.drawerActive : ''}`}>
        {selectedProperty && (
          <>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>Detail Properti</h2>
              <div className={styles.drawerHeaderActions}>
                {isSuperadmin && !showArchived && (
                  <>
                    <Link 
                      href={`/agent/dashboard/property/${selectedProperty.id}/edit`} 
                      className={styles.headerEditBtn}
                    >
                      Edit
                    </Link>
                    <button 
                      className={styles.headerDeleteBtn}
                      onClick={() => setDeleteTarget(selectedProperty)}
                    >
                      Hapus
                    </button>
                  </>
                )}
                {isSuperadmin && showArchived && (
                  <button 
                    className={styles.headerRestoreBtn}
                    onClick={() => handleRestore(selectedProperty)}
                  >
                    Pulihkan
                  </button>
                )}
                <button className={styles.drawerCloseBtn} onClick={() => setSelectedProperty(null)}>
                  &times;
                </button>
              </div>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.drawerSplitLayout}>
                {/* Left Side: Property Photo with status badge */}
                <div 
                  className={styles.drawerPhoto}
                  style={{ backgroundImage: 'url(/property-villa.png)' }}
                >
                  <span className={`badge ${
                    selectedProperty.status === 'IN_STOCK' ? 'badge-in-stock' : 'badge-sold-out'
                  }`}>
                    {getStatusLabel(selectedProperty.status)}
                  </span>
                </div>

                {/* Right Side: Specifications list */}
                <div className={styles.drawerSpecsColumn}>
                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Nama Property</span>
                    <span className={styles.drawerSpecVal}>{selectedProperty.namaProperty}</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Group</span>
                    <span className={styles.drawerSpecVal}>{selectedProperty.group || 'Mentari'}</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Lebar</span>
                    <span className={styles.drawerSpecVal}>{selectedProperty.lebar} m</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Panjang</span>
                    <span className={styles.drawerSpecVal}>{selectedProperty.panjang} m</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Hadap</span>
                    <span className={styles.drawerSpecVal}>{formatHadap(selectedProperty.hadap)}</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Tipe</span>
                    <span className={styles.drawerSpecVal}>{getTipeLabel(selectedProperty.tipe)}</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Tingkat</span>
                    <span className={styles.drawerSpecVal}>{selectedProperty.tingkat}</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Harga</span>
                    <span className={styles.drawerSpecValGold}>{formatRupiah(Number(selectedProperty.price))}</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Carport</span>
                    <span className={styles.drawerSpecVal}>{selectedProperty.carport ? 'Ya' : 'Tidak'}</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Status</span>
                    <span className={styles.drawerSpecVal}>
                      <span className={`badge ${selectedProperty.status === 'IN_STOCK' ? 'badge-in-stock' : 'badge-sold-out'}`}>
                        {getStatusLabel(selectedProperty.status)}
                      </span>
                    </span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Siap</span>
                    <span className={styles.drawerSpecVal}>
                      <span className={`badge ${
                        selectedProperty.siap === 'SIAP_HUNI' 
                          ? 'badge-siap-huni' 
                          : selectedProperty.siap === 'SIAP_KOSONG' 
                          ? 'badge-siap-kosong' 
                          : 'badge-siap-renovasi'
                      }`}>
                        {getSiapLabel(selectedProperty.siap)}
                      </span>
                    </span>
                  </div>

                  {selectedProperty.mapsLink && (
                    <div className={styles.drawerDataRow}>
                      <span className={styles.drawerSpecLabel}>Maps Link</span>
                      <span className={styles.drawerSpecVal}>
                        <a href={selectedProperty.mapsLink} target="_blank" rel="noopener noreferrer" className={styles.drawerMapsLinkSpan}>
                          Buka di Google Maps ↗
                        </a>
                      </span>
                    </div>
                  )}

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Kawasan</span>
                    <span className={styles.drawerSpecVal}>{formatKawasan(selectedProperty.kawasan)}</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Unit</span>
                    <span className={styles.drawerSpecVal}>{selectedProperty.unit || 'Ready Siap Huni'}</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Dibuat Oleh</span>
                    <span className={styles.drawerSpecVal}>{selectedProperty.createdBy?.name || 'Superadmin'}</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Dibuat Pada</span>
                    <span className={styles.drawerSpecVal}>{formatTanggalWaktu(selectedProperty.createdAt)}</span>
                  </div>

                  <div className={styles.drawerDataRow}>
                    <span className={styles.drawerSpecLabel}>Diupdate Pada</span>
                    <span className={styles.drawerSpecVal}>{formatTanggalWaktu(selectedProperty.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Extra static high-fidelity text box in screenshot */}
              <div className={styles.drawerAdditionalInfo}>
                <h4 className={styles.additionalInfoTitle}>Informasi Tambahan</h4>
                <p className={styles.additionalInfoText}>
                  Lokasi strategis, dekat pusat bisnis dan fasilitas umum. Unit komersial berpotensi apresiasi kapital tinggi.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Hapus Properti</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ lineHeight: 1.6 }}>
                Yakin ingin menghapus properti <strong>{deleteTarget.namaProperty}</strong>? 
                Tindakan ini bersifat soft-delete dan tidak akan menghapus data di database fisik secara permanen, namun unit ini tidak akan ditampilkan lagi.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
