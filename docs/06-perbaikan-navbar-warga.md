# Perbaikan #6 & #7 — Navbar Warga: Beranda = Info Akun, Hapus Belanja

Lokasi proyek: `G:\WORK\picing\frontend\smart-mbg-local`
Tanggal: Sabtu, 01 Agustus 2026

## Status

| # | Perbaikan | Status |
|---|---|---|
| 6 | Navbar `http://localhost:5173/` terintegrasi role warga → "Beranda" jadi home, "Dashboard" dihapus | ✅ Selesai |
| 7 | Warga "Beranda" menampilkan info akun; halaman `/warga/belanja` dihapus; login warga → `/marketplace` | ✅ Selesai |

## 6. Navbar Publik (`HomeHeader`)

- Item menu **"Dashboard"** dihapus dari navbar.
- Item **"Beranda"** jadi role-aware:
  - Role **warga (penerima)** → `/warga/beranda` (beranda = info akun).
  - Role lain / tamu → `/`.
- Dropdown profil warga **"Belanja Sekarang"** kini menuju `/marketplace`.

Menu navbar publik sekarang:

| Item | Path |
|---|---|
| Beranda | `/` (tamu) / `/warga/beranda` (warga) |
| Marketplace | `/marketplace` |
| Informasi | `/berita` |
| Knowledge Center | `/knowledge-center` |
| Kontak | scroll ke bawah |

Implementasi: `src/components/marketplace/HomeHeader.jsx` — `NAV` dihitung di dalam
komponen, `homePath = role === "penerima" ? "/warga/beranda" : "/"`.

## 7. Role Warga

### 7.1 Redirect Setelah Login

Warga (penerima) kini login langsung menuju **`/marketplace`**
(`DASHBOARD_PATHS.penerima = "/marketplace"`), bukan `/warga/beranda` lagi.

### 7.2 Beranda = Info Akun

Halaman `/warga/beranda` (`WargaBeranda`) diubah isinya menjadi **Info Akun**:

- Kartu akun: avatar, nama, badge "Anggota Warga Smart MBG", email.
- **Info Akun**: email, NIK, No. Telepon + tombol "Kelola Profil".
- **Alamat Utama**: ringkasan alamat utama tersimpan (atau ajakan tambah).
- **Tautan Cepat**: Belanja (`/marketplace`), Keranjang, Pesanan, Profil.
- Ringkasan pesanan terakhir.

### 7.3 Hapus `/warga/belanja`

- Route `/warga/belanja` dihapus (`src/App.jsx`).
- File `src/pages/warga/WargaBelanja.jsx` dihapus.
- Menu "Belanja" dihapus dari `WargaLayout` (navbar warga kini: **Beranda,
  Keranjang, Pesanan, Profil**).
- Semua tautan lama `/warga/belanja` dialihkan ke `/marketplace`
  (`WargaKeranjang`, `WargaCheckout`, `WargaPesanan`, `HomeHeader`).

Alasan: warga belanja langsung di `/marketplace`, sehingga halaman belanja
khusus di dalam `WargaLayout` tidak dibutuhkan lagi.

## Perubahan Kode

- `src/lib/rolePaths.js` — `DASHBOARD_PATHS.penerima = "/marketplace"`.
- `src/components/marketplace/HomeHeader.jsx` — hapus Dashboard; Beranda role-aware;
  "Belanja Sekarang" → `/marketplace`.
- `src/App.jsx` — hapus import & route `/warga/belanja`.
- `src/pages/warga/WargaLayout.jsx` — hapus menu "Belanja".
- `src/pages/warga/WargaBeranda.jsx` — ditulis ulang sebagai Info Akun.
- `src/pages/warga/WargaBelanja.jsx` — **dihapus**.
- `WargaKeranjang.jsx`, `WargaCheckout.jsx`, `WargaPesanan.jsx` — tautan belanja → `/marketplace`.

## Verifikasi

- `npm run build` → sukses.
- `npm run lint` → 0 error.
- `scripts/test-flow.mjs` → **30 PASS / 0 FAIL**, termasuk:
  - Redirect warga (penerima) → `/marketplace`.
  - Login akun demo warga → `/marketplace`.
