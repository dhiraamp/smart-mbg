# 🗺️ Roadmap & Rencana Eksekusi Smart MBG (Garut Ecosystem)

Dokumen ini memuat panduan eksekusi pengembangan terstruktur untuk platform **Smart MBG** (`smart-mbg-local`), mencakup fitur operasional Dapur SPPG, Supplier Bahan Pangan, Logistik Distribusi, Admin Pengawas BGN, dan Warga/Sekolah Sasaran.

---

## 📌 Status Progress Ringkas
- [ ] **Fase 1: Pengembangan Fitur Baru / Inovasi**
  - [x] **1.a Peta Pelacakan Logistik & Simulasi Armada Real-Time** *(Selesai Diimplementasikan)*
  - [ ] **1.b Kalkulator Gizi & Komposisi Menu BGN (Badan Gizi Nasional)** *(Berikutnya)*
  - [ ] **1.c Generator Cetak Surat Jalan & Laporan MBG (Export PDF)**
- [ ] **Fase 2: Integrasi & Data Live (Mister MBG / Supabase)**
  - [ ] **2.a Sinkronisasi Real-Time Portal Mister MBG (Disperindag Garut)**
  - [ ] **2.b State Management & Query Caching (TanStack Query)**
- [ ] **Fase 3: Poles UI/UX & Desain Mobile-Friendly**
  - [ ] **3.a Redesain Responsif Portal Publik & Marketplace MBG**
  - [ ] **3.b Micro-Interactions, Feedback Haptic & Notifikasi Toast**
- [ ] **Fase 4: Code Cleanup & Quality Assurance**
  - [ ] **4.a Audit Linting & Pembersihan Unused Imports**
  - [ ] **4.b Validasi Skema Zod & Type Safety**

---

## 1. Pengembangan Fitur Baru / Inovasi

### 1.a Peta Pelacakan Logistik & Simulasi Armada Real-Time *(Fokus Sekarang)*
* **Target File:** [`src/pages/logistik/LogistikMap.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/logistik/LogistikMap.jsx)
* **Tujuan:** Mengubah peta statis menjadi dashboard kendali logistik interaktif untuk memantau armada distribusi makan bergizi gratis dari Dapur SPPG ke sekolah-sekolah penerima di Kabupaten Garut.
* **Fitur Utama:**
  1. **Visual Hub & Destination Markers:**
     - 🏭 Icon marker Dapur Sentral / SPPG (Central Kitchen MBG) dengan detail kapasitas harian.
     - 🏫 Icon marker Sekolah Sasaran (SDN, SMPN, dsb.) dengan data jumlah penerima porsi & jadwal jam makan siang.
  2. **Pelacakan Armada & Polyline Routes:**
     - 🚚 Marker kendaraan (Mobil Box Thermal / Kurir Motor) yang menghubungkan rute Dapur SPPG ke sekolah tujuan.
     - Mode **Simulasi Tracking Real-Time** (armada bergerak dinamis di sepanjang jalur peta).
  3. **Indikator Kualitas Pangan (HACCP):**
     - Monitoring suhu boks makanan (Thermal Box / Cool Box) untuk menjamin makanan tiba dalam kondisi hangat higienis (>60°C).
  4. **Panel Detail Armada & Filter Status:**
     - Tab filter: *Semua*, *Dalam Perjalanan (In Transit)*, *Tiba di Sekolah (Delivered)*, *Standby di Dapur*.
     - Sidebar info kurir, plat nomor, estimasi waktu tiba (ETA), rincian muatan porsi, dan tombol kontak darurat.

---

### 1.b Kalkulator Gizi & Komposisi Menu BGN
* **Target File:** [`src/pages/mitra/MitraNutrition.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/mitra/MitraNutrition.jsx)
* **Tujuan:** Memberikan alat simulasi bagi Mitra Dapur SPPG untuk menyusun menu makanan harian sesuai standar Angka Kecukupan Gizi (AKG) BGN & Kemenkes.
* **Fitur Utama:**
  1. **Pemilihan Jenjang Sasaran:** PAUD/TK, SD Kelas 1-3, SD Kelas 4-6, SMP/SMA, Ibu Hamil & Balita.
  2. **Kalkulator Komposisi Bahan & Gramasi:** Input karbohidrat (beras/ubi), protein hewani (ayam/telur/ikan), protein nabati (tempe/tahu), sayur (bayam/wortel), buah (pisang/pepaya), dan susu.
  3. **Auto-Compliance Validator:** Verifikasi otomatis target kalori (kkal), protein (g), lemak (g), karbohidrat (g), dan zat besi.
  4. **Cost Estimator per Porsi:** Estimasi biaya bahan baku vs pagu anggaran per porsi (misal budget Rp 15.000).

---

### 1.c Generator Cetak Surat Jalan & Laporan MBG (Export PDF)
* **Target File:** Modul Logistik & Mitra (`src/pages/logistik/` & `src/pages/mitra/`)
* **Tujuan:** Pembuatan dokumen fisik resmi pengiriman dan serah terima makanan.
* **Fitur Utama:**
  1. **Surat Jalan / Delivery Order Resmi:** Nomor resi barcode, rute Dapur SPPG, daftar sekolah tujuan, kuota porsi, supir bertugas, dan kolom tanda tangan kepala sekolah/panitia MBG.
  2. **Berita Acara Serah Terima (BAST):** Formulir verifikasi kedatangan makanan (jumlah box diterima, jam tiba, pengecekan sampel makanan).
  3. **Preview & Export PDF:** Menggunakan `jspdf` & `html2canvas` dengan tata letak kertas A4 siap print.

---

## 2. Integrasi & Data Live (Mister MBG / Supabase)

### 2.a Sinkronisasi Real-Time Portal Mister MBG (Disperindag Garut)
* **Target File:** [`scripts/mister_mbg_sync_service.mjs`](file:///G:/WORK/picing/frontend/smart-mbg-local/scripts/mister_mbg_sync_service.mjs)
* **Tujuan:** Otomasi pengambilan data live dari portal resmi Disperindag Garut (`mistermbg.disperindag.garutkab.go.id`).
* **Fitur Utama:**
  1. Penarikan 624 Dapur SPPG se-Kabupaten Garut beserta koordinat dan penanggung jawab.
  2. Penarikan harga harian riil 24+ bahan pokok pangan pasar (Bapokting Garut) untuk referensi harga supplier.
  3. Daemon sync interval terjadwal dengan status logging dan penanganan fallback offline.

### 2.b State Management & Query Caching (TanStack Query)
* **Target File:** [`src/lib/query-client.js`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/lib/query-client.js)
* **Tujuan:** Caching cerdas untuk data master (dapur, sekolah sasaran, komoditas pasar) sehingga navigasi antar modul (Mitra, Supplier, Logistik, Admin) berjalan instan tanpa jitter.

---

## 3. Poles UI/UX & Desain Mobile-Friendly

### 3.a Redesain Responsif Portal Publik & Marketplace MBG
* **Target File:** [`src/pages/Portal.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/Portal.jsx), [`src/pages/Marketplace.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/Marketplace.jsx)
* **Tujuan:** Tampilan modern, bersih, dan sangat nyaman dibuka dari perangkat mobile (smartphone kader posyandu / guru sekolah).
* **Fitur Utama:**
  1. Hero section visual interaktif dengan status total porsi terdistribusi hari ini di Garut.
  2. Quick filter pasar komoditas pangan lokal (sayuran organik, beras Garut, telur lokal).
  3. Peta sebaran SPPG yang ringan diakses dari mobile browser.

### 3.b Micro-Interactions, Feedback Haptic & Notifikasi Toast
* **Target File:** Global layout & komponen interaktif
* **Tujuan:** Pengalaman pengguna (UX) yang responsif dengan animasi `framer-motion` dan notifikasi `sonner` pada setiap aksi penting (konfirmasi pesanan, update logistik, dsb).

---

## 4. Code Cleanup & Quality Assurance

### 4.a Audit Linting & Pembersihan Unused Imports
* **Target File:** Seluruh direktori `src/`
* **Tujuan:** Menghilangkan warning ESLint, menghapus import yang tidak terpakai, dan menyelaraskan penamaan komponen.

### 4.b Validasi Skema Zod & Type Safety
* **Target File:** [`src/api/`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/api/) & Form validations
* **Tujuan:** Menjaga keandalan data transaksi MBG, validasi input order supplier, dan struktur payload data logistik.

---
*Dokumen ini dibuat otomatis sebagai panduan kerja berkelanjutan dan dapat diperbarui secara dinamis sesuai perkembangan implementasi.*
