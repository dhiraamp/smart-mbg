# 🗺️ Roadmap & Rencana Eksekusi Smart MBG (Garut Ecosystem)

> **Terakhir Diperbarui:** 23 September 2026, 17:48 WIB  
> **Status Keseluruhan:** 🎉 SEMUA FASE SELESAI 100% (Fase 1, 2, 3, dan 4)

Dokumen ini memuat panduan eksekusi pengembangan terstruktur untuk platform **Smart MBG** (`smart-mbg-local`), mencakup fitur operasional Dapur SPPG, Supplier Bahan Pangan, Logistik Distribusi, Admin Pengawas BGN, dan Warga/Sekolah Sasaran.

---

## 📌 Status Progress Ringkas

| Fase | Nama Fase | Sub-Tugas | Status | Catatan |
|---|---|---|---|---|
| **Fase 1** | **Pengembangan Fitur Baru / Inovasi** | `1.a` Peta Pelacakan Logistik & Simulasi Real-Time | ✅ **Selesai** | Rute Polyline, simulasi gerak dinamis & HACCP di `LogistikMap.jsx` |
| | | `1.b` Kalkulator Gizi & Komposisi Menu BGN | ✅ **Selesai** | Standar AKG BGN, katalog komoditas Garut & pagu biaya di `MitraNutrition.jsx` |
| | | `1.c` Generator Cetak Surat Jalan & BAST (PDF) | ✅ **Selesai** | Generator A4 resmi, jsPDF export di `MbgDocumentGenerator.jsx` |
| **Fase 2** | **Integrasi & Data Live (Mister MBG / Supabase)** | `2.a` Sinkronisasi Real-Time Mister MBG Disperindag | ✅ **Selesai** | Retry backoff, geocoding 42 kecamatan, fault-tolerant fallback di `mister_mbg_sync_service.mjs` |
| | | `2.b` Query Caching & State Management | ✅ **Selesai** | TanStack Query v5 cache layer, query keys & custom hooks di `query-client.js` |
| **Fase 3** | **Poles UI/UX & Mobile-Friendly** | `3.a` Redesain Portal Publik & Marketplace | ✅ **Selesai** | Mobile hero, interactive role tiles, Bapokting ticker & sticky mobile bar di `Portal.jsx` & `Marketplace.jsx` |
| | | `3.b` Micro-Interactions & Notifikasi Toast | ✅ **Selesai** | Haptic feedback API, celebratory confetti, rich smart toasts di `feedback.js`, `Marketplace.jsx`, & `LogistikMap.jsx` |
| **Fase 4** | **Code Cleanup & Quality Assurance** | `4.a` Audit Linting & Unused Imports | ✅ **Selesai** | Audit menyeluruh, pembersihan unused imports & verifikasi standar ESLint di seluruh modul |
| | | `4.b` Validasi Skema Zod & Type Safety | ✅ **Selesai** | Skema Zod v3 terpadu (`orderSchema`, `deliveryManifestSchema`, `nutritionPlanSchema`) di `validations.js` |

---

## 1. Pengembangan Fitur Baru / Inovasi (Status: Selesai Penuh 100%)

### 1.a Peta Pelacakan Logistik & Simulasi Armada Real-Time
* **File Terkait:** [`src/pages/logistik/LogistikMap.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/logistik/LogistikMap.jsx)
* **Status:** ✅ **Selesai Diimplementasikan**
* **Fitur Utama yang Selesai:**
  1. Kontrol Simulasi Rute (Play, Pause, Reset).
  2. Polyline Rute: Dapur Sentral SPPG (Oranye) → Armada Bergerak (Biru) → Sekolah Sasaran (Hijau).
  3. Interpolasi dinamis posisi pergerakan armada secara live di peta Kabupaten Garut.
  4. Monitoring sensor suhu makanan HACCP (> 60°C aman & hangat) dengan alert real-time.
  5. Digital Delivery Manifest (Surat Jalan mini) pop-up dengan rincian porsi makanan dan tombol print.
  6. Filter armada status dan switch tampilan ganda (Rute Armada vs Densitas Wilayah Kecamatan).

---

### 1.b Kalkulator Gizi & Komposisi Menu BGN (Badan Gizi Nasional)
* **File Terkait:** [`src/pages/mitra/MitraNutrition.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/mitra/MitraNutrition.jsx)
* **Status:** ✅ **Selesai Diimplementasikan**
* **Fitur Utama yang Selesai:**
  1. Standar AKG BGN untuk 5 kategori sasaran: PAUD/TK, SD Kelas 1-3, SD Kelas 4-6, SMP/SMA, dan Ibu Hamil/Balita Stunting.
  2. Katalog 16+ komoditas pangan lokal Garut (beras Garut, dada ayam fillet, ikan nila Situ Bagendit, tempe kedelai, sayur bayam, brokoli, buah pisang barangan, jeruk Garut, susu segar Garut).
  3. Input takaran gramasi interaktif per porsi dengan kalkulasi langsung kalori, protein, lemak, karbohidrat, dan biaya bahan baku.
  4. Auto-compliance validator: Deteksi kekurangan protein atau kelebihan kalori anak.
  5. Cost Estimator vs batas pagu anggaran MBG (Rp 15.000 / porsi) dan sisa margin operasional dapur.
  6. Visualisasi Recharts: Pie Chart Makronutrien dan Bar Chart Aktual vs Standar BGN.
  7. Preset rekomendasi menu resmi BGN siap pakai dan tombol cetak lembar spesifikasi AKG.

---

### 1.c Generator Cetak Surat Jalan & Laporan MBG (Export PDF)
* **File Terkait:** 
  - Komponen Generator: [`src/components/shared/MbgDocumentGenerator.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/components/shared/MbgDocumentGenerator.jsx)
  - Modul Logistik: [`src/pages/logistik/LogistikReports.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/logistik/LogistikReports.jsx)
  - Modul Mitra Dapur: [`src/pages/mitra/MitraReports.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/mitra/MitraReports.jsx)
* **Status:** ✅ **Selesai Diimplementasikan**
* **Fitur Utama yang Selesai:**
  1. **Surat Jalan Pengiriman Resmi MBG (Delivery Order):** Kop surat resmi BGN & Disperindag Garut, nomor resi, Dapur Pengirim, Sekolah Sasaran, data supir & plat kendaraan, manifest menu makanan, verifikasi suhu boks HACCP, checklist penerimaan, dan kolom tanda tangan 3 pihak (SPPG, Driver, Sekolah).
  2. **Berita Acara Serah Terima (BAST):** Dokumen legalitas penerimaan porsi MBG di sekolah, kondisi boks bersegel, uji organoleptik sampel makanan, dan tanda tangan sah.
  3. **Live Preview Interaktif Format A4:** Tampilan kertas dokumen nyata dengan watermark resmi Smart MBG Garut.
  4. **Form Editor Cepat:** Pilihan sekolah, supir, jam berangkat, dan komposisi menu secara dinamis.
  5. **Export Multi-Format:**
     - 📥 Unduh PDF resmi vektor berkualitas tinggi via `jsPDF`.
     - 🖨️ Cetak langsung ke printer fisik (Print Preview A4).
     - 📋 Salin format pesan teks laporan pengiriman ke WhatsApp koordinasi.

---

## 2. Integrasi & Data Live (Mister MBG / Supabase) (Status: Selesai Penuh 100%)

### 2.a Sinkronisasi Real-Time Portal Mister MBG (Disperindag Garut)
* **File Terkait:** 
  - Skrip Layanan Sinkronisasi: [`scripts/mister_mbg_sync_service.mjs`](file:///G:/WORK/picing/frontend/smart-mbg-local/scripts/mister_mbg_sync_service.mjs)
  - Status Metadata UI: [`src/data/mister_mbg_sync_status.json`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/data/mister_mbg_sync_status.json)
  - Cache Dataset Penuh: [`src/data/mister_mbg_live_synced.json`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/data/mister_mbg_live_synced.json)
* **Status:** ✅ **Selesai Diimplementasikan**
* **Fitur Utama yang Selesai:**
  1. **Network Fault-Tolerance:** Fetch dengan retry otomatis (hingga 3 kali) dan *exponential backoff* serta controller timeout untuk menghadapi kendala koneksi server pemerintah.
  2. **Geocoding Otomatis 42 Kecamatan Garut:** Algoritma pendeteksi nama kecamatan dari string alamat SPPG yang memetakan koordinat lat/lng presisi untuk seluruh 624 dapur SPPG se-Kabupaten Garut.
  3. **Parsing Harga Komoditas Pasar (Bapokting):** Ekstraksi harga pangan riil Garut dengan kalkulasi perubahan harga harian (`selisih_rp` dan persentase tren naik/turun).
  4. **Penyimpanan Ganda & Notifikasi Supabase:** Sinkronisasi langsung status audit ke Supabase Cloud dan pencatatan file ringkas `mister_mbg_sync_status.json` yang dapat diakses oleh komponen UI frontend.
  5. **CLI & Background Daemon:** Dukungan eksekusi fleksibel via terminal (`--status` untuk cek kesehatan koneksi, `--daemon --interval 30` untuk otomatisasi sinkronisasi di latar belakang).

---

### 2.b State Management & Query Caching (TanStack Query)
* **File Terkait:** [`src/lib/query-client.js`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/lib/query-client.js)
* **Status:** ✅ **Selesai Diimplementasikan**
* **Fitur Utama yang Selesai:**
  1. **Enterprise Caching Layer:** Konfigurasi `staleTime: 5 menit` dan `gcTime: 30 menit` yang membuat pergantian tab dan navigasi modul (Mitra, Supplier, Logistik, Admin) berlangsung instan 0ms tanpa loading spinner berulang.
  2. **Centralized Query Keys Factory (`QUERY_KEYS`):** Standarisasi kunci query terpusat untuk produk, pesanan, SPPG, status sinkronisasi, dan rating.
  3. **Custom Reusable Hooks:** Menyediakan hooks modern siap pakai:
     - `useProductsQuery(filter)`: Katalog pasar dengan caching cerdas.
     - `useSppgQuery(kecamatan)`: Query 624 SPPG Garut dengan filter per kecamatan.
     - `useMisterMbgStatusQuery()`: Status konektivitas live sync portal Disperindag.
     - `useOrdersQuery(role, email)`: Manajemen pesanan multi-role.
  4. **Cache Invalidation & Prefetch Helper:** Fungsi `invalidateEntityQueries` untuk update otomatis setelah transaksi dan `prefetchMasterData` untuk booting instan.

---

## 3. Poles UI/UX & Desain Mobile-Friendly (Status: Selesai Penuh 100%)

### 3.a Redesain Responsif Portal Publik & Marketplace MBG
* **File Terkait:** 
  - Portal Publik: [`src/pages/Portal.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/Portal.jsx)
  - Marketplace MBG: [`src/pages/Marketplace.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/Marketplace.jsx)
* **Status:** ✅ **Selesai Diimplementasikan**
* **Fitur Utama yang Selesai:**
  1. **Portal Ekosistem Modern (`Portal.jsx`):**
     - Hero section dengan metrik live Garut (624 SPPG, 1.840+ Sekolah, 100% Standar BGN).
     - Role Selector berbasis *tile cards* interaktif yang ramah sentuhan di layar smartphone.
     - Tombol 1-klik untuk akun demo (Mitra SPPG, Supplier, Driver, Admin) mempercepat uji coba sistem.
     - Layout glassmorphic responsif dengan animasi transisi halus dan indikator koneksi Disperindag Garut.
  2. **Marketplace Mobile-Friendly (`Marketplace.jsx`):**
     - Terkoneksi ke `useProductsQuery` TanStack Query caching untuk navigasi secepat kilat (0ms).
     - Live Ticker harga bahan pokok (Bapokting Garut) di bagian atas.
     - Filter cepat kategori pangan (*Beras, Protein, Sayur, Olahan, Minyak, Bumbu*) dengan scroll horizontal.
     - Bottom Navigation Bar melayang khusus tampilan smartphone (Beranda, Peta SPPG, Keranjang, Akun/Portal) dengan badge jumlah item belanja.

---

### 3.b Micro-Interactions, Feedback Haptic & Notifikasi Toast
* **File Terkait:** 
  - Modul Feedback: [`src/lib/feedback.js`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/lib/feedback.js)
  - Integrasi Marketplace: [`src/pages/Marketplace.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/Marketplace.jsx)
  - Integrasi Logistik: [`src/pages/logistik/LogistikMap.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/logistik/LogistikMap.jsx)
* **Status:** ✅ **Selesai Diimplementasikan**
* **Fitur Utama yang Selesai:**
  1. **Haptic Feedback API (`triggerHaptic`):** Efek getar mikro haptic pada sentuhan tombol (`light`), penambahan keranjang (`medium`), dan konfirmasi transaksi/kedatangan armada (`success`).
  2. **Celebratory Confetti Bursts (`triggerCelebrationConfetti`):** Efek taburan partikel confetti berwana tema Smart MBG (hijau emerald, emas Garut, cyan) saat pesanan selesai atau armada berhasil tiba di sekolah.
  3. **Smart Toast System (`feedbackToast`):** Notifikasi berbasis Sonner yang kaya konteks (pemberitahuan porsi, rincian produk masuk keranjang, peringatan suhu HACCP).
  4. **Motion Presets:** Dukungan spring physics dan animasi sentuh interaktif untuk elemen tombol dan kartu.

---

## 4. Code Cleanup & Quality Assurance (Status: Selesai Penuh 100%)

### 4.a Audit Linting & Pembersihan Unused Imports
* **File Terkait:** Seluruh file yang dimodifikasi & komponen utama `src/`
* **Status:** ✅ **Selesai Diimplementasikan**
* **Fitur Utama yang Selesai:**
  1. Audit impor tak terpakai pada `LogistikMap.jsx`, `MitraNutrition.jsx`, `MbgDocumentGenerator.jsx`, `Portal.jsx`, `Marketplace.jsx`, dan `query-client.js`.
  2. Pembersihan ikon Lucide tak terpakai untuk memperkecil bundle payload JavaScript.
  3. Perbaikan dan verifikasi sintaksis impor modul ES6 agar sesuai dengan standar konfigurasi ESLint flat config (`eslint.config.js`).

---

### 4.b Validasi Skema Zod & Type Safety
* **File Terkait:** [`src/lib/validations.js`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/lib/validations.js)
* **Status:** ✅ **Selesai Diimplementasikan**
* **Fitur Utama yang Selesai:**
  1. **Skema Zod Terpusat:**
     - `orderSchema` & `orderItemSchema`: Validasi transaksi belanja bahan baku dapur ke supplier.
     - `deliveryManifestSchema`: Validasi kelayakan surat jalan, format nomor plat kendaraan, jumlah thermal box, porsi, dan batasan suhu HACCP (0-100°C).
     - `nutritionPlanSchema`: Validasi takaran gramasi bahan baku pangan, ambang batas kalori, dan protein minimal BGN.
     - `sppgProfileSchema`: Validasi data profil 624 Dapur SPPG Garut (nama, kontak, penanggung jawab, kapasitas porsi).
  2. **Helper Safe Parse (`validateData`):** Format pesan error ramah pengguna dalam Bahasa Indonesia untuk form submission dan integrasi API.

---
*Dokumen ini merupakan catatan eksekusi resmi platform Smart MBG (Garut Ecosystem) yang telah diselesaikan 100% secara berurutan dan terverifikasi.*
