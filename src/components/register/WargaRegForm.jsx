import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { usePublicRegister } from "@/hooks/usePublicRegister";
import RegisterOtpModal from "@/components/register/RegisterOtpModal";

export default function WargaRegForm({ onSuccess }) {
  const [form, setForm] = useState({
    full_name: "", nik: "", address: "", email: "", password: "", confirm_password: "", phone: ""
  });
  const [loading, setLoading] = useState(false);
  const {
    otpOpen,
    otpPhone,
    otpEmail,
    otpLoading,
    otpError,
    simulatedCode,
    cooldownSeconds,
    attemptsRemaining,
    sendRegister,
    resendOtp,
    verifyOtpAndFinalize,
    closeOtp,
  } = usePublicRegister();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.nik || !form.email || !form.password || !form.phone) {
      toast.error("Error", { description: "Harap isi semua field termasuk No. WhatsApp" });
      return;
    }
    if (!/^\d{16}$/.test(form.nik)) {
      toast.error("NIK Tidak Valid", { description: "NIK harus terdiri dari 16 digit angka" });
      return;
    }
    if (form.password !== form.confirm_password) {
      toast.error("Kata Sandi Tidak Cocok", { description: "Pastikan kata sandi dan konfirmasi sama" });
      return;
    }
    if (form.password.length < 6) {
      toast.error("Error", { description: "Kata sandi minimal 6 karakter" });
      return;
    }
    setLoading(true);
    const profileData = {
      user_email: form.email,
      full_name: form.full_name,
      role: "penerima",
      nik: form.nik,
      phone: form.phone,
      address: form.address,
      is_active: true,
    };
    await sendRegister({
      email: form.email,
      password: form.password,
      phone: form.phone,
      name: form.full_name,
      profileData,
    });
    setLoading(false);
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-black">Nama Lengkap <span className="text-destructive">*</span></Label>
        <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Nama sesuai KTP" required />
      </div>
      <div className="space-y-2">
        <Label className="text-black">NIK <span className="text-destructive">*</span></Label>
        <Input value={form.nik} onChange={(e) => update("nik", e.target.value)} placeholder="16 digit NIK" inputMode="numeric" maxLength={16} required />
      </div>
      <div className="space-y-2">
        <Label className="text-black">Alamat Lengkap</Label>
        <Textarea value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Desa / kelurahan, RT/RW, kecamatan" rows={2} />
      </div>
      <div className="space-y-2">
        <Label className="text-black">Email <span className="text-destructive">*</span></Label>
        <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@contoh.com" required />
        <p className="text-xs text-muted-foreground">Kode OTP akan dikirim ke email ini untuk aktivasi akun</p>
      </div>
      <div className="space-y-2">
        <Label className="text-black">Kata Sandi <span className="text-destructive">*</span></Label>
        <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Minimal 6 karakter" required />
      </div>
      <div className="space-y-2">
        <Label className="text-black">Konfirmasi Kata Sandi <span className="text-destructive">*</span></Label>
        <Input type="password" value={form.confirm_password} onChange={(e) => update("confirm_password", e.target.value)} placeholder="Ulangi kata sandi" required />
      </div>
      <div className="space-y-2">
        <Label className="text-black">No. WhatsApp <span className="text-destructive">*</span></Label>
        <Input
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="08xxxxxxxxxx (untuk kirim OTP WhatsApp)"
          inputMode="tel"
          required
        />
        <p className="text-xs text-muted-foreground">Kode OTP 6 digit akan dikirim ke nomor WhatsApp ini</p>
      </div>
      <p className="text-xs text-muted-foreground bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
        Pendaftaran Anda akan diverifikasi oleh SPPG/Admin sebelum akun aktif.
      </p>
      <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md">
        {loading ? "Mengirim OTP WhatsApp..." : "Daftar Sebagai Warga"}
      </Button>
    </form>

    <RegisterOtpModal
      open={otpOpen}
      phone={otpPhone}
      email={otpEmail}
      loading={otpLoading}
      error={otpError}
      simulatedCode={simulatedCode}
      cooldownSeconds={cooldownSeconds}
      attemptsRemaining={attemptsRemaining}
      onVerify={(enteredCode) => verifyOtpAndFinalize({ enteredCode, onSuccess })}
      onResend={resendOtp}
      onClose={closeOtp}
    />
    </>
  );
}
