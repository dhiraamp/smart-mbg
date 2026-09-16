import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Utensils } from "lucide-react";
import { IngredientNutritionCalculator, TotalWeeklyNutrition } from "@/components/mitra/IngredientNutritionCalculator";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

/**
 * Menampilkan menu mingguan SPPG dengan detail gizi & kalori per hari.
 * Membaca struktur menu_data dari WeeklyMenu entity.
 *
 * Struktur lama: { Senin: { pagi: "Nasi 150gr", siang: "", sore: "" } }
 * Struktur baru: { Senin: { pagi: "...", ingredients: [{nama,gram}], servings: 50 } }
 */
export default function PenerimaMenuView({ menus }) {
  // menus = array WeeklyMenu records (published)
  const sppgOptions = useMemo(() => menus.map(m => m.sppg_name).filter(Boolean), [menus]);
  const [selectedSPPG, setSelectedSPPG] = React.useState("");
  const activeSPPG = selectedSPPG || sppgOptions[0] || "";

  const activeMenu = menus.find(m => m.sppg_name === activeSPPG);
  const menuData = activeMenu?.menu_data || {};

  // Ekstrak ingredients per hari dari menu_data
  const dayIngredients = useMemo(() => {
    const result = {};
    DAYS.forEach(day => {
      const dayData = menuData[day];
      if (!dayData) { result[day] = []; return; }

      // Struktur baru: array ingredients tersimpan langsung
      if (Array.isArray(dayData.ingredients) && dayData.ingredients.length > 0) {
        result[day] = dayData.ingredients.filter(i => i.nama && i.gram);
        return;
      }

      // Struktur lama: parse teks pagi menjadi [{nama, gram}]
      const text = dayData.pagi || dayData.siang || dayData.sore || "";
      result[day] = parseTextToIngredients(text);
    });
    return result;
  }, [menuData]);

  const servings = activeMenu?.menu_data?.[Object.keys(menuData)[0]]?.servings ||
    menuData?.Senin?.servings || 50;

  // Hari yang punya bahan
  const activeDays = DAYS.filter(d => dayIngredients[d]?.length > 0);

  return (
    <div className="space-y-4">
      {/* Pilih SPPG */}
      {sppgOptions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {sppgOptions.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSPPG(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeSPPG === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Info header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-green-600" />
            Menu Mingguan — {activeSPPG || "Belum ada SPPG"}
            <Badge className="ml-auto bg-green-100 text-green-700 text-xs">
              {menus.length > 0 ? "Live dari SPPG" : "Menunggu SPPG"}
            </Badge>
          </CardTitle>
          {activeMenu?.week_label && (
            <p className="text-xs text-muted-foreground">{activeMenu.week_label}</p>
          )}
        </CardHeader>
      </Card>

      {/* Daftar menu per hari dengan gizi */}
      {activeDays.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Utensils className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {menus.length === 0
                ? "Belum ada menu yang dipublikasikan SPPG"
                : "Menu belum memiliki bahan terperinci"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Menu akan muncul di sini setelah SPPG mengupload menu istirahat mingguan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {activeDays.map(day => (
              <Card key={day}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {day.slice(0, 3)}
                    </span>
                    Menu Istirahat {day}
                    <Badge variant="outline" className="text-xs ml-auto">
                      {dayIngredients[day].length} bahan
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {/* Daftar bahan */}
                  <div className="flex flex-wrap gap-1.5">
                    {dayIngredients[day].map((ing, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {ing.nama} · {ing.gram}gr
                      </Badge>
                    ))}
                  </div>

                  {/* Kalkulator gizi otomatis */}
                  <IngredientNutritionCalculator
                    ingredients={dayIngredients[day]}
                    servings={servings}
                    label={day}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total gizi mingguan */}
          <TotalWeeklyNutrition weeklyIngredients={dayIngredients} servings={servings} />
        </>
      )}
    </div>
  );
}

// Parse teks bahan bebas "Nasi 150gr, Ayam 100gr" -> [{nama:"Nasi", gram:"150"}, {nama:"Ayam", gram:"100"}]
function parseTextToIngredients(text) {
  if (!text || text.trim() === "-" || !text.trim()) return [];
  return text
    .split(",")
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      // Cari pola "Nama 150gr" atau "Nama 150"
      const match = part.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(?:gr|gram|g)?$/i);
      if (match) {
        return { nama: match[1].trim(), gram: match[2].replace(",", ".") };
      }
      return { nama: part, gram: "100" }; // default 100g jika takaran tidak ada
    });
}