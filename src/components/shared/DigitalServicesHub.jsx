import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, Zap, Droplets, CheckCircle, CheckCircle2,
  XCircle, Clock, Loader2, Star, FileText, Calculator,
  ArrowRight, Percent, CreditCard
} from "lucide-react";

// ─── BJBS DATA ────────────────────────────────────────────────────────────────
const produkBJBS = [
  {
    nama: "Pembiayaan Usaha Mikro iB",
    desc: "Pembiayaan untuk usaha mikro dengan plafon hingga Rp 50 juta menggunakan akad Murabahah",
    plafon: "Rp 5 juta – Rp 50 juta", tenor: "6 – 36 bulan", margin: "1,5% / bulan",
    badge: "Murabahah", color: "from-green-500 to-green-600",
    syarat: ["KTP & KK", "Surat Keterangan Usaha", "Rekening koran 3 bulan", "NPWP (plafon >Rp 25 juta)"],
  },
  {
    nama: "Pembiayaan Modal Kerja iB",
    desc: "Pembiayaan modal kerja untuk pengadaan bahan pangan SPPG MBG menggunakan akad Mudharabah",
    plafon: "Rp 50 juta – Rp 500 juta", tenor: "12 – 60 bulan", margin: "1,2% / bulan",
    badge: "Mudharabah", color: "from-blue-500 to-blue-600",
    syarat: ["KTP & KK", "SIUP / NIB", "Laporan Keuangan 2 tahun", "Jaminan aset", "NPWP"],
  },
  {
    nama: "Pembiayaan Investasi iB",
    desc: "Pembiayaan pengembangan kapasitas produksi dan infrastruktur supplier MBG",
    plafon: "Rp 500 juta – Rp 5 miliar", tenor: "24 – 120 bulan", margin: "1,0% / bulan",
    badge: "Musyarakah", color: "from-purple-500 to-purple-600",
    syarat: ["Akta Pendirian Perusahaan", "Laporan Keuangan 3 tahun audited", "Agunan", "NPWP Perusahaan"],
  },
];

const riwayatPengajuan = [
  { id: "BJBS-2026-001", produk: "Pembiayaan Usaha Mikro iB", jumlah: "Rp 25.000.000", tenor: "24 bulan", status: "disetujui", tgl: "01 Feb 2026" },
  { id: "BJBS-2026-002", produk: "Pembiayaan Modal Kerja iB", jumlah: "Rp 150.000.000", tenor: "36 bulan", status: "proses", tgl: "15 Mar 2026" },
];

const statusMap = {
  disetujui: { label: "Disetujui", cls: "bg-green-100 text-green-700", Icon: CheckCircle },
  proses: { label: "Dalam Proses", cls: "bg-yellow-100 text-yellow-700", Icon: Loader2 },
  ditolak: { label: "Ditolak", cls: "bg-red-100 text-red-700", Icon: XCircle },
  menunggu: { label: "Menunggu Verifikasi", cls: "bg-blue-100 text-blue-700", Icon: Clock },
};

// ─── BJBS FULL PAGE ───────────────────────────────────────────────────────────
function BJBSPage({ onClose }) {
  const [nominal, setNominal] = useState("");
  const [tenor, setTenor] = useState(24);
  const [marginPct] = useState(0.9);
  const [form, setForm] = useState({ nama: "", nik: "", usaha: "", produk: "", jumlah: "", tenor: "", tujuan: "" });
  const [submitted, setSubmitted] = useState(false);
  const [pengajuanList] = useState(riwayatPengajuan);

  const n = parseFloat(nominal) || 0;
  const cicilan = n > 0 ? n * (1 + (marginPct / 100) * tenor) / tenor : 0;
  const totalMargin = cicilan * tenor - n;
  const totalKewajiban = cicilan * tenor;
  const formatRp = (v) => "Rp " + Math.round(v).toLocaleString("id-ID");

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-5 text-white flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-yellow-400 text-blue-900 text-xs font-bold">MITRA RESMI</Badge>
            <span className="text-xs opacity-80">SMART MBG × BJBS</span>
          </div>
          <h2 className="text-2xl font-bold">Pembiayaan BJBS</h2>
          <p className="text-sm opacity-80 mt-0.5">Bank Jabar Banten Syariah – Solusi Modal Usaha MBG</p>
        </div>
        <div className="text-right">
          <div className="flex gap-0.5 justify-end">
            {[1,2,3,4,5].map(s=><Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400"/>)}
          </div>
          <p className="text-xs opacity-70 mt-1">Layanan Syariah Terpercaya</p>
        </div>
      </div>

      <Tabs defaultValue="produk">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="produk" className="text-xs">Produk Pembiayaan</TabsTrigger>
          <TabsTrigger value="kalkulator" className="text-xs">Kalkulator</TabsTrigger>
          <TabsTrigger value="ajukan" className="text-xs">Ajukan Sekarang</TabsTrigger>
          <TabsTrigger value="status" className="text-xs">Status Pengajuan</TabsTrigger>
        </TabsList>

        {/* PRODUK */}
        <TabsContent value="produk" className="space-y-3">
          {produkBJBS.map((p, i) => (
            <Card key={i} className="overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${p.color}`}/>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-bold text-sm">{p.nama}</p>
                  <Badge className="text-xs bg-blue-100 text-blue-700 shrink-0">{p.badge}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{p.desc}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-xs"><p className="text-muted-foreground flex items-center gap-1"><CreditCard className="w-3 h-3"/>Plafon</p><p className="font-semibold">{p.plafon}</p></div>
                  <div className="text-xs"><p className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/>Tenor</p><p className="font-semibold">{p.tenor}</p></div>
                  <div className="text-xs"><p className="text-muted-foreground flex items-center gap-1"><Percent className="w-3 h-3"/>Margin</p><p className="font-semibold text-green-700">{p.margin}</p></div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1">Persyaratan:</p>
                  <div className="flex flex-wrap gap-1">{p.syarat.map((s,j)=><Badge key={j} variant="outline" className="text-xs">{s}</Badge>)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* KALKULATOR */}
        <TabsContent value="kalkulator" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4"/>Simulasi Angsuran</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Jumlah Pembiayaan (Rp)</Label>
                <Input type="number" placeholder="50000000" value={nominal} onChange={e=>setNominal(e.target.value)} className="text-lg font-mono"/>
              </div>
              <div className="space-y-2">
                <Label>Tenor (bulan)</Label>
                <div className="flex gap-2 flex-wrap">
                  {[6,12,24,36,48,60].map(t=>(
                    <button key={t} onClick={()=>setTenor(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${tenor===t?'bg-blue-700 text-white border-blue-700':'border-gray-200 hover:border-blue-300'}`}>
                      {t} bln
                    </button>
                  ))}
                </div>
              </div>
              {n > 0 && (
                <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-5 text-white">
                  <p className="text-xs opacity-70 text-center mb-1">Estimasi Angsuran per Bulan</p>
                  <p className="text-3xl font-bold text-center mb-3">{formatRp(cicilan)}</p>
                  <p className="text-xs opacity-60 text-center">Selama {tenor} bulan • Margin ±{marginPct}%/bln (simulasi)</p>
                  <div className="mt-4 space-y-1.5 border-t border-white/20 pt-3">
                    <div className="flex justify-between text-sm"><span className="opacity-80">Total Pembiayaan</span><span>{formatRp(n)}</span></div>
                    <div className="flex justify-between text-sm"><span className="opacity-80">Total Margin</span><span>{formatRp(totalMargin)}</span></div>
                    <div className="flex justify-between text-sm font-bold border-t border-white/20 pt-1.5 mt-1.5"><span>Total Kewajiban</span><span>{formatRp(totalKewajiban)}</span></div>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">*Simulasi bersifat indikatif. Nilai final ditentukan BJBS.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PENGAJUAN */}
        <TabsContent value="ajukan">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4"/>Form Pengajuan Pembiayaan</CardTitle></CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3"/>
                  <h3 className="text-lg font-bold text-green-700 mb-1">Pengajuan Terkirim!</h3>
                  <p className="text-sm text-muted-foreground">Tim BJBS akan menghubungi Anda dalam 2–3 hari kerja.</p>
                  <Badge className="mt-3 bg-blue-100 text-blue-700">No: BJBS-2026-{Math.floor(Math.random()*900)+100}</Badge>
                  <div className="mt-5"><Button variant="outline" onClick={()=>setSubmitted(false)}>Pengajuan Baru</Button></div>
                </div>
              ) : (
                <form onSubmit={e=>{e.preventDefault();setSubmitted(true);}} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nama Lengkap *</Label><Input required placeholder="Sesuai KTP" value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})}/></div>
                  <div className="space-y-2"><Label>NIK *</Label><Input required placeholder="16 digit NIK" value={form.nik} onChange={e=>setForm({...form,nik:e.target.value})}/></div>
                  <div className="space-y-2"><Label>Nama Usaha *</Label><Input required placeholder="Nama usaha" value={form.usaha} onChange={e=>setForm({...form,usaha:e.target.value})}/></div>
                  <div className="space-y-2">
                    <Label>Produk Pembiayaan *</Label>
                    <Select value={form.produk} onValueChange={v=>setForm({...form,produk:v})}>
                      <SelectTrigger><SelectValue placeholder="Pilih produk..."/></SelectTrigger>
                      <SelectContent>{produkBJBS.map((p,i)=><SelectItem key={i} value={p.nama}>{p.nama}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Jumlah Pengajuan (Rp) *</Label><Input required type="number" placeholder="Nominal" value={form.jumlah} onChange={e=>setForm({...form,jumlah:e.target.value})}/></div>
                  <div className="space-y-2">
                    <Label>Tenor *</Label>
                    <Select value={form.tenor} onValueChange={v=>setForm({...form,tenor:v})}>
                      <SelectTrigger><SelectValue placeholder="Pilih tenor..."/></SelectTrigger>
                      <SelectContent>{[6,12,18,24,36,48,60].map(t=><SelectItem key={t} value={String(t)}>{t} Bulan</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2"><Label>Tujuan Penggunaan Dana *</Label><Input required placeholder="Jelaskan tujuan penggunaan dana" value={form.tujuan} onChange={e=>setForm({...form,tujuan:e.target.value})}/></div>
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white">Kirim Pengajuan ke BJBS</Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">Dengan mengirim, Anda menyetujui syarat & ketentuan BJB Syariah</p>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STATUS */}
        <TabsContent value="status">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4"/>Status Pengajuan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {pengajuanList.map((p,i)=>{
                const sc = statusMap[p.status];
                const Icon = sc.Icon;
                return (
                  <div key={i} className="border rounded-xl p-4 flex items-center gap-4">
                    <Icon className={`w-7 h-7 shrink-0 ${p.status==='disetujui'?'text-green-500':p.status==='proses'?'text-yellow-500 animate-spin':'text-red-500'}`}/>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5"><span className="font-bold text-sm">{p.id}</span><Badge className={`text-xs ${sc.cls}`}>{sc.label}</Badge></div>
                      <p className="text-sm">{p.produk}</p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Jumlah: <strong>{p.jumlah}</strong></span>
                        <span>Tenor: <strong>{p.tenor}</strong></span>
                        <span>{p.tgl}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                <strong>Info BJBS Garut:</strong> (0262) 241-8000 | cs.garut@bjbsyariah.co.id
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── LAYANAN LAINNYA (Pulsa, Listrik, PDAM) ────────────────────────────────
const otherServices = [
  { id: "pulsa", label: "Pembelian Pulsa", icon: Smartphone, desc: "Isi ulang pulsa & paket data", color: "bg-green-50 text-green-600" },
  { id: "token_listrik", label: "Token Listrik", icon: Zap, desc: "Beli token listrik PLN", color: "bg-yellow-50 text-yellow-600" },
  { id: "pdam", label: "Air PDAM", icon: Droplets, desc: "Bayar tagihan air PDAM", color: "bg-cyan-50 text-cyan-600" },
];

function OtherServiceDialog({ svc, onClose }) {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [meterId, setMeterId] = useState("");
  const [done, setDone] = useState(false);

  if (!svc) return null;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svc.icon className="w-5 h-5 text-primary"/>{svc.label}
          </DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3"/>
            <p className="font-semibold text-green-700">Berhasil Diproses!</p>
            <p className="text-sm text-muted-foreground mt-1">Permintaan {svc.label} sedang diproses.</p>
            <Button className="mt-4" onClick={onClose}>Tutup</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {svc.id === "pulsa" && <div className="space-y-2"><Label>No. Telepon</Label><Input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="08xxxxxxxxxx"/></div>}
            {svc.id === "token_listrik" && <div className="space-y-2"><Label>No. Meter / ID Pelanggan</Label><Input value={meterId} onChange={e=>setMeterId(e.target.value)} placeholder="Nomor meter PLN"/></div>}
            {svc.id === "pdam" && <div className="space-y-2"><Label>ID Pelanggan PDAM</Label><Input value={meterId} onChange={e=>setMeterId(e.target.value)} placeholder="ID pelanggan PDAM"/></div>}
            <div className="space-y-2"><Label>Nominal (Rp)</Label><Input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Masukkan nominal"/></div>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white" onClick={()=>setDone(true)}>Proses Pembayaran</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function DigitalServicesHub() {
  const [showBJBS, setShowBJBS] = useState(false);
  const [selectedOther, setSelectedOther] = useState(null);

  return (
    <div className="space-y-6">
      {/* BJBS Banner Card */}
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200" onClick={()=>setShowBJBS(true)}>
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-yellow-400 text-blue-900 text-xs font-bold">MITRA RESMI</Badge>
              <span className="text-xs opacity-80">SMART MBG × BJBS</span>
            </div>
            <h3 className="text-xl font-bold">Pembiayaan BJBS</h3>
            <p className="text-sm opacity-80">Bank Jabar Banten Syariah – Solusi Modal Usaha MBG</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-0.5">{[1,2,3,4,5].map(s=><Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400"/>)}</div>
            <Button size="sm" className="bg-white text-blue-800 hover:bg-blue-50 font-semibold">
              Lihat Produk <ArrowRight className="w-3 h-3 ml-1"/>
            </Button>
          </div>
        </div>
        <CardContent className="p-4 bg-blue-50">
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div><p className="text-muted-foreground">Plafon hingga</p><p className="font-bold text-blue-800 text-sm">Rp 5 Miliar</p></div>
            <div><p className="text-muted-foreground">Margin mulai</p><p className="font-bold text-green-700 text-sm">1,0%/bulan</p></div>
            <div><p className="text-muted-foreground">Tenor hingga</p><p className="font-bold text-blue-800 text-sm">120 Bulan</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Other Services */}
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">LAYANAN LAINNYA</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {otherServices.map(svc=>(
            <Card key={svc.id} className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border" onClick={()=>setSelectedOther(svc)}>
              <CardContent className="p-5">
                <div className={`w-12 h-12 rounded-xl ${svc.color} flex items-center justify-center mb-3`}>
                  <svc.icon className="w-6 h-6"/>
                </div>
                <h3 className="font-semibold">{svc.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{svc.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* BJBS Full Modal */}
      <Dialog open={showBJBS} onOpenChange={setShowBJBS}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <BJBSPage onClose={()=>setShowBJBS(false)}/>
        </DialogContent>
      </Dialog>

      {/* Other Service Dialog */}
      {selectedOther && <OtherServiceDialog svc={selectedOther} onClose={()=>setSelectedOther(null)}/>}
    </div>
  );
}