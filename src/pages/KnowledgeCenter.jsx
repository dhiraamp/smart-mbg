import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, X, CalendarDays, FileText } from "lucide-react";
import HomeHeader from "@/components/marketplace/HomeHeader";
import FooterStats from "@/components/marketplace/FooterStats";

const CATEGORIES = [
  { key: "Semua", label: "Semua" },
  { key: "pengembangan", label: "Pengembangan", color: "bg-emerald-600 text-white" },
  { key: "panduan", label: "Panduan", color: "bg-sky-600 text-white" },
  { key: "regulasi", label: "Regulasi", color: "bg-amber-500 text-white" },
  { key: "sumberdaya", label: "Sumber Daya", color: "bg-violet-600 text-white" },
];

const catLabel = (key) => CATEGORIES.find((c) => c.key === key)?.label || key;
const catColor = (key) => CATEGORIES.find((c) => c.key === key)?.color || "bg-gray-500 text-white";

const DATA = [
  {
    id: "dev-1",
    category: "pengembangan",
    title: "Perkembangan Program Makan Bergizi Gratis di Garut",
    excerpt: "Perjalanan dan capaian program MBG sejak diluncurkan di Kabupaten Garut, mulai dari jumlah SPPG hingga cakupan sekolah.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    date: "2026-07-28",
    author: "Dinas Ketahanan Pangan",
    body: "Program Makan Bergizi Gratis (MBG) terus berkembang di Kabupaten Garut. Kini dapur SPPG aktif melayani ratusan sekolah dengan menu bergizi yang disusun oleh pengelola gizi. Artikel ini mengulas perkembangan program, jumlah dapur yang beroperasi, serta rencana perluasan cakupan ke kecamatan lain.",
  },
  {
    id: "dev-2",
    category: "pengembangan",
    title: "Inovasi Menu Bergizi Berbasis Bahan Lokal",
    excerpt: "Dapur SPPG mulai memanfaatkan hasil bumi lokal seperti beras cianjur, telur ayam kampung, dan sayuran petani Garut.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    date: "2026-07-20",
    author: "Tim Gizi SPPG",
    body: "Untuk mendukung ekonomi lokal, SPPG mengadopsi menu yang berbasis bahan pangan daerah. Inovasi ini memangkas biaya logistik sekaligus meningkatkan gizi melalui bahan segar dari petani sekitar.",
  },
  {
    id: "dev-3",
    category: "pengembangan",
    title: "Digitalisasi Pengelolaan Dapur SPPG",
    excerpt: "Smart MBG membantu dapur SPPG mencatat stok, pesanan, dan distribusi secara digital untuk mengurangi kesalahan manual.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
    date: "2026-07-15",
    author: "Smart MBG Team",
    body: "Penerapan Smart MBG di dapur SPPG mempermudah pemantauan stok bahan, pembuatan purchase order ke supplier, dan pelacakan pengiriman. Data tercatat otomatis sehingga laporan bulanan lebih akurat.",
  },
  {
    id: "panduan-1",
    category: "panduan",
    title: "Panduan Belanja Bahan Pangan untuk SPPG",
    excerpt: "Langkah-langkah memesan bahan pangan dari supplier melalui marketplace Smart MBG.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    date: "2026-07-10",
    author: "Smart MBG Team",
    body: "1) Buka menu Marketplace. 2) Pilih produk dan masukkan ke keranjang. 3) Lanjutkan ke checkout dan konfirmasi alamat pengiriman. 4) Pantau status pesanan melalui halaman Tracking Pesanan sampai barang diterima.",
  },
  {
    id: "panduan-2",
    category: "panduan",
    title: "Panduan Melamar Lowongan Kerja MBG",
    excerpt: "Cara mencari posisi yang cocok dan mengirim lamaran melalui halaman Career.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800",
    date: "2026-07-05",
    author: "Smart MBG Team",
    body: "Kunjungi menu Career, cari posisi (dapur SPPG, logistik, atau lainnya), lalu klik 'Lihat & Lamar'. Masuk dengan akun warga, isi nama dan pesan singkat, lalu kirim. Status lamaran akan diinformasikan oleh pengelola lowongan.",
  },
  {
    id: "panduan-3",
    category: "panduan",
    title: "Panduan Gizi untuk Penerima Manfaat",
    excerpt: "Tips menjaga asupan gizi seimbang untuk anak usia sekolah sesuai standar menu MBG.",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800",
    date: "2026-06-28",
    author: "Tim Gizi",
    body: "Pastikan porsi makan mengandung karbohidrat, lauk protein, sayur, dan buah. Minum air putih yang cukup dan biasakan sarapan sebelum berangkat sekolah. Menu MBG disusun agar memenuhi kebutuhan energi harian anak.",
  },
  {
    id: "regulasi-1",
    category: "regulasi",
    title: "Regulasi Program Makan Bergizi Gratis",
    excerpt: "Dasar hukum dan pedoman penyelenggaraan MBG di tingkat pusat dan daerah.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
    date: "2026-06-20",
    author: "Bagian Hukum",
    body: "Program MBG diselenggarakan berdasarkan peraturan perundang-undangan terkait pemenuhan gizi anak usia sekolah dan penanganan stunting. Dokumen ini merangkum regulasi utama yang menjadi acuan pelaksanaan di daerah.",
  },
  {
    id: "regulasi-2",
    category: "regulasi",
    title: "Standar Mutu dan Keamanan Pangan MBG",
    excerpt: "Pedoman higiene dapur, standar pengolahan, dan keamanan pangan yang wajib dipenuhi SPPG.",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800",
    date: "2026-06-12",
    author: "Dinas Kesehatan",
    body: "Setiap dapur SPPG wajib menerapkan higiene sanitasi, memastikan bahan pangan segar dan aman, serta menjaga suhu penyimpanan. Dokumen ini menjelaskan standar mutu yang digunakan dalam pemeriksaan berkala.",
  },
  {
    id: "regulasi-3",
    category: "regulasi",
    title: "Kebijakan Kemitraan Supplier dan SPPG",
    excerpt: "Pedoman kerja sama antara supplier bahan pangan dan dapur SPPG dalam rantai pasok MBG.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
    date: "2026-06-01",
    author: "Dinas Ketahanan Pangan",
    body: "Kemitraan supplier–SPPG diatur agar harga transparan, kualitas terjaga, dan pengiriman tepat waktu. Panduan ini memuat kriteria supplier, mekanisme purchase order, serta evaluasi kinerja kemitraan.",
  },
  {
    id: "sumber-1",
    category: "sumberdaya",
    title: "Sumber Daya: Template Laporan Bulanan SPPG",
    excerpt: "Format laporan stok, pengeluaran, dan distribusi yang dapat diunduh oleh pengelola dapur.",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    date: "2026-05-25",
    author: "Smart MBG Team",
    body: "Template laporan bulanan membantu SPPG menyusun data stok masuk/keluar, anggaran, dan distribusi dengan rapi. Data dari aplikasi dapat langsung dijadikan bahan laporan kepada dinas terkait.",
  },
  {
    id: "sumber-2",
    category: "sumberdaya",
    title: "Sumber Daya: Kontak Dinas dan Layanan Bantuan",
    excerpt: "Daftar kontak Dinas Ketahanan Pangan, Dinas Pendidikan, dan layanan bantuan teknis Smart MBG.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    date: "2026-05-18",
    author: "Smart MBG Team",
    body: "Temukan kontak resmi untuk pertanyaan seputar program MBG, bantuan teknis aplikasi, serta pengaduan layanan. Tim pendamping siap membantu SPPG, supplier, dan warga penerima manfaat.",
  },
  {
    id: "sumber-3",
    category: "sumberdaya",
    title: "Sumber Daya: Kalender Kegiatan dan Pelatihan",
    excerpt: "Jadwal pelatihan pengelola dapur, sosialisasi gizi, dan kegiatan rutin program MBG.",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800",
    date: "2026-05-10",
    author: "Dinas Ketahanan Pangan",
    body: "Ikuti pelatihan dan sosialisasi yang diadakan secara berkala untuk memperbarui pengetahuan pengelola dapur dan kader gizi. Pendaftaran dapat dilakukan melalui perangkat daerah terkait.",
  },
];

export default function KnowledgeCenter() {
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DATA.filter((d) => {
      const matchCat = category === "Semua" || d.category === category;
      const matchQ =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.excerpt.toLowerCase().includes(q) ||
        d.body.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [category, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      <section className="relative border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-teal-800/80" />
        </div>
        <div className="relative max-w-full mx-auto px-4 py-12">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-100 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-full w-fit">
            <BookOpen className="w-3.5 h-3.5" /> Knowledge Center MBG Garut
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3">Pusat Pengetahuan MBG</h1>
          <p className="text-sm text-white/80 mt-1.5 max-w-2xl">
            Panduan, regulasi, pengembangan program, dan sumber daya untuk mendukung
            penyelenggaraan Makan Bergizi Gratis di Kabupaten Garut.
          </p>

          <div className="mt-6 flex items-stretch bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl">
            <div className="flex items-center pl-4">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari panduan, regulasi, atau artikel..."
              className="flex-1 px-3 py-3 text-sm outline-none"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  category === c.key
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white/10 text-white/85 border-white/30 hover:bg-white/20"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {category === "Semua" ? "Semua Materi" : catLabel(category)}
          </h2>
          <span className="text-xs text-gray-500">{filtered.length} materi</span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada materi yang cocok dengan pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((d) => (
              <motion.button
                key={d.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(d)}
                className="bg-white rounded-2xl border border-gray-200 p-0 text-left hover:border-emerald-400 hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded ${catColor(d.category)}`}>
                    {catLabel(d.category)}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{d.title}</h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{d.excerpt}</p>
                  <span className="mt-auto pt-3 flex items-center gap-1 text-[11px] text-gray-400">
                    <CalendarDays className="w-3 h-3" /> {new Date(d.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    <span className="mx-1">·</span>
                    <span className="truncate">{d.author}</span>
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>

      <FooterStats />

      {/* Modal detail */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={() => setSelected(null)}>
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            >
              <div className="relative h-44 overflow-hidden rounded-t-2xl">
                <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
                <button onClick={() => setSelected(null)} className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60">
                  <X className="w-4 h-4" />
                </button>
                <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded ${catColor(selected.category)}`}>
                  {catLabel(selected.category)}
                </span>
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 leading-snug">{selected.title}</h2>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1 flex-wrap">
                  <FileText className="w-3 h-3" /> {selected.author}
                  <span className="mx-1">·</span>
                  <CalendarDays className="w-3 h-3" /> {new Date(selected.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mt-3">{selected.body}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
