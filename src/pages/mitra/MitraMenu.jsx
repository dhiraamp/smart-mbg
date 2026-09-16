import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Clock, Users, ShoppingCart, Upload, CalendarDays, CheckCircle, Plus, Trash2 } from "lucide-react";
import StockAlertBanner from "@/components/mitra/StockAlertBanner";
import { IngredientNutritionCalculator, TotalWeeklyNutrition } from "@/components/mitra/IngredientNutritionCalculator";
import { INGREDIENT_SUGGESTIONS, parseAmountToGrams } from "@/lib/nutritionDB";

const menus = [
  { id: 1, name: "Nasi Kotak Ayam Goreng", desc: "Nasi putih, ayam goreng, tempe orek, wortel tumis, kerupuk", calories: 520, protein: 30, carbs: 68, fat: 16, servings: 50, time: "45 menit", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop", ingredients: [{ name: "Beras", amount: "5 kg", suppliers: ["UD Tani Makmur Garut"] }, { name: "Ayam Broiler", amount: "8 kg", suppliers: ["Peternakan Maju Jaya"] }, { name: "Tempe", amount: "3 kg", suppliers: ["Pengrajin Tempe Garut"] }] },
  { id: 2, name: "Bakso Kuah Sayuran", desc: "Bakso sapi, mie, tahu, wortel, bayam dalam kuah bening", calories: 380, protein: 22, carbs: 45, fat: 12, servings: 60, time: "30 menit", image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=300&fit=crop", ingredients: [{ name: "Bakso Sapi", amount: "6 kg", suppliers: ["RPH Garut"] }, { name: "Sayuran Mix", amount: "4 kg", suppliers: ["Petani Sayur Cikajang"] }] },
  { id: 3, name: "Mie Goreng Telur", desc: "Mie goreng dengan telur, sawi, wortel, dan bumbu spesial", calories: 450, protein: 18, carbs: 62, fat: 14, servings: 55, time: "25 menit", image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=300&fit=crop", ingredients: [{ name: "Mie", amount: "5 kg", suppliers: ["Distributor Mie Garut"] }, { name: "Telur Ayam", amount: "4 kg", suppliers: ["Peternakan Ayam Garut"] }] },
  { id: 4, name: "Nasi Pecel Sayuran", desc: "Nasi putih dengan pecel sayuran dan sambal kacang", calories: 420, protein: 15, carbs: 72, fat: 10, servings: 65, time: "35 menit", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop", ingredients: [{ name: "Sayuran Segar", amount: "6 kg", suppliers: ["Petani Sayur Cikajang"] }, { name: "Beras", amount: "6 kg", suppliers: ["UD Tani Makmur Garut"] }] },
];

const EDITABLE_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const ALL_DAYS = [
  { day: "Senin" },
  { day: "Selasa" },
  { day: "Rabu" },
  { day: "Kamis" },
  { day: "Jumat" },
  { day: "Sabtu", mirror: "Senin" },
];

// Datalist untuk sugesti nama bahan
const INGREDIENT_DATALIST_ID = "ingredient-suggestions";

export default function MitraMenu() {
  const { user } = useUserProfile();
  const [selectedMenu, setSelectedMenu] = useState(null);

  // ── MENU ISTIRAHAT: bahan terstruktur per hari ──
  const [weeklyMenu, setWeeklyMenu] = useState(
    EDITABLE_DAYS.reduce((acc, d) => ({ ...acc, [d]: [{ nama: "", gram: "" }] }), {})
  );
  const [menuServings, setMenuServings] = useState(50);
  const [weeklySubmitted, setWeeklySubmitted] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);

  const addIngredient = (day) => setWeeklyMenu(prev => ({ ...prev, [day]: [...prev[day], { nama: "", gram: "" }] }));
  const removeIngredient = (day, idx) => setWeeklyMenu(prev => ({ ...prev, [day]: prev[day].filter((_, i) => i !== idx) }));
  const updateIngredient = (day, idx, field, val) => setWeeklyMenu(prev => ({
    ...prev,
    [day]: prev[day].map((ing, i) => i === idx ? { ...ing, [field]: val } : ing),
  }));

  const submitWeekly = async () => {
    setSavingMenu(true);
    const now = new Date();
    const weekLabel = `Minggu ${now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
    const menuData = ALL_DAYS.reduce((acc, { day, mirror }) => {
      const source = mirror ? weeklyMenu[mirror] : weeklyMenu[day];
      const ingredients = (source || []).filter(i => i.nama.trim() && i.gram);
      const istirahatText = ingredients.map(i => `${i.nama} ${i.gram}gr`).join(", ");
      return { ...acc, [day]: { pagi: istirahatText, siang: "", sore: "", ingredients, servings: menuServings, mirror: mirror || null } };
    }, {});
    await base44.entities.WeeklyMenu.create({
      sppg_name: user?.organization_name || "SPPG",
      sppg_id: user?.email || "",
      week_label: weekLabel,
      menu_data: menuData,
      status: "published",
    });
    setSavingMenu(false);
    setWeeklySubmitted(true);
  };

  // Konversi ingredients menu rekomendasi ke format terstruktur [{ nama, gram }]
  const convertMenuIngredients = (menuIngs) =>
    (menuIngs || []).map(ing => ({ nama: ing.name, gram: String(parseAmountToGrams(ing.amount) || 0) }));

  return (
    <div className="space-y-6">
      <datalist id={INGREDIENT_DATALIST_ID}>
        {INGREDIENT_SUGGESTIONS.map(name => <option key={name} value={name} />)}
      </datalist>

      <div>
        <h2 className="text-2xl font-bold">Menu & Rekomendasi</h2>
        <p className="text-muted-foreground">Kelola menu istirahat mingguan dan lihat rekomendasi menu beserta nilai gizi</p>
      </div>

      <StockAlertBanner userEmail={user?.email} sppgName={user?.organization_name || user?.full_name} />

      <Tabs defaultValue="mingguan">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="mingguan" className="text-xs flex items-center gap-1"><CalendarDays className="w-3 h-3" />Menu Istirahat</TabsTrigger>
          <TabsTrigger value="rekomendasi" className="text-xs flex items-center gap-1"><UtensilsCrossed className="w-3 h-3" />Rekomendasi</TabsTrigger>
        </TabsList>

        {/* ── MENU ISTIRAHAT MINGGUAN ── */}
        <TabsContent value="mingguan" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />Upload Menu Istirahat Mingguan
                <Badge className="ml-auto bg-blue-100 text-blue-700 text-xs">Terhubung ke Portal Penerima</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Masukkan setiap bahan dengan gramasinya. Kalkulator gizi otomatis menghitung — mendukung semua jenis bahan pangan (bila bahan tidak ada di database, sistem akan mencari via AI).</p>
            </CardHeader>
            <CardContent>
              {weeklySubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-bold text-green-700 text-lg">Menu Istirahat Dipublikasikan!</p>
                  <p className="text-sm text-muted-foreground mt-1">Menu sudah dapat dilihat oleh penerima manfaat yayasan di portal penerima.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setWeeklySubmitted(false)}>Update Menu</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700 font-medium">🍱 Menu Istirahat Yayasan (Senin - Sabtu)</p>
                        <p className="text-xs text-blue-600 mt-0.5">Masukkan nama bahan (misal: <strong>Nasi</strong>, <strong>Ayam</strong>, <strong>Tempe</strong>) dan gramasinya (misal: <strong>150</strong> untuk 150 gram). Kalkulator gizi otomatis aktif.</p>
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Jumlah Porsi per Hari</Label>
                        <Input type="number" value={menuServings} onChange={e => setMenuServings(Number(e.target.value) || 1)} className="h-8 text-sm w-32" min={1} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {ALL_DAYS.map(({ day, mirror }) => {
                      const dayIngredients = mirror ? weeklyMenu[mirror] : weeklyMenu[day];
                      if (mirror) {
                        return (
                          <div key={day} className="border rounded-xl p-3 space-y-2 bg-purple-50/40 border-purple-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-sm text-primary">{day}</p>
                                <p className="text-[10px] text-purple-600">Sama dengan hari {mirror} — {dayIngredients.filter(i => i.nama.trim()).length} bahan</p>
                              </div>
                              <Badge className="text-[10px] bg-purple-100 text-purple-700 border-0">Auto: {mirror}</Badge>
                            </div>
                            {dayIngredients.filter(i => i.nama.trim()).length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {dayIngredients.filter(i => i.nama.trim()).map((ing, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-white">{ing.nama} {ing.gram}gr</Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-muted-foreground italic">Isi menu hari {mirror} terlebih dahulu</p>
                            )}
                            {dayIngredients.some(i => i.nama.trim() && i.gram) && (
                              <IngredientNutritionCalculator
                                ingredients={dayIngredients}
                                servings={menuServings}
                                label={day}
                              />
                            )}
                          </div>
                        );
                      }
                      return (
                      <div key={day} className="border rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm text-primary">{day}</p>
                            <p className="text-[10px] text-muted-foreground">Istirahat — {weeklyMenu[day].filter(i => i.nama.trim()).length} bahan</p>
                          </div>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addIngredient(day)}>
                            <Plus className="w-3 h-3 mr-1" />Tambah Bahan
                          </Button>
                        </div>

                        {/* Daftar bahan terstruktur: nama + gram */}
                        <div className="space-y-2">
                          {weeklyMenu[day].map((ing, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <Input
                                list={INGREDIENT_DATALIST_ID}
                                placeholder="Nama bahan (mis. Nasi, Ayam, Bayam...)"
                                value={ing.nama}
                                onChange={e => updateIngredient(day, idx, "nama", e.target.value)}
                                className="flex-1 text-sm h-8"
                              />
                              <div className="relative w-28">
                                <Input
                                  type="number"
                                  placeholder="Gram"
                                  value={ing.gram}
                                  onChange={e => updateIngredient(day, idx, "gram", e.target.value)}
                                  className="text-sm h-8 pr-8"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">gr</span>
                              </div>
                              {weeklyMenu[day].length > 1 && (
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 shrink-0" onClick={() => removeIngredient(day, idx)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Kalkulator gizi otomatis per hari */}
                        {weeklyMenu[day].some(i => i.nama.trim() && i.gram) && (
                          <IngredientNutritionCalculator
                            ingredients={weeklyMenu[day]}
                            servings={menuServings}
                            label={day}
                          />
                        )}
                      </div>
                      );
                    })}
                  </div>

                  {/* Total gizi keseluruhan minggu */}
                  <TotalWeeklyNutrition weeklyIngredients={{ ...weeklyMenu, Sabtu: weeklyMenu.Senin }} servings={menuServings} />

                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white" onClick={submitWeekly} disabled={savingMenu}>
                    <Upload className="w-4 h-4 mr-2" />{savingMenu ? "Menyimpan..." : "Publikasikan Menu Istirahat"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── REKOMENDASI MENU ── */}
        <TabsContent value="rekomendasi">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {menus.map((menu) => (
              <Card key={menu.id} className="overflow-hidden group hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedMenu(menu)}>
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src={menu.image} alt={menu.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop"; }} />
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold">{menu.name}</h3>
                    <Badge className="bg-blue-100 text-blue-700 text-xs shrink-0">Istirahat</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{menu.desc}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{menu.time}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{menu.servings} porsi</span>
                  </div>
                  {/* Kalkulator gizi dari bahan ingredients */}
                  <IngredientNutritionCalculator
                    ingredients={convertMenuIngredients(menu.ingredients)}
                    servings={menu.servings}
                    label={menu.name}
                  />
                  <Button variant="outline" size="sm" className="w-full text-primary border-primary/30 mt-1">
                    <ShoppingCart className="w-3 h-3 mr-1" />Lihat Bahan & Supplier
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Menu Dialog */}
      {selectedMenu && (
        <Dialog open={!!selectedMenu} onOpenChange={() => setSelectedMenu(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><UtensilsCrossed className="w-5 h-5 text-primary" />{selectedMenu.name}</DialogTitle></DialogHeader>
            <img src={selectedMenu.image} alt={selectedMenu.name} className="w-full h-48 object-cover rounded-xl"
              onError={e => { e.target.src = "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop"; }} />
            <p className="text-sm text-muted-foreground">{selectedMenu.desc}</p>
            <div className="grid grid-cols-4 gap-2">
              {[{ l: "Kalori", v: `${selectedMenu.calories} kkal`, c: "bg-blue-50 text-blue-700" }, { l: "Protein", v: `${selectedMenu.protein}g`, c: "bg-green-50 text-green-700" }, { l: "Karbo", v: `${selectedMenu.carbs}g`, c: "bg-yellow-50 text-yellow-700" }, { l: "Lemak", v: `${selectedMenu.fat}g`, c: "bg-red-50 text-red-700" }].map((n, i) => (
                <div key={i} className={`text-center p-2 rounded-lg ${n.c}`}><p className="text-xs opacity-70">{n.l}</p><p className="font-bold text-sm">{n.v}</p></div>
              ))}
            </div>
            {/* Kalkulator gizi dari bahan ingredients */}
            <IngredientNutritionCalculator
              ingredients={convertMenuIngredients(selectedMenu.ingredients)}
              servings={selectedMenu.servings}
              label={selectedMenu.name}
            />
            <div>
              <h4 className="font-semibold mb-2 text-sm">Rekomendasi Bahan & Supplier</h4>
              <div className="space-y-2">
                {selectedMenu.ingredients.map((ing, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm">{ing.name}</p>
                      <Badge variant="outline" className="text-xs">{ing.amount}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ing.suppliers.map((s, j) => <Badge key={j} className="text-xs bg-blue-100 text-blue-700">{s}</Badge>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}