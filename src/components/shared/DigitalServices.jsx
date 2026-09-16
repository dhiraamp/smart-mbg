import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Banknote, Smartphone, Zap, Droplets, CheckCircle2, FileText, Building2, ArrowRight } from "lucide-react";

const services = [
  { id: "pinjaman_modal", label: "Pinjaman Modal", icon: Banknote, desc: "Ajukan pinjaman modal usaha dengan bank mitra", color: "bg-blue-50 text-blue-600" },
  { id: "pulsa", label: "Pembelian Pulsa", icon: Smartphone, desc: "Isi ulang pulsa & paket data", color: "bg-green-50 text-green-600" },
  { id: "token_listrik", label: "Token Listrik", icon: Zap, desc: "Beli token listrik PLN", color: "bg-yellow-50 text-yellow-600" },
  { id: "pdam", label: "Air PDAM", icon: Droplets, desc: "Bayar tagihan air PDAM", color: "bg-cyan-50 text-cyan-600" },
];

const bankPartners = [
  { name: "Bank BJB", type: "Bank Daerah", limit: "Rp 500 juta", rate: "6%/tahun", tenor: "1-5 tahun", syarat: "KTP, KK, NPWP, SIUP/SKDU, Rekening 3 bulan" },
  { name: "BRI", type: "Bank BUMN", limit: "Rp 1 miliar", rate: "7%/tahun", tenor: "1-7 tahun", syarat: "KTP, NPWP, Laporan Keuangan, Agunan" },
  { name: "BNI", type: "Bank BUMN", limit: "Rp 750 juta", rate: "6.5%/tahun", tenor: "1-5 tahun", syarat: "KTP, NPWP, SIUP, Rekening aktif, Agunan" },
  { name: "Bank Mandiri", type: "Bank BUMN", limit: "Rp 2 miliar", rate: "7.5%/tahun", tenor: "1-10 tahun", syarat: "KTP, NPWP, Laporan Keuangan 2 tahun, Agunan" },
];

const loanSteps = [
  { step: 1, title: "Pengajuan Online", desc: "Isi formulir permohonan pinjaman melalui platform SMART MBG" },
  { step: 2, title: "Verifikasi Dokumen", desc: "Tim bank mitra akan memverifikasi dokumen persyaratan dalam 3-5 hari kerja" },
  { step: 3, title: "Penilaian Kredit", desc: "Bank melakukan analisis kelayakan kredit dan penilaian agunan" },
  { step: 4, title: "Persetujuan Bank", desc: "Bank memberikan keputusan kredit (approval/penolakan) beserta syarat dan ketentuan" },
  { step: 5, title: "Penandatanganan", desc: "Penandatanganan perjanjian kredit dan akad pinjaman" },
  { step: 6, title: "Pencairan Dana", desc: "Dana dicairkan ke rekening yang terdaftar dalam 1-2 hari kerja" },
];

export default function DigitalServices() {
  const [selectedService, setSelectedService] = useState(null);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [meterNo, setMeterNo] = useState("");
  const [custId, setCustId] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const [loanStep, setLoanStep] = useState("info"); // info | bank | form | review

  const handleSubmit = () => {
    toast({ title: "Berhasil", description: `Permintaan ${selectedService?.label} sedang diproses.` });
    setSelectedService(null);
    setAmount(""); setPhone(""); setMeterNo(""); setCustId("");
    setLoanStep("info"); setSelectedBank(null);
  };

  const handleLoanApply = () => {
    if (!selectedBank) return toast({ title: "Pilih Bank", description: "Harap pilih bank mitra terlebih dahulu." });
    setLoanStep("form");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Layanan Digital</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((svc) => (
          <Card key={svc.id} className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border"
            onClick={() => { setSelectedService(svc); setLoanStep("info"); }}>
            <CardContent className="p-5">
              <div className={`w-12 h-12 rounded-xl ${svc.color} flex items-center justify-center mb-3`}>
                <svc.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">{svc.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{svc.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedService} onOpenChange={(o) => { if (!o) { setSelectedService(null); setLoanStep("info"); setSelectedBank(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedService && <selectedService.icon className="w-5 h-5 text-primary" />}
              {selectedService?.label}
            </DialogTitle>
          </DialogHeader>

          {selectedService?.id === "pinjaman_modal" ? (
            <div className="space-y-4">
              {loanStep === "info" && (
                <>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Regulasi & Persyaratan Umum
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li>Pemohon merupakan anggota aktif SMART MBG (Supplier/Mitra/Logistik)</li>
                      <li>Memiliki usaha yang telah berjalan minimal 1 tahun</li>
                      <li>Tidak memiliki kredit macet di bank manapun (BI Checking)</li>
                      <li>Bersedia menyerahkan dokumen agunan apabila diperlukan</li>
                      <li>Pinjaman digunakan untuk keperluan modal usaha pangan</li>
                      <li>Wajib melaporkan perkembangan usaha setiap 3 bulan</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Alur Proses Pinjaman</h4>
                    <div className="space-y-2">
                      {loanSteps.map((s) => (
                        <div key={s.step} className="flex gap-3 items-start">
                          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{s.step}</div>
                          <div>
                            <p className="font-medium text-sm">{s.title}</p>
                            <p className="text-xs text-muted-foreground">{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white" onClick={() => setLoanStep("bank")}>
                    Pilih Bank Mitra <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}

              {loanStep === "bank" && (
                <>
                  <h4 className="font-semibold">Pilih Bank Mitra</h4>
                  <div className="space-y-3">
                    {bankPartners.map((bank, i) => (
                      <div key={i} onClick={() => setSelectedBank(bank)}
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${selectedBank?.name === bank.name ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{bank.name}</p>
                            <Badge variant="outline" className="text-xs mt-1">{bank.type}</Badge>
                          </div>
                          {selectedBank?.name === bank.name && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                          <div><p className="text-muted-foreground">Limit Pinjaman</p><p className="font-semibold">{bank.limit}</p></div>
                          <div><p className="text-muted-foreground">Suku Bunga</p><p className="font-semibold">{bank.rate}</p></div>
                          <div><p className="text-muted-foreground">Tenor</p><p className="font-semibold">{bank.tenor}</p></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2"><span className="font-medium">Syarat: </span>{bank.syarat}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setLoanStep("info")}>Kembali</Button>
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white" onClick={handleLoanApply}>
                      Ajukan Pinjaman <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </>
              )}

              {loanStep === "form" && (
                <>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-green-700 font-medium">Bank dipilih: {selectedBank?.name}</p>
                    <p className="text-xs text-green-600">Limit: {selectedBank?.limit} | Bunga: {selectedBank?.rate}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>Nominal Pinjaman (Rp)</Label>
                      <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Nominal pinjaman" />
                    </div>
                    <div className="space-y-1">
                      <Label>Tujuan Penggunaan Dana</Label>
                      <Input placeholder="Contoh: Pembelian stok bahan pangan" />
                    </div>
                    <div className="space-y-1">
                      <Label>No. KTP</Label>
                      <Input placeholder="Nomor KTP" />
                    </div>
                    <div className="space-y-1">
                      <Label>No. NPWP (opsional)</Label>
                      <Input placeholder="Nomor NPWP" />
                    </div>
                    <p className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded-lg">
                      ⚠️ Dengan mengajukan pinjaman, Anda menyetujui proses verifikasi oleh pihak bank dan bersedia mengikuti ketentuan yang berlaku.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setLoanStep("bank")}>Kembali</Button>
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white" onClick={handleSubmit}>
                      Kirim Pengajuan
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {selectedService?.id === "pulsa" && (
                <div className="space-y-2">
                  <Label>No. Telepon</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
                </div>
              )}
              {selectedService?.id === "token_listrik" && (
                <div className="space-y-2">
                  <Label>No. Meter / ID Pelanggan</Label>
                  <Input value={meterNo} onChange={(e) => setMeterNo(e.target.value)} placeholder="Nomor meter" />
                </div>
              )}
              {selectedService?.id === "pdam" && (
                <div className="space-y-2">
                  <Label>ID Pelanggan PDAM</Label>
                  <Input value={custId} onChange={(e) => setCustId(e.target.value)} placeholder="ID pelanggan" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Nominal (Rp)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Masukkan nominal" />
              </div>
              <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                Proses Pembayaran
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}