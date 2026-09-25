// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  Store,
  Users,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  Award,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getDashboardPath } from "@/lib/rolePaths";
import { toast } from "sonner";

const DRP_LOGO_URL = "/images/logo-drp.jpeg";

const ROLES = [
  {
    id: "mitra",
    label: "Mitra Dapur SPPG",
    shortLabel: "Dapur SPPG",
    icon: Store,
    color: "from-emerald-500 to-teal-600",
    borderActive: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50",
    desc: "Pengelola Dapur Satuan Pelayanan MBG (624 Dapur Garut)",
    defaultEmail: "mitra.garut@smartmbg.id",
  },
  {
    id: "supplier",
    label: "Supplier Bahan Pangan",
    shortLabel: "Supplier",
    icon: Users,
    color: "from-amber-500 to-orange-600",
    borderActive: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50",
    desc: "Pemasok Beras, Sayur, Daging & Telur Lokal Garut",
    defaultEmail: "supplier.pangan@smartmbg.id",
  },
  {
    id: "logistik",
    label: "Logistik & Armada MBG",
    shortLabel: "Logistik",
    icon: Truck,
    color: "from-blue-500 to-indigo-600",
    borderActive: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50",
    desc: "Kurir Distribusi & Monitoring Suhu Makanan Hangat",
    defaultEmail: "logistik.armada@smartmbg.id",
  },
  {
    id: "penerima",
    label: "Sekolah & Warga",
    shortLabel: "Warga",
    icon: ShieldCheck,
    color: "from-green-500 to-emerald-600",
    borderActive: "border-green-500 ring-2 ring-green-500/20 bg-green-50/50",
    desc: "Penerima Sasaran MBG, Guru Piket & Monitoring Menu",
    defaultEmail: "warga.garut@smartmbg.id",
  },
  {
    id: "admin",
    label: "Administrator BGN",
    shortLabel: "Admin",
    icon: Award,
    color: "from-purple-500 to-indigo-600",
    borderActive: "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/50",
    desc: "Pengawas Ekosistem Disperindag Garut & Tim BGN Pusat",
    defaultEmail: "admin.mbg@garutkab.go.id",
  },
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

  const currentRole = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  useEffect(() => {
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
          description: `Selamat datang di Smart MBG, masuk sebagai ${currentRole.label}.`,
        });
        navigate(getDashboardPath(userRole), { replace: true });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Email atau kata sandi tidak cocok. Silakan periksa kembali.";
      setLoginError(msg);
      toast.error("Gagal Masuk", { description: msg, duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutCurrentSession = () => {
    base44.auth.logout();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-foreground flex flex-col justify-between relative overflow-hidden">
      {/* Background Decor Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="relative z-20 w-full border-b border-white/10 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={DRP_LOGO_URL}
            alt="PT. Duta Realtindo Perkasa"
            className="h-9 w-auto object-contain bg-white rounded-lg px-2 py-0.5 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">SMART MBG</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Kabupaten Garut
              </span>
            </div>
            <p className="text-[11px] text-white/60 hidden sm:block">
              Sistem Rantai Pasok Terintegrasi MBG & Disperindag
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/marketplace"
            className="text-xs font-medium text-white/80 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span className="hidden xs:inline">Marketplace</span>
          </Link>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            624 Dapur SPPG Terhubung
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex flex-col justify-center items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Sisi Kiri: Hero Banner Informasi MBG (7 cols on desktop) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Portal Resmi Program Makan Bergizi Gratis
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Membangun Generasi Emas Garut yang Sehat & Cerdas
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Akses terpadu bagi Dapur SPPG, Supplier Bahan Pangan Lokal, Armada Logistik, Sekolah, dan
                Pemerintah Daerah dalam pendistribusian makanan bergizi berstandar BGN.
              </p>
            </motion.div>

            {/* Quick Metrics Bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2"
            >
              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-[11px] text-slate-400 font-medium">Dapur SPPG Tersebar</p>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">624</p>
                <p className="text-[10px] text-emerald-300/80">Di 42 Kecamatan Garut</p>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                <p className="text-[11px] text-slate-400 font-medium">Sekolah Sasaran MBG</p>
                <p className="text-2xl font-black text-teal-400 mt-0.5">1.840+</p>
                <p className="text-[10px] text-teal-300/80">PAUD, SD, SMP & SMA</p>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 backdrop-blur-sm col-span-2 sm:col-span-1">
                <p className="text-[11px] text-slate-400 font-medium">Standar Keamanan</p>
                <p className="text-2xl font-black text-amber-400 mt-0.5">100%</p>
                <p className="text-[10px] text-amber-300/80">Uji Suhu & Gizi BGN</p>
              </div>
            </motion.div>

            {/* Quick Action Links */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 text-xs">
              <Link
                to="/marketplace"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center gap-1.5 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                Buka Pasar Komoditas Pangan
              </Link>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <a
                href="https://mistermbg.disperindag.garutkab.go.id"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 flex items-center gap-1"
              >
                Portal Disperindag Garut <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Sisi Kanan: Kartu Login Responsif Terpadu (6 cols) */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <Card className="border border-white/15 shadow-2xl bg-white/95 text-slate-900 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-5">
                {/* Session Active Alert */}
                {isAuthenticated && user && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold block text-emerald-900">Sesi Login Aktif:</span>
                      <span className="text-slate-600 truncate max-w-[210px] block">
                        {user.email || user.user_email} (<strong className="capitalize">{user.role}</strong>)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogoutCurrentSession}
                      className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-red-700 border border-slate-300 rounded-lg font-medium text-slate-700 shrink-0 transition-colors"
                    >
                      Ganti Akun
                    </button>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Masuk ke Portal</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih peran Anda untuk diarahkan ke dashboard operasional yang sesuai
                  </p>
                </div>

                {/* Role Tiles Selector (Mobile Friendly) */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Pilih Peran Pengguna:
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ROLES.map((role) => {
                      const isSelected = selectedRole === role.id;
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                            isSelected
                              ? role.borderActive
                              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <div
                              className={`w-6 h-6 rounded-md bg-gradient-to-br ${role.color} flex items-center justify-center text-white shrink-0`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-xs leading-snug">{role.shortLabel}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{role.desc.split("(")[0]}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>


                {/* Form Input Email & Password */}
                <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                      Alamat Email Terdaftar
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contoh@smartmbg.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 text-xs rounded-xl border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                        Kata Sandi
                      </Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan kata sandi akun"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 text-xs rounded-xl border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 pl-9 pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-2.5 text-center font-medium">
                      {loginError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    {loading ? "Memverifikasi Akses..." : `Masuk sebagai ${currentRole.shortLabel}`}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>

                {/* Footer Register Link */}
                {selectedRole !== "admin" && (
                  <div className="text-center pt-1 border-t text-xs text-slate-500">
                    Belum memiliki akun {currentRole.shortLabel}?{" "}
                    <button
                      type="button"
                      onClick={() => navigate(`/register/${selectedRole}`)}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Daftar Baru
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer Hak Cipta */}
      <footer className="relative z-10 w-full py-4 px-4 text-center border-t border-white/10 bg-slate-950/40 text-xs text-slate-400">
        <p>
          &copy; 2026 <strong>SMART MBG</strong> &bull; Satuan Pelayanan Program Gizi & Disperindag Kabupaten Garut
        </p>
      </footer>
    </div>
  );
}
