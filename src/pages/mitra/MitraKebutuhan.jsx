import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Upload, FileText, CheckCircle, Plus, Trash2, AlertTriangle, Megaphone, XCircle, RefreshCw, UtensilsCrossed } from "lucide-react";
import StockAlertBanner from "@/components/mitra/StockAlertBanner";

const SUPPLIER_LIST = [
  "UD Tani Makmur Garut",
  "Peternakan Maju Jaya",
  "Petani Sayur Cikajang",
  "RPH Garut",
  "Budidaya Ikan Garut",
  "CV Bumbu Nusantara",
  "PT Sadang Barokah Niaga",
  "CV Binar Kalasenja",
];

const statusPO = {
  diterima: "bg-green-100 text-green-700",
  menunggu: "bg-yellow-100 text-yellow-700",
  diproses: "bg-blue-100 text-blue-700",
  ditolak: "bg-red-100 text-red-700",
};

export default function MitraKebutuhan() {
  const navigate = useNavigate();
  const { user } = useUserProfile();

  const [poItems, setPOItems] = useState([
    { nama: "Beras", qty: "", unit: "kg", category: "beras" },
    { nama: "Ayam", qty: "", unit: "kg", category: "daging" },
    { nama: "Sayuran", qty: "", unit: "kg", category: "sayuran" },
    { nama: "Telur", qty: "", unit: "kg", category: "telur" },
  ]);
  const [supplierMode, setSupplierMode] = useState("broadcast");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [poNotes, setPONotes] = useState("");
  const [poSaving, setPOSaving] = useState(false);
  const [poSubmitted, setPOSubmitted] = useState(false);
  const [poHistory, setPOHistory] = useState([]);
  const [needsHistory, setNeedsHistory] = useState([]);
  const [stockWarnings, setStockWarnings] = useState([]);
  const [showStockWarning, setShowStockWarning] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.PurchaseOrder.filter({ mitra_email: user.email }, "-created_date"),
      base44.entities.WeeklyNeeds.filter({ sppg_id: user.email }, "-created_date", 10),
    ]).then(([pos, needs]) => {
      setPOHistory(pos);
      setNeedsHistory(needs);
    });
  }, [user?.email]);

  const addItem = () => setPOItems(prev => [...prev, { nama: "", qty: "", unit: "kg", category: "lainnya" }]);
  const removeItem = (i) => setPOItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => setPOItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const submitOrder = async () => {
    const validItems = poItems.filter(i => i.nama && i.qty);
    if (validItems.length === 0) return;
    setPOSaving(true);
    setStockWarnings([]);
    setShowStockWarning(false);

    // ── CEK STOK GUDANG SEBELUM SUBMIT ──
    const allStock = await base44.entities.WarehouseStock.list();
    const warnings = [];

    for (const item of validItems) {
      const key = item.nama.toLowerCase().trim();
      const needed = parseFloat(item.qty) || 0;

      const matchingStock = allStock.filter(s => {
        const sName = (s.product_name || "").toLowerCase();
        const sCat = (s.category || "").toLowerCase();
        const iCat = (item.category || "").toLowerCase();
        return sName.includes(key) || key.includes(sName) || sCat === iCat;
      });

      const totalAvailable = matchingStock.reduce((sum, s) => sum + (s.stock || 0), 0);

      if (totalAvailable < needed) {
        warnings.push({
          nama: item.nama,
          needed,
          available: totalAvailable,
          shortage: needed - totalAvailable,
          unit: item.unit,
        });
      }
    }

    if (warnings.length > 0) {
      setStockWarnings(warnings);
      setShowStockWarning(true);
      setPOSaving(false);

      await base44.functions.invoke("checkStockAlerts", {
        items: warnings.map(w => w.nama),
        sppg_id: user?.email,
        sppg_name: user?.organization_name || user?.full_name,
      });
      return;
    }

    const now = new Date();
    const weekNum = Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / 604800000);
    const weekLabel = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

    if (supplierMode === "direct" && selectedSupplier) {
      const poNum = `PO-${Date.now().toString().slice(-8)}`;
      const newPO = await base44.entities.PurchaseOrder.create({
        po_number: poNum,
        mitra_id: user?.id || user?.email,
        mitra_name: user?.organization_name || user?.full_name || user?.email,
        mitra_email: user?.email || "",
        supplier_name: selectedSupplier,
        items: validItems,
        notes: poNotes,
        status: "menunggu",
      });
      setPOHistory(prev => [newPO, ...prev]);
    } else {
      const newNeeds = await base44.entities.WeeklyNeeds.create({
        sppg_id: user?.email || "",
        sppg_name: user?.organization_name || user?.full_name || "SPPG",
        week_label: weekLabel,
        items: validItems,
        notes: poNotes,
        status: "open",
        has_supplier: false,
      });
      setNeedsHistory(prev => [newNeeds, ...prev]);
      await base44.functions.invoke("checkStockAlerts", {
        items: validItems.map(i => i.nama),
        sppg_id: user?.email,
        sppg_name: user?.organization_name || user?.full_name,
      });
    }

    setPOSaving(false);
    setPOSubmitted(true);
    setPONotes("");
    setSelectedSupplier("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Kebutuhan Bahan & PO</h2>
        <p className="text-muted-foreground">Isi kebutuhan bahan untuk minggu ini, kirim ke supplier langganan atau broadcast ke semua supplier</p>
      </div>

      <StockAlertBanner userEmail={user?.email} sppgName={user?.organization_name || user?.full_name} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            Kebutuhan Bahan Mingguan & PO
          </CardTitle>
          <p className="text-xs text-muted-foreground">Pilih kirim ke supplier langganan atau broadcast ke semua supplier.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {poSubmitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="font-bold text-emerald-700 text-lg">
                {supplierMode === "direct" ? "PO Terkirim ke Supplier!" : "Kebutuhan Dipublikasikan ke Semua Supplier!"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {supplierMode === "direct"
                  ? `Menunggu konfirmasi dari ${selectedSupplier}.`
                  : "Supplier yang memiliki stok akan mengklik Terima Orderan."}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setPOSubmitted(false)}>Buat Pesanan Baru</Button>
            </div>
          ) : (
            <>
              {/* Pilih mode: supplier langganan vs broadcast */}
              <div className="p-3 bg-slate-50 rounded-xl border space-y-3">
                <Label className="text-sm font-semibold">Pilih Cara Pengiriman</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSupplierMode("broadcast")}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${supplierMode === "broadcast" ? "border-emerald-500 bg-emerald-50" : "border-border bg-white"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Megaphone className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold">Broadcast</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Tampil ke semua supplier. Supplier yang punya stok klik Terima.</p>
                  </button>
                  <button
                    onClick={() => setSupplierMode("direct")}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${supplierMode === "direct" ? "border-blue-500 bg-blue-50" : "border-border bg-white"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold">Supplier Langganan</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Kirim langsung sebagai PO ke supplier pilihan Anda.</p>
                  </button>
                </div>

                {supplierMode === "direct" && (
                  <div>
                    <Label className="text-xs mb-1 block">Pilih Supplier Langganan</Label>
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger><SelectValue placeholder="Pilih nama supplier..." /></SelectTrigger>
                      <SelectContent>
                        {SUPPLIER_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Daftar kebutuhan */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Daftar Kebutuhan Bahan</Label>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addItem}><Plus className="w-3 h-3 mr-1" />Tambah Bahan</Button>
                </div>
                <div className="space-y-2">
                  {poItems.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input placeholder="Nama bahan" value={item.nama} onChange={e => updateItem(i, "nama", e.target.value)} className="flex-1 text-sm h-8" />
                      <Input placeholder="Qty" type="number" value={item.qty} onChange={e => updateItem(i, "qty", e.target.value)} className="w-20 text-sm h-8" />
                      <Select value={item.unit} onValueChange={v => updateItem(i, "unit", v)}>
                        <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["kg", "gram", "liter", "pcs", "ikat", "bungkus"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 shrink-0" onClick={() => removeItem(i)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Catatan Tambahan</Label>
                <Input placeholder="Kualitas, waktu pengiriman, dll..." value={poNotes} onChange={e => setPONotes(e.target.value)} />
              </div>

              {supplierMode === "broadcast" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">Jika tidak ada supplier yang menerima dalam 24 jam, admin dan SPPG akan mendapat alert otomatis. Anda akan diminta mencari menu pengganti.</p>
                </div>
              )}

              {/* ── PERINGATAN STOK KURANG ── */}
              {showStockWarning && stockWarnings.length > 0 && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="font-bold text-red-700 text-sm">Stok Gudang Tidak Mencukupi!</p>
                  </div>
                  <p className="text-xs text-red-600">PO tidak dapat dikirim. Bahan berikut stoknya kurang — admin telah diberitahu. Silakan ubah jumlah atau cari <strong>menu pengganti</strong> di halaman Rekomendasi Menu.</p>
                  <div className="space-y-2">
                    {stockWarnings.map((w, i) => (
                      <div key={i} className="bg-white border border-red-200 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-red-700">{w.nama}</p>
                          <p className="text-xs text-muted-foreground">Dibutuhkan: <strong>{w.needed} {w.unit}</strong> · Tersedia: <strong>{w.available} {w.unit}</strong></p>
                        </div>
                        <Badge className="bg-red-100 text-red-700 text-xs">Kurang {w.shortage} {w.unit}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs border-red-300 text-red-700" onClick={() => setShowStockWarning(false)}>
                      <RefreshCw className="w-3 h-3 mr-1" />Ubah Jumlah
                    </Button>
                    <Button size="sm" className="flex-1 text-xs bg-amber-500 hover:bg-amber-600 text-white" onClick={() => {
                      setShowStockWarning(false);
                      navigate("/mitra/menu");
                    }}>
                      <UtensilsCrossed className="w-3 h-3 mr-1" />Cari Menu Pengganti
                    </Button>
                  </div>
                </div>
              )}

              <Button
                className={`w-full text-white ${supplierMode === "direct" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                onClick={submitOrder}
                disabled={poSaving || (supplierMode === "direct" && !selectedSupplier)}
              >
                <Upload className="w-4 h-4 mr-2" />
                {poSaving ? "Mengirim..." : supplierMode === "direct" ? `Kirim PO ke ${selectedSupplier || "Supplier"}` : "Broadcast ke Semua Supplier"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Riwayat PO & Kebutuhan */}
      {(poHistory.length > 0 || needsHistory.length > 0) && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Riwayat Pesanan & Kebutuhan</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {poHistory.map((po, i) => (
              <div key={po.id || i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700 text-xs">PO</Badge>
                    <span className="font-bold text-sm">{po.po_number}</span>
                    <Badge className={`text-xs ${statusPO[po.status] || statusPO.menunggu}`}>{po.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{po.supplier_name} — {Array.isArray(po.items) ? po.items.map(i => `${i.nama} ${i.qty}${i.unit}`).join(", ") : ""}</p>
                </div>
              </div>
            ))}
            {needsHistory.map((n, i) => (
              <div key={n.id || i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">Broadcast</Badge>
                    <span className="font-semibold text-sm">{n.week_label}</span>
                    <Badge className={`text-xs ${n.status === "filled" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {n.status === "filled" ? "Sudah Ada Supplier" : "Menunggu Supplier"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {Array.isArray(n.items) ? n.items.map(i => `${i.nama} ${i.qty}${i.unit}`).join(", ") : ""}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}