import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, UtensilsCrossed, ChevronDown, ChevronRight, Loader2, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function parseTextToIngredients(text) {
  if (!text || text.trim() === "-" || !text.trim()) return [];
  return text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(?:gr|gram|g)?$/i);
      if (match) return { nama: match[1].trim(), gram: match[2].replace(",", ".") };
      return { nama: part, gram: "100" };
    });
}

function MenuCard({ menu, index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const menuData = menu.menu_data || {};
  const servings = menuData?.Senin?.servings || 50;

  const dayData = DAYS.map((day) => {
    const d = menuData[day];
    if (!d) return { day, ingredients: [] };
    const ingredients =
      Array.isArray(d.ingredients) && d.ingredients.length > 0
        ? d.ingredients.filter((i) => i.nama && i.gram)
        : parseTextToIngredients(d.pagi || d.siang || d.sore || "");
    return { day, ingredients };
  });

  const activeDays = dayData.filter((d) => d.ingredients.length > 0);
  const totalBahan = activeDays.reduce((sum, d) => sum + d.ingredients.length, 0);

  return (
    <motion.div
      layout
      className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/50 border border-blue-100"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-8 w-36 h-36 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />
      <button
        onClick={() => setExpanded(!expanded)}
        className="relative w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
          <UtensilsCrossed className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-md shrink-0">
              #{index + 1}
            </span>
            <p className="text-sm font-bold text-slate-800 truncate">{menu.sppg_name}</p>
          </div>
          <p className="text-[11px] text-blue-600/80 flex items-center gap-1 font-medium">
            <CalendarDays className="w-3 h-3" />
            {menu.week_label} · {activeDays.length} hari · {totalBahan} bahan · {servings} porsi
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-100/60 backdrop-blur-sm flex items-center justify-center shrink-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-blue-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-blue-600" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="relative px-4 pb-4 space-y-2.5">
          {activeDays.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">Belum ada bahan menu terperinci.</p>
          ) : (
            activeDays.map(({ day, ingredients }) => (
              <div
                key={day}
                className="rounded-xl p-3 space-y-2 bg-white/70 backdrop-blur-sm border border-blue-100/80 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-blue-500/30">
                    {day.slice(0, 3)}
                  </span>
                  <span className="font-semibold text-xs text-slate-700">{day}</span>
                  <span className="text-[10px] text-blue-500/70 ml-auto font-medium">{ingredients.length} bahan</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-medium"
                    >
                      {ing.nama} · {ing.gram}gr
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function WeeklyMenuSection() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.entities.WeeklyMenu
      .filter({ status: "published" }, "-created_date", 50)
      .then((data) => setMenus(data))
      .catch((error) => console.error('Gagal memuat WeeklyMenuSection:', error?.status, error?.message, error))
      .finally(() => setLoading(false));
  }, []);

  // Ambil menu terbaru per SPPG
  const sppgMap = {};
  menus.forEach((m) => {
    if (!sppgMap[m.sppg_name] || new Date(m.created_date) > new Date(sppgMap[m.sppg_name].created_date)) {
      sppgMap[m.sppg_name] = m;
    }
  });
  const sppgMenus = Object.values(sppgMap);

  const sortedMenus = useMemo(
    () => [...sppgMenus].sort((a, b) => (a.sppg_name || "").localeCompare(b.sppg_name || "")),
    [sppgMenus]
  );

  const filteredMenus = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return sortedMenus.filter(
      (m) =>
        m.sppg_name?.toLowerCase().includes(q) ||
        m.week_label?.toLowerCase().includes(q)
    );
  }, [sortedMenus, search]);

  const hasSearch = search.trim().length > 0;

  if (loading) {
    return (
      <section className="max-w-full mx-auto px-3 mt-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        </div>
      </section>
    );
  }

  if (sppgMenus.length === 0) return null;

  return (
    <section className="max-w-full mx-auto px-3 mt-5">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 p-4 mb-4 shadow-lg">
        <div className="absolute -top-8 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <CalendarDays className="w-4 h-4 text-white" />
            </div>
            Menu Mingguan SPPG
          </h2>
          <span className="text-xs text-blue-50 bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full font-medium">
            {sppgMenus.length} SPPG
          </span>
        </div>
        <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-xl overflow-hidden shadow-inner">
          <Search className="w-4 h-4 text-blue-500 ml-3 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama yayasan atau minggu..."
            className="flex-1 px-2.5 py-2.5 text-sm text-slate-700 outline-none bg-transparent placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <AnimatePresence>
          {hasSearch &&
            filteredMenus.map((menu, idx) => (
              <MenuCard key={menu.id} menu={menu} index={idx} />
            ))}
        </AnimatePresence>
        {hasSearch && filteredMenus.length === 0 && (
          <div className="bg-white rounded-2xl border border-blue-100 py-10 text-center">
            <Search className="w-8 h-8 text-blue-200 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">Yayasan tidak ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau hapus filter</p>
          </div>
        )}
        {!hasSearch && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-blue-100 py-12 text-center">
            <Search className="w-10 h-10 text-blue-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Cari nama yayasan untuk melihat menu</p>
            <p className="text-xs text-slate-400 mt-1">Ketik nama yayasan pada kolom pencarian di atas</p>
          </div>
        )}
      </div>
    </section>
  );
}