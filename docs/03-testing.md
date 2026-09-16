# Panduan Build & Test — Smart MBG Local

Klon full-local aplikasi Smart MBG (tanpa Base44). Data 100% dari seed /
`localStorage`; tidak ada request ke `*.base44.app`.

Lokasi: `G:\WORK\picing\frontend\smart-mbg-local`
Dibuat: Sabtu, 01 Agustus 2026

---

## 1. Prasyarat

- Node.js v20+ (terverifikasi: v24.18.0)
- npm
- Internet opsional (gambar produk via Unsplash, peta OSM, berita Satu Data Garut)

> Catatan: PowerShell di mesin ini memblokir `npm.ps1`, jadi semua perintah npm
> dijalankan lewat `cmd /c "..."`.

## 2. Install Dependensi

```bash
cd G:\WORK\picing\frontend\smart-mbg-local
cmd /c "npm install --no-audit --no-fund"
```

## 3. Build Produksi

```bash
cmd /c "npm run build"
```

Hasil: folder `dist/` dibuat. Output bersih = tidak ada error.

**Validasi build:**
- Alias `@/` harus dikonfigurasi di `vite.config.js` (`resolve.alias`), karena
  plugin Base44 yang dulu menyediakannya sudah dihapus.
- Pastikan tidak ada sisa referensi SDK/platform:
  ```bash
  grep -rn "@base44/sdk\|VITE_BASE44\|base44\.app\|media\.base44" src
  ```
  → Hanya tersisa komentar dokumentasi di `src/api/base44Client.js`.

## 4. Lint

```bash
cmd /c "npm run lint:fix"   # otomatis hapus unused imports (pre-existing dari sumber)
cmd /c "npm run lint"        # hasil: 0 error (warnings non-blokir boleh ada)
```

## 5. Jalankan Dev Server

```bash
cmd /c "npm run dev"
```

Buka `http://localhost:5173/`. Verifikasi:
- Halaman marketplace tampil (HTTP 200).
- Tidak ada request ke `*.base44.app` / `media.base44.com` di DevTools → Network.

## 6. Test Otomatis Alur Auth (register → login → redirect)

Skrip menjalankan adapter & seed **asli** aplikasi dengan shim `localStorage`:

```bash
cmd /c "node --experimental-loader ./scripts/alias-loader.mjs scripts/test-flow.mjs"
```

Yang diuji (29 kasus):
| # | Kasus | Harapan |
|---|---|---|
| 1 | Seed akun demo | ≥ 4 akun (mitra/supplier/logistik/warga) |
| 2 | Seed produk | ≥ 15 produk |
| 3 | Register user baru | berhasil |
| 4 | Register email ganda | ditolak (400) |
| 5 | Verifikasi OTP | kode dummy diterima |
| 6 | Login password salah | ditolak (401) |
| 7 | Login benar | berhasil, sesi tersimpan |
| 8 | `me()` | mengembalikan user login |
| 9 | Redirect setelah login | lihat tabel di bawah |
| 10 | Login akun demo (5 role) | sukses + redirect sesuai |
| 11 | Login admin (email+password) | sama seperti role lain → `/admin/dashboard` |
| 12 | Entity CRUD (CartItem) | create/filter/update/delete OK |
| 13 | Subscribe real-time | event create diterima |
| 14 | Logout | sesi hilang + redirect `/portal` |

**Tabel redirect setelah login (logika `Portal.handleLogin` → `getDashboardPath`):**

| Role | Path redirect |
|---|---|
| mitra | `/mitra/dashboard` |
| supplier | `/supplier/dashboard` |
| logistik | `/logistik/dashboard` |
| penerima (Warga) | `/marketplace` |
| admin | `/admin/dashboard` |

> `smartmbg_intended` diprioritaskan bila ada; selain itu dashboard per role.
> `/` (root) adalah portal publik tanpa login.

Hasil terakhir: **30 PASS, 0 FAIL**.

## 7. Test Manual (di browser)

### 7.1 Register
1. Buka `http://localhost:5173/register/warga` (atau role lain).
2. Isi email + password → klik daftar.
3. Modal OTP muncul → masukkan kode apa saja (mis. `000000`) → **tanpa kirim email**.
4. Muncul toast "Pendaftaran Berhasil!" → akun aktif.

### 7.2 Login & Redirect
1. Buka `http://localhost:5173/portal`.
2. Pilih role → isi email + password akun demo → Masuk.
3. **Harapan: otomatis pindah ke dashboard role masing-masing.**
   `/` (root) tetap portal publik tanpa login.

Akun demo:

| Role | Email | Password | Redirect ke |
|---|---|---|---|
| Warga | `adhiramaharani@gmail.com` | `SmartMBG2026!` | `/marketplace` |
| Mitra | `mitra@demo.local` | `demo1234` | `/mitra/dashboard` |
| Supplier | `supplier@demo.local` | `demo1234` | `/supplier/dashboard` |
| Logistik | `logistik@demo.local` | `demo1234` | `/logistik/dashboard` |
| Admin | `admin@demo.local` | `demo1234` | `/admin/dashboard` |

### 7.3 Negatif
- Password salah → tampil pesan "Email atau password salah."
- Login tanpa halaman terproteksi → diarahkan ke `/portal`.

## 8. Hasil Verifikasi Saat Ini

- `npm run build` → **sukses** (dist 5 aset).
- `npm run lint` → **0 error** (24 warning unused vars pre-existing, non-blokir).
- Test otomatis alur auth → **30 PASS / 0 FAIL**.
- Dev server `http://localhost:5173/` → **HTTP 200**, modul terserve **0 referensi**
  `base44.app` / `media.base44.com`.
- Seluruh URL gambar `media.base44.com` sudah diganti Unsplash (5 file: `Portal`,
  `Register`, `useSupplierProducts`, `MitraProducts`, `SmartRecommendations`).

## 9. Reset Data Lokal

Data persisten di localStorage browser. Untuk reset ke seed awal:

```js
// konsol browser
localStorage.clear();
location.reload();
```

Skrip seed ulang juga tersedia di `src/lib/seed.js` (`resetSeed()`).

## 10. Riwayat Perbaikan (Changelog)

### 10.1 [Perbaikan] Logout tidak berfungsi
- **Gejala**: klik Logout tidak berpindah halaman / seolah tidak terjadi apa-apa.
- **Penyebab**: di SDK Base44 lama, `base44.auth.logout(path)` melakukan redirect
  ke URL login. Adapter lokal hanya menghapus sesi tanpa redirect, padahal banyak
  komponen memanggil `base44.auth.logout("/portal")` langsung
  (contoh: `DashboardLayout`, `SearchHeader`, `rolePaths.logoutUser`).
- **Perbaikan** (`src/api/base44Client.js`):
  - `auth.logout(redirectPath)` kini menghapus sesi **lalu** mengarahkan
    `window.location.href` ke `redirectPath`.
  - Jika `redirectPath === window.location.href` (kasus `AuthContext.logout(true)`)
    arahkan ke `/portal` agar tidak terjadi loop.
  - Tanpa argumen → hanya hapus sesi (perilaku lama dipertahankan).
- **Verifikasi**: test `scripts/test-flow.mjs` menambah kasus
  "Logout: redirect ke /portal" → PASS.

### 10.2 [Perbaikan] Logo login tidak muncul
- **Gejala**: logo (PT. Duta Realtindo Perkasa) tidak tampil di halaman
  `/portal` dan `/register/:role`.
- **Penyebab**: URL logo semula dari CDN `media.base44.com` (sudah dihapus) dan
  diganti placeholder SVG sementara yang tidak dirender dengan benar.
- **Perbaikan**:
  - Logo disimpan lokal di `public/images/logo-drp.jpeg` (ter-copy ke `dist/` saat build).
  - `DRP_LOGO_URL` di `src/pages/Portal.jsx` dan `src/pages/Register.jsx`
    diganti menjadi `/images/logo-drp.jpeg`.
- **Verifikasi**: `dist/images/logo-drp.jpeg` ada setelah `npm run build`; di dev
  server URL `/images/logo-drp.jpeg` dapat diakses.

### 10.3 [Perbaikan] Link dev server tidak tampil
- **Penyebab**: `vite.config.js` memakai `logLevel: 'error'` (ikut tercopy dari
  sumber) sehingga baris "Local: http://localhost:5173/" disembunyikan.
- **Perbaikan**: hapus `logLevel: 'error'` dari `vite.config.js`.
- **Hasil**: `npm run dev` kini menampilkan URL.

