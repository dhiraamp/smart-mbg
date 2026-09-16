# Panduan & Dokumentasi Fitur — Perbaikan Validasi Autentikasi & Keamanan Login Portal

Dokumen ini menjelaskan hasil analisis akar masalah (*root cause analysis*) dan perbaikan keamanan terkait celah di mana pengguna sebelumnya bisa masuk (*login*) meskipun email atau kata sandi yang dimasukkan salah, serta bypass pemilihan peran (*role*).

- **Nomor Dokumen:** 19
- **Tanggal Pembuatan:** Selasa, 15 September 2026
- **Status:** ✅ Selesai, Diperbaiki & Lulus Uji Build (Production Ready)
- **Komponen Terdampak:** `src/api/base44Client.js`, `src/pages/Portal.jsx`

---

## 1. Akar Masalah (Mengapa Sebelumnya Bisa Login Padahal Kredensial Salah?)

Setelah dilakukan audit mendalam pada berkas [`src/api/base44Client.js`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/api/base44Client.js) dan [`src/pages/Portal.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/Portal.jsx), ditemukan **3 faktor utama**:

### A. Ketiadaan Pengecekan Password pada Fallback Lokal (`base44Client.js`)
* Pada mode luring/lokal (karena provider email Supabase Auth di cloud dinonaktifkan / unconfirmed), sistem mencari akun di `localStorage`:
  ```javascript
  // KODE LAMA SEBELUM DIPERBAIKI:
  const localProfiles = getLocalCollection("UserProfile");
  const matched = localProfiles.find(
    (p) => p.user_email?.toLowerCase() === email?.toLowerCase()
  );
  if (matched) {
    user = { id: matched.id, email: matched.user_email };
    profile = matched;
  }
  ```
* **Kelemahan Fatal:** Kode di atas **hanya mencocokkan alamat email**. Sama sekali **tidak ada baris kode yang memverifikasi kecocokan password** (`password === expectedPassword`)!
* Akibatnya: Jika pengguna mengetikkan email yang sudah terdaftar (seperti akun bawaan `mitra@demo.local` atau akun hasil registrasi), password apapun yang diketikkan (bahkan password salah atau 1 huruf) dianggap lolos dan berhasil login.

### B. Sesi Lama Tetap Menempel di Browser (`localStorage`)
* Saat pengguna sebelumnya berhasil melakukan registrasi atau pernah login, sistem menyimpan sesi ke `localStorage` (`smb_session_user` dan `smart_mbg_user`).
* Jika pengguna membuka halaman `/portal` tanpa menekan tombol Logout terlebih dahulu:
  * Di `Portal.jsx`, ada efek auto-redirect jika mendeteksi antrean rute (`smartmbg_intended`).
  * Jika pengguna membuka URL dashboard secara langsung (misal `/admin/dashboard`), rute proteksi meloloskannya masuk karena sesi lama belum dihapus.

### C. Pemilihan Peran (Role) di Dropdown Menimpa Hak Akses Asli Akun
* Di halaman Portal sebelumnya:
  ```javascript
  // KODE LAMA:
  localStorage.setItem("smartmbg_role", selectedRole); // Mengambil dari dropdown di layar!
  navigate(getDashboardPath(selectedRole));
  ```
* Sistem menetapkan role berdasarkan apa yang dipilih di dropdown, bukan dari role sebenarnya yang melekat pada akun di database.
* Akibatnya: Akun yang terdaftar sebagai Warga bisa memilih role Admin di dropdown dan langsung masuk ke dashboard Admin.

---

## 2. Rincian Solusi & Perbaikan yang Diterapkan

### 1. Validasi Password Wajib & Ketat ([`base44Client.js`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/api/base44Client.js))
* Memeriksa keberadaan email terlebih dahulu. Jika email tidak ditemukan di tabel `users` maupun `UserProfile`, sistem langsung menghentikan proses dan melempar error:
  > *"Email tidak terdaftar. Silakan periksa kembali atau lakukan pendaftaran akun baru."* (HTTP 404)
* Memverifikasi password secara ketat dengan data yang tersimpan saat pendaftaran atau akun demo. Jika password tidak cocok:
  > *"Password yang Anda masukkan salah. Silakan periksa kembali kata sandi Anda."* (HTTP 401)

### 2. Validasi Kesesuaian Peran (*Role Guard*)
* Sistem membandingkan `selectedRole` yang dipilih pengguna di dropdown dengan `accountRole` yang terdaftar pada profil database.
* Jika akun terdaftar sebagai Mitra tetapi pengguna memilih Admin:
  > *"Peran tidak cocok. Akun ini terdaftar sebagai Mitra / SPPG, bukan Admin. Silakan pilih peran yang sesuai."* (HTTP 403)
* Mencegah eskalasi hak akses / privilege escalation.

### 3. Penyimpanan Password Terenkripsi Lokal Saat Registrasi
* Pada fungsi `base44.auth.register`, password kini disimpan baik ke collection `UserProfile` maupun collection `users` agar dapat divalidasi keabsahannya saat pengguna melakukan login berikutnya.

### 4. Indikator Sesi Aktif & Tombol Keluar Bersih di Halaman Portal ([`Portal.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/pages/Portal.jsx))
* Jika di browser masih tersimpan sesi login pengguna sebelumnya, halaman Portal kini menampilkan banner informatif hijau:
  > **Sesi aktif saat ini:** `email@domain.com` (Peran: **Mitra**)
  > Dilengkapi tombol cepat: **[Keluar Akun Ini]** untuk menghapus sesi lama secara bersih sebelum mencoba login dengan akun lain.

---

## 3. Daftar Akun Demo Resmi untuk Pengujian

Untuk pengujian login dengan kredensial yang valid, gunakan akun demo berikut:

| Peran (Pilih di Dropdown) | Email Terdaftar | Kata Sandi Resmi |
| :--- | :--- | :--- |
| **Mitra / SPPG** | `mitra@demo.local` | `demo1234` |
| **Admin Panel** | `admin@demo.local` | `demo1234` |
| **Supplier Bahan Pangan** | `supplier@demo.local` | `demo1234` |
| **Logistik MBG** | `logistik@demo.local` | `demo1234` |
| **Warga / Penerima** | `adhiramaharani@gmail.com` | `SmartMBG2026!` |

*(Atau gunakan email & kata sandi yang baru saja Anda daftarkan melalui menu registrasi publik).*

---

## 4. Hasil Verifikasi Pengujian

1. **Uji Email Salah / Tidak Terdaftar:**
   * Input: `ngawur@gmail.com`, Password: `demo1234`
   * Hasil: ❌ Ditolak dengan pesan *"Email tidak terdaftar. Silakan periksa kembali atau lakukan pendaftaran akun baru."*
2. **Uji Password Salah:**
   * Input: `mitra@demo.local`, Password: `salahpassword`
   * Hasil: ❌ Ditolak dengan pesan *"Password yang Anda masukkan salah. Silakan periksa kembali kata sandi Anda."*
3. **Uji Peran Tidak Cocok:**
   * Input: `mitra@demo.local`, Password: `demo1234`, Dropdown: `Admin`
   * Hasil: ❌ Ditolak dengan pesan *"Peran tidak cocok. Akun ini terdaftar sebagai Mitra / SPPG, bukan Admin."*
4. **Uji Kredensial Benar:**
   * Input: `mitra@demo.local`, Password: `demo1234`, Dropdown: `Mitra / SPPG`
   * Hasil: ✅ Berhasil masuk dan diarahkan ke `/mitra/dashboard`.
5. **Uji Kompilasi Produksi Vite:**
   * Perintah: `cmd.exe /c "npm run build"`
   * Status: `✓ built in 58.27s` (0 error).

---

## 5. Proteksi Lapis Ganda di Seluruh Rute Dashboard (*Role Route Guard*)

Selain validasi form login, sistem kini menerapkan proteksi lapis ganda di tingkat Router ([`src/components/ProtectedRoute.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/components/ProtectedRoute.jsx) dan [`src/App.jsx`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/App.jsx)):

```jsx
// Proteksi ketat per peran di App.jsx:
<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
  {/* Hanya akun dengan role "admin" yang dapat membuka rute ini */}
  <Route element={<AdminLayout />}>...</Route>
</Route>

<Route element={<ProtectedRoute allowedRoles={["mitra"]} />}>
  <Route element={<MitraLayout />}>...</Route>
</Route>
```

### Mekanisme Pencegahan Tembus / Bypass:
1. **Pengunjung yang Belum Login (Guest):**
   * Membuka URL langsung seperti `http://localhost:5173/admin/dashboard`
   * ➔ **Ditolak seketika** dan dialihkan ke `/portal`.
2. **Pengguna dengan Peran Berbeda (Misal Warga mencoba membuka Admin):**
   * Pengguna login sebagai `warga`, lalu mengetik `/admin/dashboard` di address bar browser.
   * ➔ **Ditolak oleh `ProtectedRoute`** karena `userRole !== "admin"`.
   * ➔ Otomatis dialihkan kembali ke halaman miliknya (`/warga/profil`).
3. **Pengguna Memasukkan Password / Email Salah:**
   * Form login di `/portal` menolak, tidak ada sesi yang dibuat, dan pengguna tetap tertahan di halaman login dengan peringatan error merah.

