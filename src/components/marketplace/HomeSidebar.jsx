import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { LineChart, Users, BarChart3, BookOpen, Bell, Smartphone, ReceiptText, ShieldPlus } from "lucide-react";

export const DIGITAL_MENU = [
  { icon: Smartphone, title: "Beli Pulsa", desc: "Isi pulsa semua operator", path: "/pulsa" },
  { icon: ReceiptText, title: "Bayar Tagihan", desc: "Listrik, air, internet & lainnya", path: "/tagihan" },
  { icon: ShieldPlus, title: "Premi BPJS", desc: "Bayar premi BPJS Kesehatan", path: "/bpjs" },
];

export const FEATURES = [
  { icon: LineChart, title: "Monitoring Rantai Pasok", desc: "Pantau alur distribusi real-time", path: "/admin/supply-chain", requiresAuth: true },
  { icon: Users, title: "Manajemen Supplier", desc: "Kelola supplier terverifikasi", path: "/admin/suppliers", requiresAuth: true },
  { icon: BarChart3, title: "Analisis & Laporan", desc: "Insight harga & stok", path: "/admin/financial", requiresAuth: true },
  { icon: BookOpen, title: "Knowledge Center", desc: "Panduan & regulasi MBG", path: "/knowledge-center", requiresAuth: false },
  { icon: Bell, title: "Notifikasi & Informasi", desc: "Update stok & pesanan", path: "/admin/notifications", requiresAuth: true },
];

export default function HomeSidebar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleDigital = (path) => {
    if (!isAuthenticated) {
      localStorage.setItem("smartmbg_intended", path);
    }
    navigate(path);
  };

  return (
    <aside className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900">Login ke Smart MBG</h3>
          <p className="text-xs text-gray-500 mt-1">
            Akses fitur lengkap untuk mengelola rantai pasok MBG Anda.
          </p>
          <button
            onClick={() => navigate("/portal")}
            className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            Login
          </button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Belum punya akun?{" "}
            <span
              onClick={() => navigate("/register/mitra")}
              className="text-emerald-600 font-medium cursor-pointer"
            >
              Daftar di sini
            </span>
          </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Layanan Digital</h3>
        <p className="text-xs text-gray-500 mb-3">Pulsa & tagihan butuh login terlebih dahulu.</p>
        <div className="space-y-2">
          {DIGITAL_MENU.map((item) => (
            <button
              key={item.path}
              onClick={() => handleDigital(item.path)}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                <item.icon className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 truncate">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
