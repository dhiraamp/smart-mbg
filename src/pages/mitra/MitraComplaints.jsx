import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Plus, MessageSquare } from "lucide-react";

const complaints = [
  { id: 1, title: "Kualitas Bayam Kurang Segar", target: "Supplier A", status: "open", date: "07 Apr 2026", desc: "Bayam yang dikirim sudah layu dan tidak segar." },
  { id: 2, title: "Keterlambatan Pengiriman", target: "Logistik", status: "in_progress", date: "05 Apr 2026", desc: "Pesanan terlambat 2 hari dari jadwal." },
  { id: 3, title: "Jumlah Tidak Sesuai", target: "Supplier B", status: "resolved", date: "01 Apr 2026", desc: "Beras yang diterima kurang 5kg dari pesanan." },
];

const statusColors = { open: "bg-red-50 text-red-700", in_progress: "bg-yellow-50 text-yellow-700", resolved: "bg-green-50 text-green-700", closed: "bg-muted text-muted-foreground" };
const statusLabels = { open: "Dibuka", in_progress: "Diproses", resolved: "Selesai", closed: "Ditutup" };

export default function MitraComplaints() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Pengaduan</h2>
          <p className="text-muted-foreground">Sampaikan keluhan atau masukan Anda</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"><Plus className="w-4 h-4 mr-1" /> Buat Pengaduan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Buat Pengaduan Baru</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2"><Label>Judul</Label><Input placeholder="Judul pengaduan" /></div>
              <div className="space-y-2"><Label>Detail Pengaduan</Label><Textarea placeholder="Jelaskan masalah Anda..." rows={4} /></div>
              <Button onClick={() => { toast({ title: "Terkirim", description: "Pengaduan Anda telah dikirim." }); setOpen(false); }} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white">Kirim Pengaduan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {complaints.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">{c.title}</h3>
                    <Badge variant="outline" className={statusColors[c.status]}>{statusLabels[c.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                  <p className="text-xs text-muted-foreground mt-2">Ditujukan ke: {c.target} · {c.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}