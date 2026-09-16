import React, { useState, useEffect, useRef } from "react";
import { Sprout, ChevronDown, User, UserCircle, LogOut, ShoppingCart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getProfilePath, logoutUser } from "@/lib/rolePaths";
import { base44 } from "@/api/base44Client";

export default function HomeHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);

  const role = localStorage.getItem("smartmbg_role") || "mitra";
  const profilePath = getProfilePath(role);
  const email = user?.email || "";
  const CART_PATH = { penerima: "/warga/keranjang", mitra: "/mitra/cart" };
  const cartPath = CART_PATH[role];
  const isShopper = isAuthenticated && Boolean(cartPath);

  useEffect(() => {
    if (!isShopper) return;
    const loadCart = async () => {
      const items = await base44.entities.CartItem.filter({ user_email: email });
      setCartCount(items.reduce((s, i) => s + (i.quantity || 1), 0));
    };
    loadCart();
    return base44.entities.CartItem.subscribe(loadCart);
  }, [isShopper, email]);

  const NAV = [
    { label: "Beranda", path: "/", match: "/" },
    { label: "Peta GIS", path: "/peta", match: "/peta" },
    { label: "Marketplace", path: "/marketplace", match: "/marketplace" },
    { label: "Knowledge Center", path: "/knowledge-center", match: "/knowledge-center", dropdown: true },
    { label: "Career", path: "/career", match: "/career" },
    { label: "Kontak", path: null, match: null },
  ];

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleNav = (n) => {
    if (n.path) {
      navigate(n.path);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    navigate("/");
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
  };

  const isActive = (n) => {
    if (n.match === "/") return location.pathname === "/";
    return n.match ? location.pathname.startsWith(n.match) : false;
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logoutUser("/portal");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold text-gray-900">Smart MBG</p>
            <p className="text-[10px] text-gray-500 hidden sm:block">
              Integrated Supply Chain Management for MBG Program
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          {NAV.map((n) => (
            <span
              key={n.label}
              onClick={() => handleNav(n)}
              className={
                isActive(n)
                  ? "text-emerald-600 font-semibold underline underline-offset-4 cursor-pointer"
                  : "hover:text-emerald-600 cursor-pointer"
              }
            >
              {n.label}
              {n.dropdown && <ChevronDown className="w-3 h-3 inline ml-0.5" />}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-emerald-600 cursor-pointer">
            <span className="text-base leading-none">🇮🇩</span> ID
            <ChevronDown className="w-3 h-3" />
          </button>

          {isShopper && (
            <button
              onClick={() => navigate(cartPath)}
              className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              title="Keranjang"
              aria-label="Keranjang belanja"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-semibold pl-1.5 pr-3 py-1.5 rounded-full border border-emerald-200 transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  {role === "penerima" ? "W" : role[0]?.toUpperCase() || "U"}
                </span>
                <span className="capitalize hidden sm:block">{role === "penerima" ? "Profil Warga" : "Profil"}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 capitalize">Role: {role === "penerima" ? "Warga" : role}</p>
                    <p className="text-xs text-gray-500">Anda sudah masuk</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); navigate(profilePath); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <UserCircle className="w-4 h-4 text-emerald-600" /> Lihat Profil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/portal")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <User className="w-4 h-4" /> Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
