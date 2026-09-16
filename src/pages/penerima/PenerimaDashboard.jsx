import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School, Users, Star, ChefHat, MapPin, CheckCircle, CalendarDays } from "lucide-react";
import PenerimaMenuView from "@/components/penerima/PenerimaMenuView";

const daftarPenerima = [
  { id: 1, nama: "SDN 1 Tarogong", jenis: "sekolah", alamat: "Jl. Raya Tarogong No. 12, Garut", siswa: 320, sppg: "SPPG Tarogong", status: "aktif" },
  { id: 2, nama: "SDN 2 Garut Kota", jenis: "sekolah", alamat: "Jl. Merdeka No. 5, Garut Kota", siswa: 410, sppg: "SPPG Garut Kota", status: "aktif" },
  { id: 3, nama: "Posyandu Melati", jenis: "posyandu", alamat: "Desa Sukajaya, Tarogong Kaler", siswa: 85, sppg: "SPPG Tarogong", status: "aktif" },
  { id: 4, nama: "SDN Leles 1", jenis: "sekolah", alamat: "Jl. Leles Raya No. 3, Leles", siswa: 280, sppg: "SPPG Leles", status: "aktif" },
  { id: 5, nama: "Posyandu Anggrek", jenis: "posyandu", alamat: "Kampung Cikaret, Samarang", siswa: 62, sppg: "SPPG Samarang", status: "aktif" },
  { id: 6, nama: "SDN Samarang 2", jenis: "sekolah", alamat: "Jl. Samarang No. 18, Samarang", siswa: 245, sppg: "SPPG Samarang", status: "aktif" },
  { id: 7, nama: "MI Al-Hidayah", jenis: "sekolah", alamat: "Jl. Pesantren No. 7, Garut Kota", siswa: 195, sppg: "SPPG Garut Kota", status: "aktif" },
  { id: 8, nama: "Posyandu Mawar", jenis: "posyandu", alamat: "Desa Sukagalih, Leles", siswa: 70, sppg: "SPPG Leles", status: "aktif" },
];

const sppgList = ["SPPG Tarogong", "SPPG Garut Kota", "SPPG Leles", "SPPG Samarang"];

const RatingModal = ({ sppg, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [aspek, setAspek] = useState({ rasa: 0, kebersihan: 0, ketepatan: 0, porsi: 0 });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-lg mb-1">Beri Nilai SPPG</h3>
        <p className="text-sm text-muted-foreground mb-4">{sppg}</p>
        
        <div className="text-center mb-4">
          <p className="text-sm font-medium mb-2">Penilaian Keseluruhan</p>
          <div className="flex justify-center gap-1">
            {[1,2,3,4,5].map(s => (
              <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}>
                <Star className={`w-8 h-8 transition-colors ${s <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          {rating > 0 && <p className="text-xs text-muted-foreground mt-1">{["","Sangat Buruk","Buruk","Cukup","Baik","Sangat Baik"][rating]}</p>}
        </div>

        <div className="space-y-3 mb-4">
          {[{key:"rasa",label:"Rasa Makanan"},{key:"kebersihan",label:"Kebersihan"},{key:"ketepatan",label:"Ketepatan Waktu"},{key:"porsi",label:"Kesesuaian Porsi"}].map(a => (
            <div key={a.key} className="flex items-center justify-between">
              <span className="text-sm">{a.label}</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setAspek(prev => ({...prev, [a.key]: s}))}>
                    <Star className={`w-4 h-4 ${s <= aspek[a.key] ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <textarea className="w-full border rounded-lg p-3 text-sm resize-none h-20" placeholder="Komentar atau saran untuk SPPG..." value={komentar} onChange={e => setKomentar(e.target.value)} />
        
        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
          <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => { onSubmit(sppg, rating, komentar); onClose(); }} disabled={rating === 0}>
            Kirim Penilaian
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function PenerimaDashboard() {
  const [ratingModal, setRatingModal] = useState(null);
  const [ratings, setRatings] = useState({});
  const [filter, setFilter] = useState("semua");

  const sekolah = daftarPenerima.filter(d => d.jenis === "sekolah");
  const posyandu = daftarPenerima.filter(d => d.jenis === "posyandu");
  const totalSiswa = daftarPenerima.reduce((s, d) => s + d.siswa, 0);
  const filtered = filter === "semua" ? daftarPenerima : daftarPenerima.filter(d => d.jenis === filter);

  const handleSubmitRating = (sppg, rating, komentar) => {
    setRatings(prev => ({ ...prev, [sppg]: { rating, komentar, tanggal: new Date().toLocaleDateString("id-ID") } }));
  };

  const [liveMenus, setLiveMenus] = useState([]);

  useEffect(() => {
    base44.entities.WeeklyMenu.filter({ status: "published" }, "-created_date", 20).then(data => {
      setLiveMenus(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Warga</h2>
        <p className="text-muted-foreground">Daftar penerima manfaat MBG Kabupaten Garut</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><School className="w-8 h-8 text-blue-500 bg-blue-50 p-2 rounded-lg" /><div><p className="text-xs text-muted-foreground">Total Sekolah</p><p className="text-2xl font-bold">{sekolah.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Users className="w-8 h-8 text-green-500 bg-green-50 p-2 rounded-lg" /><div><p className="text-xs text-muted-foreground">Total Posyandu</p><p className="text-2xl font-bold">{posyandu.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Users className="w-8 h-8 text-purple-500 bg-purple-50 p-2 rounded-lg" /><div><p className="text-xs text-muted-foreground">Total Penerima</p><p className="text-2xl font-bold">{totalSiswa.toLocaleString("id-ID")}</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="daftar">
        <TabsList className="flex-wrap">
          <TabsTrigger value="daftar">Daftar Penerima</TabsTrigger>
          <TabsTrigger value="menu"><CalendarDays className="w-3 h-3 mr-1"/>Menu Mingguan SPPG</TabsTrigger>
          <TabsTrigger value="rating">Nilai SPPG</TabsTrigger>
        </TabsList>

        <TabsContent value="daftar" className="space-y-4">
          <div className="flex gap-2">
            {["semua","sekolah","posyandu"].map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f === "semua" ? "Semua" : f === "sekolah" ? "Sekolah" : "Posyandu"}</Button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(p => (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${p.jenis === 'sekolah' ? 'bg-blue-50' : 'bg-pink-50'}`}>
                      <School className={`w-5 h-5 ${p.jenis === 'sekolah' ? 'text-blue-600' : 'text-pink-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{p.nama}</span>
                        <Badge variant="outline" className={`text-xs ${p.jenis === 'sekolah' ? 'border-blue-300 text-blue-700' : 'border-pink-300 text-pink-700'}`}>{p.jenis}</Badge>
                        <Badge className="text-xs bg-green-100 text-green-700 ml-auto"><CheckCircle className="w-2.5 h-2.5 mr-0.5"/>Aktif</Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-1"><MapPin className="w-3 h-3 text-muted-foreground"/><p className="text-xs text-muted-foreground">{p.alamat}</p></div>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3 text-muted-foreground"/><strong>{p.siswa}</strong> penerima</span>
                        <span className="flex items-center gap-1"><ChefHat className="w-3 h-3 text-muted-foreground"/>{p.sppg}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <PenerimaMenuView menus={liveMenus} />
        </TabsContent>

        <TabsContent value="rating" className="space-y-4">
          <p className="text-sm text-muted-foreground">Berikan penilaian untuk SPPG yang melayani penerima manfaat</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sppgList.map((sppg, i) => {
              const r = ratings[sppg];
              return (
                <Card key={i} className={r ? 'border-yellow-200 bg-yellow-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-orange-50 p-2 rounded-lg"><ChefHat className="w-5 h-5 text-orange-600"/></div>
                      <div><p className="font-semibold text-sm">{sppg}</p><p className="text-xs text-muted-foreground">Dapur MBG</p></div>
                    </div>
                    {r ? (
                      <div>
                        <div className="flex gap-0.5 mb-1">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}/>)}
                          <span className="text-xs text-muted-foreground ml-2">({r.rating}/5)</span>
                        </div>
                        {r.komentar && <p className="text-xs text-muted-foreground italic">"{r.komentar}"</p>}
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Dinilai {r.tanggal}</p>
                        <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => setRatingModal(sppg)}>Ubah Penilaian</Button>
                      </div>
                    ) : (
                      <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => setRatingModal(sppg)}>
                        <Star className="w-3 h-3 mr-1"/>Beri Nilai
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {ratingModal && <RatingModal sppg={ratingModal} onClose={() => setRatingModal(null)} onSubmit={handleSubmitRating} />}
    </div>
  );
}