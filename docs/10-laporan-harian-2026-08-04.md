# Laporan Harian — Smart MBG

- Tanggal: Selasa, 04 Agustus 2026
- Status: ✅ Penyempurnaan aplikasi (notifikasi, keranjang & pelacakan pesanan, Knowledge Center) selesai & live
- Tautan pratinjau: https://smart-mbg-local-preview-03853770.base44.app

---

## Yang Dikerjakan Hari Ini

### Lonceng Notifikasi untuk Semua Role Pengelola
- Ikon lonceng ditambahkan di pojok kanan atas untuk role **SPPG**, **Supplier**,
  **Logistik**, dan **Admin** (desktop maupun HP).
- Jika ada notifikasi baru, muncul tanda angka merah; bisa diklik untuk melihat
  rincian dan menandai semua sudah dibaca.
- Contoh notifikasi yang tampil: **ada pelamar baru**, stok menipis, pesanan baru
  masuk, pengiriman sedang berjalan, dan pengaduan baru.
- **Contoh alur otomatis:** saat warga melamar lowongan kerja, SPPG/Logistik pemilik
  lowongan langsung mendapat pemberitahuan "Ada Pelamar Baru".
- Beberapa notifikasi contoh sudah diisi agar setiap role langsung terlihat isinya.

### Keranjang & Pelacakan Pesanan Mitra (gaya Shopee)
- Keranjang kini tampil sebagai **ikon keranjang** di navbar mitra dengan angka jumlah
  barang, terpisah dari menu — seperti di situs belanja pada umumnya.
- Halaman **"Tracking Pesanan"** dilengkapi **tab status**: Semua, Menunggu, Diproses,
  Dikirim, Selesai, Dibatalkan — lengkap dengan jumlah pesanan di tiap tab, sehingga
  mitra mudah memilah pesanan berdasarkan tahapnya.

### Menu "Informasi" Dihilangkan
- Menu **Informasi** tidak lagi tampil di navbar publik yang dilihat role warga.
  Menu publik kini: Beranda, Marketplace, Knowledge Center, Career, Kontak.

### Merapikan Tampilan Warga (mengurangi kebingungan)
- Kartu **"Buka Profil" & "Keluar"** di sidebar kanan (di atas Layanan Digital) dihapus.
- Item **"Belanja Sekarang"** di dropdown kanan atas dihapus; dropdown profil kini hanya
  berisi "Lihat Profil" dan "Keluar".
- Tombol teks **"Ke Marketplace Publik"** di navbar warga diganti **ikon rumah** agar
  lebih ringkas dan jelas (menuju beranda publik).

### Knowledge Center Diisi Materi
- Halaman Knowledge Center (sebelumnya masih kosong) kini berisi **12 materi berfoto**
  dalam 4 kategori:
  - **Pengembangan** — perkembangan program MBG di Garut, inovasi menu bahan lokal,
    digitalisasi pengelolaan dapur SPPG.
  - **Panduan** — cara belanja bahan pangan, cara melamar lowongan, panduan gizi.
  - **Regulasi** — dasar hukum MBG, standar mutu & keamanan pangan, kebijakan kemitraan.
  - **Sumber Daya** — template laporan bulanan, kontak dinas & bantuan, kalender pelatihan.
- Dilengkapi kolom pencarian, filter kategori, dan popup detail saat kartu diklik.

---

Catatan: seluruh pengembangan dikerjakan di atas aplikasi utama Smart MBG yang sudah
ter-deploy. Proyek asli "SMART MBG 1" milik orang lain tidak disentuh.

### Perbaikan Belanja Warga di Marketplace (gaya Shopee)
- **Sebelumnya:** setiap klik produk di Marketplace publik selalu mengarah ke halaman
  login ??" termasuk saat warga sudah masuk. Akibatnya warga tidak bisa memasukkan barang
  ke keranjang (barang tidak pernah masuk keranjang).
- **Sekarang:**
  - Warga yang belum login: klik produk tetap menuju login (wajar).
  - Warga yang sudah login: klik produk membuka **jendela popup bergaya Shopee** berisi
    foto, harga, stok, pilihan jumlah, serta dua tombol:
      - **"Masukkan ke Keranjang"** ??" barang masuk keranjang + pemberitahuan berhasil.
      - **"Beli Langsung"** ??" barang masuk keranjang lalu langsung pindah ke halaman keranjang.
  - Navbar publik kini menampilkan **ikon keranjang** (dengan angka merah) hanya untuk
    warga yang sudah login; pengunjung yang belum login tidak melihatnya.
- Hasil: build + cek kode + unggah pratinjau berhasil, 30 tes alur lolos (0 gagal).

### Pilihan "Keranjang" & "Beli" Langsung di Kartu Produk
- Setiap kartu produk/bahan di Marketplace kini punya **dua tombol**:
  - **Keranjang** -- memasukkan produk ke keranjang (muncul pemberitahuan berhasil).
  - **Beli** -- memasukkan produk ke keranjang lalu langsung pindah ke halaman keranjang.
- Berlaku untuk semua role yang memiliki akses belanja:
  - **Warga** -> keranjang warga (/warga/keranjang)
  - **Mitra/SPPG** -> keranjang mitra (/mitra/cart)
- Jika belum login, kedua tombol tetap mengarah ke halaman login.
- Badge angka di ikon keranjang kini menampilkan **1 s.d. 99+** dan otomatis bertambah
  saat produk masuk keranjang.
- Ikon keranjang di navbar publik ditampilkan untuk semua role yang bisa belanja dan sudah
  login; pengunjung yang belum login tidak melihatnya.
- Hasil: build + cek kode + unggah pratinjau berhasil, 30 tes alur lolos (0 gagal).

### Perbaikan Halaman Marketplace (menu "Marketplace" di navbar)
- Penyebab sebelumnya: halaman /marketplace memakai berkas MarketplacePage.jsx (bukan
  Marketplace.jsx yang untuk beranda), sehingga tombol beli di sana hanya menampilkan
  pemberitahuan tanpa benar-benar menyimpan produk ke keranjang.
- Sekarang setiap kartu produk memiliki dua tombol nyata:
  - **"Keranjang"** -- produk tersimpan ke keranjang + pemberitahuan berhasil.
  - **"Beli"** -- produk tersimpan ke keranjang lalu langsung pindah ke halaman keranjang.
- Tombol "Info Gizi" tetap tersedia; popup info gizi kini juga punya "Masukkan Keranjang"
  dan "Beli Langsung".
- Berlaku untuk semua role yang bisa belanja (Warga & Mitra); yang belum login diarahkan ke login.
- Hasil: build + cek kode + unggah pratinjau berhasil, 30 tes alur lolos (0 gagal).

### Pesanan Warga Terhubung ke Rantai Pasok (Supplier & Logistik)
- **Sebelumnya:** pesanan warga hanya disimpan di perangkat warga (localStorage), sehingga
  tidak ada pihak lain yang menerimanya.
- **Sekarang:** saat warga checkout, selain tersimpan di "Pesanan Saya", dibuat juga Order di
  penyimpanan bersama sehingga muncul di:
  - **Supplier** -- halaman "Notifikasi Pesanan" (bisa konfirmasi/tolak, proses, pilih logistik)
  - **Logistik** -- dashboard (bisa ambil pesanan & selesai kirim)
- Status sinkron dua arah: Menunggu Konfirmasi -> Diproses -> Dikirim -> Selesai (atau
  Dibatalkan). Warga melihatnya otomatis tanpa muat ulang (real-time subscribe).

### Perbaikan Pembayaran Mitra (belanja bahan pangan)
- Tombol bayar mitra sebelumnya memanggil fungsi backend yang tidak tersedia di klon lokal,
  sehingga pesanan tidak pernah dibuat. Kini dibuat langsung sebagai Order (dikelompokkan per
  supplier) + Transaksi, sehingga pesanan mitra sampai ke Supplier dan tampil di Tracking
  Pesanan mitra (gaya Shopee).

### Perbaikan Logistik
- Tombol "Ambil Pesanan" & "Selesai Kirim" kini mengubah status Order secara langsung
  (sebelumnya memanggil fungsi backend yang tidak tersedia, sehingga tidak berpengaruh).

### Hasil
- Build + cek kode + unggah pratinjau berhasil, 30 tes alur lolos (0 gagal).
- Pratinjau: https://smart-mbg-local-preview-03853770.base44.app

### Perbaikan "Riwayat Transaksi" Mitra
- **Gejala:** riwayat transaksi mitra tidak menampilkan transaksi baru / tampil aneh
  (nomor kosong, total Rp NaN).
- **Penyebab:** transaksi dari checkout mitra disimpan dengan field tidak cocok
  (mitra_id & total_amount), sementara halaman memfilter Transaction.user_email dan
  menampilkan transaction_number/payment_status/delivery_status/items/total. Data contoh
  lama juga field-nya tidak sesuai.
- **Perbaikan:**
  - Transaksi baru kini lengkap: user_email, mitra_id, transaction_number, payment_status
    (paid), delivery_status (pending), payment_method, items (produk/supplier/qty/subtotal),
    subtotal, service_fee, delivery_fee, total, delivery_address.
  - Halaman riwayat transaksi memfilter user_email ATAU mitra_id (kompatibel data lama).
  - Data contoh transaksi mitra & warga di-seed ulang agar tampil rapi.
- **Catatan:** seed data naik ke v5 (smb_seed_v5) -- data demo lama di browser ter-reset
  saat pertama kali dibuka setelah update.
- Hasil: build + cek kode + unggah pratinjau berhasil, 30 tes alur lolos (0 gagal).

### Hilangkan Tampilan "NaN" (Mitra)
- **Penyebab:** formatter Rp di halaman mitra memformat nilai kosong (undefined) sehingga
  muncul "Rp NaN" -- umumnya untuk transaksi lama yang field-nya belum lengkap (nomor
  transaksi/total/bayar-layanan/ongkir belum ada).
- **Perbaikan:** semua formatter Rp di Riwayat Transaksi & Keranjang Mitra kini menampilkan
  Rp 0 bila nilainya kosong (Number(n || 0)), sehingga "NaN" tidak mungkin muncul.
  Data contoh transaksi juga sudah lengkap sejak seed v5.
- Hasil: build + cek kode + unggah pratinjau berhasil, 30 tes alur lolos (0 gagal).
- Pratinjau: https://smart-mbg-local-preview-03853770.base44.app

## 2026-08-04 � Unifikasi Tampilan Marketplace Warga = Mitra (Semua Hijau)
- **Tema global jadi hijau:** --primary/--ring/--sidebar/chart-1 di src/index.css diubah dari
  biru (217 91%) ke hijau emerald (160 84%), sehingga seluruh portal (termasuk Mitra) yang
  memakai warna "primary" kini hijau.
- **Mitra -> hijau:** harga produk di MitraDashboard, AddToCartDialog, MitraProducts,
  SmartRecommendations, MitraKebutuhan (tombol kirim PO), dan info ongkir/rekening di
  MitraCheckout diganti dari biru ke hijau emerald.
- **Marketplace warga disamakan modelnya dengan mitra (tetap hijau):**
  - Kartu produk kini memakai model mitra: gambar + badge kategori pojok kiri bawah,
    nama, asal/supplier, rating bintang + stok, harga, tombol.
  - Diterapkan konsisten di: /marketplace (MarketplacePage.jsx), beranda (MarketCarousel.jsx),
    dan "Produk Pilihan" WargaBeranda.jsx.
  - Fungsi tetap: tombol Keranjang & Beli (gaya Shopee), info gizi (ikon di kartu + dialog).
- Build + lint sukses, deploy ke preview, 30 tes alur lolos (0 gagal).
- Pratinjau: https://smart-mbg-local-preview-03853770.base44.app
- **Pilihan jumlah (+/-) di marketplace warga:** komponen baru QuantityStepper.jsx dipasang di
  kartu produk /marketplace (MarketplacePage), beranda (MarketCarousel), dan Produk Pilihan
  (WargaBeranda). Tombol Keranjang/Beli menambah sesuai qty terpilih lalu reset ke 1.
- **SupplierOrders: badge asal pesanan:** tiap pesanan di /supplier/orders kini berlabel
  "Warga" (hijau) atau "Mitra SPPG" (biru); teks header & empty-state diperbarui menyebut
  mitra SPPG & warga; fallback nama ke customer_email. Konfirmasi/Tolak menangani keduanya.
- **Bug: pesanan warga tidak muncul di Notifikasi Pesanan supplier.**
  - Penyebab: adapter lokal menyimpan semua data di localStorage PER BROWSER. Jika warga belanja
    di browser/perangkat lain, supplier (browser lain) tidak akan melihat pesanannya.
  - Perbaikan:
    1) Real-time lintas tab: base44Client kini mendengarkan event storage dan meneruskan
       create/update/delete ke semua tab browser yang sama (halaman supplier terbuka otomatis
       ter-update saat warga memesan di tab lain).
    2) Badge jumlah pesanan "pending" di menu Supplier -> Notifikasi Pesanan (desktop dropdown,
       menu geser mobile, dan menu bawah mobile) via SupplierLayout.jsx yang berlangganan Order.
  - Cara tes yang benar: gunakan SATU browser yang sama (login warga -> beli -> logout ->
    login supplier -> cek Notifikasi Pesanan / badge angka). Data demo tidak sinkron antar
    browser/perangkat karena keterbatasan localStorage.
- **Notifikasi lonceng kini bisa langsung diklik (direct).**
  - NotificationBell: tiap item notifikasi bisa diklik -> menandai terbaca lalu navigate ke
    link-nya (n.link, fallback ke halaman sesuai role: supplier->/supplier/orders,
    mitra->/mitra/orders, logistik->/logistik/dashboard, admin->/admin/dashboard,
    penerima->/warga/pesanan).
  - Notifikasi nyata dibuat saat: pesanan baru dari warga/mitra (ke supplier, link
    /supplier/orders), status pesanan berubah (konfirmasi/proses/tolak, ke mitra/warga),
    supplier menunjuk logistik (ke logistik, link /logistik/dashboard). notifyRoles kini
    menerima param link.
- **Fix: Riwayat pesanan warga tidak tampil ("Belum Ada Pesanan").**
  - Penyebab: halaman WargaPesanan & WargaPesananDetail hanya menampilkan pesanan dari
    daftar lokal (warga_orders_<email>); jika pesanan hanya ada sebagai Order di rantai
    pasok (base44), tidak muncul sama sekali.
  - Perbaikan: Order remote kini menjadi sumber utama. Helper remoteToWargaOrder di
    warga-store.js mengubah Order base44 ke bentuk tampilan warga; WargaPesanan menggabungkan
    remote + lokal (dedup by order_number); WargaPesananDetail bisa membuka pesanan remote-only
    (by id). Status tetap tersinkron real-time dari supplier/logistik.
  - Catatan: karena data di localStorage per browser, pastikan warga & supplier memakai
    browser yang sama untuk melihat lintas role.
