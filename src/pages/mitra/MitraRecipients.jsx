import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { School, Users, MapPin } from "lucide-react";

const initialData = [
  { id: 1, type: "sekolah", name: "SD Negeri 1 Tarogong Kidul", address: "Jl. Patriot No. 1, Tarogong Kidul", recipients: 240, posyandu: false },
  { id: 2, type: "sekolah", name: "SMP Negeri 2 Garut Kota", address: "Jl. Cimanuk No. 100, Garut Kota", recipients: 320, posyandu: false },
  { id: 3, type: "posyandu", name: "Posyandu Melati Tarogong", address: "Kp. Tarogong RT 01/02", recipients: 85, posyandu: true },
  { id: 4, type: "posyandu", name: "Posyandu Mawar Sukagalih", address: "Kel. Sukagalih, Tarogong Kidul", recipients: 72, posyandu: true },
  { id: 5, type: "sekolah", name: "MI Al-Hidayah Cibatu", address: "Ds. Cibatu, Kec. Cibatu", recipients: 180, posyandu: false },
  { id: 6, type: "posyandu", name: "Posyandu Kenanga Leles", address: "Ds. Leles, Kec. Leles, Garut", recipients: 65, posyandu: true },
];

export default function MitraRecipients() {
  const [data] = useState(initialData);
  const [filterType, setFilterType] = useState("all");

  const totalSekolah = data.filter(d => d.type === "sekolah").reduce((a, b) => a + b.recipients, 0);
  const totalPosyandu = data.filter(d => d.type === "posyandu").reduce((a, b) => a + b.recipients, 0);
  const total = totalSekolah + totalPosyandu;

  const filtered = data.filter(d => filterType === "all" || d.type === filterType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Jumlah Penerima Bantuan</h2>
        <p className="text-muted-foreground">Data penerima MBG dari Posyandu & Sekolah mitra SPPG</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-5">
            <Users className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{total.toLocaleString("id-ID")}</p>
            <p className="text-blue-100 text-sm mt-1">Total Penerima Bantuan</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-5">
            <School className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{totalSekolah.toLocaleString("id-ID")}</p>
            <p className="text-green-100 text-sm mt-1">Penerima dari Sekolah</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-5">
            <Users className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{totalPosyandu.toLocaleString("id-ID")}</p>
            <p className="text-purple-100 text-sm mt-1">Penerima dari Posyandu</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        {["all", "sekolah", "posyandu"].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filterType === t ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}>
            {t === "all" ? "Semua" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={item.type === "sekolah" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}>
                      {item.type === "sekolah" ? "Sekolah" : "Posyandu"}
                    </Badge>
                  </div>
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {item.address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{item.recipients}</p>
                  <p className="text-xs text-muted-foreground">penerima</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">Total penerima bantuan MBG tercatat</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


    </div>
  );
}