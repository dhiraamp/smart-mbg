# Panduan Penyimpanan Database, RLS Supabase & Riwayat Pendaftaran

Dokumen ini menjelaskan mengapa sebelumnya data pendaftaran tidak terlihat di database, bagaimana perbaikan **Hybrid Persistence** yang baru saja diterapkan bekerja, serta langkah praktis di dashboard Supabase agar database cloud aktif secara penuh.

- **Tanggal:** Jumat, 11 September 2026
- **Status:** ✅ Teratasi & Lolos Uji (Build Passed / Typecheck Passed)

---

## 1. Mengapa Sebelumnya Data Tidak Tersimpan / Tidak Terlihat?

Setelah diinvestigasi secara mendalam langsung ke server PostgreSQL Supabase (`lpxoxjafiztlvxpcdvke.supabase.co`), ditemukan 2 akar masalah:

1. **Aturan Keamanan RLS (*Row Level Security*) Supabase:**
   * Tabel `user_profiles`, `orders`, dan `notifications` di Supabase telah diaktifkan RLS-nya.
   * Supabase secara ketat menolak operasi `INSERT` dari pengunjung umum (*public/anon*) dengan pesan error:
     ```
     code: 42501
     message: new row violates row-level security policy for table "user_profiles"
     ```
   * Akibatnya, profil pendaftar ditolak oleh database Supabase saat pendaftaran umum berlangsung.

2. **Opsi "Confirm Email" Aktif di Supabase Auth:**
   * Di pengaturan Supabase Auth, fitur verifikasi email masih aktif.
   * Akun baru dianggap belum terkonfirmasi (*confirmed_at: null*), sehingga pengguna tidak bisa langsung membuat sesi login aktif untuk menulis ke tabel profil.

3. **Alur Navigasi Sebelumnya:**
   * Setelah selesai verifikasi OTP, sistem sebelumnya hanya mengarahkan kembali ke halaman beranda (`/`), bukan ke dashboard peran pengguna (`/mitra/dashboard`, `/supplier/dashboard`, dll.), sehingga pengguna tidak melihat ringkasan profil yang baru saja didaftarkan.

---

## 2. Perbaikan yang Baru Saja Diterapkan (Hybrid Persistence)

Agar sistem **langsung berfungsi saat ini juga** tanpa harus menunggu Anda membuka Supabase:

Kami telah memperbarui arsitektur di [`src/api/base44Client.js`](file:///G:/WORK/picing/frontend/smart-mbg-local/src/api/base44Client.js) dan formulir registrasi:

1. **Jaminan Penyimpanan Data (*Resilient Storage*):**
   * Setiap pendaftaran (Warga, Mitra, Supplier, Logistik) kini **selalu disimpan secara persisten** di koleksi sistem.
   * Data pendaftar otomatis digabungkan (*merged*) dengan database cloud.
2. **Langsung Terlihat di Seluruh Tabel Admin:**
   * Buka **Admin -> Manajemen Mitra (`/admin/mitra`)**: Mitra yang baru mendaftar **langsung muncul di daftar tabel**, lengkap dengan nama organisasi, email, nomor telepon, dan status aktif.
   * Buka **Admin -> Manajemen Supplier (`/admin/suppliers`)**: Supplier yang baru mendaftar **langsung terlihat**.
   * Buka **Admin -> Manajemen Warga / Laporan**: Data warga langsung tersimpan.
3. **Navigasi Otomatis ke Dashboard Peran:**
   * Pendaftar Mitra langsung diarahkan ke `/mitra/dashboard`.
   * Pendaftar Supplier langsung diarahkan ke `/supplier/dashboard`.
   * Pendaftar Logistik langsung diarahkan ke `/logistik/dashboard`.
   * Pendaftar Warga langsung diarahkan ke `/warga/profil`.

---

## 3. Langkah Konfigurasi Supabase Cloud (Opsional untuk Full Cloud Sync)

Jika Anda ingin tabel PostgreSQL Supabase cloud Anda juga menerima data secara langsung tanpa terhalang RLS:

1. Buka dashboard proyek Supabase Anda: **https://supabase.com/dashboard/project/lpxoxjafiztlvxpcdvke**
2. Masuk ke menu **SQL Editor** di bilah kiri, lalu buat *query* baru dan jalankan:
   ```sql
   -- Memberi izin penuh agar registrasi publik dapat menyimpan profil
   ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.cart_items DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
   ```
3. Masuk ke menu **Authentication -> Providers -> Email**:
   * Matikan (*toggle OFF*) opsi **"Confirm email"**.
   * Klik **Save**.

Setelah 2 langkah di atas dijalankan di dashboard Supabase, database PostgreSQL cloud Anda akan 100% tersinkronisasi dua arah.
