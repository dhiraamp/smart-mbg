# Analisis Sistem Smart MBG — Aplikasi Sumber

Dokumen ini adalah hasil analisis read-only terhadap aplikasi sumber di
`C:\Users\DELL\Documents\smart-mbg` sebelum dibuatkan klon lokal tanpa Base44.
Menjadi dasar penyusunan `02-prd.md`.

Dibuat: Sabtu, 01 Agustus 2026

---

## 1. Ringkasan Arsitektur

| Aspek | Nilai |
|---|---|
| Build tool | Vite (plugin: `@base44/vite-plugin`, proxy `/api`, `/satudata`, `/dataid`) |
| UI | React 18 + React Router + Framer Motion |
| Data fetching | `@tanstack/react-query` (`@/lib/query-client`) |
| Styling | Tailwind CSS + komponen `shadcn/ui` (±58 komponen di `src/components/ui/`) |
| Backend/BaaS | **`@base44/sdk`** — autentikasi & entitas (main target penghapusan di klon) |
| Payment | `@stripe/react-stripe-js`, `@stripe/stripe-js` (integrasi pembayaran) |
| Peta | Leaflet + OpenStreetMap (tiles OSM) |
| Ikon | `lucide-react` |
| Notifikasi UI | `sonner` + `@radix-ui/toast` |
| Drag & drop | `@hello-pangea/dnd` |

### Ketergantungan eksternal saat runtime

| Sumber | Dipakai di | Keterangan |
|---|---|---|
| `https://images.unsplash.com/*` | gambar produk & marketplace | thumbnail produk, banner |
| OSM tile / Leaflet | `GisMap`, `LogistikMap`, `MapPicker` | peta interaktif |
| `satudata.garutkab.go.id` | `Berita`, `NewsSection` | berita (via proxy `/satudata`) |
| `data.go.id` | `NewsSection`, `Berita` | berita (via proxy `/dataid`) |
| Base44 (`base44.app`) | seluruh autentikasi & entitas | lihat bagian 4 |

---

## 2. Peta Path Aplikasi

Struktur route di `src/App.jsx`. Semua route terbungkus `AnimatePresence`
(Framer Motion) dengan animasi transisi halaman.

### 2.1 Route publik (tanpa proteksi auth)

| Path | Halaman |
|---|---|
| `/` | `Marketplace` (landing + marketplace) |
| `/marketplace` | `MarketplacePage` |
| `/portal` | `Portal` (login — role dipilih via dropdown) |
| `/register/:role` | `Register` (role: `mitra`, `supplier`, `logistik`, `penerima`/`warga`) |
| `/knowledge-center` | `KnowledgeCenter` |
| `/berita` | `Berita` |

### 2.2 Route terproteksi (wajib login → redirect ke `/portal`)

Semua dibungkus `<ProtectedRoute unauthenticatedElement={<Navigate to="/portal" replace />} />`.

**Layanan Digital** (semua role, di luar layout sidebar):

| Path | Halaman |
|---|---|
| `/pulsa` | `Pulsa` |
| `/tagihan` | `Tagihan` |
| `/bpjs` | `Bpjs` |

**Portal Mitra / SPPG** (`MitraLayout`):

| Path | Menu | Halaman |
|---|---|---|
| `/mitra/dashboard` | Dashboard | `MitraDashboard` |
| `/mitra/cart` | Keranjang Pesanan | `MitraCart` |
| `/mitra/transactions` | Riwayat Transaksi | `MitraTransactions` |
| `/mitra/products` | Produk Bahan Pangan | `MitraProducts` |
| `/mitra/orders` | Tracking Pesanan | `MitraOrders` |
| `/mitra/kebutuhan` | Kebutuhan Bahan & PO | `MitraKebutuhan` |
| `/mitra/menu` | Rekomendasi Menu | `MitraMenu` |
| `/mitra/nutrition` | Nutrition Page | `MitraNutrition` |
| `/mitra/recipients` | Penerima Bantuan | `MitraRecipients` |
| `/mitra/complaints` | Pengaduan | `MitraComplaints` |
| `/mitra/reports` | Laporan Bulanan | `MitraReports` |
| `/mitra/digital-services` | Layanan Digital | `MitraDigitalServices` |

> Catatan: `/mitra/dashboard` direncanakan **dihapus** (keputusan user); landing
> mitra pengganti belum final (usulan `/mitra/products`).

**Portal Supplier** (`SupplierLayout`):

| Path | Menu | Halaman |
|---|---|---|
| `/supplier/dashboard` | Dashboard | `SupplierDashboard` |
| `/supplier/products` | Manajemen Produk | `SupplierProducts` |
| `/supplier/orders` | Notifikasi Pesanan | `SupplierOrders` |
| `/supplier/income` | Laporan Pendapatan | `SupplierIncome` |
| `/supplier/ratings` | Rating & Ulasan | `SupplierRatings` |
| `/supplier/complaints` | Notifikasi Pengaduan | `SupplierComplaints` |
| `/supplier/chat` | Chat Admin | `SupplierChat` |
| `/supplier/digital-services` | Layanan Digital | `SupplierDigitalServices` |

**Portal Logistik** (`LogistikLayout`):

| Path | Menu | Halaman |
|---|---|---|
| `/logistik/dashboard` | Dashboard | `LogistikDashboard` |
| `/logistik/orders` | Data Pengiriman | `LogistikOrders` |
| `/logistik/priority` | Prioritas Pesanan | `LogistikPriority` |
| `/logistik/map` | Peta Sebaran Area | `LogistikMap` |
| `/logistik/reports` | Laporan Bulanan | `LogistikReports` |
| `/logistik/chat` | Chat Admin | `LogistikChat` |
| `/logistik/digital-services` | Layanan Digital | `LogistikDigitalServices` |
| `/logistik/agent` | Asisten AI | `LogistikAgent` |

**Admin Panel** (`AdminLayout`):

| Path | Menu | Halaman |
|---|---|---|
| `/admin/dashboard` | Dashboard | `AdminDashboard` |
| `/admin/stock` | Manajemen Stok | `AdminStock` |
| `/admin/bapokting` | SIHARBATING & MISTER MBG | `AdminBapokting` |
| `/admin/suppliers` | Manajemen Supplier | `AdminSuppliers` |
| `/admin/mitra` | Manajemen Mitra/SPPG | `AdminMitra` |
| `/admin/sppg-menus` | Menu Harian SPPG | `AdminSppgMenus` |
| `/admin/logistik` | Manajemen Logistik | `AdminLogistik` |
| `/admin/financial` | Laporan Keuangan | `AdminFinancial` |
| `/admin/inflation` | Laporan Inflasi/Harga | `AdminInflation` |
| `/admin/supply-chain` | Laporan Rantai Pasok | `AdminSupplyChain` |
| `/admin/food-report` | Laporan Bahan Pangan | `AdminFoodReport` |
| `/admin/chat-mitra` | Chat Mitra/SPPG | `AdminChatMitra` |
| `/admin/chat-supplier` | Chat Supplier | `AdminChatSupplier` |
| `/admin/chat-logistik` | Chat Logistik | `AdminChatLogistik` |
| `/admin/notifications` | Notifikasi Stok | `AdminNotifications` |

**Warga — pengalaman baru (AloFresh)** (`WargaLayout`):

| Path | Halaman |
|---|---|
| `/warga/beranda` | `WargaBeranda` (= Info Akun) |
| `/warga/keranjang` | `WargaKeranjang` |
| `/warga/checkout` | `WargaCheckout` |
| `/warga/pesanan` | `WargaPesanan` |
| `/warga/pesanan/:id` | `WargaPesananDetail` |
| `/warga/profil` | `WargaProfil` |

**Penerima — pengalaman lama** (`PenerimaLayout`):

| Path | Halaman |
|---|---|
| `/penerima/dashboard` | `PenerimaDashboard` |
| `/penerima/daftar` | `PenerimaDashboard` |
| `/penerima/rating` | `PenerimaDashboard` |

**Fallback:** `*` → `PageNotFound`.

---

## 3. Inventaris Modul & Fitur per Role

### 3.1 Marketplace / Landing (publik)

- `HeroSearch` — pencarian & hero.
- `MarketCarousel` — banner carousel.
- `ProductCard` + grid produk (`PRODUCTS` dari `lib/marketplace.js`).
- `WeeklyMenuSection` / `WeeklyMenuCards` — menu mingguan.
- `NewsSection` — berita (Satu Data Garut + data.go.id).
- `KnowledgeSection` — shortcut Knowledge Center.
- `GisMap` — peta GIS (Leaflet + OSM).
- `AdBanner`, `FooterStats` — banner & statistik footer.
- `HomeSidebar` — panel kanan dengan:
  - `DIGITAL_MENU`: Beli Pulsa `/pulsa`, Bayar Tagihan `/tagihan`, Premi BPJS `/bpjs`.
  - `FEATURES`: Monitoring Rantai Pasok, Manajemen Supplier, Analisis & Laporan, Knowledge Center, Notifikasi (sebagian `requiresAuth`).
- `HomeHeader` — header + `NotificationBell`.

### 3.2 Portal / Auth

- `Portal` — login: dropdown pilih role, form email+password, pilihan
  "Masuk sebagai Admin" (token), tampilkan/atur redirect.
- `Register` + form per role (`WargaRegForm`, `MitraRegForm`, `SupplierRegForm`,
  `LogistikRegForm`) + `RegisterOtpModal` (verifikasi OTP via Base44).
- `AuthContext` — state auth global; `ProtectedRoute`.

### 3.3 Warga (AloFresh)

- Beranda: sambutan + navigasi cepat.
- Belanja: grid produk (kategori, pencarian, detail, `AddToCartDialog`).
- Keranjang: kelola item, sub-total, lanjut checkout.
- Checkout: pilih alamat (`AddressForm` + `MapPicker` OSM), metode bayar
  (QRIS / Transfer Bank / COD), buat order, layar sukses.
- Pesanan: daftar order (status: Menunggu Konfirmasi / Diproses / Dikirim /
  Selesai / Dibatalkan); detail order dengan timeline `tracking[]`,
  aksi Terima/Batalkan, panel simulasi status.
- Profil: profil akun + kelola alamat (store lokal per email).

### 3.4 Mitra / SPPG

- Dashboard (statistik, stok, notifikasi; `StockAlertBanner`, `SmartRecommendations`).
- Keranjang pesanan & Riwayat transaksi (alur PO ke supplier).
- Produk bahan pangan (katalog + `AddToCartDialog`).
- Tracking pesanan (status pengiriman; rating supplier via `RatingSupplierModal`).
- Kebutuhan bahan & PO; Rekomendasi menu (`SmartRecommendations`);
  Nutrition page (`IngredientNutritionCalculator`).
- Penerima bantuan; Pengaduan; Laporan bulanan (`MonthlyReport`);
  Layanan digital (`DigitalServicesHub`).

### 3.5 Supplier

- Dashboard (statistik penjualan, `DemandAnalytics`).
- Manajemen produk (CRUD produk supplier; data via Base44 `Product`).
- Notifikasi pesanan (order masuk; kelola status).
- Laporan pendapatan; Rating & ulasan (`SupplierRating`).
- Notifikasi pengaduan; Chat admin (`ChatPanel`);
  pilih logistik saat kirim (`PilihLogistik`); Layanan digital.

### 3.6 Logistik

- Dashboard (ringkasan pengiriman; rating driver via `RatingDriverModal`).
- Data pengiriman (kelola order, status).
- Prioritas pesanan; Peta sebaran area (Leaflet + marker).
- Laporan bulanan; Chat admin; Layanan digital; Asisten AI (`LogistikAgent`).

### 3.7 Admin

- Dashboard (KPI, `StockAlertPanel`, `NotificationBell`).
- Manajemen stok; SIHARBATING & MISTER MBG (`AdminBapokting`).
- Manajemen Supplier / Mitra / Logistik; Menu harian SPPG.
- Laporan: keuangan, inflasi/harga, rantai pasok, bahan pangan.
- Komunikasi: chat mitra / supplier / logistik (`ChatPanel`); notifikasi stok.

### 3.8 Penerima (legacy)

- `PenerimaMenuView` — menu MBG untuk penerima (dashboard lama).

---

## 4. Ketergantungan Data

### 4.1 Base44 (`@/api/base44Client.js`)

Client `requiresAuth:false`; app id & base URL dari `.env.local`
(`VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`).

±89 titik pemakaian `base44.auth.*` / `base44.entities.*` di `src/`.

Entitas yang digunakan:

| Entity | Pemakaian utama |
|---|---|
| `auth` (login/register/otp/logout) | Portal, Register, AuthContext, logout |
| `UserProfile` | profil user, role, data penerima |
| `Product` | katalog produk supplier & marketplace |
| `CartItem` | keranjang belanja (Warga & Mitra) |
| `Order` | pesanan / PO / pengiriman |
| `Transaction` | transaksi & pembayaran |
| `ShoppingHistory` | riwayat belanja |
| `StockAlert` | notifikasi stok |
| `SupplierRating` | rating supplier |
| `DriverRating` | rating driver |

Hook/API konsumen utama: `src/hooks/useCart.js`, `usePublicRegister.js`,
`useUserProfile.js`, `useSupplierProducts.js`, `src/lib/AuthContext.js`,
`src/api/base44Client.js`.

### 4.2 Eksternal non-Base44

- Unsplash: gambar produk & banner.
- OSM (Leaflet): peta (GisMap, LogistikMap, MapPicker).
- Satu Data Garut (`/satudata` proxy): berita.
- data.go.id (`/dataid` proxy): berita.

### 4.3 Lokal (offline-capable)

- `src/lib/marketplace.js` — `PRODUCTS` (katalog dummy, ~±15 item),
  `CATEGORIES` (Semua, Sayuran, Bumbu, Protein, Sembako), `formatRp`.
- `src/lib/warga-store.js` — store localStorage:
  - `warga_addresses_{email}` — daftar alamat per akun.
  - `warga_orders_{email}` — daftar order per akun (termasuk array `tracking[]`).
- `src/lib/rolePaths.js` — `DASHBOARD_PATHS`, `PROFILE_PATHS`, `logoutUser`,
  `rolePaths` helper.
- `src/lib/PageNotFound.js` — halaman 404.

---

## 5. Konvensi Kode

- Role internal: `"mitra"`, `"supplier"`, `"logistik"`, `"penerima"`,
  `"admin"`. Role penerima tampil sebagai **"Warga"** (label UI).
- Login menyimpan `smartmbg_role`, token, dan profil di localStorage/context;
  redirect via `smartmbg_intended`; admin login via email+password
  (akun `admin@demo.local`)
  (nilai dummy di `.env`).
- Path per role di `DASHBOARD_PATHS` / `PROFILE_PATHS` (`rolePaths.js`).
- Theme: hijau emerald (toast sukses `#f0fdf4`/`#16a34a`, error `#fef2f2`/`#991b1b`).
- Dialog Radix di-override `z-[1000]`/`1001` (kompatibilitas with header).
- Fix CSS Leaflet (`leaflet-default-icon-path`) — perlu dipertahankan di klon.
- Alias import `@/` → `src/`.
- Nama file halaman: `PascalCase.jsx` per role di `src/pages/<role>/`.

---

## 6. Catatan untuk Klon (dampak penghapusan Base44)

1. **Auth**: alur register → OTP → login harus diganti simulasi lokal
   (tanpa email; OTP bisa hardcode/display di UI, atau dilewati).
2. **Entitas**: `useCart`, `usePublicRegister`, `useUserProfile`,
   `useSupplierProducts`, `AuthContext` perlu adapter lokal.
3. **Logout**: `base44.auth.logout` menyebabkan lompatan ke domain hosted —
   di klon diganti logout lokal murni (hapus state, redirect `/portal`).
4. **Vite plugin & proxy**: `@base44/vite-plugin`, proxy `/api`, `.env`
   dihapus; proxy `/satudata` & `/dataid` diganti data statis/seed.
5. **Stripe**: integrasi pembayaran diganti metode dummy (QRIS/Transfer/COD).
6. **Peta**: tetap bisa Leaflet+OSM (internet) atau marker statis.
7. **Gambar**: tetap Unsplash (internet) atau asset lokal.
