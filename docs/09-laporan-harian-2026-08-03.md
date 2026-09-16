# Laporan Harian — Smart MBG

- Tanggal: Senin, 03 Agustus 2026
- Status: ✅ Fitur "Halaman Karir / Lowongan Kerja" **selesai** & ✅ Layout navbar role **dirapikan**
- Tautan pratinjau: https://smart-mbg-local-preview-03853770.base44.app

---

## Yang Dikerjakan Hari Ini

### Fitur Baru: Halaman Karir / Lowongan Kerja (Career)

**Cara akses:**
- Halaman karir **terbuka untuk publik** (dapat dilihat siapa saja) → menu **Karir** di navbar.
- Peran **Warga bisa melamar** (apply) melalui halaman detail lowongan.

**Jenis lowongan (sesuai kebutuhan MBG):**
- **SPPG (dapur)** — tenaga penyiapan/pengemasan makanan.
- **Logistik** — pengemudi/kurir & pendukung pengiriman.
- **Lainnya (terkait MBG)** — helper gudang/warehouse, dst.

**Siapa yang mengelola/menambah lowongan:**
- **SPPG** dan **Logistik**, masing-masing melalui menu "Kelola Lowongan" di dashboard
  mereka (bisa tambah, ubah, tutup, hapus, dan melihat daftar pelamar).

**Yang sudah dibangun:**
- Halaman publik daftar lowongan + pencarian & filter kategori.
- Halaman detail lowongan + form lamaran untuk warga (butuh login warga).
- Menu "Kelola Lowongan" di dashboard SPPG dan Logistik.
- Contoh data lowongan yang tersedia langsung di preview.

**Alur demo:**
1. Buka `/career` → lihat daftar lowongan.
2. Login sebagai Warga → buka detail → isi lamaran → kirim.
3. Login SPPG/Logistik → "Kelola Lowongan" → tambah/edit/hapus & lihat pelamar.

---

Catatan: fitur ini menambah pengembangan di atas aplikasi utama Smart MBG yang
sudah ter-deploy. Proyek asli "SMART MBG 1" milik orang lain tidak disentuh.

---

## Penyesuaian UI/UX: Tata Letak Navbar Setiap Role

**Latar belakang:** Menu role pengelola (SPPG, Supplier, Logistik, Admin) sangat
banyak sehingga tampil berjejer penuh di navbar (harus scroll ke samping) dan
terlihat berantakan / kurang user-friendly.

**Perubahan yang dilakukan (file `TopNavLayout.jsx`):**
- **Menubar kategori + dropdown** (pola web-app umum): navbar hanya menampilkan
  tombol kategori sesuai kelompok menu, mis. SPPG (4 kategori), Supplier (3),
  Logistik (5), Admin (4). Hover/klik membuka dropdown berisi menu lengkap
  (ikon + label + badge), **tanpa perlu scroll ke samping**.
- Kategori yang sedang aktif ditandai hijau emerald.
- **Mobile/tablet:** tombol "Menu" membuka panel geser (slide-over) berisi menu
  yang dikelompokkan per kategori; bottom-nav 5 menu utama tetap tersedia.
- Tombol "Ke Marketplace Publik" **dihapus** untuk keempat role pengelola
  (SPPG, Supplier, Logistik, Admin) karena hanya berfungsi mengelola, bukan
  belanja.
- Klik logo → kembali ke halaman pertama role (Dashboard), bukan ke halaman publik.
- **Tombol "Keluar" (logout)** ditambahkan di navbar keempat role pengelola:
  tampil di pojok kanan navbar (desktop) dan di samping tombol Menu (mobile);
  klik → bersihkan sesi → kembali ke `/portal`.
- **Halaman Career publik:** data dummy lowongan ditambah (total ±17 posisi,
  seed di-bump ke `smb_seed_v3` agar browser lama ikut ter-seed ulang); untuk
  user **SPPG & Logistik yang login**, tersedia tombol **"Tambah Lowongan"**
  yang membuka **popup** untuk membuat lowongan langsung dari halaman publik.
  Modal form lowongan di-refactor jadi komponen reusable (`JobFormModal.jsx`)
  dan dipakai di halaman publik serta halaman "Kelola Lowongan".
- Layout warga / publik tidak berubah.

**Verifikasi:** build & lint bersih, test alur (30 PASS) tetap lolos, sudah
deploy ulang ke pratinjau.