import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Thermometer } from "lucide-react";

const priorityOrders = [
  { id: "ORD-P01", items: "Ikan Nila Segar 20kg, Daging Ayam 15kg", mitra: "SPPG Garut Kota", perishable: "cepat_busuk", priority: "urgent", distance: "5 km", eta: "1 jam" },
  { id: "ORD-P02", items: "Bayam Segar 10kg, Tomat 8kg", mitra: "SPPG Tarogong", perishable: "cepat_busuk", priority: "urgent", distance: "12 km", eta: "2 jam" },
  { id: "ORD-P03", items: "Telur Ayam 30kg, Tahu 20kg", mitra: "SPPG Leles", perishable: "sedang", priority: "normal", distance: "18 km", eta: "3 jam" },
  { id: "ORD-P04", items: "Beras Premium 50kg", mitra: "SPPG Bayongbong", perishable: "tahan_lama", priority: "low", distance: "25 km", eta: "5 jam" },
  { id: "ORD-P05", items: "Susu Segar 10 liter, Yogurt 5kg", mitra: "SPPG Cibatu", perishable: "cepat_busuk", priority: "urgent", distance: "30 km", eta: "4 jam" },
];

const priorityConfig = {
  urgent: { label: "URGENT", color: "bg-red-100 text-red-800 border-red-300", icon: "🔴" },
  normal: { label: "Normal", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: "🟡" },
  low: { label: "Rendah", color: "bg-green-50 text-green-700 border-green-200", icon: "🟢" },
};

const perishableConfig = {
  cepat_busuk: { label: "Cepat Busuk", color: "bg-red-50 text-red-700" },
  sedang: { label: "Sedang", color: "bg-yellow-50 text-yellow-700" },
  tahan_lama: { label: "Tahan Lama", color: "bg-green-50 text-green-700" },
};

export default function LogistikPriority() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Prioritas Pesanan</h2>
        <p className="text-muted-foreground">Pendahuluan pesanan berdasarkan tingkat kerentanan bahan pangan</p>
      </div>

      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700 font-medium">Terdapat {priorityOrders.filter(o => o.priority === "urgent").length} pesanan URGENT yang harus didahulukan karena mengandung bahan mudah busuk!</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {priorityOrders.map((order) => (
          <Card key={order.id} className={order.priority === "urgent" ? "border-red-200 shadow-md" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg">{order.id}</span>
                    <Badge variant="outline" className={priorityConfig[order.priority].color}>
                      {priorityConfig[order.priority].icon} {priorityConfig[order.priority].label}
                    </Badge>
                    <Badge variant="outline" className={perishableConfig[order.perishable].color}>
                      <Thermometer className="w-3 h-3 mr-1" />{perishableConfig[order.perishable].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{order.mitra}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> ETA: {order.eta}</p>
                  <p className="text-xs text-muted-foreground">Jarak: {order.distance}</p>
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium">{order.items}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}