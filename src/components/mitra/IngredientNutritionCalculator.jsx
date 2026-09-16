import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Calculator, Loader2, Sparkles, Database } from "lucide-react";
import { getNutritionFromDB, lookupNutritionWithLLM } from "@/lib/nutritionDB";

// ════════════════════════════════════════════════════════════════════════════
// KALKULATOR GIZI OTOMATIS untuk bahan terstruktur [{ nama, gram }]
// Menggunakan database lokal + AI fallback untuk semua jenis bahan pangan
// ════════════════════════════════════════════════════════════════════════════
export function IngredientNutritionCalculator({ ingredients, servings = 1, label = "" }) {
  const [aiResults, setAiResults] = useState({}); // { nama: { cal, protein, carbs, fat } }
  const [loadingSet, setLoadingSet] = useState(new Set());

  const validIngredients = (ingredients || []).filter(i => i.nama && i.nama.trim() && i.gram && parseFloat(i.gram) > 0);

  // Lookup bahan yang tidak ada di DB via AI
  useEffect(() => {
    let cancelled = false;
    const toLookup = validIngredients
      .map(i => i.nama.toLowerCase().trim())
      .filter(name => !getNutritionFromDB(name) && !aiResults[name] && !loadingSet.has(name));

    if (toLookup.length === 0) return;

    setLoadingSet(prev => new Set([...prev, ...toLookup]));

    toLookup.forEach(async (name) => {
      const result = await lookupNutritionWithLLM(name);
      if (!cancelled) {
        setAiResults(prev => ({ ...prev, [name]: result }));
        setLoadingSet(prev => {
          const s = new Set(prev);
          s.delete(name);
          return s;
        });
      }
    });

    return () => { cancelled = true; };
     
  }, [JSON.stringify(validIngredients.map(i => i.nama + i.gram))]);

  // Hitung total gizi
  const totals = { cal: 0, protein: 0, carbs: 0, fat: 0 };
  const detected = [];
  const unknown = [];

  validIngredients.forEach(item => {
    const name = item.nama.toLowerCase().trim();
    const grams = parseFloat(item.gram) || 0;
    const dbEntry = getNutritionFromDB(name);
    const aiEntry = aiResults[name];
    const entry = dbEntry || aiEntry;

    if (entry) {
      const factor = grams / 100;
      totals.cal += entry.cal * factor;
      totals.protein += entry.protein * factor;
      totals.carbs += entry.carbs * factor;
      totals.fat += entry.fat * factor;
      detected.push({
        nama: item.nama,
        gram: grams,
        source: entry.source,
        cal: (entry.cal * factor).toFixed(0),
        protein: (entry.protein * factor).toFixed(1),
      });
    } else {
      unknown.push(item.nama);
    }
  });

  if (detected.length === 0 && loadingSet.size === 0 && validIngredients.length === 0) return null;

  const isLoading = loadingSet.size > 0;
  const perServing = {
    cal: servings > 0 ? (totals.cal / servings).toFixed(0) : "0",
    protein: servings > 0 ? (totals.protein / servings).toFixed(1) : "0",
    carbs: servings > 0 ? (totals.carbs / servings).toFixed(1) : "0",
    fat: servings > 0 ? (totals.fat / servings).toFixed(1) : "0",
  };

  return (
    <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-200 space-y-2">
      <p className="text-xs font-semibold text-green-800 flex items-center gap-1">
        <Calculator className="w-3.5 h-3.5" />
        {label ? `Gizi ${label}` : "Estimasi Gizi"} · {servings} porsi
      </p>

      <div className="grid grid-cols-4 gap-2">
        {[
          { l: "Kalori", v: `${totals.cal.toFixed(0)} kkal`, c: "bg-blue-100 text-blue-700" },
          { l: "Protein", v: `${totals.protein.toFixed(1)}g`, c: "bg-green-100 text-green-700" },
          { l: "Karbo", v: `${totals.carbs.toFixed(1)}g`, c: "bg-yellow-100 text-yellow-700" },
          { l: "Lemak", v: `${totals.fat.toFixed(1)}g`, c: "bg-red-100 text-red-700" },
        ].map((n, i) => (
          <div key={i} className={`text-center p-2 rounded-lg ${n.c}`}>
            <p className="text-[10px] opacity-70">{n.l}</p>
            <p className="font-bold text-xs">{n.v}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-green-700">
        Per porsi: <strong>{perServing.cal} kkal</strong> · Protein {perServing.protein}g · Karbo {perServing.carbs}g · Lemak {perServing.fat}g
      </p>

      {/* Status badge kalori */}
      {Number(perServing.cal) > 0 && (
        Number(perServing.cal) < 300
          ? <Badge className="bg-yellow-100 text-yellow-700 text-xs">⚠️ Kalori kurang (min. 300 kkal/anak)</Badge>
          : Number(perServing.cal) >= 300 && Number(perServing.cal) <= 600
            ? <Badge className="bg-green-100 text-green-700 text-xs">✅ Kalori ideal untuk menu istirahat</Badge>
            : <Badge className="bg-orange-100 text-orange-700 text-xs">⚠️ Kalori terlalu tinggi</Badge>
      )}

      {/* Daftar bahan terdeteksi dengan source indicator */}
      {detected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {detected.map((d, i) => (
            <Badge key={i} className={`text-[10px] ${d.source === "db" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
              {d.source === "db" ? <Database className="w-2.5 h-2.5 mr-0.5" /> : <Sparkles className="w-2.5 h-2.5 mr-0.5" />}
              {d.nama} ({d.gram}g)
            </Badge>
          ))}
        </div>
      )}

      {/* Loading indicator untuk bahan yang sedang dicari via AI */}
      {isLoading && (
        <p className="text-xs text-purple-600 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Mencari nilai gizi via AI: {[...loadingSet].join(", ")}
        </p>
      )}

      {/* Bahan yang tidak terdeteksi (belum di-lookup) */}
      {unknown.length > 0 && !isLoading && (
        <p className="text-[10px] text-muted-foreground">Menunggu data: {unknown.join(", ")}</p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TOTAL GIZI MINGGUAN — agregasi semua hari
// ════════════════════════════════════════════════════════════════════════════
export function TotalWeeklyNutrition({ weeklyIngredients, servings = 1 }) {
  const [aiResults, setAiResults] = useState({});
  const [loadingSet, setLoadingSet] = useState(new Set());

  // Kumpulkan semua bahan dari semua hari
  const allIngredients = Object.entries(weeklyIngredients || {}).flatMap(([, items]) =>
    (items || []).filter(i => i.nama && i.nama.trim() && i.gram && parseFloat(i.gram) > 0)
  );

  const validIngredients = allIngredients;

  // Lookup AI untuk bahan tidak ada di DB
  useEffect(() => {
    let cancelled = false;
    const toLookup = validIngredients
      .map(i => i.nama.toLowerCase().trim())
      .filter((name, idx, arr) => arr.indexOf(name) === idx) // unique
      .filter(name => !getNutritionFromDB(name) && !aiResults[name] && !loadingSet.has(name));

    if (toLookup.length === 0) return;

    setLoadingSet(prev => new Set([...prev, ...toLookup]));

    toLookup.forEach(async (name) => {
      const result = await lookupNutritionWithLLM(name);
      if (!cancelled) {
        setAiResults(prev => ({ ...prev, [name]: result }));
        setLoadingSet(prev => {
          const s = new Set(prev);
          s.delete(name);
          return s;
        });
      }
    });

    return () => { cancelled = true; };
     
  }, [JSON.stringify(validIngredients.map(i => i.nama))]);

  // Hitung total
  const totals = { cal: 0, protein: 0, carbs: 0, fat: 0 };
  const activeDays = Object.entries(weeklyIngredients || {}).filter(([, items]) =>
    (items || []).some(i => i.nama && i.nama.trim() && i.gram)
  ).length || 1;

  validIngredients.forEach(item => {
    const name = item.nama.toLowerCase().trim();
    const grams = parseFloat(item.gram) || 0;
    const entry = getNutritionFromDB(name) || aiResults[name];
    if (entry) {
      const factor = grams / 100;
      totals.cal += entry.cal * factor;
      totals.protein += entry.protein * factor;
      totals.carbs += entry.carbs * factor;
      totals.fat += entry.fat * factor;
    }
  });

  if (validIngredients.length === 0) return null;

  const perDay = {
    cal: (totals.cal / activeDays).toFixed(0),
    protein: (totals.protein / activeDays).toFixed(1),
    carbs: (totals.carbs / activeDays).toFixed(1),
    fat: (totals.fat / activeDays).toFixed(1),
  };
  const perChild = {
    cal: (totals.cal / activeDays / servings).toFixed(0),
    protein: (totals.protein / activeDays / servings).toFixed(1),
  };

  const isLoading = loadingSet.size > 0;

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200 space-y-3">
      <p className="text-sm font-bold text-blue-800 flex items-center gap-2">
        <Calculator className="w-4 h-4" />
        Total Gizi Keseluruhan Minggu Ini ({activeDays} hari aktif)
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { l: "Total Kalori", v: `${totals.cal.toFixed(0)} kkal`, c: "bg-blue-200 text-blue-800" },
          { l: "Total Protein", v: `${totals.protein.toFixed(1)}g`, c: "bg-green-200 text-green-800" },
          { l: "Total Karbo", v: `${totals.carbs.toFixed(1)}g`, c: "bg-yellow-200 text-yellow-800" },
          { l: "Total Lemak", v: `${totals.fat.toFixed(1)}g`, c: "bg-red-200 text-red-800" },
        ].map((n, i) => (
          <div key={i} className={`text-center p-2 rounded-lg ${n.c}`}>
            <p className="text-[10px] opacity-80">{n.l}</p>
            <p className="font-bold text-xs">{n.v}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg p-3 space-y-1">
        <p className="text-xs font-semibold text-blue-800">Rata-rata per hari ({servings} anak):</p>
        <p className="text-xs text-blue-700">🍽️ Per hari: <strong>{perDay.cal} kkal</strong> · Protein {perDay.protein}g · Karbo {perDay.carbs}g · Lemak {perDay.fat}g</p>
        <p className="text-xs text-blue-700">👦 Per anak per hari: <strong>{perChild.cal} kkal</strong> · Protein {perChild.protein}g</p>
        {Number(perChild.cal) > 0 && (
          Number(perChild.cal) < 300
            ? <Badge className="bg-yellow-100 text-yellow-700 text-xs">⚠️ Rata-rata kalori per anak kurang dari 300 kkal</Badge>
            : Number(perChild.cal) >= 300 && Number(perChild.cal) <= 600
              ? <Badge className="bg-green-100 text-green-700 text-xs">✅ Rata-rata gizi harian ideal</Badge>
              : <Badge className="bg-orange-100 text-orange-700 text-xs">⚠️ Rata-rata kalori terlalu tinggi</Badge>
        )}
      </div>
    </div>
  );
}