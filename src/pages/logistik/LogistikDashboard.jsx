import React, { useEffect, useState, useRef } from "react";
import StatCard from "@/components/shared/StatCard";
import { Truck, MapPin, Package, Clock, CheckCircle2, BellRing, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const vehicleLabels = {
  motor: "🏍️ Motor",
  mobil_pickup: "🛻 Mobil Pickup",
  mobil_box: "📦 Mobil Box",
  truk: "🚛 Truk",
};

const statusConfig = {
  pending:    { label: "Menunggu Pickup", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  confirmed:  { label: "Dikonfirmasi", color: "bg-blue-50 text-blue-700 border-blue-200" },
  processing: { label: "Diproses", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  shipping:   { label: "Dalam Pengiriman", color: "bg-purple-50 text-purple-700 border-purple-200" },
  delivered:  { label: "Terkirim", color: "bg-green-50 text-green-700 border-green-200" },
};

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

export default function LogistikDashboard() {
  const { user, profile, updateProfile } = useUserProfile();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem("logistik_notifs") || "[]"); } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [togglingReady, setTogglingReady] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [vehicleType, setVehicleType] = useState("");
  const [supplierReadyPOs, setSupplierReadyPOs] = useState([]);
  const prevOrderIds = useRef(new Set());
  const prevPOIds = useRef(new Set());

  // Simpan notifikasi ke localStorage setiap update
  useEffect(() => {
    localStorage.setItem("logistik_notifs", JSON.stringify(notifications));
  }, [notifications]);

  const isReady = profile?.is_ready || false;

  // Sync vehicle type dari profile
  useEffect(() => {
    if (profile?.vehicle_type) setVehicleType(profile.vehicle_type);
  }, [profile?.vehicle_type]);

  // Load orders + PO siap kirim dari database
  useEffect(() => {
    base44.entities.Order.list("-created_date", 30).then(data => {
      setOrders(data);
      prevOrderIds.current = new Set(data.map(o => o.id));
      setLoading(false);
    });
    base44.entities.PurchaseOrder.filter({ status: "diproses" }, "-created_date", 20).then(data => {
      setSupplierReadyPOs(data);
      prevPOIds.current = new Set(data.map(p => p.id));
    });
  }, []);

  // Real-time subscription + notifikasi pesanan baru
  useEffect(() => {
    const unsubOrder = base44.entities.Order.subscribe((event) => {
      if (event.type === "create") {
        if (!prevOrderIds.current.has(event.id)) {
          prevOrderIds.current.add(event.id);
          setOrders(prev => [event.data, ...prev]);
          const notif = {
            id: event.id,
            order_number: event.data.order_number,
            mitra_name: event.data.mitra_name,
            area: event.data.delivery_area,
            total: event.data.total_amount,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          };
          setNotifications(prev => [notif, ...prev].slice(0, 10));
        }
      } else if (event.type === "update") {
        setOrders(prev => prev.map(o => o.id === event.id ? event.data : o));
      }
    });

    // Subscribe PO dari supplier — deteksi saat supplier proses/siap kirim
    const unsubPO = base44.entities.PurchaseOrder.subscribe((event) => {
      if (event.type === "update" && event.data.status === "diproses") {
        // Supplier sudah memproses PO → siap dikirim logistik
        setSupplierReadyPOs(prev => {
          const exists = prev.find(p => p.id === event.id);
          if (exists) return prev.map(p => p.id === event.id ? event.data : p);
          return [event.data, ...prev];
        });
        toast({
          title: "📦 Supplier Siap Kirim!",
          description: `PO ${event.data.po_number} dari ${event.data.mitra_name} siap diambil dari supplier ${event.data.supplier_name}.`,
          duration: 6000,
        });
        const notif = {
          id: `po-${event.id}`,
          order_number: event.data.po_number,
          mitra_name: event.data.mitra_name,
          area: event.data.supplier_name,
          total: event.data.total_amount,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };
        setNotifications(prev => [notif, ...prev].slice(0, 10));
      } else if (event.type === "update" && (event.data.status === "diterima" || event.data.status === "ditolak")) {
        setSupplierReadyPOs(prev => prev.filter(p => p.id !== event.id));
      }
    });

    return () => { unsubOrder(); unsubPO(); };
  }, []);

  const handleToggleReady = async () => {
    setTogglingReady(true);
    try {
      const updates = { is_ready: !isReady };
      // Jika mau set ready, ambil lokasi GPS terkini
      if (!isReady && navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              updates.latitude = pos.coords.latitude;
              updates.longitude = pos.coords.longitude;
              resolve();
            },
            () => resolve() // lanjut meski GPS gagal
          );
        });
      }
      if (vehicleType) updates.vehicle_type = vehicleType;
      await updateProfile(updates);
    } catch (e) {
      console.error(e);
    }
    setTogglingReady(false);
  };

  const handleAmbilPesanan = async (orderId) => {
    setUpdatingOrder(orderId);
    try {
      await base44.entities.Order.update(orderId, {
        status: "shipping",
        logistic_id: user?.email,
        logistic_name: profile?.full_name || profile?.organization_name || user?.email,
      });
    } catch (e) {
      console.error(e);
    }
    setUpdatingOrder(null);
  };

  const handleSelesai = async (orderId) => {
    setUpdatingOrder(orderId);
    try {
      await base44.entities.Order.update(orderId, { status: "delivered" });
    } catch (e) {
      console.error(e);
    }
    setUpdatingOrder(null);
  };

  const readyOrders   = orders.filter(o => o.status === "confirmed" || o.status === "processing");
  const shippingOrders = orders.filter(o => o.status === "shipping" && o.logistic_id === user?.email);
  const deliveredCount = orders.filter(o => o.status === "delivered" && o.logistic_id === user?.email).length;
  const totalOrders    = orders.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Logistik</h2>
          <p className="text-muted-foreground">Kelola pengiriman bahan pangan Kabupaten Garut</p>
        </div>

        {/* Pilih Kendaraan + Tombol Siap Mengantar */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {!isReady && (
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Pilih kendaraan..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="motor">🏍️ Motor</SelectItem>
                <SelectItem value="mobil_pickup">🛻 Mobil Pickup</SelectItem>
                <SelectItem value="mobil_box">📦 Mobil Box</SelectItem>
                <SelectItem value="truk">🚛 Truk</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={handleToggleReady}
            disabled={togglingReady || (!isReady && !vehicleType)}
            className={`gap-2 font-semibold shadow-md transition-all ${
              isReady
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-muted hover:bg-muted/80 text-foreground border"
            }`}
            variant={isReady ? "default" : "outline"}
          >
            {isReady ? (
              <><CheckCircle2 className="w-4 h-4" /> Siap Mengantar {vehicleType && `· ${vehicleLabels[vehicleType]}`}</>
            ) : (
              <><Truck className="w-4 h-4" /> Set Siap Mengantar</>
            )}
          </Button>
        </div>
      </div>

      {/* Status Ready Banner */}
      {isReady && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <div>
            <p className="text-green-800 font-semibold text-sm">Anda sedang dalam status Siap Mengantar</p>
            <p className="text-green-600 text-xs">Pesanan yang siap di-pickup akan muncul di bawah</p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Pesanan" value={totalOrders} icon={Package} color="blue" />
        <StatCard title="Siap Di-Pickup" value={readyOrders.length} icon={Clock} color="yellow" />
        <StatCard title="Sedang Diantar" value={shippingOrders.length} icon={Truck} color="purple" />
        <StatCard title="Terkirim (Anda)" value={deliveredCount} icon={CheckCircle2} color="green" />
      </div>

      {/* Notifikasi Pesanan Baru */}
      {notifications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
              <BellRing className="w-4 h-4 animate-bounce" />
              Notifikasi Pesanan Baru ({notifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-orange-100 text-sm">
                <div>
                  <span className="font-semibold text-orange-700">{n.order_number}</span>
                  <span className="text-muted-foreground ml-2">· {n.mitra_name}</span>
                  {n.area && <span className="text-xs text-muted-foreground ml-2">📍 {n.area}</span>}
                </div>
                <div className="text-right">
                  <p className="font-medium text-xs">{formatRp(n.total)}</p>
                  <p className="text-xs text-muted-foreground">{n.time}</p>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="text-xs text-orange-600 w-full" onClick={() => setNotifications([])}>
              Hapus semua notifikasi
            </Button>
          </CardContent>
        </Card>
      )}

      {/* PO Siap Diambil dari Supplier */}
      {supplierReadyPOs.length > 0 && (
        <Card className="border-blue-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
              <ShoppingBag className="w-4 h-4" />
              Barang Siap Diambil dari Supplier
              <Badge className="bg-blue-600 text-white ml-auto text-xs">{supplierReadyPOs.length} PO</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">Supplier sudah memproses pesanan berikut. Segera ambil dan antarkan.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {supplierReadyPOs.map((po) => (
              <div key={po.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-blue-200">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-blue-700">{po.po_number}</span>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">Siap Diambil</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dari: <span className="font-medium">{po.supplier_name}</span> → <span className="font-medium">{po.mitra_name}</span>
                  </p>
                  {Array.isArray(po.items) && po.items.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {po.items.slice(0, 3).map((item, j) => (
                        <Badge key={j} variant="outline" className="text-xs text-black">{item.nama} {item.qty} {item.unit}</Badge>
                      ))}
                      {po.items.length > 3 && <Badge variant="outline" className="text-xs text-black">+{po.items.length - 3} lagi</Badge>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pesanan Siap Di-Pickup */}
      {isReady && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Pesanan Siap Di-Pickup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {readyOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Tidak ada pesanan yang siap di-pickup saat ini</p>
            ) : readyOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{order.order_number}</span>
                    <Badge variant="outline" className={statusConfig[order.status]?.color}>
                      {statusConfig[order.status]?.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {order.mitra_name} · {order.delivery_area || "-"}
                  </p>
                  <p className="text-xs font-semibold text-primary mt-0.5">{formatRp(order.total_amount)}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                  disabled={updatingOrder === order.id}
                  onClick={() => handleAmbilPesanan(order.id)}
                >
                  {updatingOrder === order.id ? "..." : "Ambil Pesanan"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pesanan Sedang Diantar Saya */}
      {shippingOrders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-600" />
              Sedang Anda Antar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {shippingOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{order.order_number}</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Dalam Pengiriman</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {order.mitra_name} · {order.delivery_area || "-"}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                  disabled={updatingOrder === order.id}
                  onClick={() => handleSelesai(order.id)}
                >
                  {updatingOrder === order.id ? "..." : "Selesai Kirim"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Semua Pesanan Terbaru */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Semua Pesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada pesanan</p>
          ) : orders.slice(0, 8).map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            return (
              <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{order.order_number}</span>
                    <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {order.mitra_name} — {order.delivery_area || "-"}
                  </p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <p className="text-sm font-semibold text-primary">{formatRp(order.total_amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.created_date && new Date(order.created_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}