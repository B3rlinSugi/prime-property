import styles from './page.module.css';

export default function TentangKamiPage() {
  return (
    <div className={styles.container}>
      {/* Hero Banner */}
      <section className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>Tentang Kami</h1>
          <p className={styles.bannerSubtitle}>
            Mengenal lebih dekat Prime Property, mitra terpercaya Anda dalam menemukan ruko dan villa premium terbaik di Indonesia.
          </p>
        </div>
      </section>

      {/* Profil Perusahaan */}
      <section className={styles.profile}>
        <div className={styles.profileGrid}>
          <div className={styles.profileContent}>
            <span className={styles.profileLabel}>Profil Perusahaan</span>
            <h2 className={styles.profileTitle}>Membangun Masa Depan Properti Premium</h2>
            <p className={styles.profileText}>
              Didirikan dengan visi untuk mentransformasi cara masyarakat Indonesia berinvestasi dan memilih hunian, Prime Property telah berkembang menjadi salah satu platform real estate premium paling tepercaya di Indonesia. Kami berfokus secara eksklusif pada kurasi aset properti komersial (ruko) dan hunian mewah (villa) berkualitas tinggi.
            </p>
            <p className={styles.profileText}>
              Setiap properti yang terdaftar di portal kami telah melalui proses evaluasi internal yang sangat ketat. Kami memastikan legalitas hukum yang sempurna, lokasi dengan potensi pertumbuhan nilai aset yang tinggi, serta standar konstruksi fisik bangunan yang unggul.
            </p>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>10+</span>
                <span className={styles.statLabel}>Kawasan Pilihan</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Unit Terjual</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>99%</span>
                <span className={styles.statLabel}>Kepuasan Investor</span>
              </div>
            </div>
          </div>

          <div className={styles.profileVisual}>
            {/* Visual design element representing premium building */}
            <div style={{
              background: 'linear-gradient(135deg, #C9A961 0%, #1A1A1A 100%)',
              height: '400px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              padding: '40px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏰</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '1px' }}>PRIME SELECTION</h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '8px' }}>Only Premium Properties, Certified Legality, and High Growth Potential</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className={styles.visiMisi}>
        <div className={styles.visiMisiContent}>
          <div className={styles.visiBox}>
            <h3 className={styles.sectionBoxTitle}>Visi Kami</h3>
            <p className={styles.visiText}>
              &ldquo;Menjadi platform dan pengembang properti premium paling terpercaya dan terdepan di Indonesia, menciptakan standar baru dalam kualitas hunian mewah dan investasi komersial.&rdquo;
            </p>
          </div>

          <div className={styles.misiBox}>
            <h3 className={styles.sectionBoxTitle}>Misi Kami</h3>
            <ul className={styles.misiList}>
              <li>Menyediakan kurasi unit ruko dan villa berkualitas tinggi dengan legalitas yang 100% aman dan terjamin.</li>
              <li>Memberikan transparansi penuh dalam hal spesifikasi teknis, harga, serta detail fasilitas properti kepada calon pembeli.</li>
              <li>Memberikan pelayanan konsultasi real estate yang ramah, informatif, dan profesional guna mendampingi proses keputusan investasi pelanggan.</li>
              <li>Membangun ekosistem platform yang mempermudah agent dan internal manajemen dalam mengelola serta memasarkan properti secara dinamis dan efisien.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Nilai Perusahaan */}
      <section className={styles.values}>
        <div className={styles.sectionHeader} style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 className={styles.sectionTitle}>Nilai-Nilai Kami</h2>
          <p className={styles.sectionSubtitle} style={{ margin: '16px auto 0' }}>
            Pondasi dasar yang memandu setiap langkah, transaksi, dan interaksi bisnis kami
          </p>
        </div>

        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <div className={styles.valueCardNumber}>01</div>
            <h3 className={styles.valueCardTitle}>Integritas</h3>
            <p className={styles.valueCardText}>
              Kami menjunjung tinggi nilai kejujuran, keterbukaan, serta kepatuhan hukum penuh dalam setiap transaksi properti.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueCardNumber}>02</div>
            <h3 className={styles.valueCardTitle}>Profesionalisme</h3>
            <p className={styles.valueCardText}>
              Tim penasihat real estate kami memiliki keahlian mendalam untuk memberikan wawasan analisis pasar properti yang akurat.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueCardNumber}>03</div>
            <h3 className={styles.valueCardTitle}>Inovasi</h3>
            <p className={styles.valueCardText}>
              Menggunakan teknologi platform termutakhir untuk memberikan pengalaman pencarian unit properti yang lancar dan interaktif.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueCardNumber}>04</div>
            <h3 className={styles.valueCardTitle}>Kepuasan Pelanggan</h3>
            <p className={styles.valueCardText}>
              Kepuasan jangka panjang pelanggan dan kesuksesan investasi properti mereka adalah prioritas utama kami.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
