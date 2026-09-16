import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldPlus, CheckCircle2, HeartPulse } from "lucide-react";
import HomeHeader from "@/components/marketplace/HomeHeader";
import FooterStats from "@/components/marketplace/FooterStats";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CLASSES = [
  { id: "kelas-1", label: "Kelas 1", amount: "150.000" },
  { id: "kelas-2", label: "Kelas 2", amount: "100.000" },
  { id: "kelas-3", label: "Kelas 3", amount: "42.000" },
];

export default function Bpjs() {
  const navigate = useNavigate();
  const [kelas, setKelas] = useState(CLASSES[2].id);
  const [cardNumber, setCardNumber] = useState("");
  const [familyMembers, setFamilyMembers] = useState(1);

  const current = CLASSES.find((c) => c.id === kelas);
  const total = (parseInt(current.amount.replace(/\./g, ""), 10) * familyMembers).toLocaleString("id-ID");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.trim().length < 10) {
      toast.error("Masukkan nomor kartu BPJS yang valid (min. 10 digit)");
      return;
    }
    toast.success(`Pembayaran premi BPJS ${current.label} (${cardNumber}) sedang diproses.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      <main className="max-w-full mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldPlus className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Bayar Premi BPJS</h1>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Bayar iuran BPJS Kesehatan dengan mudah dan cepat.</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl space-y-5"
        >
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm">
            <HeartPulse className="w-4 h-4 shrink-0" />
            <span>Layanan resmi pembayaran premi <b>BPJS Kesehatan</b>.</span>
          </div>

          <div>
            <Label className="text-gray-900 font-semibold text-sm mb-1.5 block">Kelas Perawatan</Label>
            <div className="grid grid-cols-3 gap-2">
              {CLASSES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setKelas(c.id)}
                  className={`flex flex-col items-center gap-0.5 p-3 rounded-lg border text-sm font-medium transition-colors ${
                    kelas === c.id
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-600 hover:border-emerald-300"
                  }`}
                >
                  <span className="font-semibold">{c.label}</span>
                  <span className="text-xs">Rp{c.amount}/bln</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-gray-900 font-semibold text-sm block">
              Nomor Kartu BPJS (NIK)
            </Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="Nomor Kartu BPJS Kesehatan"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="h-11 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="familyMembers" className="text-gray-900 font-semibold text-sm block">
              Jumlah Peserta (Kepala Keluarga + Anggota)
            </Label>
            <Input
              id="familyMembers"
              type="number"
              min="1"
              max="10"
              value={familyMembers}
              onChange={(e) => setFamilyMembers(Number(e.target.value) || 1)}
              className="h-11 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Total pembayaran: <b>Rp{total}</b> — {current.label} × {familyMembers} peserta
            </span>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            Bayar Premi Sekarang
          </Button>
        </form>
      </main>

      <FooterStats />
    </div>
  );
}
