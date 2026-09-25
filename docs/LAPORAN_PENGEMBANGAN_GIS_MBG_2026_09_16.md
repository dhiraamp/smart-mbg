# Laporan Rinci Pengembangan & Integrasi GIS Smart MBG Garut
**Tanggal Pelaksanaan:** 16 September 2026  
**Fokus Utama:** Integrasi Data Resmi Disperindag Garut, Fitur Geospasial, Dropdown Entitas Terpadu, Refactoring UI, & Manajemen Repositori

---

## 1. Ringkasan Eksekutif

Pada hari ini, telah diselesaikan serangkaian peningkatan besar (*major enhancement*) pada modul Geospasial (GIS) **Smart MBG** untuk wilayah Kabupaten Garut. Sistem kini terintegrasi penuh dengan data resmi dari portal Disperindag Kabupaten Garut (*MISTER MBG - mistermbg.disperindag.garutkab.go.id/mbg*), mencakup **446 Dapur SPPG**, **1.611 Sekolah/Sasaran Penerima**, **8 Supplier Pangan Binaan**, dan **8 Rute Jalur Logistik Terjadwal** di **36 Kecamatan**.

Selain itu, antarmuka pengguna (*UI/UX*) telah ditingkatkan secara signifikan:
1. Menghadirkan **Dropdown Pemilih Entitas di samping Search Bar** yang adaptif.
2. Menambahkan **Widget Kontrol Navigasi Peta Interaktif** (*Zoom In, Zoom Out, Pusat Garut, & Fit Bounds*).
3. Melakukan **Sanitasi String Nama** dari dokumen PDF mentah menjadi teks yang bersih dan mudah dibaca.
4. Menghilangkan **Kotak-kotak Metrik Redundan di atas peta** agar tampilan peta lebih bersih, langsung terlihat, dan fokus.
5. Menyediakan **Kartu Direktori Dinamis & Modal Rincian Komprehensif** untuk setiap entitas di bawah peta.
6. Memastikan seluruh pengujian otomatis (**19 Test GIS** dan **30 Test Alur Aplikasi**) lolos **100%**, serta verifikasi `npm run build` sukses tanpa *error*.

---

## 2. Rincian Masalah & Solusi yang Dikerjakan

### A. Ekstraksi & Integrasi Data Resmi Disperindag Garut
* **Permasalahan Awal:** Data peta sebelumnya masih menggunakan sampel acak/dummy (< 50 titik) dan belum merefleksikan sebaran nyata di lapangan.
* **Tindakan:**
  * Mengekstraksi 5 berkas PDF resmi dari direktori `src/data/mister mbg/`.
  * Menemukan dan memetakan 446 Satuan Pelayanan Pangan Bergizi (SPPG) serta 1.611 titik sasaran penerima manfaat di 36 kecamatan Kabupaten Garut.
  * Menghasilkan berkas data terstruktur:
    * `src/data/mister_mbg_official_garut.json` (Dataset JSON lengkap).
    * `src/data/misterMbgOfficialGarut.js` (Modul JavaScript ESM untuk Vite bundler).
  * Memperbarui `src/api/gisService.js` dengan konstanta koordinat 36 kecamatan (`KECAMATAN_COORDS`), mekanisme penyimpanan lokal reaktif, serta fungsi pemulihan (*reset to official baseline*).

---

### B. Pembersihan & Sanitasi Nama SPPG dan Sekolah Sasaran
* **Permasalahan:** Teks yang diekstrak dari tabel PDF sering kali berupa string panjang hasil penggabungan tanpa spasi rapi (contoh: `"1 SPPG GARUT KADUNGORA TALAGASARI Kecamatan Kadungora Suprayogi Purnomo Repi Fahmi Sidiq Pos yandu lunjuk hilir"`).
* **Solusi:**
  * Membangun fungsi parser regex cerdas `cleanSchoolName()` yang mendeteksi batas kata (*word boundary*) untuk jenjang pendidikan dan fasilitas kesehatan (`SDN`, `SMPN`, `SMAN`, `SMKN`, `TK`, `PAUD`, `KOBER`, `RA`, `MI`, `MTS`, `POSYANDU`, `BALITA`, `BUMIL`, dll.).
  * Menampilkan kode standar SPPG (`SPPG-001` s/d `SPPG-446`) dan nama desa/unit yang rapi (`SPPG #001 Talagasari`, `SPPG #002 Tanggulun`, dll.).
  * Mengelompokkan kategori penerima manfaat secara otomatis (`getPenerimaCategory()`) ke dalam:
    * *Siswa SD / MI*
    * *Siswa SMP / MTs*
    * *Siswa SMA / SMK / MA*
    * *PAUD & TK*
    * *Balita & Baduta*
    * *Ibu Hamil & Menyusui*
    * *Posyandu & Kader*

---

### C. Kontrol Navigasi & Peta Geospasial
* **Permasalahan:** Peta sebelumnya tidak memiliki tombol navigasi zoom yang nyaman di perangkat layar sentuh/desktop selain bawaan Leaflet standar.
* **Solusi:**
  * Membuat komponen `MapNavigationControls`:
    * Tombol **Perbesar (`+`)** & **Perkecil (`-`)** dengan indikator zoom level aktif (contoh: `11x`).
    * Tombol **Pusatkan ke Garut Kota (🎯)** untuk mereset kamera ke koordinat pusat Kabupaten Garut.
    * Tombol **Fokuskan Titik Terfilter (⛶)** untuk secara cerdas mengkalkulasi `L.latLngBounds` dari entitas yang sedang aktif terfilter.
  * Mengaktifkan `scrollWheelZoom={true}` dan animasi transisi halus (`flyTo`) saat pengguna memilih kecamatan tertentu dari dropdown.

---

### D. Dropdown Pemilih Entitas di Samping Search Bar
* **Permasalahan:** Pengguna ingin mengetahui detail bukan hanya dari Dapur SPPG, namun juga sekolah sasaran, penerima manfaat, supplier binaan, dan jalur distribusi logistik secara menyeluruh.
* **Solusi:**
  * Memposisikan elemen `<select>` dropdown bernuansa hijau *emerald* tepat di samping kiri kolom pencarian:
    1. 🏢 **Dapur SPPG** (446 unit)
    2. 🏫 **Sekolah Sasaran** (1.611 unit)
    3. 👥 **Penerima Manfaat** (Total alokasi porsi harian)
    4. 🌾 **Supplier Pangan Binaan** (8 sentra komoditas)
    5. 🚚 **Jalur Distribusi Logistik** (8 rute aktif)
  * Mengintegrasikan perilaku adaptif:
    * Placeholder search bar berganti otomatis sesuai entitas terpilih.
    * Filter sekunder di baris ke-3 berubah dinamis (Kapasitas Dapur, Jenjang Sekolah, Kategori Penerima, Komoditas Supplier, atau Jarak Tempuh Jalur).
    * Dropdown Kecamatan (36 wilayah) menampilkan jumlah unit entitas yang aktif.

---

### E. Penataan Ulang UI: Penghapusan Kotak Metrik di Atas Peta
* **Permasalahan:** Terdapat 5 kartu metrik (*stat cards*) berukuran besar di atas peta yang menampilkan angka-angka ringkasan yang redundan, memakan ruang vertikal, dan menutupi pandangan langsung ke peta.
* **Solusi:**
  * Menghapus seluruh blok grid kotak metrik di atas peta beserta state `detail` dan modal dialog terkait.
  * Peta Leaflet kini berada tepat di bawah panel pencarian/filter, menghasilkan tata letak yang bersih, ringkas, dan langsung dapat dieksplorasi oleh pengguna.

---

### F. Direktori Kartu & Modal Dialog Komprehensif
Di bawah peta, direktori data berubah secara dinamis sesuai entitas yang dipilih:
1. **Kartu Dapur SPPG**: Kode, Nama Unit, Wilayah Kecamatan, Kapasitas Harian (Porsi/Hari), Nama Yayasan Penyelenggara, dan Jumlah Sasaran Terhubung.
2. **Kartu Sekolah Sasaran**: Badge Jenjang, Nama Sekolah Bersih, Kecamatan, Jumlah Siswa Penerima, dan Dapur SPPG Penyuplai.
3. **Kartu Penerima Manfaat**: Kategori Sasaran, Alokasi Porsi, Kecamatan, dan Dapur Distribusi.
4. **Kartu Supplier Pangan**: Jenis Komoditas Pangan Pokok/Protein/Sayur, Kontak Person, dan Wilayah Sentra.
5. **Kartu Jalur Distribusi**: Hub Garut Kota ➔ Tujuan, Panjang Lintasan (km), Estimasi Waktu, dan Jadwal Pengiriman.

Setiap kartu memiliki dua tombol aksi:
* **"Fokus di Peta"**: Melakukan animasi kamera halus (`map.flyTo`) langsung menuju koordinat marker atau menyesuaikan batas lintasan jalur (`map.fitBounds`).
* **"Detail [Entitas]"**: Membuka modal dialog lengkap dengan informasi menyeluruh.

---

### G. Manajemen Repositori Git
* Menginisialisasi repositori Git lokal (`git init`, branch `main`).
* Mengonfigurasi identitas author dan melakukan commit pertama atas seluruh pembaruan proyek (`b64ac53`).
* Menganalisis kendala push yang dialami pengguna (*unrelated histories* / *fetch first*) akibat file bawaan di repo GitHub baru.
* Melakukan pemutusan seluruh koneksi Git sesuai instruksi pengguna:
  * Mencabut remote origin (`git remote remove origin`).
  * Menghapus direktori `.git` secara permanen (`Remove-Item -Recurse -Force .git`).
  * Memverifikasi path `.git` tidak ada lagi (`Test-Path .git -> False`), mengembalikan proyek ke status lokal murni yang aman.

---

## 3. Daftar Berkas yang Dimodifikasi / Dibuat

| No | Path Berkas | Jenis Perubahan | Deskripsi |
|---|---|---|---|
| 1 | `src/components/marketplace/GisMap.jsx` | **Modifikasi Utama** | Dropdown entitas samping search bar, sanitasi nama, navigasi peta, direktori dinamis, modal dialog 5 entitas, dan penghapusan kotak stat redundan. |
| 2 | `src/api/gisService.js` | **Pembaruan Service** | Dataset baseline 446 SPPG & 1.611 Sekolah, koordinat 36 kecamatan Garut, fallback aman localStorage, event reaktif `smartmbg_gis_updated`. |
| 3 | `src/data/mister_mbg_official_garut.json` | **Berkas Baru** | Basis data JSON resmi hasil ekstraksi 5 berkas PDF Disperindag Garut. |
| 4 | `src/data/misterMbgOfficialGarut.js` | **Berkas Baru** | Wrapper JavaScript ESM untuk data resmi Disperindag Garut agar kompatibel dengan Node & Vite bundler. |
| 5 | `scripts/test-gis-integration.mjs` | **Pengujian** | Skrip pengujian otomatis 19 assertions untuk validasi integrasi data, batas koordinat Garut, parser CSV/GeoJSON, dan event reaktif. |
| 6 | `docs/LAPORAN_PENGEMBANGAN_GIS_MBG_2026_09_16.md` | **Dokumentasi** | Laporan dokumentasi rinci atas seluruh pekerjaan hari ini. |

---

## 4. Hasil Verifikasi & Pengujian Kualitas

1. **Kompilasi Produksi (`npm run build`)**:
   * **Status:** `SUCCESS (Exit Code 0)`
   * **Modul Tertransformasi:** 4.160 modul.
   * **Waktu Bundling:** ~28 detik.
   * **Output:** Direktori `dist/` ter-generate sempurna tanpa error sintaks maupun tipe.

2. **Pengujian Integrasi Data GIS (`scripts/test-gis-integration.mjs`)**:
   * **Hasil:** `19 PASS, 0 FAIL (100%)`
   * Memvalidasi keabsahan portal resmi Disperindag, kelengkapan 446 Dapur SPPG, 1.611 Sekolah Sasaran, 8 Supplier, 8 Jalur Logistik, serta koordinat berada dalam batas geografis Kabupaten Garut (Lat: -6.8 s/d -8.0, Lng: 107.5 s/d 108.5).

3. **Pengujian Alur Aplikasi (`scripts/test-flow.mjs`)**:
   * **Hasil:** `30 PASS, 0 FAIL (100%)`
   * Memvalidasi alur otentikasi akun demo, multi-role redirect (Mitra, Supplier, Logistik, Penerima, Admin), CRUD keranjang belanja, real-time event, dan alur navigasi portal.

---

## 5. Kesimpulan & Panduan Akses

Seluruh tujuan pengembangan pada hari ini telah tercapai dengan tuntas:
* **Rute Pengujian Antarmuka Pengguna:** Buka browser dan navigasikan ke `http://localhost:5173/peta` atau dashboard admin di `http://localhost:5173/admin/gis`.
* **Kerapian Kode & Keamanan:** Seluruh file sementara telah dibersihkan, `.env` terlindungi dari eksposur, dan proyek lokal berjalan stabil.
