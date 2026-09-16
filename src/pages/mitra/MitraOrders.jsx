import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle2, Clock, MapPin, Star, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useUserProfile } from "@/hooks/useUserProfile";
import RatingDriverModal from "@/components/logistik/RatingDriverModal";
import RatingSupplierModal from "@/components/mitra/RatingSupplierModal";
import PodViewModal from "@/components/logistik/PodViewModal";

const statusConfig = {
  pending: { label: "Menunggu", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Package },
  processing: { label: "Diproses", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Package },
  shipping: { label: "Dikirim", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Truck },
  delivered: { label: "Diterima", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "Dibatalkan", color: "bg-red-50 text-red-700 border-red-200", icon: Clock },
};

const steps = ["pending", "confirmed", "processing", "shipping", "delivered"];
const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const TABS = [
  { key: "semua", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "proses", label: "Diproses" },
  { key: "kirim", label: "Dikirim" },
  { key: "selesai", label: "Selesai" },
  { key: "batal", label: "Dibatalkan" },
];

const tabMatch = (order, key) => {
  switch (key) {
    case "pending":
      return order.status === "pending";
    case "proses":
      return ["confirmed", "processing"].includes(order.status);
    case "kirim":
      return order.status === "shipping";
    case "selesai":
      return order.status === "delivered";
    case "batal":
      return order.status === "cancelled";
    default:
      return true;
  }
};

export default function MitraOrders() {
  const { user, profile } = useUserProfile();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("semua");
  const [ratedOrders, setRatedOrders] = useState(new Set());
  const [ratedSupplierOrders, setRatedSupplierOrders] = useState(new Set());
  const [ratingOrder, setRatingOrder] = useState(null);
  const [ratingSupplierOrder, setRatingSupplierOrder] = useState(null);
  const [podViewOrder, setPodViewOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Order.filter({ mitra_id: user.email }, "-created_date", 30)
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => {
        // fallback: fetch all and filter client-side
        base44.entities.Order.list("-created_date", 50).then(data => {
          setOrders(data.filter(o => o.mitra_id === user.email || o.mitra_id === user.id));
          setLoading(false);
        });
      });
  }, [user?.email]);

  // Cek order yang sudah diberi rating driver & supplier
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.DriverRating.filter({ mitra_id: user.email }).then(ratings => {
      setRatedOrders(new Set(ratings.map(r => r.order_id)));
    });
    base44.entities.SupplierRating.filter({ sppg_id: user.email }).then(ratings => {
      setRatedSupplierOrders(new Set(ratings.map(r => r.order_id)));
    });
  }, [user?.email]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.type === "create" && (event.data?.mitra_id === user?.email || event.data?.mitra_id === user?.id)) {
        setOrders(prev => [event.data, ...prev]);
      } else if (event.type === "update") {
        setOrders(prev => prev.map(o => o.id === event.id ? event.data : o));
      }
    });
    return unsub;
  }, [user?.email]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const visibleOrders = orders.filter((o) => tabMatch(o, tab));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tracking Pesanan</h2>
        <p className="text-muted-foreground">Pantau status pengiriman pesanan Anda dari supplier</p>
      </div>

      {/* Tab status ala Shopee */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-200 bg-white rounded-2xl px-2">
        {TABS.map((t) => {
          const count = orders.filter((o) => tabMatch(o, t.key)).length;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                active ? "text-emerald-700 font-semibold" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                active ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"
              }`}>{count}</span>
              {active && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 rounded-full" />}
            </button>
          );
        })}
      </div>

      {visibleOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Package className="w-12 h-12 text-muted-foreground mb-3 opacity-40" />
            <p className="font-medium">{tab === "semua" ? "Belum ada pesanan" : "Tidak ada pesanan pada kategori ini"}</p>
            <p className="text-sm text-muted-foreground">Pesan produk dari katalog supplier di Dashboard</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            const currentStep = steps.indexOf(order.status);
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{order.order_number}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {order.supplier_name && <span>Supplier: {order.supplier_name} · </span>}
                      {order.created_date && new Date(order.created_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <Badge variant="outline" className={cfg.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />{cfg.label}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress bar */}
                  {order.status !== "cancelled" && (
                    <div className="flex items-center gap-1">
                      {steps.map((step, i) => (
                        <React.Fragment key={step}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            i <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>{i + 1}</div>
                          {i < steps.length - 1 && <div className={`flex-1 h-1 rounded ${i < currentStep ? "bg-primary" : "bg-muted"}`} />}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Item Pesanan</p>
                      {Array.isArray(order.items) && order.items.map((item, i) => (
                        <p key={i} className="font-medium text-sm">{item.product_name} × {item.quantity || 1}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Area Pengiriman</p>
                      <p className="font-medium flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{order.delivery_area || order.mitra_address || "-"}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">Total</p>
                      <p className="text-lg font-bold text-primary">{formatRp(order.total_amount)}</p>
                    </div>
                  </div>

                  {/* Tombol Rating & POD — hanya jika delivered */}
                  {order.status === "delivered" && (
                    <div className="border-t pt-3 flex flex-wrap justify-end gap-2">
                      {/* Tombol Bukti Serah Terima Fisik (POD) */}
                      {(order.pod_image_url || order.tracking?.some((t) => t.pod_image_url)) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-emerald-400 text-emerald-700 hover:bg-emerald-50 font-semibold"
                          onClick={() => setPodViewOrder(order)}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Bukti Serah Terima (POD)
                        </Button>
                      )}

                      {/* Rating Driver */}
                      {order.logistic_id && (
                        ratedOrders.has(order.id) ? (
                          <span className="text-xs text-yellow-600 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Driver sudah dirating
                          </span>
                        ) : (
                          <Button size="sm" variant="outline"
                            className="text-xs border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                            onClick={() => setRatingOrder(order)}>
                            <Star className="w-3 h-3 mr-1" /> Rating Driver
                          </Button>
                        )
                      )}
                      {/* Rating Supplier */}
                      {order.supplier_name && (
                        ratedSupplierOrders.has(order.id) ? (
                          <span className="text-xs text-orange-600 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-orange-400 text-orange-400" /> Supplier sudah dirating
                          </span>
                        ) : (
                          <Button size="sm" variant="outline"
                            className="text-xs border-orange-400 text-orange-600 hover:bg-orange-50"
                            onClick={() => setRatingSupplierOrder(order)}>
                            <Star className="w-3 h-3 mr-1" /> Rating Supplier
                          </Button>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {ratingOrder && (
        <RatingDriverModal
          open={!!ratingOrder}
          order={ratingOrder}
          mitraProfile={profile}
          onClose={() => setRatingOrder(null)}
          onSuccess={() => setRatedOrders(prev => new Set([...prev, ratingOrder.id]))}
        />
      )}
      {ratingSupplierOrder && (
        <RatingSupplierModal
          open={!!ratingSupplierOrder}
          order={ratingSupplierOrder}
          sppgProfile={profile}
          onClose={() => setRatingSupplierOrder(null)}
          onSuccess={() => setRatedSupplierOrders(prev => new Set([...prev, ratingSupplierOrder.id]))}
        />
      )}
      {podViewOrder && (
        <PodViewModal
          open={!!podViewOrder}
          delivery={podViewOrder}
          onClose={() => setPodViewOrder(null)}
        />
      )}
      <style>{` .no-scrollbar::-webkit-scrollbar{display:none} .no-scrollbar{scrollbar-width:none} `}</style>
    </div>
  );
}