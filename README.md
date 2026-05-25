# Prime Property — Web Platform & Internal Agent Portal

Platform Real Estate Premium **Prime Property** yang mencakup halaman publik (Landing Page, Tentang Kami, Kontak) dan portal manajemen internal khusus agent real estate dengan fitur Role-Based Access Control (RBAC).

Proyek ini dibangun berdasarkan seluruh butir spesifikasi dokumen **Acceptance Criteria PDF (AC-1 s.d AC-10)** dengan penyempurnaan fitur premium (Arsip & Pemulihan properti, Audit Log Security Alert, dan database-backed IP rate limiting).

---

## 🔑 Demo Kredensial (Wajib Submission)

Berikut adalah akun demonstrasi bawaan (*seeding*) yang dapat langsung Anda gunakan untuk masuk ke dalam portal internal agen di halaman `/agent/login`:

### 👑 Akun 1: Superadmin (Akses Penuh - Full CRUD)
*   **Email**: `super@primeproperty.id`
*   **Password**: `SuperAdmin123!`
*   **Wewenang**: 
    *   Mengelola daftar properti secara penuh (Tambah, Edit, dan Hapus unit).
    *   Mengakses halaman pengelolaan akun Admin Agent (Tambah admin, Aktifkan/Nonaktifkan akun, Reset sandi admin).
    *   Melihat & memulihkan (*restore*) properti terhapus lewat menu **Arsip**.
    *   Melihat audit log riwayat mutasi properti serta peringatan lockout keamanan.

### 👤 Akun 2: Admin (Akses Terbatas - Read Only)
*   **Email**: `admin@primeproperty.id`
*   **Password**: `Admin123!`
*   **Wewenang**: 
    *   Hanya dapat mencari, menyaring (9 filter), dan melihat detail spesifikasi properti.
    *   Semua tombol tambah, edit, hapus, manajemen pengguna, dan audit log disembunyikan secara visual.
    *   Seluruh API mutasi dilindungi di sisi server (mencoba memaksa request POST/PUT/DELETE akan mengembalikan respon keamanan `403 Forbidden`).

---

## 🛠️ Stack Teknologi Proyek

Sesuai kriteria bebas, kami memilih teknologi terbaik untuk performa optimal, kebersihan kode data, dan keamanan:
-   **Framework**: Next.js 16 (App Router) & React 19
-   **Bahasa**: TypeScript (Strict Type-Safety)
-   **Styling (CSS)**: Vanilla CSS Modules (Branding Luxury Gold-HSL & Responsif Mobile/Tablet)
-   **Database**: PostgreSQL (Supabase Cloud)
-   **ORM**: Prisma Client v5.22.0
-   **Autentikasi**: NextAuth.js v5 (Credentials Provider)
-   **Enkripsi**: Bcryptjs (Cost factor 10)

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi Secara Lokal

Ikuti petunjuk di bawah ini untuk mengaktifkan server lokal Anda:

### 1. Buka Direktori Proyek
Buka terminal Anda (PowerShell/CMD) lalu masuk ke direktori utama proyek:
```powershell
cd "C:\Users\Berlin Sugiyanto\.gemini\antigravity\scratch\prime-property"
```

### 2. Instal Dependensi Node.js
Pasang semua paket pustaka yang dibutuhkan:
```powershell
npm install
```

### 3. Setup Database & Seeding Data
Migrasikan skema Prisma dan jalankan proses *seeding* otomatis untuk memasukkan akun demo dan 54 properti dummy:
```powershell
npx prisma db push
npx prisma db seed
```

### 4. Jalankan Server Development
Aktifkan server lokal Next.js Anda:
```powershell
npm run dev
```
Buka **http://localhost:3000** di browser Chrome/Edge Anda!

---

## 🌐 Panduan Deploy Produksi (Migrasi ke PostgreSQL)

Jika Anda ingin mengunggah proyek ini ke hosting produksi (misalnya Vercel) dan menghubungkannya dengan database PostgreSQL riil (seperti Supabase atau Neon), Anda cukup mengikuti 3 langkah sederhana:

1.  Buka berkas `prisma/schema.prisma` dan ubah tipe database:
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
2.  Buka berkas `.env` Anda dan ganti nilai `DATABASE_URL` dengan string koneksi PostgreSQL produksi Anda (contoh: `postgres://user:password@host:port/dbname`).
3.  Jalankan perintah sinkronisasi di terminal Anda:
    ```powershell
    npx prisma db push
    ```
    *Prisma akan langsung memigrasikan seluruh struktur tabel dari SQLite lokal ke PostgreSQL produksi Anda secara instan tanpa ada fitur yang rusak!*
