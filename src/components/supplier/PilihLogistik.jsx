import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { notifyRoles } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Truck, MapPin, Phone, CheckCircle2 } from "lucide-react";

const vehicleLabels = {
  motor: "🏍️ Motor",
  mobil_pickup: "🛻 Mobil Pickup",
  mobil_box: "📦 Mobil Box",
  truk: "🚛 Truk",
};
import { toast } from "@/components/ui/use-toast";
import { deductOrderStock } from "@/lib/stockManager";

// Hitung jarak (km) dari dua koordinat (Haversine)
function hitungJarak(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

export default function PilihLogistik({ order, supplierProfile, open, onClose, onAssigned }) {
  const [logistikList, setLogistikList] = useState([]);
  const [sppgProfile, setSppgProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    // Ambil profil SPPG (mitra) berdasarkan mitra_id dari order
    const fetchSppg = order?.mitra_id
      ? base44.entities.UserProfile.filter({ user_email: order.mitra_id }).then(d => d[0] || null)
      : Promise.resolve(null);

    Promise.all([
      base44.entities.UserProfile.filter({ role: "logistik" }),
      fetchSppg,
    ]).then(([allLogistik, sppg]) => {
      const data = allLogistik.filter(l => l.is_ready === true || l.is_ready === "true" || l.is_ready === 1);
      setSppgProfile(sppg);

      // Hitung rata-rata jarak ke supplier + ke SPPG
      const withJarak = data.map((l) => {
        const jarakKeSupplier = hitungJarak(
          supplierProfile?.latitude, supplierProfile?.longitude,
          l.latitude, l.longitude
        );
        const jarakKeSppg = sppg
          ? hitungJarak(sppg.latitude, sppg.longitude, l.latitude, l.longitude)
          : null;

        let jarakTotal = null;
        if (jarakKeSupplier !== null && jarakKeSppg !== null) {
          jarakTotal = ((parseFloat(jarakKeSupplier) + parseFloat(jarakKeSppg)) / 2).toFixed(1);
        } else if (jarakKeSupplier !== null) {
          jarakTotal = jarakKeSupplier;
        } else if (jarakKeSppg !== null) {
          jarakTotal = jarakKeSppg;
        }

        return { ...l, jarak: jarakTotal, jarakKeSupplier, jarakKeSppg };
      });

      withJarak.sort((a, b) => {
        if (a.jarak === null) return 1;
        if (b.jarak === null) return -1;
        return parseFloat(a.jarak) - parseFloat(b.jarak);
      });

      setLogistikList(withJarak);
      setLoading(false);
    });
  }, [open]);

  const handlePilih = async (logistik) => {
    setAssigning(logistik.user_email);
    await deductOrderStock(order);
    await base44.entities.Order.update(order.id, {
      logistic_id: logistik.user_email,
      logistic_name: logistik.full_name || logistik.organization_name,
      driver: logistik.full_name || logistik.organization_name,
      status: "shipping",
    });
    await notifyRoles(["logistik"], {
      type: "order_update",
      title: "Pesanan Siap Diantar",
      message: `${order.order_number} · dari ${order.mitra_name || order.customer_email || "Pelanggan"} · Segera ambil di supplier`,
      ref_id: order.id,
      link: "/logistik/dashboard",
    });
    toast({ title: `Logistik ${logistik.full_name || logistik.organization_name} dipilih untuk mengantar`, duration: 2000 });
    setAssigning(null);
    onAssigned();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Pilih Logistik untuk Order {order?.order_number}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : logistikList.length === 0 ? (
          <div className="text-center py-10">
            <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="font-medium text-muted-foreground">Belum ada logistik yang siap mengantar</p>
            <p className="text-sm text-muted-foreground mt-1">Tunggu hingga kurir menyalakan status siap</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {logistikList.length} kurir siap mengantar
              {(supplierProfile?.latitude || sppgProfile?.latitude) ? " · diurutkan berdasarkan jarak terdekat ke supplier & SPPG" : ""}
            </p>
            {logistikList.map((l, i) => (
              <div
                key={l.id}
                className={`flex items-center justify-between p-3 rounded-xl border gap-3 ${
                  i === 0 ? "border-blue-300 bg-blue-50/50" : "border-border bg-muted/20"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{l.full_name || l.organization_name || l.user_email}</span>
                    {i === 0 && (
                      <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5">Terdekat</Badge>
                    )}
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] px-1.5">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline" /> Siap
                    </Badge>
                    {l.vehicle_type && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] px-1.5">
                        {vehicleLabels[l.vehicle_type] || l.vehicle_type}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {l.jarak !== null && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> ~{l.jarak} km
                        {l.jarakKeSupplier && l.jarakKeSppg && (
                          <span className="text-[10px] ml-0.5 opacity-70">(sup: {l.jarakKeSupplier} · sppg: {l.jarakKeSppg})</span>
                        )}
                      </span>
                    )}
                    {l.area && (
                      <span className="text-xs text-muted-foreground">📍 {l.area}</span>
                    )}
                    {l.phone && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <Phone className="w-3 h-3" /> {l.phone}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                  disabled={assigning === l.user_email}
                  onClick={() => handlePilih(l)}
                >
                  {assigning === l.user_email ? "..." : "Pilih"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}