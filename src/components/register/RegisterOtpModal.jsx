import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, RotateCcw, X, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function RegisterOtpModal({
  open,
  phone,
  email,
  loading,
  error,
  simulatedCode,
  cooldownSeconds = 0,
  attemptsRemaining = 3,
  onVerify,
  onResend,
  onClose,
}) {
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(cooldownSeconds || 60);

  useEffect(() => {
    if (!open) {
      setCode("");
      return;
    }
    setCountdown(cooldownSeconds > 0 ? cooldownSeconds : 60);
  }, [open, cooldownSeconds]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  if (!open) return null;

  const canResend = countdown === 0 && attemptsRemaining > 0 && !loading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length !== 6) return;
    onVerify(code);
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(val);
    if (val.length === 6) {
      onVerify(val);
    }
  };

  const handleResendClick = () => {
    if (!canResend) return;
    onResend();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1002] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-emerald-100 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Tutup popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ikon WhatsApp Hijau */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
          <MessageCircle className="w-9 h-9" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> Verifikasi WhatsApp
        </div>

        <h3 className="font-bold text-xl text-gray-900">Masukkan Kode OTP</h3>

        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
          Kode verifikasi 6 digit telah dikirimkan ke nomor WhatsApp:
        </p>

        <div className="my-3 py-2 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold text-emerald-700 tracking-wide">
          {phone || "Nomor WhatsApp Anda"}
        </div>


        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block text-center">
              Kode OTP (6 Digit Angka)
            </Label>
            <Input
              value={code}
              onChange={handleInputChange}
              placeholder="••••••"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              className="h-12 text-center text-2xl font-bold tracking-[0.4em] rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 font-mono"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center font-medium">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Memverifikasi..." : "Verifikasi & Aktifkan Akun"}
            <ShieldCheck className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {attemptsRemaining <= 0 ? (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center leading-relaxed">
            <p className="font-bold">⚠️ Batas Permintaan OTP Tercapai</p>
            <p className="text-[11px] mt-0.5">
              Anda telah meminta OTP 3 kali. Silakan tunggu jendela 5 menit sebelum dapat meminta kode baru lagi.
            </p>
          </div>
        ) : null}

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={handleResendClick}
            disabled={!canResend}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {attemptsRemaining <= 0
              ? "Batas kirim OTP tercapai (Maks. 3x per 5 mnt)"
              : countdown > 0
              ? `Kirim ulang kode dalam (${countdown}s)`
              : `Kirim Ulang Kode via WhatsApp (${attemptsRemaining}x tersisa)`}
          </button>
          {attemptsRemaining > 0 && attemptsRemaining < 3 && countdown === 0 && (
            <span className="text-[11px] text-gray-400">
              Sisa kesempatan kirim ulang: {attemptsRemaining} dari 3 kali
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
