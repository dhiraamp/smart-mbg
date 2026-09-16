import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, FileText, Clock, CheckCircle, XCircle, Loader2, Building2, Percent, CreditCard } from "lucide-react";

const BJBS_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Bank_BJB_Syariah.png/320px-Bank_BJB_Syariah.png";

const produkPembiayaan = [
  {
    nama: "Pembiayaan Usaha Mikro iB",
    deskripsi: "Pembiayaan untuk usaha mikro dengan plafon hingga Rp 50 juta menggunakan akad Murabahah",
    plafon: "Rp 5 juta – Rp 50 juta",
    tenor: "6 – 36 bulan",
    margin: "1,5% / bulan (flat)",
    syarat: ["KTP & KK", "Surat Keterangan Usaha", "Rekening koran 3 bulan", "NPWP (plafon >Rp 25 juta)"],
    badge: "Murabahah",
    color: "from-green-500 to-green-600",
  },
  {
    nama: "Pembiayaan Modal Kerja iB",
    deskripsi: "Pembiayaan modal kerja untuk pengadaan bahan pangan SPPG MBG menggunakan akad Mudharabah",
    plafon: "Rp 50 juta – Rp 500 juta",
    tenor: "12 – 60 bulan",
    margin: "1,2% / bulan (flat)",
    syarat: ["KTP & KK", "SIUP / NIB", "Laporan Keuangan 2 tahun", "Jaminan aset", "NPWP"],
    badge: "Mudharabah",
    color: "from-blue-500 to-blue-600",
  },
  {
    nama: "Pembiayaan Investasi iB",
    deskripsi: "Pembiayaan untuk pengembangan kapasitas produksi dan infrastruktur supplier MBG",
    plafon: "Rp 500 juta – Rp 5 miliar",
    tenor: "24 – 120 bulan",
    margin: "1,0% / bulan (flat)",
    syarat: ["KTP & KK", "Akta Pendirian Perusahaan", "Laporan Keuangan 3 tahun audited", "Agunan", "NPWP Perusahaan"],
    badge: "Musyarakah",
    color: "from-purple-500 to-purple-600",
  },
];

const pengajuanFiktif = [
  { id: "BJBS-2026-001", produk: "Pembiayaan Usaha Mikro iB", jumlah: "Rp 25.000.000", tenor: "24 bulan", status: "disetujui", tgl: "01 Feb 2026" },
  { id: "BJBS-2026-002", produk: "Pembiayaan Modal Kerja iB", jumlah: "Rp 150.000.000", tenor: "36 bulan", status: "proses", tgl: "15 Mar 2026" },
];

const statusConfig = {
  disetujui: { label: "Disetujui", color: "bg-green-100 text-green-700", icon: CheckCircle },
  proses: { label: "Dalam Proses", color: "bg-yellow-100 text-yellow-700", icon: Loader2 },
  ditolak: { label: "Ditolak", color: "bg-red-100 text-red-700", icon: XCircle },
  menunggu: { label: "Menunggu Verifikasi", color: "bg-blue-100 text-blue-700", icon: Clock },
};

export default function SupplierLoanServices() {
  const [nominal, setNominal] = useState("");
  const [tenor, setTenor] = useState("12");
  const [margin, setMargin] = useState("1.5");
  const [hasil, setHasil] = useState(null);

  const [form, setForm] = useState({ nama: "", nik: "", usaha: "", jumlah: "", produk: "", tenor: "", tujuan: "" });
  const [submitted, setSubmitted] = useState(false);

  const hitung = () => {
    const n = parseFloat(nominal.replace(/\./g, "").replace(",", "."));
    const t = parseInt(tenor);
    const m = parseFloat(margin) / 100;
    if (!n || !t || !m) return;
    const cicilan = n * (1 + m * t) / t;
    const total = cicilan * t;
    const totalMargin = total - n;
    setHasil({ cicilan, total, totalMargin, n });
  };

  const formatRp = (val) => "Rp " + Math.round(val).toLocaleString("id-ID");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Layanan Pembiayaan Modal</h2>
          <p className="text-muted-foreground">Bermitra dengan Bank BJB Syariah untuk pembiayaan usaha Anda</p>
        </div>
        <div className="ml-auto">
          <div className="bg-white border rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <Building2 className="w-5 h-5 text-blue-700" />
            <div>
              <p className="text-xs text-muted-foreground">Mitra Resmi</p>
              <p className="text-sm font-bold text-blue-800">BJB Syariah</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="produk">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="produk" className="text-xs">Produk Pembiayaan</TabsTrigger>
          <TabsTrigger value="kalkulator" className="text-xs">Kalkulator Cicilan</TabsTrigger>
          <TabsTrigger value="pengajuan" className="text-xs">Ajukan Pinjaman</TabsTrigger>
          <TabsTrigger value="status" className="text-xs">Status Pengajuan</TabsTrigger>
        </TabsList>

        {/* PRODUK PEMBIAYAAN */}
        <TabsContent value="produk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {produkPembiayaan.map((p, i) => (
              <Card key={i} className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${p.color}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm leading-tight">{p.nama}</CardTitle>
                    <Badge className="text-xs shrink-0 bg-blue-100 text-blue-700">{p.badge}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.deskripsi}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground flex items-center gap-1"><CreditCard className="w-3 h-3"/>Plafon</span><span className="font-semibold">{p.plafon}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/>Tenor</span><span className="font-semibold">{p.tenor}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground flex items-center gap-1"><Percent className="w-3 h-3"/>Margin</span><span className="font-semibold text-green-700">{p.margin}</span></div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1">Persyaratan:</p>
                    <ul className="space-y-0.5">
                      {p.syarat.map((s, j) => <li key={j} className="text-xs text-muted-foreground flex items-center gap-1"><span className="w-1 h-1 bg-blue-400 rounded-full shrink-0"/>  {s}</li>)}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 flex items-center gap-4">
              <Building2 className="w-8 h-8 text-blue-700 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-blue-900">Tentang BJB Syariah</p>
                <p className="text-xs text-blue-700">Bank BJB Syariah adalah mitra resmi SMART MBG dalam penyediaan pembiayaan syariah untuk supplier, mitra SPPG, dan pelaku logistik. Semua produk sesuai prinsip syariah Islam dan telah mendapat persetujuan OJK.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KALKULATOR */}
        <TabsContent value="kalkulator">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4"/>Kalkulator Simulasi Cicilan</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nominal Pembiayaan (Rp)</Label>
                  <Input placeholder="Contoh: 50000000" value={nominal} onChange={e => setNominal(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tenor (Bulan)</Label>
                  <Select value={tenor} onValueChange={setTenor}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[6,12,18,24,36,48,60].map(t => <SelectItem key={t} value={String(t)}>{t} Bulan</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Margin Per Bulan (%)</Label>
                  <Select value={margin} onValueChange={setMargin}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.0">1,0% (Pembiayaan Investasi iB)</SelectItem>
                      <SelectItem value="1.2">1,2% (Pembiayaan Modal Kerja iB)</SelectItem>
                      <SelectItem value="1.5">1,5% (Pembiayaan Usaha Mikro iB)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={hitung}>Hitung Cicilan</Button>
              </CardContent>
            </Card>
            {hasil && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader><CardTitle className="text-base text-green-800">Hasil Simulasi</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white rounded-xl p-4 space-y-3 border border-green-200">
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Pokok Pinjaman</span><span className="font-semibold">{formatRp(hasil.n)}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Margin</span><span className="font-semibold text-orange-600">{formatRp(hasil.totalMargin)}</span></div>
                    <div className="border-t pt-2 flex justify-between"><span className="text-sm text-muted-foreground">Total Pembiayaan</span><span className="font-bold">{formatRp(hasil.total)}</span></div>
                  </div>
                  <div className="bg-blue-700 text-white rounded-xl p-4 text-center">
                    <p className="text-xs opacity-80 mb-1">Estimasi Cicilan per Bulan</p>
                    <p className="text-2xl font-bold">{formatRp(hasil.cicilan)}</p>
                    <p className="text-xs opacity-70 mt-1">selama {tenor} bulan</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">*Simulasi ini bersifat indikatif. Nilai final ditentukan oleh pihak BJBS.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* PENGAJUAN */}
        <TabsContent value="pengajuan">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4"/>Form Pengajuan Pembiayaan Modal</CardTitle></CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-700 mb-2">Pengajuan Berhasil Dikirim!</h3>
                  <p className="text-muted-foreground text-sm">Tim BJBS akan menghubungi Anda dalam 2–3 hari kerja untuk verifikasi lebih lanjut.</p>
                  <Badge className="mt-4 bg-blue-100 text-blue-700">No. Pengajuan: BJBS-2026-{String(Math.floor(Math.random()*900)+100)}</Badge>
                  <div className="mt-6"><Button variant="outline" onClick={() => setSubmitted(false)}>Buat Pengajuan Baru</Button></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Lengkap *</Label>
                    <Input required placeholder="Sesuai KTP" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>NIK *</Label>
                    <Input required placeholder="16 digit NIK" value={form.nik} onChange={e => setForm({...form, nik: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Usaha *</Label>
                    <Input required placeholder="Nama usaha supplier" value={form.usaha} onChange={e => setForm({...form, usaha: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Produk Pembiayaan *</Label>
                    <Select value={form.produk} onValueChange={v => setForm({...form, produk: v})}>
                      <SelectTrigger><SelectValue placeholder="Pilih produk..." /></SelectTrigger>
                      <SelectContent>
                        {produkPembiayaan.map((p,i) => <SelectItem key={i} value={p.nama}>{p.nama}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Jumlah Pengajuan (Rp) *</Label>
                    <Input required type="number" placeholder="Nominal yang diajukan" value={form.jumlah} onChange={e => setForm({...form, jumlah: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tenor yang Diinginkan *</Label>
                    <Select value={form.tenor} onValueChange={v => setForm({...form, tenor: v})}>
                      <SelectTrigger><SelectValue placeholder="Pilih tenor..." /></SelectTrigger>
                      <SelectContent>
                        {[6,12,18,24,36,48,60].map(t => <SelectItem key={t} value={String(t)}>{t} Bulan</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Tujuan Penggunaan Dana *</Label>
                    <Input required placeholder="Jelaskan tujuan penggunaan dana pembiayaan" value={form.tujuan} onChange={e => setForm({...form, tujuan: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white">Kirim Pengajuan ke BJBS</Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">Dengan mengirim formulir ini, Anda menyetujui syarat dan ketentuan pembiayaan BJB Syariah</p>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STATUS */}
        <TabsContent value="status">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4"/>Status Pengajuan Pembiayaan</CardTitle></CardHeader>
            <CardContent>
              {pengajuanFiktif.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Belum ada pengajuan pembiayaan.</p>
              ) : (
                <div className="space-y-3">
                  {pengajuanFiktif.map((p, i) => {
                    const sc = statusConfig[p.status];
                    const Icon = sc.icon;
                    return (
                      <div key={i} className="p-4 border rounded-xl flex items-center gap-4">
                        <Icon className={`w-8 h-8 ${p.status === 'disetujui' ? 'text-green-500' : p.status === 'proses' ? 'text-yellow-500 animate-spin' : 'text-red-500'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm">{p.id}</span>
                            <Badge className={`text-xs ${sc.color}`}>{sc.label}</Badge>
                          </div>
                          <p className="text-sm">{p.produk}</p>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Jumlah: <strong>{p.jumlah}</strong></span>
                            <span>Tenor: <strong>{p.tenor}</strong></span>
                            <span>Tgl: {p.tgl}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                <strong>Info:</strong> Untuk informasi lebih lanjut hubungi BJBS Garut: (0262) 241-8000 atau email cs.garut@bjbsyariah.co.id
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}