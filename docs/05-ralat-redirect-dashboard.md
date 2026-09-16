# Ralat #5 — `/` = Portal Publik, Login → Dashboard per Role

Ralat atas perbaikan #4. Halaman utama `http://localhost:5173/` tetap menjadi
**portal publik (tanpa login)**. Setelah login, setiap role diarahkan ke
**dashboard masing-masing** (dibedakan berdasarkan role: mitra, supplier,
logistik, warga, admin).

Lokasi proyek: `G:\WORK\picing\frontend\smart-mbg-local`
Tanggal: Sabtu, 01 Agustus 2026

---

## Status Perbaikan

| # | Perbaikan | Status |
|---|---|---|
| 1 | Logout tidak berfungsi | ✅ Selesai |
| 2 | Logo login → `public/images/logo-drp` | ✅ Selesai |
| 3 | Login admin sama seperti role lainnya (email + password) | ✅ Selesai |
| 4 | ~~Redirect login → `/` (kecuali admin)~~ | ⚠️ Diralat oleh #5 |
| 5 | `/` = portal publik; login → dashboard per role | ✅ Selesai |

## 5. Aturan Navigasi Baru

### 5.1 `/` (root) — Portal Publik, Tanpa Login
- `http://localhost:5173/` → halaman utama (Marketplace / landing).
- Bisa diakses **tanpa login** (public access).
- Login tetap melalui `http://localhost:5173/portal`.

### 5.2 Redirect Setelah Login — Dashboard per Role

| Role | Redirect setelah login |
|---|---|
| Mitra / SPPG | `/mitra/dashboard` |
| Supplier | `/supplier/dashboard` |
| Logistik | `/logistik/dashboard` |
| Warga (penerima) | `/marketplace` |
| Admin | `/admin/dashboard` |

Prioritas: `smartmbg_intended` (jika ada) → selain itu dashboard role.
Implementasi: `Portal.handleLogin` → `navigate(getDashboardPath(selectedRole))`.

---

## Pemetaan Halaman per Role

Sumber: menu sidebar pada `MitraLayout`, `SupplierLayout`, `LogistikLayout`,
`AdminLayout`, dan route `/warga/*`.

### Mitra / SPPG (12 halaman)

| Path | Menu |
|---|---|
| `/mitra/dashboard` | Dashboard |
| `/mitra/cart` | Keranjang Pesanan |
| `/mitra/transactions` | Riwayat Transaksi |
| `/mitra/products` | Produk Bahan Pangan |
| `/mitra/orders` | Tracking Pesanan |
| `/mitra/kebutuhan` | Kebutuhan Bahan & PO |
| `/mitra/menu` | Rekomendasi Menu |
| `/mitra/nutrition` | Nutrition Page |
| `/mitra/recipients` | Penerima Bantuan |
| `/mitra/complaints` | Pengaduan |
| `/mitra/reports` | Laporan Bulanan |
| `/mitra/digital-services` | Layanan Digital |

### Supplier (8 halaman)

| Path | Menu |
|---|---|
| `/supplier/dashboard` | Dashboard |
| `/supplier/products` | Manajemen Produk |
| `/supplier/orders` | Notifikasi Pesanan |
| `/supplier/income` | Laporan Pendapatan |
| `/supplier/ratings` | Rating & Ulasan |
| `/supplier/complaints` | Notifikasi Pengaduan |
| `/supplier/chat` | Chat Admin |
| `/supplier/digital-services` | Layanan Digital |

### Logistik (8 halaman)

| Path | Menu |
|---|---|
| `/logistik/dashboard` | Dashboard |
| `/logistik/orders` | Data Pengiriman |
| `/logistik/priority` | Prioritas Pesanan |
| `/logistik/map` | Peta Sebaran Area |
| `/logistik/reports` | Laporan Bulanan |
| `/logistik/chat` | Chat Admin |
| `/logistik/digital-services` | Layanan Digital |
| `/logistik/agent` | Asisten AI |

### Warga (6 halaman)

| Path | Halaman |
|---|---|
| `/warga/beranda` | Beranda (= Info Akun, lihat perbaikan #6–#7) |
| `/warga/keranjang` | Keranjang |
| `/warga/checkout` | Checkout |
| `/warga/pesanan` | Pesanan |
| `/warga/pesanan/:id` | Detail Pesanan |
| `/warga/profil` | Profil |

> `/warga/belanja` **dihapus** (perbaikan #7). Warga belanja langsung di
> `/marketplace`. Setelah login, warga menuju `/marketplace`.

### Admin (16 halaman)

| Path | Menu |
|---|---|
| `/admin/dashboard` | Dashboard |
| `/admin/stock` | Manajemen Stok |
| `/admin/bapokting` | SIHARBATING & MISTER MBG |
| `/admin/suppliers` | Manajemen Supplier |
| `/admin/mitra` | Manajemen Mitra/SPPG |
| `/admin/sppg-menus` | Menu Harian SPPG |
| `/admin/logistik` | Manajemen Logistik |
| `/admin/financial` | Laporan Keuangan |
| `/admin/inflation` | Laporan Inflasi/Harga |
| `/admin/supply-chain` | Laporan Rantai Pasok |
| `/admin/food-report` | Laporan Bahan Pangan |
| `/admin/chat-mitra` | Chat Mitra/SPPG |
| `/admin/chat-supplier` | Chat Supplier |
| `/admin/chat-logistik` | Chat Logistik |
| `/admin/notifications` | Notifikasi Stok |

---

## Perubahan Kode

- `src/pages/Portal.jsx`: `navigate(getDashboardPath(selectedRole))` —
  login mengarah ke dashboard per role (menggantikan aturan #4 yang menuju `/`).

## Verifikasi

- `npm run build` → sukses.
- `npm run lint` → 0 error.
- `scripts/test-flow.mjs` → **30 PASS / 0 FAIL**, termasuk kasus:
  - Redirect mitra → `/mitra/dashboard`
  - Redirect supplier → `/supplier/dashboard`
  - Redirect logistik → `/logistik/dashboard`
  - Redirect warga → `/marketplace`
  - Redirect admin → `/admin/dashboard`
  - `/` tetap publik (tanpa proteksi di `App.jsx`).
