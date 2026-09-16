import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, Clock } from "lucide-react";

const notifications = [
  { id: 1, type: "low_stock", title: "Stok Ikan Nila Rendah", desc: "Stok tersisa 8 kg, minimum 20 kg. Segera pesan ke Tambak Segar.", time: "2 jam lalu", severity: "high" },
  { id: 2, type: "low_stock", title: "Stok Bayam Segar Rendah", desc: "Stok tersisa 15 ikat, minimum 30 ikat. Hubungi Pak Ade.", time: "3 jam lalu", severity: "high" },
  { id: 3, type: "low_stock", title: "Stok Cabai Merah Rendah", desc: "Stok tersisa 20 kg, minimum 25 kg. Perlu restock.", time: "5 jam lalu", severity: "medium" },
  { id: 4, type: "low_stock", title: "Stok Ayam Potong Rendah", desc: "Stok tersisa 45 kg, minimum 50 kg. Hubungi CV Segar Makmur.", time: "6 jam lalu", severity: "medium" },
  { id: 5, type: "expiring", title: "Susu Segar Mendekati Kadaluarsa", desc: "10 liter susu segar akan kadaluarsa dalam 2 hari.", time: "8 jam lalu", severity: "high" },
  { id: 6, type: "restock", title: "Beras Premium Sudah Direstock", desc: "500 kg beras premium dari UD Tani Jaya telah diterima.", time: "1 hari lalu", severity: "low" },
];

const severityColors = { high: "bg-red-50 text-red-700 border-red-200", medium: "bg-yellow-50 text-yellow-700 border-yellow-200", low: "bg-green-50 text-green-700 border-green-200" };
const typeIcons = { low_stock: AlertTriangle, expiring: Clock, restock: Package };

export default function AdminNotifications() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notifikasi Stok Bahan</h2>
        <p className="text-muted-foreground">Peringatan stok rendah dan informasi restock</p>
      </div>
      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = typeIcons[n.type];
          return (
            <Card key={n.id} className={n.severity === "high" ? "border-red-200" : ""}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${n.severity === "high" ? "bg-red-100 text-red-600" : n.severity === "medium" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{n.title}</h3>
                    <Badge variant="outline" className={severityColors[n.severity]}>
                      {n.severity === "high" ? "Kritis" : n.severity === "medium" ? "Perhatian" : "Info"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}