'use client';

import { useState, useEffect, FormEvent } from 'react';
import styles from './page.module.css';

export default function KontakPage() {
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
      newErrors.nama = 'Nama lengkap wajib diisi.';
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
        newErrors.nomorHp = 'Nomor HP minimal 10 digit.';
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
        // Reset fields
        setNama('');
        setEmail('');
        setNomorHp('');
        setPesan('');
        setErrors({});
      } else {
        const json = await response.json();
        setSubmitResult({
          success: false,
          message: json.message || 'Gagal mengirim pesan. Silakan coba kembali.',
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
      {/* ─── Hero / Header Section ─── */}
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>
          {/* Left: Brand Heading */}
          <div className={`${styles.heroContent} reveal`}>
            <span className={styles.heroLabel}>Hubungi Kami</span>
            <h1 className={styles.heroTitle}>
              Kami Siap Membantu <br />
              Anda <br />
              Mewujudkan <span className={styles.goldText}>Investasi</span> <br />
              <span className={styles.goldText}>Properti Terbaik</span>
            </h1>
            <p className={styles.heroDescription}>
              Hubungi tim kami untuk informasi lebih lanjut atau konsultasi properti yang Anda butuhkan.
            </p>
          </div>

          {/* Right: Gold Pin Map Graphic */}
          <div className={`${styles.heroVisual} reveal`}>
            <div className={styles.mapGraphicWrapper}>
              <img 
                src="/map.png" 
                alt="Prime Property Location Map Pointer Glow" 
                className={styles.mapGraphicImg} 
              />
              <div className={styles.mapGlowOverlay}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Two-Column Contact Form Section ─── */}
      <section className={styles.contactSection}>
        <div className={styles.contactGrid}>
          {/* Left Column: Contact Cards */}
          <div className={styles.contactInfoColumn}>
            {/* Info Card */}
            <div className={`${styles.infoCard} reveal`}>
              <h2 className={styles.cardSectionTitle}>Informasi Kontak</h2>
              
              <div className={styles.contactItemRow}>
                <div className={styles.iconCircle}>📍</div>
                <div className={styles.itemContent}>
                  <span className={styles.itemLabel}>Alamat Kantor</span>
                  <span className={styles.itemValue}>Jl. Krakatau No.123, Medan, Sumatera Utara 20234</span>
                </div>
              </div>

              <div className={styles.contactItemRow}>
                <div className={styles.iconCircle}>📞</div>
                <div className={styles.itemContent}>
                  <span className={styles.itemLabel}>Telepon / WhatsApp</span>
                  <a href="tel:+6281234567890" className={styles.itemValue}>+62 812 3456 7890</a>
                </div>
              </div>

              <div className={styles.contactItemRow}>
                <div className={styles.iconCircle}>✉️</div>
                <div className={styles.itemContent}>
                  <span className={styles.itemLabel}>Email</span>
                  <a href="mailto:info@primeproperty.id" className={styles.itemValue}>info@primeproperty.id</a>
                </div>
              </div>

              <div className={styles.contactItemRow}>
                <div className={styles.iconCircle}>⏱️</div>
                <div className={styles.itemContent}>
                  <span className={styles.itemLabel}>Jam Operasional</span>
                  <span className={styles.itemValue}>
                    Senin - Sabtu: 09:00 - 18:00 WIB <br />
                    Minggu & Hari Libur: Tutup
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA Card */}
            <div className={`${styles.waCard} reveal`}>
              <div className={styles.waCardHeader}>
                <span className={styles.waIcon}>💬</span>
                <h3 className={styles.waTitle}>Chat WhatsApp</h3>
              </div>
              <p className={styles.waText}>
                Dapatkan respon lebih cepat melalui WhatsApp kami.
              </p>
              <a 
                href="https://wa.me/6281234567890?text=Halo%20Prime%20Property,%20saya%20tertarik%20dengan%20properti%20Anda."
                target="_blank"
                rel="noopener noreferrer"
                className={styles.waButton}
              >
                Mulai Chat <span className={styles.waBtnArrow}>↗</span>
              </a>
            </div>
          </div>

          {/* Right Column: Kirim Pesan Form */}
          <div className={`${styles.formCard} reveal`}>
            <h2 className={styles.formTitle}>Kirim Pesan</h2>

            {submitResult && (
              <div className={`${styles.resultBox} ${submitResult.success ? styles.resultBoxSuccess : styles.resultBoxError}`}>
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
                  placeholder="Masukkan nama lengkap"
                  disabled={isSubmitting}
                />
                {errors.nama && <span className="form-error">{errors.nama}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  disabled={isSubmitting}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="nomorHp" className="form-label">Nomor HP</label>
                <input 
                  type="tel" 
                  id="nomorHp" 
                  className={`form-input ${errors.nomorHp ? 'form-input-error' : ''}`}
                  value={nomorHp}
                  onChange={(e) => setNomorHp(e.target.value)}
                  placeholder="Masukkan nomor HP Anda"
                  disabled={isSubmitting}
                />
                {errors.nomorHp && <span className="form-error">{errors.nomorHp}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="pesan" className="form-label">Pesan</label>
                <textarea 
                  id="pesan" 
                  rows={4}
                  className={`form-input ${errors.pesan ? 'form-input-error' : ''}`}
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder="Tulis pesan Anda di sini..."
                  disabled={isSubmitting}
                ></textarea>
                {errors.pesan && <span className="form-error">{errors.pesan}</span>}
              </div>

              <button 
                type="submit" 
                className={`${styles.submitButton} gold-shimmer`} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Mengirim...</span>
                ) : (
                  <span>Kirim Pesan <span className={styles.btnArrow}>→</span></span>
                )}
              </button>
            </form>
            <p className={styles.formNote}>
              Semua field wajib diisi. Pesan Anda akan dikirim ke email admin kami.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Google Maps Section ─── */}
      <section className={styles.mapsSection}>
        <div className={styles.mapsHeader}>
          <h2 className={`${styles.sectionTitle} reveal`}>Lokasi Kantor Kami</h2>
        </div>
        
        <div className={`${styles.mapsContainer} reveal`}>
          {/* Background Map Visual */}
          <img 
            src="/map-location.png" 
            alt="Office Location Map Background Grid" 
            className={styles.locationMapImg} 
          />
          <div className={styles.locationMapOverlay}></div>

          {/* Floating Address Box */}
          <div className={styles.addressFloatingBox}>
            <h3 className={styles.addressBoxTitle}>Prime Property Office</h3>
            <p className={styles.addressBoxText}>
              Jl. Krakatau No.123, Medan, <br />
              Sumatera Utara 20234
            </p>
            <a 
              href="https://maps.google.com/?q=Jl.+Krakatau+No.123,+Medan" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.mapsRedirectBtn}
            >
              Lihat di Google Maps 🗺️
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
