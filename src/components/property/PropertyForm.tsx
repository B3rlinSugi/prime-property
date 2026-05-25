'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { formatRupiah, isValidMapsLink } from '@/lib/utils';
import styles from './PropertyForm.module.css';

export interface PropertyFormValues {
  namaProperty: string;
  group: string;
  lebar: string;
  panjang: string;
  hadap: string[];
  tipe: 'RUKO' | 'VILLA';
  tingkat: string;
  price: string;
  carport: boolean;
  status: 'IN_STOCK' | 'SOLD_OUT';
  siap: 'SIAP_HUNI' | 'SIAP_KOSONG' | 'SIAP_HUNI_RENOVASI';
  mapsLink: string;
  kawasan: string[];
  unit: string;
}

interface PropertyFormProps {
  initialData?: PropertyFormValues;
  onSubmit: (values: PropertyFormValues) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
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

export default function PropertyForm({ initialData, onSubmit, isLoading, submitLabel }: PropertyFormProps) {
  // Initialize form fields
  const [namaProperty, setNamaProperty] = useState(initialData?.namaProperty || '');
  const [group, setGroup] = useState(initialData?.group || '');
  const [lebar, setLebar] = useState(initialData?.lebar || '');
  const [panjang, setPanjang] = useState(initialData?.panjang || '');
  const [hadap, setHadap] = useState<string[]>(initialData?.hadap || []);
  const [tipe, setTipe] = useState<'RUKO' | 'VILLA'>(initialData?.tipe || 'VILLA');
  const [tingkat, setTingkat] = useState(initialData?.tingkat || '1');
  const [price, setPrice] = useState(initialData?.price || '');
  const [carport, setCarport] = useState(initialData?.carport ?? true);
  const [status, setStatus] = useState<'IN_STOCK' | 'SOLD_OUT'>(initialData?.status || 'IN_STOCK');
  const [siap, setSiap] = useState<'SIAP_HUNI' | 'SIAP_KOSONG' | 'SIAP_HUNI_RENOVASI'>(initialData?.siap || 'SIAP_HUNI');
  const [mapsLink, setMapsLink] = useState(initialData?.mapsLink || '');
  const [kawasan, setKawasan] = useState<string[]>(initialData?.kawasan || []);
  const [unit, setUnit] = useState(initialData?.unit || '');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hadap list handler
  const handleHadapChange = (val: string) => {
    if (hadap.includes(val)) {
      setHadap(hadap.filter((h) => h !== val));
    } else {
      setHadap([...hadap, val]);
    }
  };

  // Kawasan list handler
  const handleKawasanChange = (val: string) => {
    if (kawasan.includes(val)) {
      setKawasan(kawasan.filter((k) => k !== val));
    } else {
      setKawasan([...kawasan, val]);
    }
  };

  // Validation runner
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!namaProperty.trim()) {
      newErrors.namaProperty = 'Nama properti wajib diisi.';
    } else if (namaProperty.length < 3 || namaProperty.length > 100) {
      newErrors.namaProperty = 'Nama properti minimal 3-100 karakter.';
    }

    if (!lebar || parseFloat(lebar) <= 0) {
      newErrors.lebar = 'Lebar harus berupa angka positif.';
    }

    if (!panjang || parseFloat(panjang) <= 0) {
      newErrors.panjang = 'Panjang harus berupa angka positif.';
    }

    if (!tingkat || parseFloat(tingkat) <= 0 || parseFloat(tingkat) > 10) {
      newErrors.tingkat = 'Jumlah lantai minimal 1 dan maksimal 10.';
    }

    if (!price || parseFloat(price) <= 0) {
      newErrors.price = 'Harga wajib diisi dengan nilai positif.';
    }

    if (hadap.length === 0) {
      newErrors.hadap = 'Pilih minimal satu arah hadap.';
    }

    if (kawasan.length === 0) {
      newErrors.kawasan = 'Pilih minimal satu kawasan.';
    }

    if (mapsLink.trim() && !isValidMapsLink(mapsLink.trim())) {
      newErrors.mapsLink = 'Format link Google Maps tidak valid (harus mengandung google.com/maps).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      namaProperty: namaProperty.trim(),
      group: group.trim(),
      lebar,
      panjang,
      hadap,
      tipe,
      tingkat,
      price,
      carport,
      status,
      siap,
      mapsLink: mapsLink.trim(),
      kawasan,
      unit: unit.trim(),
    });
  };

  return (
    <form className={styles.formWrapper} onSubmit={handleSubmit} noValidate>
      <div className={styles.formGrid}>
        
        {/* Section 1: Identifikasi Properti */}
        <h3 className={styles.sectionTitle}>1. Informasi Dasar</h3>

        <div className="form-group">
          <label htmlFor="namaProperty" className="form-label">Nama Properti *</label>
          <input 
            type="text" 
            id="namaProperty" 
            className={`form-input ${errors.namaProperty ? styles.inputError : ''}`}
            placeholder="Contoh: Aston Villas, Banyan Tree Blok A"
            value={namaProperty}
            onChange={(e) => setNamaProperty(e.target.value)}
            disabled={isLoading}
          />
          {errors.namaProperty && <span className="form-error">{errors.namaProperty}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="group" className="form-label">Nama Group (Blok/Proyek)</label>
          <input 
            type="text" 
            id="group" 
            className="form-input" 
            placeholder="Contoh: Mentari, Golden Gate (Opsional)"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tipe Properti</label>
          <div style={{ display: 'flex', gap: '20px', padding: '8px 0' }}>
            <label className={styles.checkboxLabel}>
              <input 
                type="radio" 
                name="tipe" 
                checked={tipe === 'VILLA'} 
                onChange={() => setTipe('VILLA')}
                disabled={isLoading}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent-gold)' }}
              />
              Villa
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="radio" 
                name="tipe" 
                checked={tipe === 'RUKO'} 
                onChange={() => setTipe('RUKO')}
                disabled={isLoading}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent-gold)' }}
              />
              Ruko
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Status Unit</label>
          <div style={{ display: 'flex', gap: '20px', padding: '8px 0' }}>
            <label className={styles.checkboxLabel}>
              <input 
                type="radio" 
                name="status" 
                checked={status === 'IN_STOCK'} 
                onChange={() => setStatus('IN_STOCK')}
                disabled={isLoading}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent-gold)' }}
              />
              In Stock (Tersedia)
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="radio" 
                name="status" 
                checked={status === 'SOLD_OUT'} 
                onChange={() => setStatus('SOLD_OUT')}
                disabled={isLoading}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent-gold)' }}
              />
              Sold Out (Terjual)
            </label>
          </div>
        </div>

        {/* Section 2: Dimensi & Spesifikasi */}
        <h3 className={styles.sectionTitle}>2. Spesifikasi Fisik</h3>

        <div className="form-group">
          <label htmlFor="lebar" className="form-label">Lebar Depan Properti (meter) *</label>
          <input 
            type="number" 
            id="lebar" 
            step="0.01"
            className={`form-input ${errors.lebar ? styles.inputError : ''}`}
            placeholder="Contoh: 8.5"
            value={lebar}
            onChange={(e) => setLebar(e.target.value)}
            disabled={isLoading}
          />
          {errors.lebar && <span className="form-error">{errors.lebar}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="panjang" className="form-label">Panjang Properti (meter) *</label>
          <input 
            type="number" 
            id="panjang" 
            step="0.01"
            className={`form-input ${errors.panjang ? styles.inputError : ''}`}
            placeholder="Contoh: 18"
            value={panjang}
            onChange={(e) => setPanjang(e.target.value)}
            disabled={isLoading}
          />
          {errors.panjang && <span className="form-error">{errors.panjang}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="tingkat" className="form-label">Tingkat Lantai *</label>
          <input 
            type="number" 
            id="tingkat" 
            step="0.5"
            className={`form-input ${errors.tingkat ? styles.inputError : ''}`}
            placeholder="Contoh: 2, 2.5"
            value={tingkat}
            onChange={(e) => setTingkat(e.target.value)}
            disabled={isLoading}
          />
          {errors.tingkat && <span className="form-error">{errors.tingkat}</span>}
        </div>

        <div className="form-group">
          <div className={styles.carportToggleWrapper}>
            <label className="form-label" style={{ marginBottom: 0 }}>Fasilitas Carport</label>
            <label className={styles.checkboxLabel} style={{ fontWeight: 600 }}>
              <input 
                type="checkbox" 
                className={styles.checkboxInput}
                checked={carport}
                onChange={(e) => setCarport(e.target.checked)}
                disabled={isLoading}
              />
              Tersedia Carport
            </label>
          </div>
        </div>

        <div className={`form-group ${styles.fullWidth}`}>
          <label className="form-label">Arah Hadap Bangunan * (Pilih minimal satu)</label>
          <div className={styles.checkboxGrid}>
            {HADAP_OPTIONS.map((h) => (
              <label key={h} className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  className={styles.checkboxInput}
                  checked={hadap.includes(h)}
                  onChange={() => handleHadapChange(h)}
                  disabled={isLoading}
                />
                Hadap {h}
              </label>
            ))}
          </div>
          {errors.hadap && <span className="form-error">{errors.hadap}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="siap" className="form-label">Kondisi Kesiapan Unit *</label>
          <div className="form-select-wrapper">
            <select 
              id="siap" 
              className="form-select"
              value={siap}
              onChange={(e) => setSiap(e.target.value as any)}
              disabled={isLoading}
            >
              {SIAP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="unit" className="form-label">Keterangan / Kategori Unit (e.g. Unit Ready, Booking Gate)</label>
          <input 
            type="text" 
            id="unit" 
            className="form-input" 
            placeholder="Contoh: Ready Siap huni, Gate siap"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Section 3: Investasi & Lokasi */}
        <h3 className={styles.sectionTitle}>3. Investasi & Lokasi</h3>

        <div className="form-group">
          <label htmlFor="price" className="form-label">Harga Properti (Rupiah) *</label>
          <input 
            type="number" 
            id="price" 
            className={`form-input ${errors.price ? styles.inputError : ''}`}
            placeholder="Contoh: 1350000000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isLoading}
          />
          {price && (
            <span className="form-hint" style={{ color: 'var(--color-accent-gold)', fontWeight: 600 }}>
              Konfirmasi Rupiah: {formatRupiah(Number(price))}
            </span>
          )}
          {errors.price && <span className="form-error">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="mapsLink" className="form-label">Link Lokasi Google Maps</label>
          <input 
            type="url" 
            id="mapsLink" 
            className={`form-input ${errors.mapsLink ? styles.inputError : ''}`}
            placeholder="https://google.com/maps/..."
            value={mapsLink}
            onChange={(e) => setMapsLink(e.target.value)}
            disabled={isLoading}
          />
          {errors.mapsLink && <span className="form-error">{errors.mapsLink}</span>}
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Kawasan Geografis * (Pilih minimal satu)</label>
          <div className={styles.checkboxGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {KAWASAN_OPTIONS.map((k) => (
              <label key={k} className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  className={styles.checkboxInput}
                  checked={kawasan.includes(k)}
                  onChange={() => handleKawasanChange(k)}
                  disabled={isLoading}
                />
                Kawasan {k}
              </label>
            ))}
          </div>
          {errors.kawasan && <span className="form-error">{errors.kawasan}</span>}
        </div>

      </div>

      <div className={styles.actions}>
        <Link href="/agent/dashboard" className="btn btn-secondary styles.cancelBtn">
          Batal
        </Link>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className={styles.spinner}></div>
              <span>Menyimpan...</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
}
