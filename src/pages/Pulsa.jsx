import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Zap, CheckCircle2 } from "lucide-react";
import HomeHeader from "@/components/marketplace/HomeHeader";
import FooterStats from "@/components/marketplace/FooterStats";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const OPERATORS = ["Telkomsel", "Indosat", "XL / Axis", "Tri (3)", "Smartfren"];
const NOMINALS = ["5.000", "10.000", "15.000", "20.000", "25.000", "50.000", "100.000"];

export default function Pulsa() {
  const navigate = useNavigate();
  const [operator, setOperator] = useState(OPERATORS[0]);
  const [phone, setPhone] = useState("");
  const [nominal, setNominal] = useState("10.000");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^08\d{8,11}$/.test(phone.replace(/[\s-]/g, ""))) {
      toast.error("Masukkan nomor HP yang valid (contoh: 081234567890)");
      return;
    }
    toast.success(`Pulsa ${operator} ${nominal} untuk ${phone} sedang diproses.`);
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
              <Smartphone className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Beli Pulsa</h1>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Isi pulsa semua operator dengan mudah dan cepat.</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl space-y-5"
        >
          <div>
            <Label className="text-gray-900 font-semibold text-sm mb-1.5 block">Operator</Label>
            <div className="flex flex-wrap gap-2">
              {OPERATORS.map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setOperator(op)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    operator === op
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-600 hover:border-emerald-300"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-900 font-semibold text-sm block">
              Nomor HP
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div>
            <Label className="text-gray-900 font-semibold text-sm mb-1.5 block">Nominal</Label>
            <div className="flex flex-wrap gap-2">
              {NOMINALS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNominal(n)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors flex items-center gap-1 ${
                    nominal === n
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-600 hover:border-emerald-300"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" /> Rp{n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Total pembayaran: <b>Rp{nominal}</b> untuk {operator} ({phone || "-"})
            </span>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            Beli Sekarang
          </Button>
        </form>
      </main>

      <FooterStats />
    </div>
  );
}
