import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, RotateCcw, ChevronDown, Check } from "lucide-react";

const FILTERS = [
  "Semua Area",
  "Yayasan",
  "Pengadaan",
  "Produksi",
  "Distribusi & Logistik",
  "Harga & Pasar",
  "Kualitas & Keamanan",
  "Kebijakan & Regulasi",
];

export default function HeroSearch({ query, setQuery, activeFilter, setActiveFilter }) {
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const select = (f) => {
    setActiveFilter(f);
    setOpen(false);
  };

  return (
    <section className="relative border-b border-gray-200">
      <div className="absolute inset-0 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/85 to-teal-800/80" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative max-w-4xl mx-auto px-4 py-12 text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-2xl sm:text-3xl font-bold text-white"
        >
          Cari Informasi Rantai Pasok MBG
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-white/80 text-sm mt-2 max-w-2xl mx-auto"
        >
          Temukan data, wawasan, dan solusi terbaik untuk mendukung program MBG untuk siswa Indonesia.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-6 flex items-stretch bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl mx-auto"
        >
          <div className="flex items-center pl-4">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari komoditas, supplier, distribusi, harga, atau topik lain terkait MBG..."
            className="flex-1 px-3 py-3 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === "Semua Area" ? "Yayasan" : activeFilter)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 transition-colors"
          >
            Cari
          </button>
        </motion.div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-white/70">Filter Knowledge Area:</span>
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                open
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400"
              }`}
            >
              {activeFilter}
              <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="absolute z-50 mt-1 left-0 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-left">
                {FILTERS.map((f) => {
                  const active = activeFilter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => select(f)}
                      className={`w-full text-xs font-medium px-3 py-2 flex items-center justify-between gap-2 transition-colors ${
                        active ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{f}</span>
                      {active && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setQuery("");
              setActiveFilter("Semua Area");
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-white text-gray-600 border-gray-200 hover:border-emerald-400 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </motion.div>
    </section>
  );
}