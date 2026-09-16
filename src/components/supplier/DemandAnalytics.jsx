import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from "recharts";
import { TrendingUp, BarChart2, AlertTriangle, Package, ArrowUp, ArrowDown, Minus } from "lucide-react";

const CATEGORY_COLORS = {
  beras: "#3b82f6", telur: "#f59e0b", daging: "#ef4444", ikan: "#06b6d4",
  sayuran: "#22c55e", buah: "#a855f7", minyak: "#f97316", bumbu: "#84cc16",
  susu: "#e879f9", tepung: "#94a3b8", lainnya: "#64748b",
};

function getWeekLabel(offsetWeeks = 0) {
  const now = new Date();
  now.setDate(now.getDate() - offsetWeeks * 7);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export default function DemandAnalytics() {
  const [allNeeds, setAllNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load last 8 weeks of data
    base44.entities.WeeklyNeeds.list("-created_date", 200)
      .then(data => { setAllNeeds(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // --- Aggregated demand per product across all SPPG & weeks ---
  const { topProducts, weeklyTrend, categoryBreakdown, currentWeekAgg, prevWeekAgg } = useMemo(() => {
    const currentWeek = getWeekLabel(0);
    const prevWeek = getWeekLabel(1);

    // Aggregate by product name across all data
    const productMap = {}; // key: product_name -> { total, weeks: {weekLabel: qty}, sppgCount, category, unit }
    const weekSet = new Set();
    const categoryMap = {}; // key: category -> total qty

    for (const need of allNeeds) {
      if (!Array.isArray(need.items)) continue;
      weekSet.add(need.week_label);
      for (const item of need.items) {
        if (!item.nama) continue;
        const key = item.nama.toLowerCase().trim();
        const qty = parseFloat(item.qty) || 0;
        if (!productMap[key]) {
          productMap[key] = { name: item.nama, total: 0, weeks: {}, sppgSet: new Set(), category: item.category || "lainnya", unit: item.unit || "kg" };
        }
        productMap[key].total += qty;
        productMap[key].weeks[need.week_label] = (productMap[key].weeks[need.week_label] || 0) + qty;
        productMap[key].sppgSet.add(need.sppg_id);

        const cat = item.category || "lainnya";
        categoryMap[cat] = (categoryMap[cat] || 0) + qty;
      }
    }

    // Top 8 products by total demand
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
      .map(p => ({
        name: p.name,
        total: Math.round(p.total),
        unit: p.unit,
        sppgCount: p.sppgSet.size,
        category: p.category,
        current: Math.round(p.weeks[currentWeek] || 0),
        prev: Math.round(p.weeks[prevWeek] || 0),
      }));

    // Weekly trend: last 6 weeks, top 3 products
    const sortedWeeks = [...weekSet].sort().slice(-6);
    const top3 = Object.values(productMap).sort((a, b) => b.total - a.total).slice(0, 3);
    const weeklyTrend = sortedWeeks.map(w => {
      const entry = { week: w.replace(/^\d{4}-/, "") }; // e.g. "W18"
      for (const p of top3) entry[p.name] = Math.round(p.weeks[w] || 0);
      return entry;
    });

    // Category breakdown
    const categoryBreakdown = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, total]) => ({ name: cat, total: Math.round(total), color: CATEGORY_COLORS[cat] || "#64748b" }));

    // Current & prev week totals per product (for summary)
    const currentWeekAgg = {};
    const prevWeekAgg = {};
    for (const need of allNeeds) {
      if (!Array.isArray(need.items)) continue;
      const target = need.week_label === currentWeek ? currentWeekAgg : need.week_label === prevWeek ? prevWeekAgg : null;
      if (!target) continue;
      for (const item of need.items) {
        if (!item.nama) continue;
        const key = item.nama.toLowerCase().trim();
        target[key] = (target[key] || 0) + (parseFloat(item.qty) || 0);
      }
    }

    return { topProducts, weeklyTrend, categoryBreakdown, currentWeekAgg, prevWeekAgg, top3 };
  }, [allNeeds]);

  const currentWeekLabel = getWeekLabel(0);
  const totalSPPG = useMemo(() => new Set(allNeeds.map(n => n.sppg_id)).size, [allNeeds]);
  const totalItems = useMemo(() => allNeeds.reduce((s, n) => s + (Array.isArray(n.items) ? n.items.length : 0), 0), [allNeeds]);

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  if (allNeeds.length === 0) return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center text-muted-foreground">
        <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Belum ada data kebutuhan mingguan dari SPPG</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "SPPG Aktif", value: totalSPPG, icon: "🏫", color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Total Entri Kebutuhan", value: allNeeds.length, icon: "📋", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
          { label: "Jenis Bahan Diminta", value: topProducts.length, icon: "📦", color: "bg-purple-50 border-purple-200 text-purple-700" },
          { label: "Minggu Berjalan", value: currentWeekLabel, icon: "📅", color: "bg-orange-50 border-orange-200 text-orange-700" },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border p-3 ${s.color}`}>
            <div className="text-lg">{s.icon}</div>
            <p className="text-xs opacity-70 mt-1">{s.label}</p>
            <p className="font-bold text-sm mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top Products Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Top Bahan Pangan yang Paling Banyak Dibutuhkan
          </CardTitle>
          <p className="text-xs text-muted-foreground">Akumulasi dari semua kebutuhan mingguan SPPG — prioritaskan stok untuk bahan ini</p>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={72} />
                <Tooltip
                  formatter={(val, name) => [`${val} kg`, "Total Kebutuhan"]}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border rounded-lg p-2 shadow text-xs">
                        <p className="font-bold">{d.name}</p>
                        <p>Total: <b>{d.total} {d.unit}</b></p>
                        <p>SPPG: <b>{d.sppgCount}</b></p>
                        <p>Minggu ini: <b>{d.current} {d.unit}</b></p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {topProducts.map((p, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[p.category] || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trend 6 minggu */}
      {weeklyTrend.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Tren Kebutuhan 6 Minggu Terakhir (Top 3 Bahan)
            </CardTitle>
            <p className="text-xs text-muted-foreground">Gunakan tren ini untuk memprediksi stok minggu depan</p>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {topProducts.slice(0, 3).map((p, i) => (
                    <Line
                      key={p.name}
                      type="monotone"
                      dataKey={p.name}
                      stroke={CATEGORY_COLORS[p.category] || ["#3b82f6", "#22c55e", "#f59e0b"][i]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current week comparison & stok prediksi */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Perbandingan Minggu Ini vs Minggu Lalu
          </CardTitle>
          <p className="text-xs text-muted-foreground">Bahan dengan permintaan naik perlu stok lebih banyak minggu depan</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topProducts.slice(0, 6).map((p, i) => {
              const diff = p.current - p.prev;
              const pct = p.prev > 0 ? Math.round((diff / p.prev) * 100) : (p.current > 0 ? 100 : 0);
              const isUp = diff > 0;
              const isDown = diff < 0;
              return (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[p.category] }} />
                  <span className="text-sm font-medium flex-1">{p.name}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{p.prev} → <b>{p.current}</b> {p.unit}</span>
                  </div>
                  <Badge
                    className={`text-xs flex items-center gap-0.5 ${isUp ? "bg-red-100 text-red-700" : isDown ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {isUp ? <ArrowUp className="w-3 h-3" /> : isDown ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {Math.abs(pct)}%
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {isUp ? "↑ Persiapkan lebih" : isDown ? "↓ Stabil" : "Sama"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-600" />
              Distribusi Permintaan per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categoryBreakdown.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium"
                  style={{ borderColor: c.color, color: c.color, backgroundColor: c.color + "15" }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="capitalize">{c.name}</span>
                  <span className="opacity-70">·</span>
                  <span>{c.total} kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}