import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, Bell, ArrowLeft, ExternalLink, Newspaper } from "lucide-react";
import HomeHeader from "@/components/marketplace/HomeHeader";
import FooterStats from "@/components/marketplace/FooterStats";
import { fetchAllNews } from "@/lib/news";

const BADGE = {
  emerald: "text-emerald-700 bg-emerald-50",
  orange: "text-orange-700 bg-orange-50",
  blue: "text-blue-700 bg-blue-50",
};

const FALLBACK_NEWS = [];

export default function Berita() {
  const navigate = useNavigate();
  const [news, setNews] = useState(FALLBACK_NEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAllNews()
      .then((items) => {
        if (active && items.length) setNews(items);
      })
      .catch((error) => {
        console.error("Gagal memuat daftar berita:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      <main className="max-w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
              aria-label="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-emerald-600" />
                <h1 className="text-2xl font-bold text-gray-900">Berita & Update</h1>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Berita terkini seputar data, statistik, dan program Satu Data dari Satu Data Garut & data.go.id
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="w-full h-40 bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded mt-3 w-1/3" />
                <div className="h-5 bg-gray-200 rounded mt-2 w-full" />
                <div className="h-3 bg-gray-200 rounded mt-2 w-3/4" />
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada berita untuk ditampilkan.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {news.map((n, i) => (
              <motion.a
                key={`${n.url}-${i}`}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all duration-200 group"
              >
                <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                  {n.img ? (
                    <img
                      src={n.img}
                      alt={n.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                      <Bell className="w-8 h-8 text-emerald-300" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-[10px] font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded">
                    {n.source}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${BADGE[n.color]}`}>{n.tag}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {n.time}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {n.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{n.summary}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-3 group-hover:underline">
                    Baca Selengkapnya <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </main>

      <FooterStats />
    </div>
  );
}
