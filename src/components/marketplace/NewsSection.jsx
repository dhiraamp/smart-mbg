import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, Bell, ArrowRight } from "lucide-react";
import { fetchAllNews } from "@/lib/news";

const FALLBACK_NEWS = [
  {
    tag: "Kebijakan",
    color: "emerald",
    time: "2 jam lalu",
    title: "Pemerintah Tingkatkan Anggaran MBG 2026",
    summary: "Anggaran program Makan Bergizi Gratis 2026 naik signifikan untuk perluasan jangkauan dapur MBG nasional.",
    img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200",
    url: "https://satudata.garutkab.go.id/artikel/",
  },
  {
    tag: "Pasar",
    color: "orange",
    time: "5 jam lalu",
    title: "Stabilisasi Harga Komoditas Pangan Pokok",
    summary: "Pemerintah dan supplier berkolaborasi menjaga stabilitas harga beras, telur, dan minyak goreng.",
    img: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200",
    url: "https://satudata.garutkab.go.id/artikel/",
  },
  {
    tag: "Logistik",
    color: "blue",
    time: "1 hari lalu",
    title: "Optimasi Rute Distribusi di 38 Provinsi",
    summary: "Sistem logistik terintegrasi mempercepat distribusi komoditas segar ke dapur MBG seluruh Indonesia.",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200",
    url: "https://satudata.garutkab.go.id/artikel/",
  },
];

const BADGE = {
  emerald: "text-emerald-700 bg-emerald-50",
  orange: "text-orange-700 bg-orange-50",
  blue: "text-blue-700 bg-blue-50",
};

export default function NewsSection() {
  const navigate = useNavigate();
  const [news, setNews] = useState(FALLBACK_NEWS);

  useEffect(() => {
    let active = true;
    fetchAllNews()
      .then((items) => {
        if (active && items.length) setNews(items.slice(0, 6));
      })
      .catch((error) => {
        console.error("Gagal memuat berita:", error);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Berita & Update</h2>
        </div>
        <button
          onClick={() => navigate("/berita")}
          className="text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1"
        >
          Lihat Semua Berita <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100"
      >
        {news.map((n, i) => (
          <motion.a
            key={i}
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            variants={{ hidden: { opacity: 0, x: -15 }, visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
          >
            <img src={n.img} alt="" referrerPolicy="no-referrer" className="w-16 h-16 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${BADGE[n.color]}`}>{n.tag}</span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {n.time}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.summary}</p>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}
