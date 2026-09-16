import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { usePublicRegister } from "@/hooks/usePublicRegister";
import RegisterOtpModal from "@/components/register/RegisterOtpModal";

export default function LogistikRegForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", sim_number: "", sim_type: "", password: "", confirmPassword: ""
  });
  const [vehicles, setVehicles] = useState([{ plate: "", type: "", capacity: "" }]);
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
      role: "logistik",
      organization_name: form.name,
      phone: form.phone,
      sim_number: form.sim_number,
      sim_type: form.sim_type,
      vehicles: vehicles,
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
  const addVehicle = () => setVehicles(prev => [...prev, { plate: "", type: "", capacity: "" }]);
  const removeVehicle = (i) => setVehicles(prev => prev.filter((_, idx) => idx !== i));
  const updateVehicle = (i, key, val) => {
    const updated = [...vehicles];
    updated[i][key] = val;
    setVehicles(updated);
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-black">Nama Lengkap <span className="text-destructive">*</span></Label>
        <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nama lengkap" required />
      </div>
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-black">No. SIM</Label>
          <Input value={form.sim_number} onChange={(e) => update("sim_number", e.target.value)} placeholder="Nomor SIM" />
        </div>
        <div className="space-y-2">
          <Label className="text-black">Jenis SIM</Label>
          <Select value={form.sim_type} onValueChange={(v) => update("sim_type", v)}>
            <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A">SIM A</SelectItem>
              <SelectItem value="B1">SIM B1</SelectItem>
              <SelectItem value="B2">SIM B2</SelectItem>
              <SelectItem value="C">SIM C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-black text-base font-semibold">Data Kendaraan</Label>
          <Button type="button" variant="outline" size="sm" onClick={addVehicle}>
            <Plus className="w-3 h-3 mr-1" /> Tambah
          </Button>
        </div>
        {vehicles.map((v, i) => (
          <div key={i} className="p-3 border rounded-lg bg-muted/30 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground">Kendaraan {i + 1}</span>
              {vehicles.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeVehicle(i)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="No. Polisi" value={v.plate} onChange={(e) => updateVehicle(i, "plate", e.target.value)} />
              <Select value={v.type} onValueChange={(val) => updateVehicle(i, "type", val)}>
                <SelectTrigger><SelectValue placeholder="Jenis" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="motor">Motor</SelectItem>
                  <SelectItem value="mobil_box">Mobil Box</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="truk">Truk</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Kapasitas (kg)" value={v.capacity} onChange={(e) => updateVehicle(i, "capacity", e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md">
        {loading ? "Mengirim OTP WhatsApp..." : "Daftar Sebagai Logistik"}
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