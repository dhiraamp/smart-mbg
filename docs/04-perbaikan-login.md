# Perbaikan — Login, Logout & Redirect

Riwayat perbaikan terkait autentikasi & navigasi. Dilengkapi dengan catatan
perbaikan #1 dan #2 (sudah selesai pada sesi sebelumnya) serta #3 dan #4 (baru).

Lokasi proyek: `G:\WORK\picing\frontend\smart-mbg-local`
Tanggal: Sabtu, 01 Agustus 2026

---

## Status Perbaikan

| # | Perbaikan | Status |
|---|---|---|
| 1 | Logout tidak berfungsi | ✅ Selesai |
| 2 | Logo login tidak muncul → pakai `public/images/logo-drp` | ✅ Selesai |
| 3 | Login admin sama seperti role lainnya (email + password) | ✅ Selesai |
| 4 | Redirect setelah login → dashboard per role | ⚠️ Diralat → `05-ralat-redirect-dashboard.md` |

---

## 1. Logout Tidak Berfungsi (✅ Selesai)

- **Gejala**: klik Logout tidak berpindah halaman.
- **Penyebab**: SDK Base44 lama me-redirect saat `base44.auth.logout(path)`;
  adapter lokal hanya menghapus sesi tanpa redirect.
- **Perbaikan**: `src/api/base44Client.js` — `auth.logout(redirectPath)` kini
  menghapus sesi lalu `window.location.href = redirectPath`. Jika argumen sama
  dengan URL aktif, arahkan ke `/portal` (hindari loop).

## 2. Logo Login (✅ Selesai)

- Logo lokal: `public/images/logo-drp.jpeg`.
- `DRP_LOGO_URL = "/images/logo-drp.jpeg"` di `src/pages/Portal.jsx` dan
  `src/pages/Register.jsx`.

## 3. Login Admin Sama Seperti Role Lainnya (✅ Selesai)

Sebelumnya admin login memakai **token** (`SMARTMBG2026#ADMIN`). Sekarang **semua
role login dengan email + password** (termasuk admin).

Perubahan:
- `src/pages/Portal.jsx`:
  - Hapus input `Token Admin`, konstanta `ADMIN_TOKEN`, dan cabang khusus admin.
  - Form login kini seragam untuk semua role (email + password).
- `src/lib/seed.js`:
  - Akun admin baru: `admin@demo.local` / `demo1234` (role `admin`) + profil.

**Akun admin:**
| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.local` | `demo1234` |

> Token `SMARTMBG2026#ADMIN` tidak lagi dipakai. Jika data lama tersimpan,
> lakukan reset localStorage (lihat `03-testing.md` bagian Reset Data Lokal).

## 4. Redirect Setelah Login (⚠️ Diralat → lihat `05-ralat-redirect-dashboard.md`)

Aturan ini **digantikan** oleh ralat #5. Sebelumnya diarahkan ke `/` untuk
role non-admin; kini setiap role diarahkan ke **dashboard masing-masing**
(`/mitra/dashboard`, `/supplier/dashboard`, `/logistik/dashboard`,
`/marketplace`, `/admin/dashboard`), sedangkan `/` tetap portal publik tanpa login.

---

## Verifikasi

- `npm run build` → sukses.
- `npm run lint` → 0 error.
- `scripts/test-flow.mjs` → **30 PASS / 0 FAIL**, termasuk kasus baru:
  - Login admin via email+password (sama seperti role lain).
  - Redirect setiap role → dashboard masing-masing.
  - `smartmbg_intended` diprioritaskan.
  - Logout redirect ke `/portal`.

## Langkah Manual (opsional)

1. Buka `http://localhost:5173/portal`.
2. Pilih role **Admin** → login `admin@demo.local` / `demo1234` → harap ke `/admin/dashboard`.
3. Pilih role **Mitra** → login `mitra@demo.local` / `demo1234` → harap ke `/mitra/dashboard`.
4. Klik Logout → harap kembali ke `/portal`.

> Catatan: aturan redirect akhir (dashboard per role) dijelaskan di
> `05-ralat-redirect-dashboard.md`.
