import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, RefreshCw, ShoppingBasket, MapPinned, Globe, ExternalLink, ArrowRight } from "lucide-react";

const bapokting = [
  { name: "Beras Premium", current: 15109, prev: 14938, change: 171, pct: 1.14 },
  { name: "Beras Medium", current: 14022, prev: 13875, change: 147, pct: 1.06 },
  { name: "Beras Termahal", current: 15714, prev: 15813, change: -98, pct: -0.62 },
  { name: "Bawang Merah", current: 38500, prev: 37000, change: 1500, pct: 4.05 },
  { name: "Bawang Putih", current: 42000, prev: 40000, change: 2000, pct: 5.0 },
  { name: "Cabai Merah Keriting", current: 55000, prev: 48000, change: 7000, pct: 14.58 },
  { name: "Cabai Rawit Merah", current: 62000, prev: 58000, change: 4000, pct: 6.9 },
  { name: "Daging Sapi Murni", current: 135000, prev: 132000, change: 3000, pct: 2.27 },
  { name: "Daging Ayam Ras", current: 32000, prev: 31500, change: 500, pct: 1.59 },
  { name: "Telur Ayam Ras", current: 28500, prev: 27500, change: 1000, pct: 3.64 },
  { name: "Kedelai (Impor)", current: 12500, prev: 12500, change: 0, pct: 0 },
  { name: "Gula Pasir", current: 17500, prev: 17500, change: 0, pct: 0 },
  { name: "Minyak Goreng Kemasan", current: 20500, prev: 20000, change: 500, pct: 2.5 },
  { name: "Tepung Terigu", current: 13000, prev: 12800, change: 200, pct: 1.56 },
  { name: "Gas LPG 3kg", current: 25000, prev: 24500, change: 500, pct: 2.04 },
];

const misterMbgData = [
  { no: 1, item: "Gas 50 Kg", sppgTersedia: 1, kurang: 0, tidakTersedia: 0, penyerapan: "4 Tabung", harga: "Rp 1.200.000/Tabung", total: "Rp 4.800.000" },
  { no: 2, item: "Kacang Hijau", sppgTersedia: 1, kurang: 0, tidakTersedia: 0, penyerapan: "27 Kg", harga: "Rp 1.000/Kg", total: "Rp 27.000" },
  { no: 3, item: "Roti", sppgTersedia: 1, kurang: 0, tidakTersedia: 0, penyerapan: "2.148 Bungkus", harga: "Rp 2.000/Bungkus", total: "Rp 4.296.000" },
  { no: 4, item: "Susu Kotak", sppgTersedia: 1, kurang: 0, tidakTersedia: 0, penyerapan: "1.359 Kotak", harga: "Rp 3.500/Kotak", total: "Rp 4.756.500" },
  { no: 5, item: "Telur Ayam Broiler", sppgTersedia: 1, kurang: 0, tidakTersedia: 0, penyerapan: "196 Kg", harga: "Rp 31.000/Kg", total: "Rp 6.076.000" },
];

const formatRp = (n) => `Rp ${n.toLocaleString("id-ID")}`;

export default function AdminBapokting() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("harga");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Data SIHARBATING & MISTER MBG</h2>
          <p className="text-muted-foreground">Data harga bahan pokok penting & rekapitulasi MBG Kabupaten Garut</p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/admin/gis")}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold self-start sm:self-auto"
        >
          <MapPinned className="w-3.5 h-3.5" /> Buka Peta Geospasial GIS
        </Button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setActiveTab("harga")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "harga" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}>
          Harga Bapokting
        </button>
        <button onClick={() => setActiveTab("mister")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "mister" ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}>
          MISTER MBG (Disperindag)
        </button>
      </div>

      {activeTab === "harga" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
            <span>Terakhir diperbarui: 7 April 2026 — Semua Pasar Kabupaten Garut</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {bapokting.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">{item.name}</span>
                    <Badge variant={item.change > 0 ? "destructive" : item.change < 0 ? "default" : "secondary"} className="text-xs">
                      {item.change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : item.change < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
                      {item.pct > 0 ? `+${item.pct}%` : `${item.pct}%`}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold">{formatRp(item.current)}</div>
                  <div className="text-xs text-muted-foreground">Sebelumnya: {formatRp(item.prev)} ({item.change > 0 ? `+${formatRp(item.change)}` : formatRp(item.change)})</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "mister" && (
        <div className="space-y-4">
          {/* Banner Integrasi Resmi MISTER MBG */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Portal Resmi MBG Garut</span>
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold border-emerald-300">Live Integration</Badge>
              </div>
              <p className="text-xs text-emerald-800">
                Data terhubung langsung dengan sistem komoditas &amp; peta geospasial Disperindag Kabupaten Garut:{" "}
                <a
                  href="https://mistermbg.disperindag.garutkab.go.id/mbg"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-emerald-900 hover:text-emerald-700 inline-flex items-center gap-0.5"
                >
                  mistermbg.disperindag.garutkab.go.id/mbg
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/admin/gis")}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0"
            >
              Lihat Peta Sebaran GIS <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingBasket className="w-5 h-5 text-primary" /> Rekap Komoditi MBG — Periode 03 Desember 2026
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-semibold">No</th>
                      <th className="text-left p-3 font-semibold">Komoditi</th>
                      <th className="text-center p-3 font-semibold">Tersedia</th>
                      <th className="text-center p-3 font-semibold">Kurang</th>
                      <th className="text-center p-3 font-semibold">Tidak Tersedia</th>
                      <th className="text-left p-3 font-semibold">Total Penyerapan</th>
                      <th className="text-left p-3 font-semibold">Harga/Satuan</th>
                      <th className="text-right p-3 font-semibold">Total Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {misterMbgData.map((row) => (
                      <tr key={row.no} className="border-b hover:bg-muted/20">
                        <td className="p-3">{row.no}</td>
                        <td className="p-3 font-medium">{row.item}</td>
                        <td className="p-3 text-center"><Badge className="bg-green-100 text-green-700">{row.sppgTersedia}</Badge></td>
                        <td className="p-3 text-center"><Badge className="bg-yellow-100 text-yellow-700">{row.kurang}</Badge></td>
                        <td className="p-3 text-center"><Badge className="bg-red-100 text-red-700">{row.tidakTersedia}</Badge></td>
                        <td className="p-3">{row.penyerapan}</td>
                        <td className="p-3 text-muted-foreground">{row.harga}</td>
                        <td className="p-3 text-right font-semibold text-primary">{row.total}</td>
                      </tr>
                    ))}
                    <tr className="bg-primary/5 font-bold">
                      <td colSpan={7} className="p-3 text-right">Nilai Transaksi</td>
                      <td className="p-3 text-right text-primary">Rp 19.955.500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}