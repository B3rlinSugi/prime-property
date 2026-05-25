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

      {/* ─── Unified Option B: Modern Map Focus Section ─── */}
      <section className={styles.contactSection}>
        <div className={`${styles.unifiedContactBox} reveal`}>
          {/* Column 1: Map Block */}
          <div className={styles.mapColumn}>
            <iframe
              src="https://maps.google.com/maps?q=Jl.%20Krakatau%20No.123,%20Medan&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className={styles.googleMap}
            ></iframe>
            <div className={styles.mapGlowOverlay}></div>

            {/* Floating Card inside Map */}
            <div className={styles.floatingMapCard}>
              <div className={styles.floatingCardTop}>
                <img 
                  src="/property-villa-1.png" 
                  alt="Prime Property Office Building" 
                  className={styles.floatingCardThumb}
                />
                <div className={styles.floatingCardMeta}>
                  <h4 className={styles.floatingCardTitle}>Prime Property Office</h4>
                  <p className={styles.floatingCardAddress}>
                    Jl. Krakatau No.123, Medan, Sumatera Utara 20234
                  </p>
                </div>
              </div>
              <a 
                href="https://maps.google.com/?q=Jl.+Krakatau+No.123,+Medan"
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.floatingCardBtn}
              >
                Lihat di Google Maps <span style={{ marginLeft: '4px' }}>🧭</span>
              </a>
            </div>
          </div>

          {/* Column 2: Hubungi Kami Details */}
          <div className={styles.infoColumn}>
            <h2 className={styles.infoTitle}>Hubungi Kami</h2>
            <p className={styles.infoSubtitle}>
              Silakan hubungi kami melalui informasi di bawah atau kirim pesan langsung melalui form.
            </p>

            <div className={styles.infoList}>
              {/* Block 1 */}
              <div className={styles.infoItem}>
                <div className={styles.infoIconWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIconSvg}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoLabel}>Telepon / WhatsApp</span>
                  <a href="tel:+6281234567890" className={styles.infoValue}>+62 812 3456 7890</a>
                </div>
              </div>

              {/* Block 2 */}
              <div className={styles.infoItem}>
                <div className={styles.infoIconWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIconSvg}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoLabel}>Email</span>
                  <a href="mailto:info@primeproperty.id" className={styles.infoValue}>info@primeproperty.id</a>
                </div>
              </div>

              {/* Block 3 */}
              <div className={styles.infoItem}>
                <div className={styles.infoIconWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIconSvg}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoLabel}>Jam Operasional</span>
                  <span className={styles.infoValue}>
                    Senin - Sabtu: 09.00 - 18.00 WIB <br />
                    Minggu & Hari Libur: Tutup
                  </span>
                </div>
              </div>

              {/* Block 4 */}
              <div className={styles.infoItem}>
                <div className={styles.infoIconWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIconSvg}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.infoLabel}>Alamat Kantor</span>
                  <span className={styles.infoValue}>Jl. Krakatau No.123, Medan, Sumatera Utara 20234</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Kirim Pesan Form */}
          <div className={styles.formColumn}>
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
            <p className={styles.privacyNote}>
              Dengan mengirim pesan, Anda menyetujui <span className={styles.privacyGold}>Kebijakan Privasi</span> kami.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Bottom Google Maps Section ─── */}
      <section className={styles.mapsSection}>
        <div className={styles.mapsHeader}>
          <h2 className={`${styles.sectionTitle} reveal`}>Lokasi Kantor Kami</h2>
        </div>
        
        <div className={`${styles.mapsContainer} reveal`}>
          {/* Real Google Map styled Dark */}
          <iframe
            src="https://maps.google.com/maps?q=Jl.%20Krakatau%20No.123,%20Medan&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className={styles.googleMap}
          ></iframe>
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
              Lihat di Google Maps <span style={{ marginLeft: '4px' }}>🗺️</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
