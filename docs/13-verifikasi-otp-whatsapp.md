# Panduan & Dokumentasi Fitur — Verifikasi Kode OTP via WhatsApp

Dokumen ini menjelaskan implementasi, alur kerja (*user flow*), dan konfigurasi teknis untuk fitur **Verifikasi Pendaftaran Pengguna Menggunakan Kode OTP WhatsApp** pada aplikasi Smart MBG.

- **Tanggal Pembuatan:** Jumat, 11 September 2026
- **Status:** ✅ Selesai & Terverifikasi (Build Passed / Lint Passed / Typecheck Passed)

---

## 1. Latar Belakang & Manfaat

Menggantikan atau melengkapi verifikasi tautan email dengan kode OTP WhatsApp memiliki keunggulan signifikan di Indonesia:
* **Tingkat Keterbukaan Cepat (Instant Delivery):** Pesan WhatsApp langsung muncul sebagai notifikasi pop-up di layar HP pengguna.
* **Ramah untuk Segala Kalangan:** Sangat cocok untuk petani/supplier lokal, kurir logistik, dan warga yang jarang mengecek email.
* **Bebas Masalah Folder Spam:** Menghilangkan keluhan email verifikasi tidak sampai karena masuk folder spam/promosi.

---

## 2. Alur Pengguna (*User Flow*)

```
[Pengguna Mengisi Form Pendaftaran]
(Nama, Email, Password, dan No. WhatsApp aktif)
                 │
                 ▼ (Klik "Daftar")
[Sistem Men-generate Kode OTP 6 Digit]
                 │
                 ▼
[Pengiriman Pesan WhatsApp via Gateway API]
"Halo [Nama], Kode OTP verifikasi Smart MBG Anda adalah: [ 123456 ]"
                 │
                 ▼
[Modal Pop-up WhatsApp OTP Terbuka di Layar]
(Menampilkan nomor tujuan, kolom input 6 digit, dan timer kirim ulang 60 detik)
                 │
                 ▼
[Pengguna Memasukkan 6 Digit Kode]
                 │
                 ▼
[Akun Berhasil Aktif & Masuk ke Sistem]
```

---

## 3. Komponen yang Dibangun & Diperbarui

### A. Layanan WhatsApp Gateway ([`src/api/whatsappService.js`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/api/whatsappService.js))
* **`formatPhoneNumber(phone)`**: Menstandarkan format nomor HP lokal (`08xxx` menjadi `628xxx`).
* **`generateOtpCode()`**: Menghasilkan 6 digit angka acak yang aman.
* **`sendWhatsAppOtp({ phone, name, otpCode })`**:
  * Terintegrasi dengan endpoint REST API penyedia gateway (Fonnte API).
  * **Fitur Cerdas (Dual Mode):**
    * **Mode Live:** Jika token `VITE_FONNTE_TOKEN` telah diisi di `.env`, pesan WA dikirimkan langsung ke nomor HP pengguna secara riil.
    * **Mode Demo / Simulasi:** Jika token belum disetel di `.env`, sistem otomatis memunculkan kode OTP di layar modal dan *toast notification* sehingga pengujian fitur pendaftaran bisa langsung dicoba 100% tanpa hambatan.

### B. Hook Pendaftaran ([`src/hooks/usePublicRegister.js`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/hooks/usePublicRegister.js))
* Mengelola state OTP, nomor WhatsApp tujuan, timer pengiriman ulang, validasi kode yang dimasukkan, dan penyimpanan data profil pengguna.
* Menyediakan kode bypass testing standar (`000000`) untuk keperluan QA/demo cepat.

### C. Modal Pop-up WhatsApp ([`src/components/register/RegisterOtpModal.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/components/register/RegisterOtpModal.jsx))
* Bertema hijau khas WhatsApp dengan ikon `MessageCircle`.
* Input 6 digit angka dengan format spasi besar dan otomatis memverifikasi saat digit ke-6 selesai diketik.
* Tombol **"Kirim Ulang Kode via WhatsApp"** dilengkapi penghitung mundur (*cooldown timer*) 60 detik guna mencegah *spam request*.

### D. Formulir Registrasi 4 Peran:
* [`WargaRegForm.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/components/register/WargaRegForm.jsx) (Warga/Penerima)
* [`MitraRegForm.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/components/register/MitraRegForm.jsx) (Mitra/SPPG)
* [`SupplierRegForm.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/components/register/SupplierRegForm.jsx) (Pemasok Pangan)
* [`LogistikRegForm.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/components/register/LogistikRegForm.jsx) (Kurir/Armada)
* Seluruh form kini menandai kolom **No. WhatsApp** sebagai field wajib (*required*) dengan panduan pengiriman OTP.

---

## 4. Status Integrasi & Konfigurasi Token Aktif

Token WhatsApp Gateway Fonnte Anda telah aktif dan terpasang pada sistem:

* **File Konfigurasi:** [`.env`](file:///G:/WORK/picing/frontend/smart-mbg-local/.env)
* **Token:** `VITE_FONNTE_TOKEN=pWm4FsSP3o4o2TuHEaxJ`
* **Fallback Hardcoded:** Terpasang di [`src/api/whatsappService.js`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/api/whatsappService.js)
* **Hasil Pengecekan Gateway (Live Status):**
  ```json
  {
    "device": "082121288526",
    "name": "SMART MBG",
    "device_status": "connect",
    "quota": "1000",
    "package": "Free",
    "status": true
  }
  ```

---

## 5. Troubleshooting & Langkah Pengujian

Jika saat melakukan pendaftaran di browser pesan WhatsApp belum masuk:

1. **Restart Vite Development Server:**
   Karena konfigurasi `.env` dan proxy `vite.config.js` baru saja diperbarui, server lokal perlu dimuat ulang agar mendeteksi proxy `/fonnte-api`:
   ```bash
   # Di terminal yang menjalankan npm run dev:
   Ctrl + C
   npm run dev
   ```
2. **Periksa Format Nomor WhatsApp Pengguna:**
   Sistem secara otomatis mengubah `08xxxxxxxxxx`, `+628xxxxxxxxxx`, atau `8xxxxxxxxxx` ke format internasional `628xxxxxxxxxx`.
3. **Status Perangkat WhatsApp Pengirim:**
   Pastikan nomor HP pengirim (`085711205747`) di dashboard [Fonnte](https://fonnte.com/) tetap terhubung (*connect*).
4. **Bypass OTP untuk Testing:**
   Untuk keperluan testing cepat tanpa menunggu WA, pengembang tetap dapat memasukkan kode master `000000` pada pop-up modal verifikasi.
