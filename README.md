# Edulab Submission Companion - Frontend

Aplikasi frontend berbasis Next.js (App Router) untuk mendemokan endpoint backend pada tes Edulab terkait sistem penjadwalan.

## Fitur Utama

- **Admin Sekolah:** Form tambah jadwal tunggal dan tabel keseluruhan jadwal yang tersimpan.
- **Import / Export Excel:** 
  - Upload file Excel (`.xlsx`) jadwal secara massal.
  - Export rekap Jam Pelajaran ke dalam format Excel.
- **Frontend Siswa:** Filter dan lihat jadwal harian spesifik per kelas pada tanggal tertentu.
- **Frontend Guru:** Lihat rekap jam mengajar (Total JP dan Total Menit) per guru berdasarkan periode waktu tertentu.
- **Frontend Yayasan:** Lihat rekap total Jam Pelajaran dari seluruh pengajar pada satu periode yang dapat ditentukan.

## Teknologi yang Digunakan

- Next.js (App Router)
- React
- Vanilla CSS (Styling modern)

## Cara Instalasi & Menjalankan

1. Clone repositori proyek ini.
2. Buat file bernama `.env` di folder utama aplikasi (Anda bisa menggunakan `.env.example` jika ada).
3. Isi konfigurasi environment variables untuk URL backend dan API Key:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_API_KEY=YOUR_API_KEY_HERE
   ```

4. Install semua dependensi proyek:

   ```bash
   npm install
   ```

5. Jalankan development server lokal:

   ```bash
   npm run dev
   ```

6. Akses aplikasi melalui browser di alamat [http://localhost:3000](http://localhost:3000) (atau port yang tertera pada konsol/terminal).

## Catatan Penting

- **Kredensial API:** Komunikasi dengan backend membutuhkan otorisasi menggunakan header HTTP `x-api-key`. Pastikan nilai `NEXT_PUBLIC_API_KEY` sama persis dengan yang dikonfigurasikan di backend Anda.
- Jika backend Anda di-*deploy* ke layanan cloud seperti Vercel atau Render, silakan update nilai `NEXT_PUBLIC_API_BASE_URL` dengan URL deployment backend tersebut.
- Error *hydration* dari browser extensions yang memodifikasi tag `<body>` (misal: Grammarly, Dark Reader, Password Managers) sudah ditangani menggunakan opsi `suppressHydrationWarning` bawaan Next.js.
