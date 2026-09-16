# Panduan & Naskah Presentasi Roadmap Smart MBG ke Atasan / Pimpinan
## Target Peluncuran: 14 September 2026 – 14 Oktober 2026 (1 Bulan Kalender)

Dokumen ini memuat panduan komunikasi resmi, naskah presentasi, teks laporan singkat, memo eksekutif, serta antisipasi tanya-jawab (*Q&A Defense*) yang dirancang untuk menyampaikan progres dan rencana peluncuran sistem **Smart MBG (Makan Bergizi Gratis)** kepada jajaran pimpinan, direksi, kepala dinas, maupun pemangku kepentingan Badan Gizi Nasional (BGN).

---

## 1. Lembar Referensi Cepat (*Quick Reference*)

| Parameter | Data Acuan |
| :--- | :--- |
| **Nama Proyek** | Platform Rantai Pasok Pangan & Monitoring Smart MBG |
| **Periode Kerja** | **Senin, 14 September 2026 – Rabu, 14 Oktober 2026** |
| **Durasi Proyek** | **23 Hari Kerja Efektif (dalam 31 Hari Kalender, Sabtu & Minggu Libur)** (4 Sprint Mingguan) |
| **Tanggal Grand Launching** | **Rabu, 14 Oktober 2026** |
| **Total Story Points (Bobot)** | **90 Story Points** (Rata-rata 22.5 SP / Pekan) |
| **Struktur Tiket Kerja** | 5 Epics, 22 User Stories (Model Agile), 55 Sub-tasks |
| **Dashboard Pemantauan Live** | [Google Sheets Roadmap Interaktif](https://docs.google.com/spreadsheets/d/1MGiWhVSjRf3JHWibTkw2WQTh5n_IpEB848m3lROTsuA/edit) |
| **File Backlog Jira Siap Import** | [`docs/jira-import-smart-mbg.csv`](file:///G:/WORK/picing/frontend/smart-mbg-local/docs/jira-import-smart-mbg.csv) |

---

## 2. Format 1: Naskah Presentasi Lisan (Meeting / Paparan 5–7 Menit)

Gunakan naskah ini saat mempresentasikan roadmap di hadapan pimpinan atau dalam rapat koordinasi tim.

### [Bagian 1: Pembuka & Tujuan Laporan]
> *"Selamat pagi/siang Bapak/Ibu pimpinan yang saya hormati.  
> Terima kasih atas waktu dan kesempatan yang diberikan.  
>  
> Pada kesempatan kali ini, izin saya menyampaikan laporan kesiapan teknis dan peta jalan (*roadmap*) eksekusi menuju peluncuran resmi (*Go-Live*) platform **Smart MBG (Makan Bergizi Gratis)**.  
>  
> Tim teknis telah mematangkan perencanaan kerja terpadu selama **tepat 1 bulan kalender (31 hari)**, yang akan kita mulai pada hari **Senin, 14 September 2026** dengan target **Grand Launching publik pada hari Rabu, 14 Oktober 2026**."*

### [Bagian 2: Rangkuman Eksekutif & Metodologi]
> *"Bapak/Ibu, platform Smart MBG ini dirancang untuk mendigitalisasi dan memastikan transparansi rantai pasok makan bergizi dari petani, peternak, dapur SPPG, kurir logistik, hingga ke tangan penerima manfaat.  
>  
> Seluruh kebutuhan pekerjaan telah kami bedah secara terukur menggunakan metodologi Scrum/Agile dengan total **90 Story Points**, yang kami bagi ke dalam **4 Sprint mingguan**. Rata-rata beban kerja adalah **22.5 Story Points per pekan**, yang merupakan kapasitas kerja ideal dan realistis bagi tim pengembang tanpa mengorbankan kualitas dan keamanan."*

### [Bagian 3: Capaian & Target Utama per Pekan (4 Sprint)]
> *"Izin memaparkan target capaian (*deliverables*) utama pada masing-masing pekan:  
>  
> 1. **Pekan Pertama (14 – 20 September 2026) — Penguatan Fondasi & Staging Lokal (26 SP):**  
>    Kita menuntaskan formulir registrasi 4 entitas (Warga, Mitra Dapur SPPG, Supplier Bahan Baku, dan Armada Logistik) dengan verifikasi OTP WhatsApp riil. Bersamaan dengan itu, kita menata skema database PostgreSQL Supabase, melakukan pengadaan domain resmi instansi `.id`, serta menjalankan simulasi deployment staging lokal dengan target zero error.  
>  
> 2. **Pekan Kedua (21 – 27 September 2026) — Infrastruktur Cloud & Keamanan Server (19 SP):**  
>    Kita menyewa dan mengonfigurasi Cloud VPS produksi (Ubuntu 24.04 LTS), memasang sertifikat enkripsi SSL/TLS HTTPS (Grade A), mengaktifkan nomor kartu SIM khusus Bot WhatsApp resmi sistem, serta menyusun skrip pencadangan otomatis (*auto-backup cron*) database harian.  
>  
> 3. **Pekan Ketiga (28 September – 4 Oktober 2026) — Integrasi Rantai Pasok & Audit Keamanan (21 SP):**  
>    Kita menguji alur bisnis secara menyeluruh: mulai dari pesanan bahan pangan oleh Dapur SPPG, notifikasi WhatsApp ke Supplier, penugasan armada kurir logistik, hingga bukti serah terima di gudang. Di fase ini, kita juga mengunci keamanan data NIK warga dan memasang pembatasan kuota (*rate-limiting*) OTP WhatsApp untuk mencegah lonjakan biaya kuota pesan.  
>  
> 4. **Pekan Keempat (5 – 14 Oktober 2026) — Uji Lapangan Nyata & Peluncuran Resmi (24 SP):**  
>    Sebagai pembuktian kehandalan di lapangan, kita mengadakan *Pilot Trial* terbatas di 1 Dapur SPPG percontohan (Cikajang) bersama supplier lokal. Dilanjutkan dengan pelatihan operator BGN/Pemkab, penyerahan buku panduan PDF bergambar, penguncian kode (*code freeze*), hingga puncaknya pada **Rabu, 14 Oktober 2026: GRAND LAUNCHING WEB RESMI SMART MBG**."*

### [Bagian 4: Transparansi Pemantauan Real-Time]
> *"Sebagai komitmen transparansi, seluruh progres pekerjaan ini dapat dipantau secara langsung oleh jajaran manajemen melalui **Google Spreadsheet interaktif** yang telah dilengkapi Gantt Chart harian, matriks risiko, dan Jira Backlog. Setiap tiket memiliki PIC dan tenggat waktu yang jelas."*

### [Bagian 5: Penutup & Permohonan Persetujuan]
> *"Demikian paparan roadmap peluncuran Smart MBG ini kami sampaikan. Kami memohon arahan, masukan, dan persetujuan dari Bapak/Ibu agar tim dapat langsung mengeksekusi tahapan Sprint 1 mulai Senin, 14 September 2026.  
> Terima kasih atas arahan dan dukungan Bapak/Ibu."*

---

## 3. Format 2: Teks Laporan Singkat Eksekutif (WhatsApp / Telegram)

Format ringkas yang tepat dikirimkan melalui pesan instan kepada atasan:

```text
Selamat pagi/siang Bapak/Ibu [Nama Atasan],

Izin menyampaikan bahwa rencana kerja dan Roadmap Go-Live untuk platform "Smart MBG" telah selesai disusun secara komprehensif.

Ringkasan Rencana Kerja:
• Periode Pengerjaan: 14 September – 14 Oktober 2026 (Tepat 1 Bulan / 23 Hari Kerja Efektif (dalam 31 Hari Kalender, Sabtu & Minggu Libur))
• Target Grand Launching: Rabu, 14 Oktober 2026
• Total Beban Kerja: 90 Story Points (Terbagi ke dalam 4 Sprint Mingguan)

Milestone Mingguan:
1. Sprint 1 (14-18 Sep, 5 Hari Kerja): Finalisasi Form 4 Peran + OTP WA Riil, DB PostgreSQL, Domain .ID, & Uji Staging Lokal.
2. Sprint 2 (21-25 Sep, 5 Hari Kerja): Setup Cloud VPS Produksi, SSL HTTPS, Auto-Backup DB, & Bot WA Resmi.
3. Sprint 3 (28 Sep-02 Okt, 5 Hari Kerja): Integrasi Rantai Pasok (SPPG - Supplier - Kurir), Audit Keamanan NIK & UAT Lintas HP.
4. Sprint 4 (05-14 Okt, 8 Hari Kerja): Pilot Trial Lapangan (SPPG Cikajang), Training Operator Dinas/BGN, & Grand Launching.

Seluruh rincian tugas, alokasi PIC, dan visualisasi Gantt Chart harian dapat Bapak/Ibu pantau langsung melalui Google Sheets berikut:
👉 https://docs.google.com/spreadsheets/d/1MGiWhVSjRf3JHWibTkw2WQTh5n_IpEB848m3lROTsuA/edit

Mohon arahan dan persetujuan Bapak/Ibu agar tim dapat memulai eksekusi tahap pertama pekan depan. Terima kasih banyak atas bimbingan dan arahan Bapak/Ibu.
```

---

## 4. Format 3: Memo Eksekutif Resmi (*Executive Email Briefing*)

Format formal untuk pengiriman via surat elektronik dinas atau memo internal manajemen:

```text
Kepada Yth.  
Bapak/Ibu [Nama Atasan / Pimpinan Unit Kerja]  
[Nama Instansi / Perusahaan]  

Perihal: Laporan Rencana Kerja & Roadmap Peluncuran Resmi (Go-Live) Platform Smart MBG  
Lampiran: Tautan Spreadsheet Peta Kerja & Backlog Jira Proyek  

Dengan hormat,

Sehubungan dengan persiapan digitalisasi operasional program Makan Bergizi Gratis, bersama memo ini kami sampaikan Peta Jalan (Roadmap) dan Rencana Aksi Kerja menuju peluncuran resmi platform Smart MBG dengan rincian sebagai berikut:

I. RANGKUMAN EKSEKUTIF
1. Durasi Pelaksanaan : 23 Hari Kerja Efektif (dalam 31 Hari Kalender, Sabtu & Minggu Libur) (Senin, 14 September 2026 s/d Rabu, 14 Oktober 2026)
2. Target Grand Launching : Rabu, 14 Oktober 2026
3. Total Beban Kerja : 90 Story Points (Scrum Methodology, 4 Sprint @ 1 Pekan)
4. Cakupan Fitur : Autentikasi 4 Peran (Warga, SPPG, Supplier, Logistik), WhatsApp Gateway Riil, Pemesanan Komoditas Lokal, Pelacakan Pengantaran, dan Dasbor Monitoring Eksekutif.

II. TAHAPAN SPRINT & DELIVERABLES
• Sprint 1 (14–20 Sep): Finalisasi formulir publik ber-OTP WhatsApp riil, standardisasi skema PostgreSQL Supabase, registrasi domain instansi .id, dan verifikasi staging lokal bebas error.
• Sprint 2 (21–27 Sep): Pengadaan server Cloud VPS Ubuntu 24.04 LTS, sertifikat keamanan SSL/TLS HTTPS Grade A, integrasi bot resmi WhatsApp sistem, dan skrip otomatis pencadangan data (auto-backup).
• Sprint 3 (28 Sep–04 Okt): Uji transaksi terpadu rantai pasok pangan (petani ke dapur SPPG), penugasan logistik armada, pembatasan kuota OTP (rate-limiting), serta audit keamanan celah web dan privasi NIK warga.
• Sprint 4 (05–14 Okt): Pelaksanaan pilot trial lapangan di Dapur SPPG Cikajang, penyusunan buku panduan pengguna (PDF), pelatihan operator dinas/BGN, code freeze, dan Grand Launching resmi.

III. INSTRUMEN MONITORING REAL-TIME
Untuk mempermudah pengawasan pimpinan, seluruh detail tiket kerja harian dan visualisasi grafik waktu (Gantt Chart) dapat diakses melalui tautan resmi berikut:
https://docs.google.com/spreadsheets/d/1MGiWhVSjRf3JHWibTkw2WQTh5n_IpEB848m3lROTsuA/edit

Demikian laporan ini kami sampaikan. Kami memohon arahan, koreksi, dan persetujuan dari Bapak/Ibu untuk memulai eksekusi Sprint 1 sesuai jadwal. Atas perhatian dan dukungan yang diberikan, kami ucapkan terima kasih.

Hormat kami,  
[Nama Anda]  
Tim Pengembang Sistem Smart MBG
```

---

## 5. Format 4: Antisipasi Pertanyaan Kritis Pimpinan (*Q&A Defense*)

Persiapkan jawaban berikut jika pimpinan menanyakan hal-hal spesifik:

### Q1: *"Apakah waktu 1 bulan (31 hari) ini cukup dan tidak terburu-buru?"*
> **Jawaban:**  
> *"Sangat cukup dan terukur, Bapak/Ibu. Fondasi kode antarmuka dan logika sistem saat ini sudah terbangun dan berhasil melewati uji kompilasi (build) tanpa error. Periode 1 bulan ini difokuskan pada penguatan integrasi infrastruktur cloud, pengujian transaksi riil di lapangan, dan pelatihan pengguna. Beban kerja 22.5 Story Points per pekan sangat seimbang bagi tim pengembang."*

### Q2: *"Bagaimana jaminan keamanan data warga, terutama NIK dan nomor kontak?"*
> **Jawaban:**  
> *"Kami menerapkan kebijakan keamanan berlapis:  
> 1. Database PostgreSQL diproteksi dengan Row Level Security (RLS) sehingga pengguna umum tidak dapat mengekstrak data pendaftar lain.  
> 2. Data NIK dilakukan masking dan enkripsi pada respons API.  
> 3. Seluruh transmisi jaringan wajib melalui protokol terenkripsi HTTPS SSL Grade A."*

### Q3: *"Apakah sistem OTP WhatsApp ini rawan pembengkakan biaya kuota atau spam?"*
> **Jawaban:**  
> *"Kami telah menyiapkan tiket perlindungan khusus (`SMBG-18`) berupa Rate-Limiting. Setiap nomor HP dibatasi maksimal 3 kali permintaan kode per 5 menit dengan jeda cooldown 60 detik. Ini mencegah serangan bot, penipuan, sekaligus menjaga pemakaian saldo kuota pesan gateway tetap efisien."*

### Q4: *"Kenapa perlu ada Pilot Project lapangan di Cikajang pada minggu ke-4?"*
> **Jawaban:**  
> *"Pilot project ini adalah simulasi operasional nyata di lapangan sebelum web dibuka ke publik luas. Kami ingin memastikan pengelola dapur SPPG dan petani lokal dapat mengoperasikan aplikasi dengan lancar, serta menguji respon sistem pada kondisi sinyal internet di daerah. Dengan demikian, saat launching resmi, sistem sudah teruji tuntas dan minim komplain."*

### Q5: *"Berapa estimasi kebutuhan biaya server VPS dan domain untuk peluncuran ini?"*
> **Jawaban:**  
> *"Sangat efisien Bapak/Ibu.  
> • Cloud VPS (4 vCPU, 8GB RAM, NVMe): sekitar Rp 300.000 – Rp 450.000 / bulan di provider lokal (IDCloudHost / Biznet Gio).  
> • Domain resmi .ID: sekitar Rp 225.000 / tahun.  
> • SSL Certificate: Gratis selamanya menggunakan Let's Encrypt dengan pembaruan otomatis (auto-renew).  
> Total biaya infrastruktur awal di bawah Rp 1 juta rupiah."*
