'use client';

import { useState, FormEvent } from 'react';
import styles from './page.module.css';

export default function KontakPage() {
  // Form fields state
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [pesan, setPesan] = useState('');

  // Field validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Submission UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nama.trim()) {
      newErrors.nama = 'Nama wajib diisi.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Format email tidak valid.';
    }

    if (!nomorHp.trim()) {
      newErrors.nomorHp = 'Nomor HP wajib diisi.';
    } else {
      const digits = nomorHp.replace(/\D/g, '');
      if (digits.length < 10) {
        newErrors.nomorHp = 'Nomor HP minimal 10 digit angka.';
      }
    }

    if (!pesan.trim()) {
      newErrors.pesan = 'Pesan wajib diisi.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitResult(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: nama.trim(),
          email: email.trim(),
          nomorHp: nomorHp.trim(),
          pesan: pesan.trim(),
        }),
      });

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: 'Pesan terkirim. Terima kasih, tim kami akan segera menghubungi Anda.',
        });
        // Reset form fields
        setNama('');
        setEmail('');
        setNomorHp('');
        setPesan('');
        setErrors({});
      } else {
        const json = await response.json();
        setSubmitResult({
          success: false,
          message: json.message || 'Gagal mengirim pesan. Silakan coba beberapa saat lagi.',
        });
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitResult({
        success: false,
        message: 'Koneksi gagal. Silakan periksa jaringan internet Anda.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Banner */}
      <section className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>Hubungi Kami</h1>
          <p className={styles.bannerSubtitle}>
            Apakah Anda memiliki pertanyaan mengenai unit properti kami? Hubungi kami langsung dan dapatkan konsultasi gratis.
          </p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className={styles.contactSection}>
        <div className={styles.contactGrid}>
          {/* Left Column: Contact Information */}
          <div className={styles.infoPanel}>
            <h2 className={styles.infoTitle}>Informasi Kontak</h2>
            <ul className={styles.infoList}>
              <li className={styles.infoItem}>
                <div className={styles.infoIconWrapper}>📍</div>
                <div className={styles.infoItemContent}>
                  <span className={styles.infoLabel}>Alamat Kantor</span>
                  <span className={styles.infoValue}>Jl. Gatot Subroto No. 123, Medan, Sumatera Utara 20112</span>
                </div>
              </li>
              <li className={styles.infoItem}>
                <div className={styles.infoIconWrapper}>📞</div>
                <div className={styles.infoItemContent}>
                  <span className={styles.infoLabel}>Telepon</span>
                  <a href="tel:+6281234567890" className={styles.infoValue}>+62 812-3456-7890</a>
                </div>
              </li>
              <li className={styles.infoItem}>
                <div className={styles.infoIconWrapper}>✉️</div>
                <div className={styles.infoItemContent}>
                  <span className={styles.infoLabel}>Email Resmi</span>
                  <a href="mailto:info@primeproperty.id" className={styles.infoValue}>info@primeproperty.id</a>
                </div>
              </li>
            </ul>

            <a 
              href="https://wa.me/6281234567890?text=Halo%20Prime%20Property,%20saya%20tertarik%20dengan%20properti%20Anda."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waLinkButton}
            >
              💬 Hubungi via WhatsApp
            </a>
          </div>

          {/* Right Column: Contact Form */}
          <div className={styles.formPanel}>
            <h2 className={styles.formTitle}>Kirim Pesan</h2>
            <p className={styles.formDescription}>
              Isi formulir di bawah ini dengan informasi Anda, dan tim konsultan properti kami akan membalas pesan Anda dalam 1x24 jam kerja.
            </p>

            {submitResult && (
              <div className={`${styles.messageBox} ${submitResult.success ? styles.messageBoxSuccess : styles.messageBoxError}`}>
                {submitResult.message}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="nama" className="form-label">Nama Lengkap</label>
                <input 
                  type="text" 
                  id="nama" 
                  className={`form-input ${errors.nama ? 'form-input-error' : ''}`}
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  disabled={isSubmitting}
                />
                {errors.nama && <span className="form-error">{errors.nama}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Alamat Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  disabled={isSubmitting}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="nomorHp" className="form-label">Nomor Handphone (WhatsApp)</label>
                <input 
                  type="tel" 
                  id="nomorHp" 
                  className={`form-input ${errors.nomorHp ? 'form-input-error' : ''}`}
                  value={nomorHp}
                  onChange={(e) => setNomorHp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  disabled={isSubmitting}
                />
                {errors.nomorHp && <span className="form-error">{errors.nomorHp}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="pesan" className="form-label">Pesan Anda</label>
                <textarea 
                  id="pesan" 
                  rows={5}
                  className={`form-input ${errors.pesan ? 'form-input-error' : ''}`}
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder="Tuliskan detail pertanyaan atau ketertarikan Anda pada properti kami..."
                  disabled={isSubmitting}
                ></textarea>
                {errors.pesan && <span className="form-error">{errors.pesan}</span>}
              </div>

              <button 
                type="submit" 
                className={styles.submitButton} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner}></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Pesan</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
