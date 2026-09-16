// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, Store, Users, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getDashboardPath } from "@/lib/rolePaths";
import { toast } from "sonner";

const DRP_LOGO_URL = "/images/logo-drp.jpeg";

const roles = [
  { id: "mitra", label: "Mitra / SPPG", icon: Store, color: "from-emerald-400 to-emerald-500", desc: "Pengelola dapur / satuan pangan" },
  { id: "supplier", label: "Supplier", icon: Users, color: "from-teal-400 to-teal-500", desc: "Pemasok bahan pangan" },
  { id: "logistik", label: "Logistik", icon: Truck, color: "from-cyan-400 to-cyan-500", desc: "Jasa pengiriman" },
  { id: "penerima", label: "Warga", icon: ShieldCheck, color: "from-green-400 to-green-500", desc: "Masyarakat umum" },
  { id: "admin", label: "Admin", icon: ShieldCheck, color: "from-emerald-500 to-emerald-600", desc: "Pengelola sistem" },
];

export default function Portal() {
  const navigate = useNavigate();
  const { user, isAuthenticated, checkUserAuth } = useAuth();
  const [selectedRole, setSelectedRole] = useState("mitra");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const currentRole = roles.find((r) => r.id === selectedRole);

  useEffect(() => {
    // Hanya redirect otomatis jika memang ada antrean rute spesifik yang hendak dikunjungi
    if (isAuthenticated && user) {
      const intended = localStorage.getItem("smartmbg_intended");
      if (intended && intended !== "/portal" && intended !== "/") {
        localStorage.removeItem("smartmbg_intended");
        navigate(intended, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !email.trim()) {
      toast.error("Validasi Gagal", { description: "Harap masukkan alamat email akun Anda" });
      setLoginError("Harap masukkan alamat email akun Anda");
      return;
    }
    if (!password || !password.trim()) {
      toast.error("Validasi Gagal", { description: "Harap masukkan kata sandi Anda" });
      setLoginError("Harap masukkan kata sandi Anda");
      return;
    }

    setLoading(true);
    try {
      // Validasi kredensial & peran secara ketat
      const loggedUser = await base44.auth.loginViaEmailPassword(email.trim(), password, selectedRole);
      const userRole = loggedUser.role || selectedRole;
      localStorage.setItem("smartmbg_role", userRole);
      localStorage.setItem("smartmbg_login_email", email.trim());
      await checkUserAuth();

      const intended = localStorage.getItem("smartmbg_intended");
      if (intended && intended !== "/portal" && intended !== "/") {
        localStorage.removeItem("smartmbg_intended");
        navigate(intended, { replace: true });
      } else {
        toast.success("Berhasil Masuk!", {
          description: `Selamat datang, masuk sebagai ${currentRole?.label || userRole}.`,
        });
        navigate(getDashboardPath(userRole), { replace: true });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Email atau kata sandi yang Anda masukkan salah. Silakan coba lagi.";
      setLoginError(msg);
      toast.error("Gagal Masuk", { description: msg, duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutCurrentSession = () => {
    base44.auth.logout();
    window.location.reload();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-300/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src={DRP_LOGO_URL}
              alt="PT. Duta Realtindo Perkasa"
              className="h-14 object-contain bg-white rounded-xl px-2 py-1 shadow-sm"
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
            SMART MBG
          </h1>
          <p className="text-white/85 mt-1 text-sm font-medium">
            Sistem Manajemen Rantai Pasok Terintegrasi
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl">
          <CardHeader className="pb-4 pt-6 px-6">
            <p className="text-sm text-gray-500 text-center font-medium">
              Pilih peran Anda untuk masuk ke sistem
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {isAuthenticated && user && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
                <div>
                  <span className="font-semibold block text-emerald-800">Sesi aktif saat ini:</span>
                  <span className="text-gray-700">{user.email || user.user_email} (Peran: <strong className="capitalize">{user.role || "Pengguna"}</strong>)</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogoutCurrentSession}
                  className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-red-700 border border-gray-300 rounded-lg font-medium text-gray-700 shrink-0 transition-colors"
                >
                  Keluar Akun Ini
                </button>
              </div>
            )}

            <div className="mb-6">
              <Label className="text-gray-900 font-semibold text-sm mb-1.5 block">
                Pilih Peran
              </Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full h-12 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${currentRole.color} flex items-center justify-center shrink-0`}>
                      <currentRole.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {currentRole.label}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id} className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center shrink-0`}>
                          <role.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{role.label}</div>
                          <div className="text-xs text-gray-500">{role.desc}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 font-semibold text-sm">
                  Email Akun Terdaftar
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 font-semibold text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                {loading ? "Memeriksa..." : "Masuk"}{" "}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {loginError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-center">
                  {loginError}
                </p>
              )}
            </form>

            {selectedRole !== "admin" && (
              <div className="mt-5 text-center">
                <p className="text-sm text-gray-500">
                  Belum punya akun?{" "}
                  <button
                    onClick={() => navigate(`/register/${selectedRole}`)}
                    className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline transition-colors"
                  >
                    Daftar Sekarang
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <p className="text-center text-white/70 text-xs mt-6">
          &copy; 2026 SMART MBG &mdash; Powered by PT. Duta Realtindo Perkasa
        </p>
      </motion.div>
    </div>
  );
}
