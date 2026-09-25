# 🍽️ Smart MBG

**Smart MBG** adalah sistem digital terintegrasi untuk mendukung pelaksanaan program **Makan Bergizi Gratis (MBG)**, mencakup manajemen data pengguna/penerima manfaat, rantai pasok bahan pokok (bapokting), logistik distribusi, hingga portal publik & marketplace — dibangun untuk ekosistem program di wilayah Garut dan dapat diadaptasi ke wilayah lain.

---

## 🚀 Fitur Utama

- **Portal Publik & Marketplace**: Antarmuka publik yang responsif dan mobile-friendly untuk masyarakat mengakses informasi program dan marketplace bahan pokok.
- **Manajemen Data Pengguna & Lokasi**: Pendaftaran, verifikasi, dan pemetaan lokasi data pengguna/penerima manfaat program (terintegrasi dengan Supabase & audit sistem).
- **Verifikasi OTP WhatsApp**: Autentikasi pengguna melalui nomor WhatsApp resmi untuk keamanan dan validitas data.
- **Sinkronisasi Data Real-time (Mister MBG)**: Sinkronisasi otomatis data logistik dan status distribusi secara real-time.
- **Manajemen Supplier & Bapokting**: Pengelolaan data pemasok bahan pokok penting (bapokting) beserta stok dan harga.
- **Dashboard Admin & Role Management**: Panel administrasi untuk petugas program dengan manajemen peran (role-based access).
- **Validasi Data & Type Safety**: Validasi skema data (Zod) untuk menjaga keandalan transaksi dan payload logistik.
- **Notifikasi Interaktif**: Feedback dan notifikasi toast untuk setiap aksi penting (konfirmasi pesanan, update logistik, dll).

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React + Vite |
| Styling/UX | Tailwind CSS, Framer Motion, Sonner (toast) |
| Backend / Database | Supabase (PostgreSQL, Auth, Realtime) |
| Validasi Data | Zod |
| Deployment | Vercel |
| Autentikasi Tambahan | WhatsApp OTP |

> Sesuaikan tabel ini bila ada perbedaan stack aktual di project (misalnya bila sebagian modul memakai Next.js).

---

## 📋 Prasyarat

Sebelum menjalankan project ini, pastikan sudah terinstall:

- [Node.js](https://nodejs.org/) v18 atau lebih baru
- [npm](https://www.npmjs.com/) atau [bun](https://bun.sh/)
- Akun [Supabase](https://supabase.com/) (untuk database & auth)
- Kredensial Google Cloud Service Account (jika menggunakan integrasi Google Sheets/API terkait)

---

## ⚙️ Instalasi & Menjalankan Project

```bash
# 1. Clone repository
git clone https://github.com/dhiraamp/smart-mbg.git
cd smart-mbg

# 2. Install dependencies
npm install
# atau
bun install

# 3. Salin file environment contoh, lalu isi dengan kredensial Anda
cp .env.example .env

# 4. Jalankan server development
npm run dev

# 5. Build untuk produksi
npm run build

# 6. Preview build produksi
npm run preview
```

---

## 🔐 Environment Variables

Buat file `.env` di root project (jangan pernah commit file ini) berdasarkan `.env.example`, isi dengan:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
WHATSAPP_API_KEY=your_whatsapp_api_key
# tambahkan variabel lain sesuai kebutuhan integrasi
```

File kredensial JSON (misalnya Google Service Account) disimpan di folder `config/` yang **tidak** ikut ter-commit ke repository (lihat `.gitignore`).

---

## 📁 Struktur Project

```
smart-mbg/
├── config/          # Kredensial & konfigurasi sensitif (di-gitignore)
├── docs/            # Dokumentasi teknis, roadmap, dan panduan
├── public/          # Aset statis (gambar, ikon, dll)
├── scripts/         # Script utilitas (sinkronisasi data, parsing, dll)
├── src/
│   ├── api/         # Integrasi API & validasi
│   ├── components/  # Komponen UI React
│   ├── data/        # Data lokal / hasil sinkronisasi
│   └── lib/         # Fungsi utilitas & validasi (Zod)
└── vercel.json      # Konfigurasi deployment Vercel
```

---

## 📚 Dokumentasi Terkait

Dokumentasi lengkap analisis sistem, PRD, roadmap, dan panduan teknis lainnya tersedia di folder [`docs/`](docs/), di antaranya:

- Analisis sistem & PRD (Product Requirement Document)
- Roadmap & rencana eksekusi (`ROADMAP_EKSEKUSI.md`)
- Panduan integrasi real-time & sinkronisasi data
- Laporan harian pengembangan

---

## 🚢 Deployment

Project ini dikonfigurasi untuk deploy otomatis ke **Vercel**. Setiap push ke branch `main` akan memicu deployment produksi (sesuaikan dengan pengaturan CI/CD di dashboard Vercel Anda).

---

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b fitur/nama-fitur`)
3. Commit perubahan Anda (`git commit -m "feat: deskripsi fitur"`)
4. Push ke branch Anda (`git push origin fitur/nama-fitur`)
5. Buat Pull Request

---

## 📄 Lisensi

Hak cipta © 2026. Seluruh hak dilindungi. Proyek ini bersifat internal untuk mendukung program Makan Bergizi Gratis (MBG) di wilayah Garut.
