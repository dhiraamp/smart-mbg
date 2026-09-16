import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Package, Truck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { notifyRoles } from "@/lib/notify";
import { useUserProfile } from "@/hooks/useUserProfile";
import PilihLogistik from "@/components/supplier/PilihLogistik";
import { deductOrderStock, restoreOrderStock } from "@/lib/stockManager";

const statusConfig = {
  pending: { label: "Menunggu", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-50 text-blue-700 border-blue-200" },
  processing: { label: "Diproses", color: "bg-purple-50 text-purple-700 border-purple-200" },
  shipping: { label: "Dikirim", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  delivered: { label: "Diterima", color: "bg-green-50 text-green-700 border-green-200" },
  cancelled: { label: "Dibatalkan", color: "bg-red-50 text-red-700 border-red-200" },
};

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

export default function SupplierOrders() {
  const { user, profile } = useUserProfile();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("semua");
  const [pilihLogistikOrder, setPilihLogistikOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    // Fetch all orders - supplier sees orders that have their products
    const data = await base44.entities.Order.list("-created_date", 50);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // Subscribe to real-time order updates
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.type === "create") {
        setOrders(prev => [event.data, ...prev]);
      } else if (event.type === "update") {
        setOrders(prev => prev.map(o => o.id === event.id ? event.data : o));
      }
    });
    return unsub;
  }, []);

  const updateStatus = async (order, newStatus) => {
    setUpdating(order.id);
    let stockAlerts = [];

    // 1. Potong stok otomatis jika dikonfirmasi atau mulai diproses
    if (newStatus === "confirmed" || newStatus === "processing") {
      const res = await deductOrderStock(order);
      if (res.success && res.lowStockAlerts?.length) {
        stockAlerts = res.lowStockAlerts;
      }
    } else if (newStatus === "cancelled") {
      // 2. Kembalikan stok jika pesanan dibatalkan setelah sempat dikonfirmasi
      await restoreOrderStock(order);
    }

    await base44.entities.Order.update(order.id, { status: newStatus });
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));

    // Kirim notifikasi ke pembeli (mitra/warga) & logistik saat status berubah
    try {
      const isWarga = order.customer_role === "penerima";
      const label = statusConfig[newStatus]?.label || newStatus;
      await notifyRoles(isWarga ? ["penerima"] : ["mitra"], {
        type: "order_update",
        title: `Pesanan ${label}`,
        message: `${order.order_number} · ${label} oleh ${order.supplier_name || "Supplier"}`,
        ref_id: order.id,
        link: isWarga ? "/warga/pesanan" : "/mitra/orders",
      });
    } catch (e) {
      console.warn("Gagal mengirim notifikasi (opsional):", e);
    }

    const label = statusConfig[newStatus]?.label || newStatus;
    toast.success(
      newStatus === "confirmed"
        ? `Pesanan ${order.order_number} Dikonfirmasi & Stok Terpotong!`
        : `Pesanan ${order.order_number} → ${label}`,
      {
        description: stockAlerts.length > 0
          ? `Perhatian: Stok ${stockAlerts.map(s => `${s.name} (${s.stock} ${s.unit})`).join(", ")} menipis/habis!`
          : undefined,
        duration: 3000,
      }
    );
    setUpdating(null);
  };

  const filtered = filter === "semua" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notifikasi Pesanan</h2>
        <p className="text-muted-foreground">Pesanan masuk dari mitra SPPG & warga secara real-time</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["semua", "pending", "confirmed", "processing", "shipping", "delivered"].map(f => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className="capitalize text-xs h-8"
            onClick={() => setFilter(f)}
          >
            {f === "semua" ? "Semua" : statusConfig[f]?.label || f}
            {f !== "semua" && (
              <span className="ml-1 bg-white/20 rounded-full px-1.5 text-[10px]">
                {orders.filter(o => o.status === f).length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Package className="w-12 h-12 text-muted-foreground mb-3 opacity-40" />
            <p className="font-medium">Belum ada pesanan masuk</p>
            <p className="text-sm text-muted-foreground">Pesanan dari mitra SPPG & warga akan muncul di sini</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <Card key={o.id} className={`${o.status === "pending" ? "border-orange-300 shadow-orange-100 shadow-md" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{o.order_number}</span>
                      <Badge variant="outline" className={statusConfig[o.status]?.color}>
                        {statusConfig[o.status]?.label || o.status}
                      </Badge>
                      {o.customer_role === "penerima" ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Warga</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Mitra SPPG</Badge>
                      )}
                      {o.status === "pending" && (
                        <Badge className="bg-red-100 text-red-700 animate-pulse text-xs">⚡ Butuh Respon</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dari: <span className="font-medium">{o.mitra_name || o.mitra_email || o.customer_email || "-"}</span>
                      {o.created_date && <> · {new Date(o.created_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</>}
                    </p>
                    {o.mitra_address && (
                      <p className="text-xs text-muted-foreground mt-0.5">📍 {o.mitra_address}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-sm">{formatRp(o.total ?? o.total_amount)}</p>
                    {o.notes && <p className="text-xs text-muted-foreground italic max-w-[180px] text-right">{o.notes}</p>}
                  </div>
                </div>

                {/* Items */}
                {Array.isArray(o.items) && o.items.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {o.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm p-2 bg-muted/30 rounded-lg">
                        <span className="text-muted-foreground">{item.product_name} × {item.quantity || 1}</span>
                        <span className="font-medium">{formatRp(item.subtotal || item.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                {o.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                      disabled={updating === o.id}
                      onClick={() => updateStatus(o, "confirmed")}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Konfirmasi
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 h-8 text-xs"
                      disabled={updating === o.id}
                      onClick={() => updateStatus(o, "cancelled")}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Tolak
                    </Button>
                  </div>
                )}
                {o.status === "confirmed" && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="h-8 text-xs" disabled={updating === o.id} onClick={() => updateStatus(o, "processing")}>
                      Mulai Proses
                    </Button>
                  </div>
                )}
                {o.status === "processing" && (
                  <div className="flex gap-2 pt-1 flex-wrap">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
                      onClick={() => setPilihLogistikOrder(o)}
                    >
                      <Truck className="w-3.5 h-3.5 mr-1" /> Pilih Logistik
                    </Button>
                  </div>
                )}
                {o.status === "shipping" && o.logistic_name && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-1.5 w-fit">
                    <Truck className="w-3.5 h-3.5" />
                    Diantar oleh: <span className="font-semibold">{o.logistic_name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pilihLogistikOrder && (
        <PilihLogistik
          order={pilihLogistikOrder}
          supplierProfile={profile}
          open={!!pilihLogistikOrder}
          onClose={() => setPilihLogistikOrder(null)}
          onAssigned={fetchOrders}
        />
      )}
    </div>
  );
}