import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ReceiptText, CheckCircle2, PlugZap, Droplets, Wifi, Tv } from "lucide-react";
import HomeHeader from "@/components/marketplace/HomeHeader";
import FooterStats from "@/components/marketplace/FooterStats";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PROVIDERS = [
  { icon: PlugZap, name: "PLN" },
  { icon: Droplets, name: "PDAM" },
  { icon: Wifi, name: "Internet" },
  { icon: Tv, name: "TV Berbayar" },
];

export default function Tagihan() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(PROVIDERS[0].name);
  const [billNumber, setBillNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (billNumber.trim().length < 6) {
      toast.error("Masukkan nomor pelanggan yang valid");
      return;
    }
    toast.success(`Pembayaran tagihan ${provider} (${billNumber}) sedang diproses.`);
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
              <ReceiptText className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Bayar Tagihan</h1>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Bayar listrik, air, internet, dan TV berbayar.</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl space-y-5"
        >
          <div>
            <Label className="text-gray-900 font-semibold text-sm mb-1.5 block">Jenis Tagihan</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setProvider(p.name)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm font-medium transition-colors ${
                    provider === p.name
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-600 hover:border-emerald-300"
                  }`}
                >
                  <p.icon className="w-5 h-5" />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billNumber" className="text-gray-900 font-semibold text-sm block">
              Nomor Pelanggan / ID
            </Label>
            <Input
              id="billNumber"
              type="text"
              placeholder="Masukkan nomor pelanggan"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              className="h-11 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Pembayaran tagihan <b>{provider}</b> — nomor {billNumber || "-"}
            </span>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            Bayar Sekarang
          </Button>
        </form>
      </main>

      <FooterStats />
    </div>
  );
}
