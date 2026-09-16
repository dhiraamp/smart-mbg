# Rencana Strategis Go-Live & Infrastruktur — Smart MBG

Dokumen ini memuat analisis kebutuhan, rekomendasi arsitektur, rincian estimasi biaya infrastruktur beserta **tautan sumber resmi (*official links*)**, serta peta jalan teknis (*roadmap*) untuk membawa aplikasi **Smart MBG** dari tahap prototipe/lokal menuju status **Go-Live Resmi** (dapat diakses publik, mendukung pendaftaran pengguna baru, verifikasi email aktif, dan penyimpanan database terpusat).

- **Tanggal Penyusunan:** Jumat, 11 September 2026
- **Status:** Usulan Strategis & Rencana Aksi (Siap Diajukan ke Manajemen/Atasan)

---

## 1. Latar Belakang & Kebutuhan Manajemen

Aplikasi **Smart MBG (Sistem Manajemen Rantai Pasok Terintegrasi Makan Bergizi Gratis)** akan digunakan secara resmi oleh berbagai pemangku kepentingan (*multi-stakeholder*):
1. **Dinas Ketahanan Pangan / Koordinator Pengawas MBG (Admin)**
2. **Dapur Pengolah Satuan Pelayanan Pangan Gizi (Mitra / SPPG)**
3. **Pemasok / Petani Bahan Baku Pangan (Supplier)**
4. **Armada Pengantaran & Ekspedisi (Logistik)**
5. **Masyarakat Umum / Penerima Manfaat (Warga)**

### Kebutuhan Mutlak Sistem Produksi (*Production Readiness*):
* **Registrasi Pengguna Baru:** Setiap aktor dapat mendaftar mandiri sesuai perannya (*role-based registration*).
* **Verifikasi Email Nyata (OTP / Link Aktivasi):** Mencegah akun fiktif/spam dan memastikan data pendaftar valid melalui email resmi.
* **Autentikasi & Otorisasi Aman:** Akses data dibatasi sesuai hak peran masing-masing.
* **Database Terpusat & Realtime:** Seluruh data transaksi, pesanan bahan pangan (*Purchase Order*), menu bergizi, dan stok gudang tersimpan aman di cloud serta terbarui secara otomatis lintas perangkat (HP dan Laptop).
* **Domain & Identitas Resmi:** Menggunakan nama domain resmi ber-SSL (HTTPS) untuk kredibilitas instansi.

---

## 2. Peran Alat & Komponen Infrastruktur

| Komponen | Peran dalam Sistem | Urgensi |
|---|---|---|
| **Domain Resmi** (`.id` / `.go.id` / `.com`) | Memberikan alamat website resmi dan identitas legal instansi, serta menjadi syarat wajib konfigurasi reputasi email (DKIM/SPF) agar tidak masuk folder spam. | **Wajib Mutlak** |
| **AGY (Antigravity AI)** | AI Coding Assistant & Arsitek untuk mempercepat penulisan kode, perbaikan bug, migrasi skema database, dan otomasi setup deployment. | **Alat Pengembangan (Dev Tool)** |
| **Penyedia Database & Auth (Supabase)** | Menyimpan data PostgreSQL terpusat, mengelola autentikasi aman, serta menyediakan WebSocket Realtime untuk update status order kurir/dapur secara instan. | **Wajib Mutlak** |
| **Layanan Email SMTP (Resend / Brevo)** | Mengirimkan kode verifikasi OTP dan notifikasi resmi ke alamat email pendaftar secara otomatis dan reliabel. | **Wajib Mutlak** |
| **Server Hosting / VPS** | Tempat meletakkan aplikasi frontend agar bisa diakses 24/7 di internet. | **Wajib** (Pilihan: Managed Cloud vs VPS) |

---

## 3. Perbandingan Opsi Arsitektur

### 🌟 Opsi A: Modern Managed Cloud (Sangat Direkomendasikan)
* **Frontend:** Di-hosting di **Cloudflare Pages** atau **Vercel**.
  * Otomatis CDN global, gratis SSL HTTPS, waktu muat sangat cepat, dan memiliki toleransi *traffic* tinggi tanpa risiko server down.
* **Backend & Database:** **Supabase Managed Cloud** (PostgreSQL + Auth + Realtime).
  * Sudah kompatibel langsung dengan adapter `src/api/base44Client.js`.
  * Backup data harian otomatis, keamanan *bank-grade*, dan tidak membutuhkan perawatan server Linux manual.
* **Email Service:** **Brevo** atau **Resend** (terintegrasi langsung ke Supabase Auth).
* **Kelebihan Utama:** Biaya awal sangat minim, setup cepat, tanpa beban *maintenance* server harian, dan siap langsung dipakai.

### Opsi B: Self-Hosted VPS (Server Indonesia Mandiri)
* **Infrastruktur:** Menyewa satu unit VPS Linux (Ubuntu) di data center lokal Indonesia (Biznet Gio / IDCloudHost / Niagahoster).
* **Komponen:** Nginx Reverse Proxy, Node.js runtime, dan PostgreSQL database / Supabase Docker.
* **Kelebihan:** Data 100% berada di server fisik yang dikelola sendiri (cocok jika ada regulasi ketat mengenai kepemilikan server internal instansi).
* **Kelemahan:** Membutuhkan tenaga teknis khusus untuk pemeliharaan berkala (keamanan firewall, patch OS, backup database mandiri, dan konfigurasi sertifikat SSL).

---

## 4. Rincian Estimasi Biaya & Sumber Resmi (*Pricing Reference*)

Seluruh angka biaya di bawah ini diambil langsung dari halaman resmi masing-masing penyedia layanan per **September 2026**:

### A. Domain Resmi (.id / .com)
* **DomaiNesia:**
  * Promo tahun pertama: mulai dari **Rp 99.000 / tahun**.
  * Harga normal & perpanjangan (renewal): **Rp 199.000 – Rp 249.000 / tahun**.
  * Tautan resmi: [DomaiNesia Domain Pricing](https://www.domainesia.com/domain/)
* **Niagahoster:**
  * Harga normal: **Rp 200.000 – Rp 250.000 / tahun**.
  * Tautan resmi: [Niagahoster Domain](https://www.niagahoster.co.id/domain-murah)

### B. Hosting Frontend (Modern Jamstack / CDN)
* **Cloudflare Pages:**
  * **Free Plan:** **$0 / bulan (Gratis)**.
  * Fitur: Unlimited bandwidth (tanpa biaya egress), unlimited static requests, free SSL otomatis, global edge network.
  * Tautan resmi: [Cloudflare Developer Platform Pricing](https://www.cloudflare.com/plans/developer-platform/)
* **Vercel:**
  * **Hobby Plan:** **$0 / bulan (Gratis)** (100 GB Fast Data Transfer, non-commercial).
  * **Pro Plan:** **$20 / bulan / seat** (~Rp 320.000/bulan) untuk kebutuhan instansi komersial/resmi dengan alokasi 1 TB bandwidth.
  * Tautan resmi: [Vercel Pricing](https://vercel.com/pricing)

### C. Database Cloud & Autentikasi (Supabase)
* **Free Plan:** **$0 / bulan (Gratis)**.
  * Kuota: **50.000 Monthly Active Users (MAUs)**, **500 MB Database PostgreSQL**, 1 GB File Storage, 5 GB Bandwidth Egress, dan Realtime WebSocket.
* **Pro Plan:** **$25 / bulan / organization** (~Rp 400.000/bulan).
  * Kuota: **100.000 MAUs**, **8 GB Database Storage**, backup harian otomatis (retensi 7 hari), tanpa jeda auto-pause.
  * Tautan resmi: [Supabase Pricing](https://supabase.com/pricing)

### D. Layanan Email Transaksional (SMTP OTP & Notifikasi)
* **Brevo (sebelumnya Sendinblue):**
  * **Free Plan:** **$0 / bulan (Gratis)**. Kuota: **300 email / hari (~9.000 email / bulan)**, unlimited contacts. Sangat cukup untuk tahap awal Go-Live.
  * **Starter Plan:** Mulai dari **$9 / bulan** (~Rp 145.000/bulan) untuk 5.000 email/bulan tanpa limit harian.
  * Tautan resmi: [Brevo Pricing](https://www.brevo.com/pricing/)
* **Resend:**
  * **Free Plan:** **$0 / bulan (Gratis)**. Kuota: **3.000 email / bulan (100 email / hari)**.
  * **Pro Plan:** **$20 / bulan** (~Rp 320.000/bulan) untuk kuota hingga 50.000 email/bulan.
  * Tautan resmi: [Resend Pricing](https://resend.com/pricing)

### E. Cloud VPS Indonesia (Data Center Jakarta / Tier-3)
* **Biznet Gio (NEO Lite):**
  * Paket **MS 4.2** (2 vCPU, 4 GB RAM, 60 GB SSD, Bandwidth up to 10 Gbps gratis): **Rp 139.000 / bulan**.
  * Paket **MS 4.4** (4 vCPU, 4 GB RAM, 60 GB SSD): **Rp 179.000 / bulan**.
  * Tautan resmi: [Biznet Gio NEO Lite](https://www.biznetgio.com/neolite)
* **IDCloudHost (Cloud VPS):**
  * Paket Basic Standard (fleksibel per bulan): mulai dari **Rp 87.000 / bulan**.
  * Spesifikasi 2 Core, 4 GB RAM: rata-rata **Rp 149.000 – Rp 180.000 / bulan**.
  * Tautan resmi: [IDCloudHost Cloud VPS](https://idcloudhost.com/cloud-vps/)

---

## 5. Ringkasan Rekomendasi Paket untuk Manajemen / Atasan

### 🏷️ Paket 1: Rekomendasi Terbaik (Opsi A — Modern Cloud)
*Pilihan paling hemat, stabil, cepat, dan minim beban pemeliharaan teknis.*

| Komponen | Penyedia & Paket | Estimasi Biaya | Sumber Resmi |
|---|---|---|---|
| **Domain Resmi** | DomaiNesia / Niagahoster (`.id`) | ± **Rp 200.000 / tahun** | [domainesia.com/domain](https://www.domainesia.com/domain/) |
| **Hosting Frontend** | Cloudflare Pages (Free Plan) | **Rp 0 / bulan** | [cloudflare.com/plans](https://www.cloudflare.com/plans/developer-platform/) |
| **Database & Auth** | Supabase Cloud (Free Tier) | **Rp 0 / bulan** | [supabase.com/pricing](https://supabase.com/pricing) |
| **Email SMTP OTP** | Brevo / Resend (Free Tier) | **Rp 0 / bulan** | [brevo.com/pricing](https://www.brevo.com/pricing/) / [resend.com/pricing](https://resend.com/pricing) |
| **Total Investasi Awal:** | | **± Rp 200.000 / tahun** *(Hanya modal domain)* | |

> **Catatan:** Jika dalam beberapa bulan ke depan pengguna aktif melonjak melebihi 50.000 orang atau ukuran database melebihi 500 MB, sistem cukup di-upgrade ke **Supabase Pro ($25/bln ≈ Rp 400.000/bln)** secara *one-click* tanpa perlu memindahkan server.

---

### 🏷️ Paket 2: Dedicated VPS Indonesia (Opsi B — Server Fisik Lokal)
*Pilihan jika instansi/atasan mewajibkan server fisik berada di server lokal sendiri.*

| Komponen | Penyedia & Paket | Estimasi Biaya | Sumber Resmi |
|---|---|---|---|
| **Domain Resmi** | DomaiNesia / Niagahoster (`.id`) | ± **Rp 200.000 / tahun** | [domainesia.com/domain](https://www.domainesia.com/domain/) |
| **Cloud VPS** | Biznet Gio (MS 4.2: 2 Core, 4GB RAM) | ± **Rp 139.000 / bulan** | [biznetgio.com/neolite](https://www.biznetgio.com/neolite) |
| **Email SMTP** | Brevo (Free / Starter $9) | **Rp 0 – Rp 145.000 / bulan** | [brevo.com/pricing](https://www.brevo.com/pricing/) |
| **Total Investasi Tahunan:** | | **± Rp 1.900.000 – Rp 3.500.000 / tahun** | |

---

## 6. Peta Jalan Implementasi Teknis (*Execution Roadmap*)

Untuk merealisasikan sistem hingga Go-Live, tahapan pengerjaan dibagi menjadi 5 langkah:

```
[Tahap 1] Setup Skema Database PostgreSQL (17 Tabel)
   │
   ▼
[Tahap 2] Konfigurasi Layanan Email SMTP (Kirim OTP Verifikasi)
   │
   ▼
[Tahap 3] Penyesuaian Frontend (AuthContext, Form OTP, & Typecheck)
   │
   ▼
[Tahap 4] Pembelian Domain & Konfigurasi DNS/SSL
   │
   ▼
[Tahap 5] Deployment Cloud & Pengujian Alur Penuh (End-to-End Test)
```

### Rincian Tiap Tahap:
1. **Tahap 1: Eksekusi Skema Database**
   * Membuat 17 tabel inti di PostgreSQL Supabase (`user_profiles`, `products`, `orders`, `cart_items`, `purchase_orders`, `transactions`, `weekly_menu`, `weekly_needs`, `warehouse_stock`, `stock_alerts`, `notifications`, `chat_messages`, `shopping_history`, `supplier_ratings`, `driver_ratings`, `job_openings`, `job_applications`).
   * Menyiapkan data awal (*seed migration*) agar katalog produk awal dan menu bergizi standar sudah tersedia.

2. **Tahap 2: Integrasi Email Verifikasi (SMTP)**
   * Mendaftarkan akun email transaksional di Resend atau Brevo.
   * Memasukkan host SMTP, port, user, dan password ke pengaturan Supabase Auth (*Custom SMTP*).
   * Mengatur template email resmi (logo SMART MBG, subjek pengiriman, format kode OTP 6 digit).

3. **Tahap 3: Pembenahan Frontend & Validasi Registrasi**
   * Menguji alur registrasi di `src/hooks/usePublicRegister.js` agar langsung menerima kode OTP email dan membuat baris `user_profiles` secara otomatis.
   * Menyeragamkan penanganan role `penerima` dan `warga`.
   * Memperbaiki konfigurasi `jsconfig.json` agar `npm run typecheck` 100% bebas error.

4. **Tahap 4: Konfigurasi Domain & Keamanan**
   * Membeli domain pilihan (misal: `smartmbg.id`).
   * Mengatur DNS record (A / CNAME) ke penyedia hosting serta DNS TXT (SPF & DKIM) untuk kelancaran pengiriman email.

5. **Tahap 5: Uji Coba Lapangan & Rilis Resmi**
   * Pengujian registrasi multi-role menggunakan email sungguhan.
   * Verifikasi pemesanan bahan pangan dari Mitra SPPG hingga diterima oleh Supplier dan Logistik secara realtime.
   * Serah terima sistem dan dokumentasi panduan penggunaan kepada pengguna akhir.
