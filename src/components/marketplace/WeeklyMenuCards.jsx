import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2, CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const VISIBLE_DAYS = DAYS.filter((d) => d !== "Minggu");

const FALLBACK_MENU = {
  week_label: "Menu Minggu Ini",
  menu_data: {
    Senin: {
      ingredients: [
        { nama: "Nasi Putih", jumlah: "100 g", gram_per_porsi: 100, kalori: 130, protein: 2.4, karbo: 28.2, lemak: 0.3 },
        { nama: "Ayam Goreng Tepung", jumlah: "80 g", gram_per_porsi: 80, kalori: 200, protein: 18, karbo: 8, lemak: 12 },
        { nama: "Tahu Goreng", jumlah: "50 g", gram_per_porsi: 50, kalori: 80, protein: 6, karbo: 2, lemak: 6 },
        { nama: "Sayur Bening Bayam", jumlah: "100 g", gram_per_porsi: 100, kalori: 30, protein: 3, karbo: 5, lemak: 0.5 },
        { nama: "Pisang", jumlah: "1 buah", gram_per_porsi: 100, kalori: 90, protein: 1, karbo: 23, lemak: 0.3 },
      ],
    },
    Selasa: {
      ingredients: [
        { nama: "Nasi Putih", jumlah: "100 g", gram_per_porsi: 100, kalori: 130, protein: 2.4, karbo: 28.2, lemak: 0.3 },
        { nama: "Semur Daging Sapi", jumlah: "80 g", gram_per_porsi: 80, kalori: 180, protein: 18, karbo: 5, lemak: 10 },
        { nama: "Tempe Bacem", jumlah: "50 g", gram_per_porsi: 50, kalori: 100, protein: 9, karbo: 8, lemak: 4 },
        { nama: "Tumis Buncis Wortel", jumlah: "100 g", gram_per_porsi: 100, kalori: 45, protein: 2, karbo: 8, lemak: 1 },
        { nama: "Jeruk", jumlah: "1 buah", gram_per_porsi: 100, kalori: 60, protein: 1.2, karbo: 15, lemak: 0.2 },
      ],
    },
    Rabu: {
      ingredients: [
        { nama: "Nasi Putih", jumlah: "100 g", gram_per_porsi: 100, kalori: 130, protein: 2.4, karbo: 28.2, lemak: 0.3 },
        { nama: "Ikan Fillet Asam Manis", jumlah: "100 g", gram_per_porsi: 100, kalori: 150, protein: 18, karbo: 10, lemak: 5 },
        { nama: "Perkedel Tahu", jumlah: "50 g", gram_per_porsi: 50, kalori: 70, protein: 5, karbo: 4, lemak: 4 },
        { nama: "Sayur Sop Bening", jumlah: "150 g", gram_per_porsi: 150, kalori: 40, protein: 2, karbo: 6, lemak: 1 },
        { nama: "Melon", jumlah: "150 g", gram_per_porsi: 150, kalori: 50, protein: 1, karbo: 12, lemak: 0.2 },
      ],
    },
    Kamis: {
      ingredients: [
        { nama: "Nasi Putih", jumlah: "100 g", gram_per_porsi: 100, kalori: 130, protein: 2.4, karbo: 28.2, lemak: 0.3 },
        { nama: "Ayam Teriyaki", jumlah: "80 g", gram_per_porsi: 80, kalori: 180, protein: 20, karbo: 8, lemak: 9 },
        { nama: "Tempe Goreng Crispy", jumlah: "50 g", gram_per_porsi: 50, kalori: 120, protein: 8, karbo: 9, lemak: 6 },
        { nama: "Tumis Sawi Hijau", jumlah: "100 g", gram_per_porsi: 100, kalori: 35, protein: 2.5, karbo: 5, lemak: 0.5 },
        { nama: "Apel", jumlah: "1 buah", gram_per_porsi: 100, kalori: 80, protein: 0.4, karbo: 21, lemak: 0.2 },
      ],
    },
    Jumat: {
      ingredients: [
        { nama: "Nasi Putih", jumlah: "100 g", gram_per_porsi: 100, kalori: 130, protein: 2.4, karbo: 28.2, lemak: 0.3 },
        { nama: "Telur Dadar / Balado", jumlah: "2 butir", gram_per_porsi: 100, kalori: 150, protein: 12, karbo: 2, lemak: 10 },
        { nama: "Tahu Isi Sayur", jumlah: "50 g", gram_per_porsi: 50, kalori: 60, protein: 4, karbo: 5, lemak: 3 },
        { nama: "Tumis Kacang Panjang", jumlah: "100 g", gram_per_porsi: 100, kalori: 40, protein: 2.5, karbo: 7, lemak: 0.5 },
        { nama: "Jeruk", jumlah: "1 buah", gram_per_porsi: 100, kalori: 60, protein: 1.2, karbo: 15, lemak: 0.2 },
      ],
    },
    Sabtu: {
      ingredients: [
        { nama: "Nasi Goreng / Nasi Putih", jumlah: "150 g", gram_per_porsi: 150, kalori: 220, protein: 5, karbo: 40, lemak: 5 },
        { nama: "Ayam Bakar", jumlah: "100 g", gram_per_porsi: 100, kalori: 200, protein: 22, karbo: 2, lemak: 12 },
        { nama: "Tempe Orek Kering", jumlah: "30 g", gram_per_porsi: 30, kalori: 80, protein: 6, karbo: 5, lemak: 4 },
        { nama: "Cah Kangkung / Capcay", jumlah: "100 g", gram_per_porsi: 100, kalori: 35, protein: 2, karbo: 5, lemak: 1 },
        { nama: "Semangka", jumlah: "200 g", gram_per_porsi: 200, kalori: 60, protein: 1, karbo: 15, lemak: 0.3 },
      ],
    },
    Minggu: { ingredients: [] },
  },
};

const FOOD_IMAGES = Array(7).fill("https://blue.kumparan.com/image/upload/fl_progressive,fl_lossy,c_fill,f_auto,q_auto:best,w_640/v1634025439/01jzaprw25tg6p4d7gbz1y0k4n.jpg");

function mainDish(ingredients) {
  if (!ingredients || !ingredients.length) return null;
  const item = ingredients.length > 1 ? ingredients[1] : ingredients[0];
  return item.nama;
}

function totalKalori(ingredients) {
  if (!ingredients || !ingredients.length) return 0;
  return ingredients.reduce((sum, i) => sum + (i.kalori || 0), 0);
}

function totalNutrisi(ingredients, key) {
  if (!ingredients || !ingredients.length) return 0;
  return Math.round(ingredients.reduce((sum, i) => sum + (i[key] || 0), 0) * 10) / 10;
}

function weekDates() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });
}

export default function WeeklyMenuCards() {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    base44.entities.WeeklyMenu
      .filter({ status: "published" }, "-created_date", 30)
      .then((data) => {
        setMenu(data.length ? data[0] : FALLBACK_MENU);
      })
      .catch((error) => {
        console.error('Gagal memuat WeeklyMenu:', error?.status, error?.message, error);
        setMenu(FALLBACK_MENU);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!menu) return null;

  const menuData = menu.menu_data || {};
  const dates = weekDates();

  return (
    <>
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-30px" }}
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Menu Minggu Ini</h2>
          </div>
          <span className="text-xs font-medium text-emerald-600 hover:underline cursor-pointer">
            Lihat Semua Menu
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {VISIBLE_DAYS.map((day, i) => {
            const dayData = menuData[day];
            const ingredients = dayData?.ingredients || [];
            const kalori = totalKalori(ingredients);
            const dish = mainDish(ingredients);
            return (
              <motion.div
                key={day}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                onClick={() => setSelectedDay({ day, date: dates[i], data: dayData, image: FOOD_IMAGES[i] })}
                className="rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-400 transition-all cursor-pointer overflow-hidden w-[210px] h-[188px] flex flex-col shrink-0"
              >
                <div className="relative w-full flex-1 min-h-0 bg-gray-50">
                  <img src={FOOD_IMAGES[i]} alt={day} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
                    <span className="text-[11px]">🔥</span>
                    <span className="text-[10px] font-bold text-gray-800">{kalori} kkal</span>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{day} · {dates[i]}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-1">
                    {dish || "—"}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <Dialog open={!!selectedDay} onOpenChange={(open) => { if (!open) setSelectedDay(null); }}>
        <DialogContent className="sm:max-w-md">
          {selectedDay && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                  {selectedDay.day} — {selectedDay.date}
                </DialogTitle>
                <DialogDescription>
                  Rincian gizi menu harian
                </DialogDescription>
              </DialogHeader>
              <img src={selectedDay.image} alt={selectedDay.day} className="w-full h-40 object-cover rounded-lg" />
              {selectedDay.data?.ingredients?.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="grid grid-cols-12 gap-0 bg-emerald-600 text-white text-[11px] font-semibold">
                    <span className="col-span-5 px-3 py-2">Bahan</span>
                    <span className="col-span-3 px-2 py-2 text-right">Kalori</span>
                    <span className="col-span-2 px-2 py-2 text-right">Protein</span>
                    <span className="col-span-2 px-2 py-2 text-right">Karbo</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {selectedDay.data.ingredients.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-0 text-[12px] text-gray-700">
                        <span className="col-span-5 px-3 py-2 font-medium truncate">{item.nama}</span>
                        <span className="col-span-3 px-2 py-2 text-right">{item.kalori || 0}</span>
                        <span className="col-span-2 px-2 py-2 text-right">{item.protein || 0}g</span>
                        <span className="col-span-2 px-2 py-2 text-right">{item.karbo || 0}g</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-12 gap-0 border-t-2 border-emerald-600 bg-emerald-50 text-[12px] font-bold">
                    <span className="col-span-5 px-3 py-2 text-gray-900">Total</span>
                    <span className="col-span-3 px-2 py-2 text-right text-emerald-600">{totalKalori(selectedDay.data.ingredients)} kkal</span>
                    <span className="col-span-2 px-2 py-2 text-right text-emerald-600">{totalNutrisi(selectedDay.data.ingredients, "protein")}g</span>
                    <span className="col-span-2 px-2 py-2 text-right text-emerald-600">{totalNutrisi(selectedDay.data.ingredients, "karbo")}g</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada data menu untuk hari ini</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
