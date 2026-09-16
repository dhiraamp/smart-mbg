import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Utensils, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { IngredientNutritionCalculator } from "@/components/mitra/IngredientNutritionCalculator";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

// Parse teks bahan "Nasi 150gr, Ayam 100gr" → [{nama, gram}]
function parseTextToIngredients(text) {
  if (!text || text.trim() === "-" || !text.trim()) return [];
  return text
    .split(",")
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const match = part.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(?:gr|gram|g)?$/i);
      if (match) return { nama: match[1].trim(), gram: match[2].replace(",", ".") };
      return { nama: part, gram: "100" };
    });
}

function SppgMenuCard({ menu }) {
  const [expanded, setExpanded] = useState(true);
  const menuData = menu.menu_data || {};
  const servings = menuData?.Senin?.servings || 50;

  const dayData = DAYS.map(day => {
    const d = menuData[day];
    if (!d) return { day, ingredients: [], text: "" };
    const ingredients = Array.isArray(d.ingredients) && d.ingredients.length > 0
      ? d.ingredients.filter(i => i.nama && i.gram)
      : parseTextToIngredients(d.pagi || d.siang || d.sore || "");
    return { day, ingredients, text: d.pagi || d.siang || d.sore || "" };
  });

  const activeDays = dayData.filter(d => d.ingredients.length > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full text-left"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <CalendarDays className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">{menu.sppg_name}</span>
          <Badge variant="outline" className="text-xs">{activeDays.length} hari</Badge>
          <Badge className="ml-auto bg-green-100 text-green-700 text-xs">{menu.week_label}</Badge>
        </button>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-3">
          {activeDays.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Belum ada bahan menu terperinci.</p>
          ) : (
            activeDays.map(({ day, ingredients }) => (
              <div key={day} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {day.slice(0, 3)}
                  </span>
                  <span className="font-semibold text-sm">{day}</span>
                  <Badge variant="outline" className="text-xs ml-auto">{ingredients.length} bahan</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ingredients.map((ing, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{ing.nama} · {ing.gram}gr</Badge>
                  ))}
                </div>
                <IngredientNutritionCalculator
                  ingredients={ingredients}
                  servings={servings}
                  label={day}
                />
              </div>
            ))
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function AdminSppgMenus() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.WeeklyMenu.filter({ status: "published" }, "-created_date", 50)
      .then(data => setMenus(data))
      .finally(() => setLoading(false));
  }, []);

  // Group by SPPG — ambil menu terbaru per SPPG
  const sppgMap = {};
  menus.forEach(m => {
    if (!sppgMap[m.sppg_name] || new Date(m.created_date) > new Date(sppgMap[m.sppg_name].created_date)) {
      sppgMap[m.sppg_name] = m;
    }
  });
  const sppgMenus = Object.values(sppgMap);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Menu Harian SPPG</h2>
        <p className="text-muted-foreground">Pantau menu istirahat mingguan dari setiap SPPG</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : sppgMenus.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Utensils className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Belum ada SPPG yang mempublikasikan menu</p>
            <p className="text-xs text-muted-foreground mt-1">Menu akan muncul di sini setelah SPPG mengupload menu istirahat mingguan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sppgMenus.map(menu => (
            <SppgMenuCard key={menu.id} menu={menu} />
          ))}
        </div>
      )}
    </div>
  );
}