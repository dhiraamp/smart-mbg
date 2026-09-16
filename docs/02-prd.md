# PRD — Smart MBG Local (Klon Full-Local, tanpa Base44)

Product Requirements Document untuk membangun ulang aplikasi Smart MBG
dengan **React.js** di folder `smart-mbg-local`, berperilaku **identik** dengan
aplikasi sumber namun **tanpa Base44 / backend asli** — 100% data dummy lokal.

Dibuat: Sabtu, 01 Agustus 2026
Status: Draf v0.1 (menunggu persetujuan)

---

## 1. Ringkasan Eksekutif

Aplikasi sumber (`smart-mbg`) saat ini bergantung pada Base44 (BaaS) untuk
autentikasi & seluruh entitas data, plus sumber eksternal (Unsplash, OSM,
Satu Data Garut, data.go.id). Klon ini bertujuan menghasilkan aplikasi dengan
**fitur, halaman, dan tampilan yang sama persis**, tetapi berjalan penuh di
browser memakai `localStorage` sebagai "database" — tanpa perlu akun Base44,
tanpa deploy ke Base44, dan tanpa lompatan redirect ke domain hosted.

## 2. Tujuan

- Membuat aplikasi React identik secara fungsional & visual dengan sumber.
- Menghapus total ketergantungan `@base44/sdk` & platform Base44.
- Seluruh data (produk, user, order, rating, notifikasi, berita) berasal dari
  seed/`localStorage` sehingga offline-friendly (kecuali gambar/peta opsional).
- Menyediakan dokumen (`01-analisis-sistem.md`, `02-prd.md`) dan kode klon yang
  dapat langsung `npm install && npm run dev`.

## 3. Scope (In Scope)

- Semua route & modul yang tercantum di `01-analisis-sistem.md` bagian 2 & 3:
  Marketplace/landing, Portal & Register, Warga (AloFresh), Mitra, Supplier,
  Logistik, Admin, Penerima (legacy), Layanan Digital, Knowledge Center, Berita.
- Autentikasi simulasi lokal (login/register/logout) per role.
- Seed data dummy untuk seluruh entitas.
- Adapter data yang mempertahankan API pemakaian lama (lihat arsitektur).

## 4. Non-Goals

- Tidak ada backend / REST API / database server.
- Tidak ada integrasi pembayaran nyata (Stripe) — metode bayar dummy.
- Tidak ada pengiriman email/OTP nyata.
- Tidak ada integrasi berita langsung ke Satu Data Garut/data.go.id —
  diganti seed berita statis.
- Bukan port ke framework lain (tetap React + Vite).

## 5. Arsitektur Usulan

### 5.1 Strategi adapter (kunci "sama persis")

Semua pemakaian Base44 ada di `@/api/base44Client.js` (satu titik masuk).
Klon membuat **adapter localStorage** dengan **nama impor yang sama**
(`@/api/base44Client`), sehingga **±89 titik pemakaian di src/ tidak perlu
diubah** — cukup menukar implementasi file tersebut.

```text
src/
  api/
    base44Client.js      <- adapter lokal (auth + entities -> localStorage)
  lib/
    seed/                <- data dummy (produk, berita, user, order, dll)
    warga-store.js       <- (dipakai ulang dari sumber)
    rolePaths.js         <- (dipakai ulang dari sumber)
    AuthContext.js       <- (dipakai ulang; auth via adapter)
  hooks/
    useCart.js           <- (dipakai ulang; adapter di belakang layar)
    usePublicRegister.js <- (disesuaikan: tanpa OTP email nyata)
    useUserProfile.js    <- (dipakai ulang)
    useSupplierProducts.js <- (dipakai ulang)
  pages/                 <- disalin dari sumber, penyesuaian minimal
```

### 5.2 Peta kompatibilitas adapter

| Permintaan lama (Base44) | Implementasi lokal |
|---|---|
| `base44.auth.register(...)` | simpan user di localStorage (tanpa email) |
| `base44.auth.verifyOtp(...)` | terima OTP dummy (mis. `000000` atau tampil di UI) |
| `base44.auth.login(...)` | validasi user dari localStorage |
| `base44.auth.logout()` | hapus state; **tidak** redirect ke domain hosted |
| `base44.entities.<T>.save/list/get/update/delete` | operasi array localStorage per collection |
| `@/hooks/*` | tetap dipakai, data mengalir dari adapter |

### 5.3 Sumber eksternal

| Sumber | Strategi klon |
|---|---|
| Unsplash (gambar produk) | Pertahankan (butuh internet) — fallback placeholder warna bila offline |
| OSM + Leaflet (peta) | Pertahankan (butuh internet) — fallback marker statis |
| Satu Data Garut / data.go.id (berita) | Ganti seed berita statis di `lib/seed/berita.js` |
| Stripe | Ganti metode bayar dummy (QRIS / Transfer Bank / COD) |

### 5.4 Env & tooling

- Hapus: `@base44/sdk`, `@base44/vite-plugin`, proxy `/api` di vite.config,
  seluruh `.env` Base44.
- Tambah: file seed; dokumentasi `README.md`.
- Jaga: alias `@/`, Tailwind, shadcn/ui, TanStack Query (opsional —
  bisa diganti state React bila dirasa berlebih), Framer Motion.

## 6. User Stories per Role

### Pengunjung (publik)
- US-01 Membuka `/` dan melihat marketplace: hero, carousel, produk,
  menu mingguan, berita, knowledge, peta GIS, statistik, layanan digital.
- US-02 Mengakses `/knowledge-center`, `/berita`, `/marketplace`.
- US-03 Daftar akun via `/register/:role` dan login via `/portal`.

### Warga / Penerima
- US-10 Beranda: sambutan + navigasi cepat.
- US-11 Belanja: telusuri produk per kategori, lihat detail, tambah keranjang.
- US-12 Keranjang: ubah jumlah, lihat subtotal.
- US-13 Checkout: pilih/kelola alamat (peta opsional), pilih metode bayar,
  buat order, lihat konfirmasi.
- US-14 Pesanan: lihat daftar & detail order dengan timeline status
  (Menunggu Konfirmasi → Diproses → Dikirim → Selesai/Dibatalkan),
  aksi Terima/Batalkan.
- US-15 Profil: lihat profil, kelola alamat (persisten per akun).

### Mitra / SPPG
- US-20 Dashboard: statistik, stok, rekomendasi, banner peringatan.
- US-21 Belanja bahan ke supplier (keranjang → PO → transaksi).
- US-22 Katalog produk bahan pangan; tracking pesanan; rating supplier.
- US-23 Kebutuhan & PO, rekomendasi menu, nutrition calculator.
- US-24 Penerima bantuan; pengaduan; laporan bulanan; layanan digital.

### Supplier
- US-30 Dashboard + demand analytics.
- US-31 Manajemen produk (CRUD).
- US-32 Notifikasi pesanan masuk & kelola status; pilih logistik.
- US-33 Laporan pendapatan; rating & ulasan; notifikasi pengaduan;
  chat admin; layanan digital.

### Logistik
- US-40 Dashboard + ringkasan pengiriman.
- US-41 Kelola data pengiriman & prioritas pesanan.
- US-42 Peta sebaran area.
- US-43 Laporan bulanan; chat admin; layanan digital; asisten AI (simulasi).

### Admin
- US-50 Dashboard KPI + panel stok.
- US-51 Manajemen stok; SIHARBATING & MISTER MBG.
- US-52 Manajemen supplier/mitra/logistik; menu harian SPPG.
- US-53 Laporan: keuangan, inflasi, rantai pasok, bahan pangan.
- US-54 Chat mitra/supplier/logistik; notifikasi stok.
- US-55 Login admin via token dummy.

## 7. Model Data & Seed

Disimpan sebagai array objek di `localStorage` (per collection), di-seed
saat pertama jalan.

| Collection | Field kunci (contoh) |
|---|---|
| `users` | `{ id, email, password, full_name, role, created_at }` |
| `user_profiles` | `{ id, user_id, full_name, role, alamat[], ... }` |
| `products` | `{ id, name, category, price, old_price, unit, stock, origin, img, desc, nutrition }` |
| `cart_items` | `{ id, user_id, product_id, qty }` |
| `orders` | `{ id, user_id, items[], total, delivery_fee, payment_method, status, tracking[] }` |
| `transactions` | `{ id, user_id, amount, method, status, created_at }` |
| `shopping_history` | `{ id, user_id, order_id, created_at }` |
| `stock_alerts` | `{ id, product_id, message, level, read }` |
| `supplier_ratings` / `driver_ratings` | `{ id, target_id, stars, comment, created_at }` |
| `berita` | `{ id, tag, color, time, title, summary, img, url, source }` |

Seed utama bersumber dari: `lib/marketplace.js` (PRODUCTS/CATEGORIES),
`lib/warga-store.js` (alamat/order per email), plus berita & akun demo.

**Akun demo seed:**
| Role | Email | Password |
|---|---|---|
| Warga | `adhiramaharani@gmail.com` | `SmartMBG2026!` |
| Mitra | `mitra@demo.local` | `demo1234` |
| Supplier | `supplier@demo.local` | `demo1234` |
| Logistik | `logistik@demo.local` | `demo1234` |
| Admin | `admin@demo.local` | `demo1234` |

## 8. Daftar Halaman & Path Target

Identik dengan `01-analisis-sistem.md` bagian 2 (path publik + terproteksi per
role). Total target: **±57 route** (5 publik + 3 layanan digital + 12 mitra +
8 supplier + 8 logistik + 16 admin + 7 warga + 3 penerima + 404).

## 9. Acceptance Criteria

### Global
- AC-G1 `npm install && npm run dev` berjalan tanpa Base44; tidak ada
  request ke `*.base44.app`.
- AC-G2 Tidak ada lompatan/redirect ke domain hosted (termasuk saat logout).
- AC-G3 Seluruh route di daftar path dapat diakses; login per role
  mengarah ke dashboard role masing-masing.
- AC-G4 Refresh browser tidak menghilangkan data (persisten localStorage).
- AC-G5 Lint & build bersih (`npm run lint`, `npm run build`).

### Per modul (contoh)
- AC-W1 Warga dapat checkout → order muncul di daftar pesanan dengan
  timeline & metode bayar yang dipilih.
- AC-M1 Mitra dapat menambah item ke keranjang → muncul di transaksi.
- AC-S1 Supplier dapat menambah/ubah produk → tampil di marketplace.
- AC-L1 Logistik dapat mengubah status pengiriman → terlihat di tracking.
- AC-A1 Admin melihat angka stok & alert yang konsisten dengan data seed.

## 10. Roadmap

| Fase | Isi |
|---|---|
| **Fase 0** | Setup folder klon: Vite + React + deps (tanpa Base44), alias `@/`, Tailwind, shadcn/ui, seed data, adapter `base44Client.js` kosong. |
| **Fase 1** | Auth & Portal: AuthContext + adapter (register/login/logout dummy), Redirect ke dashboard role. |
| **Fase 2** | Marketplace & layanan publik (landing, berita statis, knowledge center, pulsa/tagihan/bpjs). |
| **Fase 3** | Modul Warga (AloFresh) end-to-end. |
| **Fase 4** | Modul Mitra & Supplier. |
| **Fase 5** | Modul Logistik & Admin. |
| **Fase 6** | Penerima legacy, cleanup (hapus proxy/plugin/env Base44), lint+build, README. |

## 11. Risiko & Asumsi

| Risiko | Mitigasi |
|---|---|
| OTP/email tidak nyata → alur daftar beda | OTP dummy (tampil di UI) & dokumentasi jelas |
| Berita eksternal hilang | Seed berita statis berkualitas |
| Peta/gambar butuh internet | Fallback marker/placeholder |
| Adapter tak sempurna meniru Base44 | Inventory ±89 titik & test manual per fase |
| Data localStorage tersimpan per-browser | Seed ulang & dokumentasi reset |
| `@tanstack/react-query` caching | Pastikan invalidate pada mutasi adapter |

## 12. Kriteria Kelulusan Final

- Semua user stories (US-*) & acceptance criteria (AC-*) di atas terpenuhi.
- Screenshot/perbandingan visual halaman utama identik dengan aplikasi sumber.
- Klon berjalan di `localhost` tanpa akses ke `*.base44.app`.
