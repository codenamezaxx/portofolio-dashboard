# ⚡ Modern Dynamic Portfolio & Admin Dashboard

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?style=for-the-badge&logo=vercel)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions)

## 🚀 Gambaran Proyek
Proyek ini merupakan solusi portofolio digital berperforma tinggi yang dibangun dengan arsitektur modern Next.js App Router. Situs ini tidak hanya berfungsi sebagai etalase karya yang responsif dan estetis, tetapi juga dilengkapi dengan Dashboard Admin terpusat yang berfungsi sebagai Content Management System (CMS) dan platform analitik untuk mengelola seluruh data secara *real-time*.

## ✨ Fitur Utama

### 🌐 Portofolio Publik
*   **Modern Glassmorphic UI:** Layout responsif dengan estetika *floating glass* yang bersih dan futuristik.
*   **Seamless Theme Toggle:** Peralihan mode gelap (Dark) dan terang (Light) yang halus.
*   **Interactive Sections:** Navigasi cerdas melalui Hero, Journey (Timeline), Tech Stack (Grid Ikon), hingga Galeri Sertifikat.
*   **Dynamic Contact Form:** Sistem pengiriman pesan langsung yang terintegrasi.

### 🔐 Pusat Kontrol Admin
*   **High-Security Auth:** Panel otentikasi aman untuk melindungi data sensitif.
*   **Flexible Layout:** Sidebar dinamis yang dapat diatur (collapsed/wide) untuk efisiensi ruang kerja.
*   **Real-time Activity Log:** Pelacakan aktivitas perubahan data untuk audit keamanan dan manajemen konten.

### 🛠️ Pengelola Konten (CMS)
*   **Hero & Profile Editor:** Pembaruan teks, gambar, dan informasi profil secara instan.
*   **Modular Grid Managers:** Antarmuka intuitif untuk memperbarui elemen Timeline, Tech Stack, Proyek, dan Pencapaian (Achievements).
*   **Project Showcase:** Manajemen detail proyek lengkap dengan kategori, tautan demo, dan repositori.

### ⚙️ Operasi Infrastruktur
*   **Connection Health-Checks:** Monitor status koneksi API secara *live*.
*   **Dynamic Avatar System:** Sistem unggah gambar profil yang persisten menggunakan Supabase Storage.
*   **Backup & Sync:** Manajemen cadangan data untuk menjamin keamanan informasi.

## 🏗️ Arsitektur Teknologi

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS 4, Framer Motion |
| **Bahasa** | TypeScript |
| **Ikon & UI** | Lucide Icons, SweetAlert2, Glassmorphic UI Components |
| **Backend** | Supabase (PostgreSQL), Edge Functions, Route Handlers |
| **Validasi & State** | Zod (Schema Validation), SWR (Data Fetching) |
| **Monitoring** | Sentry (Error Tracking), Lighthouse (Performance Auditing) |
| **Deployment** | Vercel (Production) |

## 🔑 Konfigurasi Variabel Lingkungan
Buat file `.env.local` di direktori utama dan konfigurasi variabel berikut:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgresql_connection_string

# API & Security
NEXT_PUBLIC_API_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_for_admin_auth
REVALIDATE_SECRET=your_on_demand_revalidation_key

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## 💻 Panduan Pengembangan Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek di mesin lokal Anda:

1. **Klon Repositori**
   ```bash
   git clone https://github.com/username/portfolio-dashboard.git
   cd portfolio-dashboard
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Setup Kunci Lingkungan**
   Salin `.env.example` menjadi `.env.local` dan isi nilainya.

4. **Jalankan Mode Pengembangan**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

5. **Uji Kompilasi Produksi**
   ```bash
   npm run build
   npm run start
   ```

## 📦 Pertimbangan Produksi & Deployment

### Catatan untuk Deployment Vercel
Untuk menghindari kesalahan **Runtime Error 500** pada modul *serverless* yang menangani pemrosesan JSDOM (misalnya pada fungsi parsing metadata), konfigurasi `next.config.ts` telah dioptimalkan dengan:
*   **serverExternalPackages:** Memasukkan `['jsdom']` untuk memastikan kompatibilitas modul di lingkungan Node.js serverless.
*   **Environment Mapping:** Pastikan seluruh variabel lingkungan di atas telah didaftarkan pada bagian *Environment Variables* di Dashboard Proyek Vercel Anda.
*   **Image Optimization:** Domain gambar eksternal (seperti Supabase Storage) harus didaftarkan dalam `images.remotePatterns` di konfigurasi Next.js.

---
Dibuat dengan dedikasi untuk performa dan estetika. 🚀
