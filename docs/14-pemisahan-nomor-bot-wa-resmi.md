# Panduan & Solusi — Menggunakan Nomor Khusus Bot (Bukan Nomor Pribadi) untuk OTP WhatsApp

Dokumen ini menjelaskan mengapa nomor pribadi Anda saat ini menjadi pengirim pesan, serta memberikan **3 solusi konkret** agar pengiriman kode OTP sepenuhnya dikirim oleh **Bot / Nomor Khusus Sistem**, tanpa mengekspos nomor WhatsApp pribadi Anda.

- **Tanggal Dokumen:** Jumat, 11 September 2026
- **Status:** Panduan Implementasi & Rekomendasi Arsitektur

---

## 1. Mengapa Nomor Pribadi Anda yang Mengirim Pesan?

Di layanan gateway seperti **Fonnte (Mode Multi-Device / Web)**:
1. Sistem bekerja dengan cara menautkan akun WhatsApp melalui **Scan QR Code** (*Linked Devices / Perangkat Tertaut*).
2. Karena sebelumnya Anda men-scan QR code menggunakan aplikasi WhatsApp di HP pribadi Anda (`082121288526`), maka server Fonnte bertindak seolah-olah sebagai "WhatsApp Web di laptop Anda".
3. Akibatnya, setiap ada orang yang mendaftar di Smart MBG, pesan OTP dikirim langsung **dari akun WhatsApp pribadi Anda ke nomor pendaftar tersebut**.

Hal ini tentu **sangat tidak ideal untuk lingkungan produksi atau privasi**, karena:
* Nomor pribadi Anda akan tersimpan di HP banyak orang asing.
* Orang asing bisa membalas, menelepon, atau melihat foto profil pribadi Anda.
* Akun pribadi Anda berisiko terkena batasan/blokir (*spam restriction*) oleh WhatsApp jika mengirim pesan ke terlalu banyak nomor baru dalam waktu singkat.

---

## 2. Pilihan Solusi (Dari yang Paling Cepat hingga Standar Enterprise)

---

### Solusi 1: Menggunakan Kartu Perdana Khusus Bot Smart MBG (Paling Cepat, Murah & Praktis) ⭐ *Rekomendasi Tahap Uji Coba / MVP*

Solusi ini adalah cara tercepat dan berbiaya sangat murah untuk memisahkan nomor pribadi:

#### Langkah-langkah:
1. **Beli 1 Kartu Perdana Baru Khusus Bot:**
   * Beli kartu perdana prabayar baru (misal By.U, Telkomsel, Indosat, atau Tri) dengan harga Rp 10.000 – Rp 25.000.
   * Daftarkan nomor tersebut dengan NIK resmi.
2. **Pasang WhatsApp Business di HP:**
   * Di HP Anda (atau HP cadangan/kantor), pasang aplikasi **WhatsApp Business** (dapat berdampingan dengan WhatsApp Pribadi di satu HP jika HP Anda dual SIM atau menggunakan fitur Dual Apps / Parallel Space).
   * Daftarkan nomor baru tersebut ke WhatsApp Business.
   * Atur Profil Bisnis:
     * **Nama:** `Smart MBG Official Bot`
     * **Kategori:** Layanan Publik / Sistem Rantai Pasok Pangan
     * **Foto Profil:** Logo Smart MBG
3. **Tautkan ke Fonnte:**
   * Buka dashboard **[Fonnte.com](https://fonnte.com/)**.
   * Di menu **Device**, klik **Disconnect** (untuk melepas nomor pribadi Anda).
   * Klik tombol **Connect** / Scan QR.
   * Buka WhatsApp Business di nomor baru tadi -> klik **Perangkat Tertaut (Linked Devices)** -> Scan QR Code Fonnte.
4. **Hasil:**
   * Nomor pribadi Anda **100% aman dan tidak pernah muncul**.
   * Semua pesan OTP dikirim atas nama profil resmi **Smart MBG Official Bot**.

---

### Solusi 2: WhatsApp Cloud API Resmi (Meta Business / WABA) ⭐ *Rekomendasi Go-Live & Instansi Pemerintah*

Jika proyek Smart MBG ini ditujukan untuk instansi pemerintah (BGN / Pemda) atau operasional skala penuh, standar industri yang wajib digunakan adalah **WhatsApp Business Platform (Cloud API)** resmi dari Meta:

#### Karakteristik:
* **Tanpa Scan QR & Tanpa HP Fisik:** Sistem terhubung langsung *server-to-server* ke Meta via API token.
* **Nama Pengirim Resmi (*Sender ID*):** Nama yang muncul di chat WhatsApp adalah **"SMART MBG"** (bukan nomor HP acak).
* **Bisa Mendapatkan Centang Hijau (*Official Green Badge*):** Jika instansi/perusahaan Anda terverifikasi oleh Meta.
* **Template Pesan Interaktif:** Pesan OTP memiliki tombol resmi *"Salin Kode"* (*Copy Code Button*) seperti perbankan/Gojek/Tokopedia.
* **Biaya:**
  * Meta membebaskan biaya untuk 1.000 percakapan *Service* per bulan.
  * Untuk pesan *Authentication / OTP*, dikenakan tarif sekitar **Rp 350 - Rp 450 per pesan OTP yang berhasil terkirim**.

#### Provider Penyedia di Indonesia:
1. **Fonnte Cloud API / WABA:** Fonnte juga menyediakan opsi aktivasi WhatsApp Cloud API resmi di dashboard mereka.
2. **Mekari Qontak:** [qontak.com](https://qontak.com/) (Penyedia resmi Meta BSP terkemuka di Indonesia).
3. **Qiscus:** [qiscus.com](https://www.qiscus.com/) (Banyak digunakan oleh BUMN dan instansi pemerintahan).
4. **Twilio:** [twilio.com](https://www.twilio.com/) (Penyedia global terpercaya).

---

### Solusi 3: Mode Simulasi / Kode Darurat Selama Masa Pengembangan (Tanpa Mengeluarkan Biaya Sama Sekali)

Jika Anda saat ini sedang dalam fase pengembangan (*development*) dan belum sempat membeli kartu baru atau mendaftar ke Meta:
* Anda cukup **memutus koneksi nomor pribadi Anda di dashboard Fonnte** (*Disconnect*).
* Sistem Smart MBG di aplikasi frontend sudah kami rancang cerdas dengan fitur **Anti-Stuck**:
  1. Pop-up verifikasi pendaftaran menyediakan tombol **"Bantuan / Kode" -> "Isi Otomatis"**.
  2. Kode master pengujian **`000000`** dapat digunakan kapan saja untuk langsung mengaktifkan akun dan login tanpa perlu mengirim pesan keluar.

---

## 3. Langkah Mendesak Sekarang (Amankan Nomor Pribadi Anda)

Agar nomor pribadi Anda tidak lagi terpakai oleh bot saat orang lain mendaftar:

1. **Buka Dashboard [Fonnte.com](https://fonnte.com/):**
   * Masuk dengan akun Fonnte Anda.
   * Buka menu **Device**.
   * Klik tombol **Disconnect**.
2. **Lepaskan Tautan di HP Pribadi:**
   * Buka aplikasi WhatsApp di HP Anda (`082121288526`).
   * Buka **Setelan (Settings) -> Perangkat Tertaut (Linked Devices)**.
   * Cari perangkat bernama **Google Chrome / Fonnte** lalu klik **Keluar (Log Out)**.
3. **Status Setelah Dilepas:**
   * Nomor pribadi Anda seketika **tidak akan lagi mengirimkan pesan apa pun**.
   * Aplikasi Smart MBG di frontend akan otomatis mendeteksi status dan menampilkan kode bantuan di pop-up modal, sehingga Anda dan penguji tetap bisa mendaftar dan menggunakan aplikasi secara normal.
