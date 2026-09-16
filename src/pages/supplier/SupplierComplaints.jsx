import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { AlertTriangle } from "lucide-react";

const complaints = [
  { id: 1, from: "SPPG Garut Kota", title: "Kualitas Bayam Kurang Segar", desc: "Bayam yang dikirim sudah layu dan tidak segar, mohon perbaikan.", date: "07 Apr 2026", status: "open" },
  { id: 2, from: "SPPG Tarogong", title: "Jumlah Tidak Sesuai Pesanan", desc: "Beras yang diterima kurang 5kg dari yang dipesan.", date: "05 Apr 2026", status: "in_progress" },
  { id: 3, from: "SPPG Leles", title: "Pengiriman Terlambat", desc: "Pesanan dikirim 1 hari lebih lambat dari jadwal.", date: "03 Apr 2026", status: "resolved" },
];

const statusColors = { open: "bg-red-50 text-red-700", in_progress: "bg-yellow-50 text-yellow-700", resolved: "bg-green-50 text-green-700" };
const statusLabels = { open: "Baru", in_progress: "Ditanggapi", resolved: "Selesai" };

export default function SupplierComplaints() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notifikasi Pengaduan</h2>
        <p className="text-muted-foreground">Pengaduan dari mitra yang perlu ditanggapi</p>
      </div>
      <div className="space-y-4">
        {complaints.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <h3 className="font-semibold">{c.title}</h3>
                    <Badge variant="outline" className={statusColors[c.status]}>{statusLabels[c.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1">Dari: {c.from} · {c.date}</p>
                </div>
              </div>
              {c.status === "open" && (
                <div className="space-y-2">
                  <Textarea placeholder="Tulis tanggapan Anda..." rows={2} />
                  <Button onClick={() => toast({ title: "Terkirim", description: "Tanggapan berhasil dikirim" })} size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">Kirim Tanggapan</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}