import React, { useEffect, useState, useCallback } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/shared/PullToRefreshIndicator";
import StatCard from "@/components/shared/StatCard";
import { Package, TrendingUp, ShoppingCart, AlertCircle, ChefHat, FileText, Megaphone, Users, BarChart2, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthlyReport from "@/components/shared/MonthlyReport";
import DemandAnalytics from "@/components/supplier/DemandAnalytics";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

const statusColors = { pending: "bg-yellow-50 text-yellow-700", confirmed: "bg-blue-50 text-blue-700", processing: "bg-purple-50 text-purple-700" };
const statusPO = { diterima: "bg-green-100 text-green-700", menunggu: "bg-yellow-100 text-yellow-700", diproses: "bg-blue-100 text-blue-700", ditolak: "bg-red-100 text-red-700" };

export default function SupplierDashboard() {
  const [poList, setPOList] = useState([]);
  const [loadingPO, setLoadingPO] = useState(true);
  const [updatingPO, setUpdatingPO] = useState(null);
  const [weeklyNeeds, setWeeklyNeeds] = useState([]);
  const [loadingNeeds, setLoadingNeeds] = useState(true);

  const loadData = useCallback(async () => {
    const [poData, orderData, needsData] = await Promise.all([
      base44.entities.PurchaseOrder.list("-created_date", 20),
      base44.entities.Order.list("-created_date", 20),
      base44.entities.WeeklyNeeds.filter({ has_supplier: false }, "-created_date", 30),
    ]);
    setPOList([...orderData, ...poData]);
    setLoadingPO(false);
    setWeeklyNeeds(needsData.filter(n => n.status === "open"));
    setLoadingNeeds(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const { isRefreshing, pullDistance } = usePullToRefresh(loadData);

  // Subscribe to real-time Order + PO updates
  useEffect(() => {
    let isInitialized = false;
    // Delay agar tidak trigger notif saat load awal
    const timer = setTimeout(() => { isInitialized = true; }, 3000);

    const unsubOrder = base44.entities.Order.subscribe((event) => {
      if (event.type === "create") {
        setPOList(prev => [event.data, ...prev]);
        if (isInitialized) {
          toast({
            title: "🛒 Pesanan Baru Masuk!",
            description: `Pesanan dari ${event.data.mitra_name || "mitra"} — ${event.data.order_number || ""}`,
            duration: 5000,
          });
        }
      } else if (event.type === "update") {
        setPOList(prev => prev.map(p => p.id === event.id ? event.data : p));
      }
    });
    const unsubPO = base44.entities.PurchaseOrder.subscribe((event) => {
      if (event.type === "create") {
        setPOList(prev => [event.data, ...prev]);
        if (isInitialized) {
          toast({
            title: "📋 PO Baru Masuk!",
            description: `Purchase Order dari ${event.data.mitra_name || "mitra"} — ${event.data.po_number || ""}`,
            duration: 5000,
          });
        }
      } else if (event.type === "update") {
        setPOList(prev => prev.map(p => p.id === event.id ? event.data : p));
      }
    });
    return () => { clearTimeout(timer); unsubOrder(); unsubPO(); };
  }, []);

  const updatePOStatus = async (po, newStatus) => {
    setUpdatingPO(po.id);
    await base44.entities.PurchaseOrder.update(po.id, { status: newStatus });
    toast({ title: `PO ${po.po_number} ${newStatus === "diproses" ? "sedang diproses" : "ditolak"}` });
    setUpdatingPO(null);
  };

  const acceptWeeklyNeeds = async (need) => {
    setUpdatingPO(need.id);
    // Update WeeklyNeeds jadi filled
    await base44.entities.WeeklyNeeds.update(need.id, { status: "filled", has_supplier: true });
    // Buat PO otomatis
    const poNum = `PO-${Date.now().toString().slice(-8)}`;
    await base44.entities.PurchaseOrder.create({
      po_number: poNum,
      mitra_id: need.sppg_id,
      mitra_name: need.sppg_name,
      mitra_email: need.sppg_id,
      supplier_name: "Supplier Aktif",
      items: need.items || [],
      notes: need.notes || "",
      status: "diproses",
    });
    setWeeklyNeeds(prev => prev.filter(n => n.id !== need.id));
    toast({ title: `Orderan dari ${need.sppg_name} diterima! PO otomatis dibuat.` });
    setUpdatingPO(null);
  };

  return (
    <div className="space-y-6">
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Supplier</h2>
          <p className="text-muted-foreground">Ringkasan aktivitas supplier Anda</p>
        </div>
        {poList.filter(p => p.status === "menunggu").length > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 animate-pulse">
            <Bell className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">
              {poList.filter(p => p.status === "menunggu").length} Pesanan Menunggu Respon
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Produk" value="48" icon={Package} color="blue" trend={8} />
        <StatCard title="Pesanan Bulan Ini" value="32" icon={ShoppingCart} color="green" trend={15} />
        <StatCard title="Pendapatan Bulan Ini" value="Rp 24.5jt" icon={TrendingUp} color="yellow" trend={12} />
        <StatCard title="PO Menunggu" value={poList.filter(p => p.status === "menunggu").length.toString()} icon={AlertCircle} color="red" />
      </div>

      {/* Tab: Permintaan SPPG vs Analitik */}
      <Tabs defaultValue="permintaan">
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="permintaan" className="text-xs flex items-center gap-1">
            <Megaphone className="w-3 h-3" />Kebutuhan SPPG
          </TabsTrigger>
          <TabsTrigger value="analitik" className="text-xs flex items-center gap-1">
            <BarChart2 className="w-3 h-3" />Analitik Tren
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analitik" className="mt-4">
          <DemandAnalytics />
        </TabsContent>

        <TabsContent value="permintaan" className="mt-4">
      {/* Kebutuhan Mingguan SPPG — hanya yang belum punya supplier */}
      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-emerald-600" />
            Kebutuhan Mingguan SPPG (Belum Ada Supplier)
            <Badge className="bg-emerald-100 text-emerald-700 ml-auto text-xs">
              {weeklyNeeds.length} Permintaan Terbuka
            </Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            SPPG ini belum memiliki supplier tetap. Anda bisa menghubungi mereka langsung untuk menawarkan bahan pangan.
          </p>
        </CardHeader>
        <CardContent>
          {loadingNeeds ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>
          ) : weeklyNeeds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Semua SPPG sudah memiliki supplier pemasok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weeklyNeeds.map((need, i) => (
                <div key={need.id || i} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          {need.sppg_name}
                        </span>
                        <Badge className="text-xs bg-yellow-100 text-yellow-700">Butuh Supplier</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Minggu: {need.week_label} · {need.created_date ? new Date(need.created_date).toLocaleDateString("id-ID") : ""}
                      </p>
                    </div>
                  </div>
                  {Array.isArray(need.items) && need.items.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {need.items.map((item, j) => (
                        <Badge key={j} variant="outline" className="text-xs bg-white text-black">
                          {item.nama} {item.qty} {item.unit}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {need.notes && <p className="text-xs text-muted-foreground italic">📝 {need.notes}</p>}
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={updatingPO === need.id}
                      onClick={() => acceptWeeklyNeeds(need)}
                    >
                      ✓ Terima Orderan
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

        </TabsContent>
      </Tabs>

      {/* PO dari Mitra/SPPG — Real Time */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            Purchase Order dari Mitra / SPPG
            <Badge className="bg-orange-100 text-orange-700 ml-auto text-xs">
              {poList.filter(p => p.status === "menunggu").length} PO Baru
            </Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">PO masuk dari mitra secara real-time. Konfirmasi atau tolak setiap PO.</p>
        </CardHeader>
        <CardContent>
          {loadingPO ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" /></div>
          ) : poList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada PO masuk</p>
            </div>
          ) : (
            <div className="space-y-3">
              {poList.map((po, i) => (
                <div key={po.id || i} className={`p-4 rounded-xl border ${po.status === "menunggu" ? "border-orange-200 bg-orange-50" : "border-border bg-muted/20"}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{po.po_number}</span>
                        <Badge className={`text-xs ${statusPO[po.status] || statusPO.menunggu}`}>{po.status}</Badge>
                        {po.status === "menunggu" && <Badge className="bg-red-100 text-red-700 text-xs animate-pulse">Butuh Respon</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <ChefHat className="w-3 h-3 inline mr-1" />
                        {po.mitra_name} • {po.created_date ? new Date(po.created_date).toLocaleDateString("id-ID") : ""}
                      </p>
                    </div>
                    {po.status === "menunggu" && (
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                          disabled={updatingPO === po.id}
                          onClick={() => updatePOStatus(po, "diproses")}>
                          ✓ Proses
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200"
                          disabled={updatingPO === po.id}
                          onClick={() => updatePOStatus(po, "ditolak")}>
                          ✗ Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                  {Array.isArray(po.items) && po.items.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {po.items.map((item, j) => (
                        <Badge key={j} variant="outline" className="text-xs text-black">
                          {item.nama} {item.qty} {item.unit}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {po.notes && <p className="text-xs text-muted-foreground mt-2 italic">📝 {po.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pesanan Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "ORD-101", mitra: "SPPG Garut Kota", items: "Beras 100kg, Telur 50kg", status: "confirmed", total: "Rp 2.100.000" },
              { id: "ORD-102", mitra: "SPPG Tarogong", items: "Sayuran Mix 30kg", status: "pending", total: "Rp 450.000" },
              { id: "ORD-103", mitra: "SPPG Leles", items: "Daging Ayam 25kg", status: "processing", total: "Rp 950.000" },
            ].map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{o.id}</span>
                    <Badge variant="outline" className={statusColors[o.status]}>{o.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{o.mitra} — {o.items}</p>
                </div>
                <p className="font-semibold text-sm">{o.total}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <MonthlyReport title="Pendapatan Bulanan" />
      </div>
    </div>
  );
}