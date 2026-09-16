import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, ShoppingCart, Package, User, Sprout } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/hooks/useCart";

const NAV = [
  { label: "Beranda", path: "/warga/beranda", icon: Home },
  { label: "Keranjang", path: "/warga/keranjang", icon: ShoppingCart, badge: true },
  { label: "Pesanan", path: "/warga/pesanan", icon: Package },
  { label: "Profil", path: "/warga/profil", icon: User },
];

export default function WargaLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem("smartmbg_login_email") || "";
  const wargaUser = { email, id: user?.id || email, role: "penerima" };
  const { totalItems } = useCart(wargaUser);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop top nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/warga/beranda")}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold text-gray-900">Smart MBG</p>
              <p className="text-[10px] text-gray-500">Belanja Warga</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.badge && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => navigate("/")}
            title="Kembali ke Marketplace Publik"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                isActive ? "text-emerald-600" : "text-gray-400"
              }`
            }
          >
            <span className="relative">
              <item.icon className={`w-5 h-5 ${item.badge && totalItems > 0 ? "" : ""}`} />
              {item.badge && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
