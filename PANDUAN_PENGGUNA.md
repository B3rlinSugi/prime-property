# PANDUAN PENGGUNA — PRIME PROPERTY
### Dokumentasi Resmi Sistem & Portal Agent Internal (Versi 1.0)

Selamat datang di Panduan Pengguna **Prime Property**. Dokumen ini dirancang sebagai panduan lengkap (manual book) bagi pengguna umum maupun tim agen internal (Admin & Superadmin) untuk memahami seluruh fitur, alur kerja, sistem keamanan, dan antarmuka responsif dari platform Prime Property.

---

## DAFTAR ISI
1. [Gambaran Umum Platform](#1-gambaran-umum-platform)
2. [Panduan Halaman Publik (Pengunjung Umum)](#2-panduan-halaman-publik-pengunjung-umum)
   - [Landing Page (Beranda)](#landing-page-beranda)
   - [Halaman Tentang Kami](#halaman-tentang-kami)
   - [Halaman Kontak Kami & Integrasi WhatsApp](#halaman-kontak-kami--integrasi-whatsapp)
3. [Portal Agen Internal & Autentikasi Keamanan](#3-portal-agen-internal--autentikasi-keamanan)
   - [Halaman Masuk (Login Agent)](#halaman-masuk-login-agent)
   - [Kebijakan Lockout Akun (Keamanan Ketat)](#kebijakan-lockout-akun-keamanan-ketat)
   - [Kredensial Default untuk Pengujian](#kredensial-default-untuk-pengujian)
4. [Manajemen Dashboard Internal](#4-manajemen-dashboard-internal)
   - [Matriks Hak Akses (Role & Permissions)](#matriks-hak-akses-role--permissions)
   - [Pencarian & Filter Properti Lanjutan](#pencarian--filter-properti-lanjutan)
   - [Manajemen Data Properti (CRUD - Khusus Superadmin)](#manajemen-data-properti-crud---khusus-superadmin)
   - [Log Audit Aktivitas (Audit Logs)](#log-audit-aktivitas-audit-logs)
5. [Panduan Responsivitas Mobile & Perangkat Kerja](#5-panduan-responsivitas-mobile--perangkat-kerja)

---

## 1. GAMBARAN UMUM PLATFORM

**Prime Property** adalah platform digital real estate premium yang dirancang khusus untuk mempermudah publik dalam mencari aset properti bernilai investasi tinggi seperti **Ruko** dan **Villa** mewah. 

Platform ini terbagi menjadi dua bagian utama:
1. **Halaman Publik**: Area informasi interaktif untuk calon pembeli yang mencari properti unggulan dan ingin berkomunikasi dengan tim representatif pemasaran Prime Property.
2. **Dashboard Internal Agen**: Portal terproteksi berkeamanan tinggi yang digunakan oleh tim agen internal untuk mengelola seluruh data inventaris properti, memantau riwayat perubahan data, dan mengatur hak akses pengguna.

---

## 2. PANDUAN HALAMAN PUBLIK (PENGUNJUNG UMUM)

Halaman publik dapat diakses langsung oleh siapa saja secara bebas dan responsif di seluruh perangkat (smartphone, tablet, maupun laptop/macbook).

### Landing Page (Beranda)
Halaman ini adalah wajah utama Prime Property yang memberikan impresi mewah dan berkelas:
* **Hero Section**: Menampilkan tagline premium dengan tombol CTA (Call-to-Action) utama *"Lihat Properti"* yang langsung mengarahkan pengguna ke bagian properti unggulan.
* **Properti Unggulan (Featured Properties)**: Menampilkan grid berisi maksimal **6 properti pilihan** teratas. Calon pembeli dapat melihat kartu properti ringkas yang memuat nama properti, tipe (Ruko/Villa), kawasan (lokasi), dimensi ukuran (Lebar × Panjang), harga jual berformat Rupiah, status ketersediaan (*In Stock / Sold Out*), serta kesiapan bangunan (*Siap Huni, Siap Kosong, atau Siap Huni Renovasi*).
* **Mengapa Memilih Kami**: Memuat 4 nilai keunggulan utama dari Prime Property, lengkap dengan ikon vektor mewah.
* **Header Sticky**: Navigasi bagian atas web selalu menempel saat Anda menggulir halaman (*scrolling*), memudahkan akses cepat ke menu *Beranda*, *Tentang Kami*, *Kontak*, dan tombol *Login Agent*.

### Halaman Tentang Kami
Menyajikan profil lengkap Prime Property yang meliputi:
* **Profil Perusahaan**: Sejarah singkat dedikasi kami dalam mengurasi properti premium di Indonesia dengan evaluasi legalitas dan kualitas yang sangat ketat.
* **Visi & Misi**: Komitmen kami menjadi mitra terpercaya dan terdepan dalam investasi properti.
* **Nilai Inti (Core Values)**: Menjabarkan pilar *Integritas, Profesionalisme, Inovasi,* dan *Kepuasan Pelanggan*.

### Halaman Kontak Kami & Integrasi WhatsApp
Disediakan khusus untuk mempermudah calon pembeli menghubungi agen pemasaran:
* **Informasi Kontak Fisik**: Menyajikan alamat kantor operasional resmi di Medan, nomor telepon interaktif, dan email resmi perusahaan.
* **Formulir Kontak**: Calon pembeli dapat meninggalkan pesan khusus dengan mengisi nama, email, nomor HP, dan pesan detail. Formulir ini dilengkapi dengan:
  * *Validasi Real-time*: Memberikan peringatan instan berwarna merah jika kolom wajib belum diisi, format email keliru, atau nomor HP kurang dari 10 digit.
  * *Anti-Spam*: Memiliki proteksi pembatasan akses (*rate limit*) maksimal 3 pengiriman pesan per alamat IP dalam 1 jam demi menghindari penyalahgunaan sistem (*spamming*).
* **Integrasi Tombol WhatsApp Premium**: Di bagian bawah panel info kontak, terdapat tombol hijau mencolok *"Hubungi via WhatsApp"* yang terintegrasi langsung dengan API WhatsApp resmi. Ketika diklik di ponsel maupun komputer, sistem akan otomatis membuka ruang obrolan WhatsApp dengan nomor agen resmi dan menyertakan pesan pembuka otomatis secara instan.

---

## 3. PORTAL AGEN INTERNAL & AUTENTIKASI KEAMANAN

Dashboard internal adalah area sensitif yang dilindungi oleh sistem keamanan berlapis untuk menjamin integritas data properti Prime Property.

### Halaman Masuk (Login Agent)
* **Akses Tersembunyi**: Portal agen hanya dapat diakses melalui URL khusus [https://domain-anda.com/agent/login](https://domain-anda.com/agent/login). Demi alasan kerahasiaan, **tidak ada tautan langsung** dari menu navigasi publik menuju halaman ini.
* **Keamanan Masuk**: Memanfaatkan NextAuth.js v5 yang menyimpan data sesi pengguna di dalam kuki terenkripsi berkunci ketat (*HTTP-Only Cookie* berbendera *SameSite=Lax* dan *Secure* di lingkungan produksi). Masa aktif sesi masuk adalah **30 hari**.

### Kebijakan Lockout Akun (Keamanan Ketat)
Guna mencegah upaya peretasan tebakan sandi (*brute-force attack*), sistem dilengkapi dengan fungsi **Lockout Akun Otomatis**:
1. Jika seorang pengguna **gagal memasukkan kata sandi yang benar sebanyak 5 kali berturut-turut**, akun tersebut akan **terkunci secara otomatis selama 15 menit**.
2. Selama masa terkunci, sistem akan memblokir setiap upaya masuk ke akun tersebut meskipun kata sandi yang dimasukkan sudah benar, dan akan menampilkan pesan peringatan: *"Akun terkunci sementara. Silakan coba lagi dalam 15 menit."*
3. Setelah periode 15 menit berakhir, kunci akun akan terbuka secara otomatis dan pengguna dapat kembali mencoba masuk.

### Kredensial Default untuk Pengujian
Akun internal dibuat secara manual oleh Superadmin. Berikut adalah kredensial default yang telah di-seed di sistem untuk tujuan evaluasi:

* **Akun SUPERADMIN (Akses Penuh):**
  * **Email:** `super@primeproperty.id`
  * **Password:** `SuperAdmin123!`
* **Akun ADMIN (Akses Terbatas/Read-Only):**
  * **Email:** `admin@primeproperty.id`
  * **Password:** `Admin123!`

---

## 4. MANAJEMEN DASHBOARD INTERNAL

Setelah berhasil masuk, Agen akan disajikan panel kendali dashboard internal yang modern, bersih, dan sarat fitur manajemen data.

### Matriks Hak Akses (Role & Permissions)
Prime Property menerapkan prinsip *Least Privilege* (hak akses minimum) yang dikunci langsung di server backend:

| Fitur / Kemampuan | Peran: Admin (👤) | Peran: Superadmin (👑) | Keterangan / Proteksi Server |
| :--- | :---: | :---: | :--- |
| **Melihat Data Properti** | Ya (✅) | Ya (✅) | Hak dasar untuk semua agen internal. |
| **Pencarian & Filter Lanjutan** | Ya (✅) | Ya (✅) | Berjalan di sisi klien & server dengan cepat. |
| **Melihat Detail Properti** | Ya (✅) | Ya (✅) | Menampilkan seluruh kolom data terdaftar secara rinci. |
| **Menambah Properti Baru (Create)** | Tidak (❌) | Ya (✅) | Admin yang mencoba memicu API mutasi akan diblokir dengan status `403 Forbidden`. |
| **Mengubah Data Properti (Update)** | Tidak (❌) | Ya (✅) | Tombol edit disembunyikan untuk Admin; API mutasi divalidasi ketat di server. |
| **Menghapus Properti (Delete)** | Tidak (❌) | Ya (✅) | Menghapus data secara aman (*Soft Delete*). |
| **Manajemen Pengguna (Akun Agen)** | Tidak (❌) | Ya (✅) | Menu khusus Superadmin untuk memantau, mengaktifkan/nonaktifkan, dan meriset sandi Admin. |
| **Lihat Audit Log Keamanan** | Tidak (❌) | Ya (✅) | Jejak riwayat aktivitas pengeditan data properti. |

### Pencarian & Filter Properti Lanjutan
Dashboard dilengkapi mesin penyaring instan yang bekerja secara dinamis tanpa perlu memuat ulang halaman (*real-time processing* dengan waktu respon < 300ms berkat optimasi debounce):
* **Pencarian Bebas (Search Bar)**: Mencari data properti berdasarkan pencocokan teks nama properti, nama grup, maupun kawasan.
* **Filter Wilayah (Kawasan)**: Pilihan dinamis multi-select (Krakatau, Pancing, Tembung, Helvetia, Cemara Asri, Sunggal, Marelan, Amplas, Johor, Medan Kota).
* **Filter Dimensi Fisik**: Input batas ukuran Lebar minimum.
* **Filter Hadap Angin**: Memilih hadap bangunan (Utara, Selatan, Timur, Barat) secara multi-select.
* **Filter Batas Harga**: Input batas nominal Harga Maksimal.
* **Filter Tipe Bangunan**: Pilihan tipe Ruko atau Villa.
* **Filter Status Ketersediaan**: In Stock (Tersedia) atau Sold Out (Terjual).
* **Filter Kesiapan Fisik**: Multi-select kesiapan (Siap Huni, Siap Kosong, Siap Huni Renovasi).
* **Filter Carport**: Pilihan memiliki carport atau tidak.
* **Manajemen Filter**: Filter aktif ditampilkan sebagai chip kecil di atas tabel yang dapat dihapus secara individual atau dihapus sekaligus menggunakan tombol *"Reset Filter"*. State filter juga tersimpan secara otomatis di parameter URL untuk kemudahan berbagi tautan (*shareable link*).

### Manajemen Data Properti (CRUD - Khusus Superadmin)
* **Tambah Properti Baru**: Menyediakan formulir lengkap dengan validasi instan. Format harga diinput secara numerik biasa dan otomatis disimpan sebagai integer rupiah penuh di database Supabase (menghindari kesalahan desimal).
* **Ubah Data (Edit)**: Data lama akan di-prefill di formulir. Ketika disimpan, data lama dan data baru akan dibandingkan untuk dicatat perubahannya.
* **Soft Delete (Penghapusan Aman)**: Ketika data properti dihapus, sistem **tidak menghapusnya secara permanen** dari database. Sistem akan mengisi kolom `deletedAt` dengan timestamp saat dihapus. Data properti tersebut secara otomatis **tidak akan muncul** di halaman publik maupun daftar aktif internal default. Hal ini mencegah hilangnya data penting akibat ketidaksengajaan.

### Log Audit Aktivitas (Audit Logs)
Setiap kali Superadmin melakukan tindakan penambahan, pengubahan, atau penghapusan properti, sistem akan mencatat peristiwa tersebut di tabel Log Audit. Informasi yang dicatat meliputi:
1. *Siapa* agen yang melakukan tindakan tersebut.
2. *Kapan* tindakan tersebut dilakukan (berdasarkan WIB / Asia Jakarta).
3. *Aset apa* yang diubah (Nama properti beserta ID uniknya).
4. *Perubahan detail* apa yang terjadi (format JSON yang mencatat data sebelum dan sesudah pengubahan).

---

## 5. PANDUAN RESPONSIVITAS MOBILE & PERANGKAT KERJA

Sistem Prime Property dirancang sepenuhnya responsif agar dapat dibuka dengan nyaman di berbagai jenis gawai dengan perilaku khusus berikut:

### 📱 Penggunaan di iPhone & Android (Mobile Safari & Chrome Android)
1. **Pencegahan Zoom Otomatis pada iOS (iPhone)**: Di peramban Safari iOS, peramban sering kali melakukan zoom-in otomatis yang mengganggu kenyamanan ketika pengguna mengetuk kolom formulir (*input focus*) yang ukuran font-nya di bawah 16px. Sistem Prime Property telah dioptimalkan dengan meningkatkan ukuran teks masukan formulir menjadi **16px solid** khusus pada tampilan layar mobile guna mencegah gangguan zoom-in otomatis ini.
2. **Navigasi Mobile (Hamburger Menu)**: Menu navigasi publik di atas akan diringkas menjadi ikon 3 garis (hamburger) di layar mobile. Ketika diklik, menu akan bergeser mulus (*slide-in*) dari kanan layar untuk menghemat ruang.
3. **Pengguliran Tabel Properti yang Aman**: Di dashboard internal, tabel inventaris properti memuat banyak kolom data. Di layar ponsel pintar, tabel ini tidak akan hancur atau terpotong, melainkan dibungkus dengan kontainer pengguliran horizontal halus (`overflow-x: auto`), sehingga agen dapat menggeser tabel ke kanan dan kiri dengan jempol secara lancar untuk membaca seluruh kolom data.
4. **Penskalaan Grid**: Layout kartu di halaman publik yang semula berjejer 3 atau 4 kolom di komputer akan otomatis tersusun rapi menjadi **1 kolom vertikal** di layar mobile, mempermudah kenyamanan membaca tanpa perlu memperbesar layar manual.

### 💻 Penggunaan di MacBook & Laptop (Safari macOS & Chrome/Edge Windows)
1. **Haptic & Hover Micro-Animations**: Elemen interaktif seperti tombol, tautan navigasi, dan kartu properti memiliki efek transisi halus berdurasi `150ms - 250ms` yang memberikan bayangan lembut (*soft shadow*) dan sedikit terangkat ke atas (*hover lift effect*) ketika kursor mouse menyentuhnya, memberikan kesan antarmuka yang "hidup" dan premium.
2. **Pembersihan Elemen Peramban Edge/Windows**: Seperti perbaikan terbaru kami, tombol mata ganda bawaan Microsoft Edge/IE yang bertabrakan dengan tombol mata kustom pada bidang kata sandi login telah disembunyikan sepenuhnya di tingkat sistem guna menjaga konsistensi visual di seluruh perangkat macOS maupun Windows.
