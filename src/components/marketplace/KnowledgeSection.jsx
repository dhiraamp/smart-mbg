import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, Tag } from "lucide-react";

const KNOWLEDGE = {
  Yayasan: {
    title: "Yayasan & SPPG",
    subtitle: "Satuan Pendidikan Penyelenggara Gizi — pilar utama pelaksana program MBG di lingkungan sekolah.",
    cards: [
      {
        title: "Pendaftaran Yayasan MBG",
        desc: "Proses registrasi SPPG untuk mengikuti program MBG, termasuk verifikasi dokumen & kapasitas dapur.",
        img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400",
        tag: "Registrasi",
        time: "Tahun Ajaran 2026",
      },
      {
        title: "Manajemen Menu Mingguan",
        desc: "Yayasan menyusun menu gizi seimbang tujuh hari, disesuaikan kebutuhan & ketersediaan bahan lokal.",
        img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        tag: "Menu",
        time: "Mingguan",
      },
      {
        title: "Pelaporan Kebutuhan Bahan",
        desc: "SPPG mengunggah kebutuhan bahan pangan per minggu untuk dipasangkan dengan supplier terdekat.",
        img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        tag: "Kebutuhan",
        time: "Real-time",
      },
      {
        title: "Daftar Penerima Manfaat",
        desc: "Kelola data siswa penerima MBG, termasuk riwayat konsumsi & evaluasi gizi.",
        img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
        tag: "Penerima",
        time: "Per Siswa",
      },
    ],
  },
  Pengadaan: {
    title: "Pengadaan",
    subtitle: "Proses akuisisi bahan pangan dari supplier terverifikasi menuju gudang MBG.",
    cards: [
      {
        title: "Sumber Supplier Terverifikasi",
        desc: "Database supplier bahan pangan dengan sertifikat laik higiene & asal-usul jelas.",
        img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
        tag: "Supplier",
        time: "500+ aktif",
      },
      {
        title: "Purchase Order (PO) Mitra",
        desc: "Sistem PO digital dari mitra/yayasan ke supplier dengan pelacakan status real-time.",
        img: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=400",
        tag: "PO",
        time: "Digital",
      },
      {
        title: "Negosiasi & Kontrak",
        desc: "Pengaturan harga kontrak & volume pengadaan bahan pokok untuk stabilitas pasokan.",
        img: "https://images.unsplash.com/photo-1450101499163-c8848c1ca85d?w=400",
        tag: "Kontrak",
        time: "Per Periode",
      },
      {
        title: "Inspeksi Bahan Diterima",
        desc: "Quality check bahan yang masuk gudang — kesegaran, jumlah, & suhu penyimpanan.",
        img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400",
        tag: "QC",
        time: "Setiap Kiriman",
      },
    ],
  },
  Produksi: {
    title: "Produksi",
    subtitle: "Pengolahan bahan pangan menjadi menu gizi seimbang di dapur MBG.",
    cards: [
      {
        title: "Dapur MBG Terpadu",
        desc: "Sentra produksi masakan gizi untuk distribusi massal ke satuan pendidikan.",
        img: "https://images.unsplash.com/photo-1556910103-1c020456d545?w=400",
        tag: "Dapur",
        time: "1.200+ aktif",
      },
      {
        title: "Standar Resep Gizi",
        desc: "Resep baku mengikuti panduan gizi Kemenkes — kalori, protein, & porsi seimbang.",
        img: "https://images.unsplash.com/photo-1495546968767-f0573cca821e?w=400",
        tag: "Resep",
        time: "Standar Nasional",
      },
      {
        title: "Kapasitas Produksi",
        desc: "Pemantauan output harian per dapur untuk memastikan volume mencukupi penerima.",
        img: "https://images.unsplash.com/photo-1577215494675-9e5bfe5f1d80?w=400",
        tag: "Kapasitas",
        time: "Harian",
      },
      {
        title: "Higiene & Sanitasi Dapur",
        desc: "Audit sanitasi peralatan, pegawai, & ruang masak untuk jaminan keamanan pangan.",
        img: "https://images.unsplash.com/photo-1581349485608-9469926a8e5e?w=400",
        tag: "Sanitasi",
        time: "Bulanan",
      },
    ],
  },
  "Distribusi & Logistik": {
    title: "Distribusi & Logistik",
    subtitle: "Pengiriman tepat waktu dari dapur ke satuan penerima dengan rute optimal.",
    cards: [
      {
        title: "Manajemen Armada Logistik",
        desc: "Kendaraan pengantar terverifikasi — motor, pickup, box, hingga truk distribusi.",
        img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400",
        tag: "Armada",
        time: "Multi-moda",
      },
      {
        title: "Optimasi Rute Pengiriman",
        desc: "Algoritma rute terpendek untuk efisiensi biaya & ketepatan waktu tiba.",
        img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
        tag: "Rute",
        time: "38 Provinsi",
      },
      {
        title: "Pelacakan Pengiriman Real-time",
        desc: "Pantau posisi armada & status pengiriman (diproses → dikirim → tiba).",
        img: "https://images.unsplash.com/photo-1526304640581-334e565c8d70?w=400",
        tag: "Tracking",
        time: "Live",
      },
      {
        title: "Prioritas Bahan Cepat Busuk",
        desc: "Skema prioritas pengiriman untuk bahan perishable agar tetap segar saat diterima.",
        img: "https://images.unsplash.com/photo-1607287767771-649b8a9d1ef9?w=400",
        tag: "Prioritas",
        time: "Urgensi Tinggi",
      },
    ],
  },
  "Harga & Pasar": {
    title: "Harga & Pasar",
    subtitle: "Pemantauan harga komoditas pangan & stabilitas pasar untuk pengadaan efisien.",
    cards: [
      {
        title: "Indikator Harga Pangan Pokok",
        desc: "Pantau pergerakan harga beras, telur, daging, minyak & sayuran harian.",
        img: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400",
        tag: "Harga Harian",
        time: "Update tiap hari",
      },
      {
        title: "Analisis Inflasi Pangan",
        desc: "Identifikasi tren inflasi komoditas kunci untuk antisipasi pengadaan.",
        img: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400",
        tag: "Inflasi",
        time: "Bulanan",
      },
      {
        title: "Mark-up Platform 2,5%",
        desc: "Transparansi harga supplier vs harga pembeli, dengan mark-up tetap platform.",
        img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
        tag: "Pricing",
        time: "Kebijakan",
      },
      {
        title: "Peringatan Lonjakan Harga",
        desc: "Notifikasi otomatis bila harga komoditas melonjak signifikan di pasar.",
        img: "https://images.unsplash.com/photo-1590283603385-17ffb3a74229?w=400",
        tag: "Alert",
        time: "Real-time",
      },
    ],
  },
  "Kualitas & Keamanan": {
    title: "Kualitas & Keamanan",
    subtitle: "Standar mutu & keamanan pangan sepanjang rantai pasok MBG.",
    cards: [
      {
        title: "Sertifikasi Laik Higiene",
        desc: "Verifikasi dokumen higiene supplier & dapur sebelum masuk ekosistem MBG.",
        img: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400",
        tag: "Sertifikasi",
        time: "Wajib",
      },
      {
        title: "Uji Mutu Bahan Pangan",
        desc: "Pengujian kualitas bahan — kesegaran, residu, & nilai gizi sampel acak.",
        img: "https://images.unsplash.com/photo-1583947215259-38e2be9c4f9c?w=400",
        tag: "Uji Lab",
        time: "Sampel Acak",
      },
      {
        title: "Penanganan & Penyimpanan",
        desc: "Standar cold storage & suhu penyimpanan sesuai kategori bahan (cepat busuk/sedang/tahan lama).",
        img: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400",
        tag: "Penyimpanan",
        time: "Cold Chain",
      },
      {
        title: "Rating Supplier & Driver",
        desc: "Sistem penilaian kualitas & ketepatan dari mitra untuk perbaikan berkelanjutan.",
        img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400",
        tag: "Rating",
        time: "Per Order",
      },
    ],
  },
  "Kebijakan & Regulasi": {
    title: "Kebijakan & Regulasi",
    subtitle: "Kerangka regulasi nasional & pedoman pelaksanaan program MBG.",
    cards: [
      {
        title: "Regulasi Program MBG",
        desc: "Dasar hukum & pedoman teknis pelaksanaan Makan Bergizi Gratis dari pemerintah.",
        img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400",
        tag: "Regulasi",
        time: "Peraturan Nasional",
      },
      {
        title: "Anggaran & Pendanaan",
        desc: "Alokasi APBN/APBD untuk program MBG serta mekanisme pencairan ke mitra.",
        img: "https://images.unsplash.com/photo-1454165804606-c7d8c4d8d963?w=400",
        tag: "Anggaran",
        time: "2026",
      },
      {
        title: "Kemitraan Multi-Pihak",
        desc: "Skema kolaborasi pemerintah, supplier, logistik, & yayasan dalam ekosistem MBG.",
        img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400",
        tag: "Kemitraan",
        time: "Multi-Stakeholder",
      },
      {
        title: "Audit & Akuntabilitas",
        desc: "Mekanisme audit kinerja & transparansi laporan rantai pasok untuk publik.",
        img: "https://images.unsplash.com/photo-1554224154-22dec23ec20f?w=400",
        tag: "Audit",
        time: "Berkala",
      },
    ],
  },
};

export default function KnowledgeSection({ activeFilter }) {
  const navigate = useNavigate();
  const data = KNOWLEDGE[activeFilter];
  if (!data) return null;

  const handleClick = () => navigate("/portal");

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {data.title}
        </h2>
        <p className="text-sm text-gray-500 mt-1.5 max-w-3xl">{data.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.cards.map((c, i) => (
          <div
            key={i}
            onClick={handleClick}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-400 transition-all group cursor-pointer"
          >
            <div className="relative h-36 bg-gray-100 overflow-hidden">
              <img
                src={c.img}
                alt={c.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 text-[10px] font-medium text-emerald-700 bg-white/90 backdrop-blur px-2 py-0.5 rounded flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5" /> {c.tag}
              </span>
            </div>
            <div className="p-3.5">
              <p className="text-sm font-bold text-gray-900">{c.title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{c.desc}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {c.time}
                </span>
                <span className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                  Selengkapnya <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}