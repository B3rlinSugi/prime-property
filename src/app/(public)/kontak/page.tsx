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
          message: 'Pesan terkirim, tim kami akan menghubungi Anda.',
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
          {/* Left: Brand Heading & Checklist */}
          <div className={`${styles.heroContent} reveal`}>
            <span className={styles.heroLabel}>Hubungi Kami</span>
            <h1 className={styles.heroTitle}>
              Kami Siap Membantu Anda <br />
              Mewujudkan <span className={styles.goldText}>Investasi Properti Terbaik</span>
            </h1>
            <p className={styles.heroDescription}>
              Dapatkan konsultasi langsung dengan property expert kami.
            </p>

            <ul className={styles.bulletList}>
              <li className={styles.bulletItem}>
                <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" stroke="#C9A961" />
                  <path d="M9 12l2 2 4-4" stroke="#C9A961" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={styles.bulletText}>Respons Cepat & Profesional</span>
              </li>
              <li className={styles.bulletItem}>
                <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" stroke="#C9A961" />
                  <path d="M9 12l2 2 4-4" stroke="#C9A961" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={styles.bulletText}>Konsultasi Tanpa Biaya</span>
              </li>
              <li className={styles.bulletItem}>
                <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" stroke="#C9A961" />
                  <path d="M9 12l2 2 4-4" stroke="#C9A961" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={styles.bulletText}>Pendampingan Hingga Transaksi Selesai</span>
              </li>
            </ul>

            <a 
              href="https://wa.me/6281234567890?text=Halo%20Berlin%20Sugiyanto%2C%20saya%20tertarik%20untuk%20berkonsultasi%20mengenai%20unit%20properti%20mewah%20di%20Medan."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappButton}
            >
              <svg className={styles.waIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.706 1.459h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Hubungi via WhatsApp
            </a>
          </div>

          {/* Right: Consultant Image with Floating Glass Card */}
          <div className={`${styles.heroVisual} reveal`}>
            <div className={styles.consultantWrapper}>
              <img 
                src="/premium_consultant.png" 
                alt="Berlin Sugiyanto — Senior Property Consultant" 
                className={styles.consultantImg} 
              />
              <div className={styles.consultantGlowOverlay}></div>
              
              {/* Floating Glass Card */}
              <div className={styles.floatingGlassCard}>
                <h3 className={styles.consultantName}>Berlin Sugiyanto</h3>
                <p className={styles.consultantTitle}>Senior Property Consultant</p>
                
                {/* Rating Block */}
                <div className={styles.ratingBlock}>
                  <div className={styles.starsRow}>
                    <span className={styles.star}>★</span>
                    <span className={styles.star}>★</span>
                    <span className={styles.star}>★</span>
                    <span className={styles.star}>★</span>
                    <span className={styles.star}>★</span>
                  </div>
                  <span className={styles.ratingText}>4.9 (120+ Review)</span>
                </div>
                
                {/* Avatars Block */}
                <div className={styles.clientsRow}>
                  <div className={styles.avatarOverlap}>
                    <div className={`${styles.miniAvatar} ${styles.avatar1}`}></div>
                    <div className={`${styles.miniAvatar} ${styles.avatar2}`}></div>
                    <div className={`${styles.miniAvatar} ${styles.avatar3}`}></div>
                  </div>
                  <span className={styles.clientsText}>500+ Klien Terbantu</span>
                </div>
              </div>
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
                Lihat di Google Maps 
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
                </svg>
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
    </div>
  );
}
