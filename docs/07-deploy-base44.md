# Deploy Live Preview ke Base44 — Klon Lokal `smart-mbg-local`

Kebutuhan: **live preview** aplikasi untuk ditunjukkan ke client, sementara
pengembangan tetap berjalan di lokal.

- Lokasi proyek (sumber dev): `G:\WORK\picing\frontend\smart-mbg-local`
- Proyek asli "SMART MBG 1" milik orang lain → **tidak disentuh**.
- Dummy user untuk semua role sudah di-seed di `src/lib/seed.js`.
- URL preview: `https://smart-mbg-local-preview-03853770.base44.app`
- CLI yang terpasang: `base44` v0.1.7 (Node v24.18.0).

Tanggal: Sabtu, 02 Agustus 2026

> Status: ✅ proyek baru `smart-mbg-local-preview` dibuat & situs **berhasil di-deploy**.

---

## 1. Jalur yang dipilih

**Base44 — static site deploy (SPA only).**

- Aplikasi ini adalah SPA statis murni; "backend"-nya mock localStorage
  (`src/api/base44Client.js`), tidak memakai `@base44/sdk`, tidak ada folder `base44/`.
- Oleh karena itu hanya `dist/` yang di-upload ke hosting statis Base44.
- Proyek yang dipakai adalah **proyek baru milik akun Base44 kita** (belum ada
  proyek terkait di akun tersebut), sehingga tidak mengganggu "SMART MBG 1".

## 2. Prasyarat sistem

- Node **v24.18.0** — memenuhi (CLI butuh Node ≥20.19).
- CLI **base44 belum terpasang** → diinstal langkah 1.
- **PowerShell memblokir `npm.ps1`** (ExecutionPolicy) → semua perintah lewat
  `cmd /c "... npx ..."` (atau `& npm.cmd`, `& npx.cmd`).
- Wajib punya/akses **akun Base44** (login OAuth lewat browser).

## 3. Dummy user untuk semua role (SUDAH ADA)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.local` | `demo1234` |
| Warga | `adhiramaharani@gmail.com` | `SmartMBG2026!` |
| Mitra/SPPG | `mitra@demo.local` | `demo1234` |
| Supplier | `supplier@demo.local` | `demo1234` |
| Logistik | `logistik@demo.local` | `demo1234` |

Auto-seed saat pertama dimuat di browser; di preview statis pun otomatis terisi.

## 3. Langkah eksekusi

1. Pasang CLI Base44:
   ```
   cmd /c "npm install -g base44@latest"
   ```
2. Login akun Base44 (interaktif, membuka browser):
   ```
   cmd /c "npx base44 login"
   ```
3. Buat proyek baru di klon lokal (membuat `base44/config.jsonc` + `.app.jsonc`):
   ```
   cmd /c "npx base44 create"
   ```
   Nama proyek (keputusan): **`smart-mbg-local-preview`** *(bisa disesuaikan*).
4. Pastikan `base44/config.jsonc` menunjuk ke output build:
   ```jsonc
   {
     "name": "smart-mbg-local-preview",
     "site": {
       "outputDirectory": "./dist",
       "buildCommand": "npm run build"
     }
   }
   ```
5. Bangun aplikasi:
   ```
   cmd /c "npm run build"
   ```
6. Deploy **hanya situs** (klon ini tanpa backend entities/functions/agents,
   jadi TIDAK pakai `base44 deploy`):
   ```
   cmd /c "npx base44 site deploy -y"
   ```
7. Buka/preview URL:
   ```
   cmd /c "npx base44 site open"
   ```
   → kirim URL tersebut ke client.

## 4. Dampak / batasan preview

- **Data per-browser**: semua login & data tersimpan di `localStorage` tiap
  pengunjung (mock backend). Tiap browser melihat data seed masing-masing;
  cocok untuk demo UI, bukan produk data bersama.
- **Fitur Berita (`/satudata`, `/dataid`)**: hanya berfungsi via proxy dev di
  `vite.config.js`. Di hosting statis Base64 **tidak ada proxy** → seksi Berita
  kemungkinan kosong. Perbaikan opsional ke Depan:
  - ganti panggilan menjadi URL absolut + CORS terdukung, atau
  - routing lewat backend function Base44.
- Base44 hosting mendukung **SPA only** — aplikasi ini SPA, kompatibel.
  Pastikan `base` di Vite berupa `/`.

## 5. Catatan instalasi/operasional

- Selalu jalankan CLI lewat `cmd /c` atau `npx.cmd` karena batasan PowerShell.
- Jangan menimpa proyek asli "SMART MBG 1"; hanya pakai proyek preview baru.
- Status: menunggu eksekusi (login → create → build → site deploy).