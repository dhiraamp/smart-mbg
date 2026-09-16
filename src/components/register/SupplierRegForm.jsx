import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { usePublicRegister } from "@/hooks/usePublicRegister";
import RegisterOtpModal from "@/components/register/RegisterOtpModal";
import { Eye, EyeOff } from "lucide-react";

export default function SupplierRegForm({ onSuccess }) {
  const [form, setForm] = useState({
    type: "", name: "", email: "", phone: "", address: "",
    company_name: "", npwp: "", password: "", confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (!form.email || !form.name || !form.phone) {
      toast.error("Error", { description: "Harap isi semua field termasuk No. WhatsApp" });
      return;
    }
    if (!form.password || form.password.length < 6) {
      toast.error("Error", { description: "Kata sandi minimal 6 karakter" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Konfirmasi Tidak Cocok", { description: "Pastikan kata sandi dan konfirmasi sama" });
      return;
    }
    setLoading(true);
    const profileData = {
      user_email: form.email,
      full_name: form.name,
      role: "supplier",
      organization_name: form.type === "badan" ? form.company_name : form.name,
      phone: form.phone,
      address: form.address,
      is_active: true,
    };
    await sendRegister({
      email: form.email,
      password: form.password,
      phone: form.phone,
      name: form.name,
      profileData,
    });
    setLoading(false);
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-black">Jenis Supplier</Label>
        <Select value={form.type} onValueChange={(v) => update("type", v)}>
          <SelectTrigger><SelectValue placeholder="Pilih jenis supplier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="perorangan">Perorangan</SelectItem>
            <SelectItem value="badan">Badan Usaha</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-black">Nama Lengkap <span className="text-destructive">*</span></Label>
        <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nama lengkap" required />
      </div>
      {form.type === "badan" && (
        <div className="space-y-2">
          <Label className="text-black">Nama Perusahaan / Badan Usaha</Label>
          <Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="PT / CV / UD ..." />
        </div>
      )}
      {form.type === "badan" && (
        <div className="space-y-2">
          <Label className="text-black">NPWP</Label>
          <Input value={form.npwp} onChange={(e) => update("npwp", e.target.value)} placeholder="Nomor NPWP" />
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-black">Email <span className="text-destructive">*</span></Label>
        <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@contoh.com" required />
        <p className="text-xs text-muted-foreground">Kode OTP akan dikirim ke email ini untuk aktivasi akun</p>
      </div>
      <div className="space-y-2">
        <Label className="text-black">Kata Sandi <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Minimal 6 karakter"
            required
          />
          <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-black">Konfirmasi Kata Sandi <span className="text-destructive">*</span></Label>
        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            placeholder="Ulangi kata sandi"
            required
          />
          <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
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
      <div className="space-y-2">
        <Label className="text-black">Alamat</Label>
        <Textarea value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Alamat lengkap" rows={2} />
      </div>
      <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md">
        {loading ? "Mengirim OTP WhatsApp..." : "Daftar Sebagai Supplier"}
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