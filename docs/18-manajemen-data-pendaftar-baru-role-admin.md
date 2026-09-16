# Panduan & Dokumentasi Fitur — Manajemen Data Pendaftar Baru pada Role Admin

Dokumen ini menjelaskan implementasi teknis, struktur menu navigasi, dan panduan penggunaan untuk **Manajemen Data Pendaftar Baru & Pengguna Terdaftar pada Role Admin** di aplikasi Smart MBG.

- **Nomor Dokumen:** 18
- **Tanggal Pembuatan:** Selasa, 15 September 2026
- **Status:** ✅ Selesai, Terintegrasi & Lulus Build (Production Ready)
- **Komponen Terdampak:** `AdminLayout.jsx`, `AdminPendaftarBaru.jsx`, `AdminWarga.jsx`, `AdminMitra.jsx`, `AdminSuppliers.jsx`, `AdminLogistik.jsx`, `AdminDashboard.jsx`, `App.jsx`

---

## 1. Latar Belakang & Tujuan

Sebelumnya, data pendaftar baru yang masuk melalui portal publik (`/register/:role`) tersebar dan sebagian menu admin (seperti data armada logistik) masih menggunakan data statis/dummy, serta belum ada menu manajemen khusus untuk **Warga/Penerima MBG**.

Pembaruan ini bertujuan untuk:
1. **Transparansi Data Pendaftaran:** Setiap pengguna baru yang selesai mendaftar dan memverifikasi WhatsApp langsung tersinkronisasi dan tampil di dasbor Administrator.
2. **Menu Data Khusus Per Kategori Pengguna:** Setiap role pendaftar memiliki halaman manajemen tersendiri yang lengkap dengan data spesifik (NIK warga, armada supir, NIB supplier, kapasitas dapur mitra).
3. **Pusat Pendaftar Terpadu (*Unified Hub*):** Memberikan satu halaman konsol di mana Admin dapat memantau seluruh pendaftar baru lintas peran secara *real-time*.

---

## 2. Struktur Navigasi Menu Baru di Sidebar Admin

Pada sidebar Admin ([`src/pages/admin/AdminLayout.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/admin/AdminLayout.jsx)), telah ditambahkan dan distrukturkan grup menu **"Data Pendaftar & Pengguna"**:

```
Admin Panel
├── 📊 Menu Utama
│   ├── Dashboard (/admin/dashboard)
│   ├── Manajemen Stok (/admin/stock)
│   └── SIHARBATING & MISTER MBG (/admin/bapokting)
│
├── 👥 Data Pendaftar & Pengguna [BARU & DIPERBARUI]
│   ├── 📋 Pusat Pendaftar Baru (/admin/pendaftar-baru & /admin/users)
│   ├── 🏪 Manajemen Mitra/SPPG (/admin/mitra)
│   ├── 👥 Manajemen Supplier (/admin/suppliers)
│   ├── 🚚 Manajemen Logistik (/admin/logistik)
│   ├── 👤 Manajemen Warga/Penerima (/admin/warga) [BARU]
│   └── 📅 Menu Harian SPPG (/admin/sppg-menus)
│
├── 📈 Laporan (Keuangan, Inflasi, Rantai Pasok, Bahan Pangan)
└── 💬 Komunikasi (Chat Mitra, Supplier, Logistik, Notifikasi)
```

---

## 3. Rincian Halaman & Data yang Disediakan

### A. Pusat Pendaftar Baru (`/admin/pendaftar-baru` atau `/admin/users`)
* **File:** [`src/pages/admin/AdminPendaftarBaru.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/admin/AdminPendaftarBaru.jsx)
* **Tujuan:** Konsol terpusat untuk memantau semua pendaftar baru dari seluruh kategori peran.
* **Fitur Utama:**
  * **Tab Filter Instan:** *Semua Pendaftar*, *Mitra / SPPG*, *Supplier*, *Logistik*, dan *Warga / Penerima*.
  * **Kartu Metrik Interaktif:** Menampilkan total pendaftar per peran dan jumlah yang sudah terverifikasi WhatsApp.
  * **Pencarian Real-Time:** Filter berdasarkan nama, nomor HP, email, atau NIK.
  * **Badge Role Berwarna:**
    * Mitra / SPPG (Hijau Emerald)
    * Supplier (Biru)
    * Logistik (Amber/Kuning)
    * Warga / Penerima (Ungu)
  * **Status Verifikasi WA:** Menampilkan badge `✓ WA Verified` untuk akun yang tervalidasi OTP Fonnte.
  * **Tombol Aksi Cepat:**
    * Chat WhatsApp langsung via `https://wa.me/...`
    * Modal detail profil pendaftaran lengkap
    * Toggle aktivasi / nonaktifkan akun

---

### B. Manajemen Warga / Penerima MBG (`/admin/warga`) — *Menu Baru*
* **File:** [`src/pages/admin/AdminWarga.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/admin/AdminWarga.jsx)
* **Tujuan:** Mengelola basis data seluruh penerima manfaat program MBG (warga, keluarga penerima, wali siswa).
* **Data yang Ditampilkan:**
  * Nama Lengkap (sesuai KTP)
  * 16 Digit NIK KTP
  * Nomor WhatsApp & Status Verifikasi OTP
  * Alamat Lengkap Penerima
  * Tanggal Pendaftaran
  * Status Akun (Aktif / Nonaktif)
* **Fitur Tambahan:**
  * Kartu ringkasan: Total Warga, Terverifikasi WA, Akun Aktif.
  * Modal detail lengkap kartu keluarga/warga.
  * Tombol interaksi cepat WhatsApp untuk verifikasi lapangan atau klarifikasi data.

---

### C. Manajemen Logistik & Armada (`/admin/logistik`) — *Live Integration*
* **File:** [`src/pages/admin/AdminLogistik.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/admin/AdminLogistik.jsx)
* **Pembaruan:** Sebelumnya menggunakan data statis/dummy. Sekarang terhubung langsung dengan tabel `UserProfile` role `logistik`.
* **Data yang Ditampilkan:**
  * Nama Driver / Kurir
  * Nomor & Tipe SIM (SIM A / B1 / B2 / C)
  * Jenis Kendaraan & Nomor Plat (Pickup, Truk Box, Motor)
  * Kapasitas Muatan Maksimal (kg/kuintal)
  * Kontak WhatsApp terverifikasi
  * Rating driver dan ulasan pengiriman

---

### D. Manajemen Mitra / SPPG (`/admin/mitra`)
* **File:** [`src/pages/admin/AdminMitra.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/admin/AdminMitra.jsx)
* **Pembaruan:** Penambahan fitur pencarian cepat, badge *WA Verified*, tombol direct WhatsApp chat, dan modal rincian dapur (nama PIC, kapasitas porsi, alamat operasional).

---

### E. Manajemen Supplier Pangan (`/admin/suppliers`)
* **File:** [`src/pages/admin/AdminSuppliers.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/admin/AdminSuppliers.jsx)
* **Pembaruan:** Penambahan pencarian instan, badge *WA Verified*, direct WhatsApp chat, modal detail entitas (nama PT/CV, PIC, nomor WhatsApp, rating pengiriman bahan).

---

### F. Dashboard Utama Admin (`/admin/dashboard`)
* **File:** [`src/pages/admin/AdminDashboard.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/admin/AdminDashboard.jsx)
* **Pembaruan:**
  * **Stat Card Real-Time:** Kartu *Total Mitra*, *Total Supplier*, *Armada Logistik*, dan *Warga MBG* menghitung secara dinamis dari database pengguna `UserProfile.list()`.
  * **Panel "Pendaftar Pengguna Terbaru":** Menampilkan 5 pendaftar paling baru dengan badge peran, status verifikasi WA, dan tombol pintasan *"Lihat Semua Data"*.

---

## 4. Alur Integrasi Pendaftaran ke Tampilan Admin

```
[Pengguna Mendaftar di /register/:role]
           │
           ▼
[Verifikasi Kode OTP WhatsApp (Gateway Fonnte)]
           │
           ▼
[Penyimpanan Data ke Database Supabase & Local Collection]
(table: `user_profiles`, role: mitra | supplier | logistik | penerima)
           │
           ├───────────────────────────────┐
           ▼                               ▼
[Tampil di /admin/pendaftar-baru]     [Tampil di Menu Per Role]
(Konsol Terpadu Semua Pendaftar)      - /admin/mitra
                                       - /admin/suppliers
                                       - /admin/logistik
                                       - /admin/warga
           │
           ▼
[Live Widget di /admin/dashboard]
(Stat Card Otomatis Bertambah & Muncul di List Pendaftar Terkini)
```

---

## 5. Ringkasan File & Rute yang Dibuat/Dimodifikasi

| File | Status | Perubahan / Fungsi |
| :--- | :---: | :--- |
| `src/pages/admin/AdminPendaftarBaru.jsx` | **Baru** | Halaman pusat kelola pendaftar baru dari seluruh peran. |
| `src/pages/admin/AdminWarga.jsx` | **Baru** | Halaman manajemen warga/penerima MBG dengan NIK & no. WA. |
| `src/pages/admin/AdminLayout.jsx` | Diperbarui | Menambahkan menu navigasi sidebar untuk Pendaftar Baru & Warga. |
| `src/pages/admin/AdminLogistik.jsx` | Diperbarui | Mengganti data statis menjadi data *live* database `UserProfile`. |
| `src/pages/admin/AdminMitra.jsx` | Diperbarui | Menambahkan fitur search, WA badge, direct WA chat, modal detail. |
| `src/pages/admin/AdminSuppliers.jsx` | Diperbarui | Menambahkan search, WA badge, direct WA chat, modal detail. |
| `src/pages/admin/AdminDashboard.jsx` | Diperbarui | Menghubungkan stat cards ke data dinamis & widget pendaftar terbaru. |
| `src/App.jsx` | Diperbarui | Mendaftarkan route `/admin/pendaftar-baru`, `/admin/users`, `/admin/warga`. |

---

## 6. Verifikasi & Pengujian

1. **Pengujian Build Produksi:**
   * Perintah: `cmd.exe /c "npm run build"`
   * Hasil: `✓ built in 30.00s` (0 error, 0 lint crash).
2. **Pengujian Rute Web:**
   * `http://localhost:5173/admin/pendaftar-baru` ➔ Menampilkan seluruh pendaftar dengan filter per role.
   * `http://localhost:5173/admin/warga` ➔ Menampilkan pendaftar role warga beserta NIK KTP.
   * `http://localhost:5173/admin/logistik` ➔ Menampilkan supir/armada logistik yang baru terdaftar.
   * `http://localhost:5173/admin/dashboard` ➔ Menampilkan ringkasan metrik pengguna dinamis.

---

## 7. Standarisasi Format Waktu Pendaftaran Pengguna (Hari, Tanggal, Bulan, Tahun & Jam:Menit:Detik WIB)

Sesuai kebutuhan audit dan pencatatan registrasi pengguna, seluruh data pendaftaran di portal Admin kini menampilkan rincian waktu lengkap berformat standar Indonesia:

1. **Format Tampilan Tabel Utama (`AdminPendaftarBaru`, `AdminWarga`, `AdminMitra`, `AdminSuppliers`, `AdminLogistik`):**
   * **Kolom:** `Hari, Tanggal & Waktu`
   * **Baris 1:** Hari & Tanggal (contoh: `Selasa, 15 September 2026`)
   * **Baris 2:** Ikon Jam & Waktu Detik (contoh: `🕐 08:55:30 WIB`)
2. **Format Tampilan Modal Detail Akun:**
   * **Hari & Tanggal Daftar:** `Selasa, 15 September 2026`
   * **Waktu / Jam (Jam:Menit:Detik):** `08:55:30 WIB`
   * **Waktu Terverifikasi OTP WhatsApp:** `Selasa, 15 September 2026 • 08:56:10 WIB`
3. **Helper Function Terpusat (`src/lib/utils.js`):**
   * `formatFullIndonesianDateTime(dateInput)`: Menghasilkan string lengkap `"Selasa, 15 September 2026 • 08:55:30 WIB"`.
   * `formatDateTimeParts(dateInput)`: Mengembalikan objek bagian `{ day, date, month, year, dateFormatted, time, full }` dengan proteksi null-safety dan zero-padding 2 digit (`08:05:09 WIB`).

