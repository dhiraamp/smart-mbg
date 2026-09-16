import React from "react";
import { ShoppingCart, User, ChevronRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const categories = [
  { id: "all", label: "Semua", emoji: "🛒" },
  { id: "sayuran", label: "Sayuran", emoji: "🥬" },
  { id: "buah", label: "Buah", emoji: "🍎" },
  { id: "daging", label: "Daging", emoji: "🥩" },
  { id: "ikan", label: "Ikan", emoji: "🐟" },
  { id: "beras", label: "Beras", emoji: "🍚" },
  { id: "telur", label: "Telur", emoji: "🥚" },
  { id: "bumbu", label: "Bumbu", emoji: "🧄" },
  { id: "susu", label: "Susu", emoji: "🥛" },
  { id: "minyak", label: "Minyak", emoji: "🫒" },
  { id: "tepung", label: "Tepung", emoji: "🌾" },
  { id: "lainnya", label: "Lainnya", emoji: "📦" },
];

export default function SearchHeader({ query, setQuery, activeCategory, setActiveCategory, cartCount }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("smartmbg_role");
    localStorage.removeItem("smartmbg_login_email");
    localStorage.removeItem("smart_mbg_role");
    localStorage.removeItem("smart_mbg_user");
    base44.auth.logout("/portal");
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
      {/* Top bar */}
      <div className="max-w-full mx-auto px-3 py-2 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="text-white font-bold text-lg tracking-tight whitespace-nowrap hidden sm:block"
        >
          SMART<span className="text-blue-100">MBG</span>
        </button>

        <button
          onClick={() => navigate("/portal")}
          className="relative text-white hover:bg-white/10 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          title="Masuk ke Portal"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate("/portal")}
          className="text-white hover:bg-white/10 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors text-sm font-medium"
        >
          <User className="w-5 h-5" />
          <span className="hidden sm:inline">Masuk</span>
        </button>
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="text-white hover:bg-white/10 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        )}
      </div>

      {/* Category strip */}
      <div className="max-w-full mx-auto px-3 pb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
              activeCategory === c.id
                ? "bg-white text-blue-600 shadow-sm"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            <span>{c.emoji}</span> {c.label}
          </button>
        ))}
      </div>

      {/* Breadcrumb */}
      <div className="bg-white/10 border-t border-white/10">
        <div className="max-w-full mx-auto px-3 py-1.5 flex items-center gap-1 text-[11px] text-white/80">
          <span>Marketplace</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white font-medium">
            {categories.find((c) => c.id === activeCategory)?.label || "Semua"}
          </span>
        </div>
      </div>
    </header>
  );
}