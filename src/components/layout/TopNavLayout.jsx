import React, { useState, useMemo, useRef, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Sprout, Menu, X, ChevronDown, LogOut, ShoppingCart } from "lucide-react";
import { logoutUser } from "@/lib/rolePaths";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import NotificationBell from "@/components/shared/NotificationBell";

export default function TopNavLayout({ menuItems = [], title = "Smart MBG" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role;
  const userEmail = user?.email || "";
  const [openGroup, setOpenGroup] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const barRef = useRef(null);

  const isMitra = role === "mitra";

  const groups = useMemo(() => {
    const out = [];
    let current = { label: "", items: [] };
    for (const m of menuItems) {
      if (m.separator) {
        if (current.items.length) out.push(current);
        current = { label: m.separator, items: [] };
      } else if (m.path && m.label) {
        current.items.push(m);
      }
    }
    if (current.items.length) out.push(current);
    return out;
  }, [menuItems]);

  const allItems = groups.flatMap((g) => g.items);
  const homePath = allItems[0]?.path || "/";

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");
  const activeGroup = groups.findIndex((g) => g.items.some((it) => isActive(it.path)));

  useEffect(() => {
    const onDown = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setOpenGroup(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMitra || !userEmail) return;
    const load = async () => {
      const items = await base44.entities.CartItem.filter({ user_email: userEmail });
      setCartCount(items.reduce((s, i) => s + (i.quantity || 1), 0));
    };
    load();
    const unsub = base44.entities.CartItem.subscribe(() => load());
    return unsub;
  }, [isMitra, userEmail]);

  const goHome = () => navigate(homePath);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto h-16 flex items-center gap-3 px-4">
          <button onClick={goHome} className="flex items-center gap-2.5 shrink-0 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm shrink-0">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight text-left hidden sm:block">
              <p className="text-base font-bold text-gray-900 whitespace-nowrap">Smart MBG</p>
              <p className="text-[10px] text-gray-500 whitespace-nowrap">{title}</p>
            </div>
          </button>

          {/* Desktop: category menubar with dropdowns */}
          <nav ref={barRef} className="hidden lg:flex flex-1 min-w-0 items-center gap-1 ml-2">
            {groups.map((g, gi) => {
              const isOpen = openGroup === gi;
              const isActiveGroup = activeGroup === gi;
              return (
                <div
                  key={gi}
                  className="relative"
                  onMouseEnter={() => setOpenGroup(gi)}
                  onMouseLeave={() => setOpenGroup((v) => (v === gi ? null : v))}
                >
                  <button
                    onClick={() => setOpenGroup(isOpen ? null : gi)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActiveGroup ? "text-emerald-700" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="whitespace-nowrap">{g.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 top-full pt-1 z-50">
                      <div className="min-w-[230px] max-w-xs bg-white border border-gray-200 rounded-xl shadow-xl p-2">
                        {g.items.map((it) => (
                          <NavLink
                            key={it.path}
                            to={it.path}
                            className={({ isActive: act }) =>
                              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                act
                                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`
                            }
                          >
                            <it.icon className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="flex-1 truncate">{it.label}</span>
                            {it.badge > 0 && (
                              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                                {it.badge > 99 ? "99+" : it.badge}
                              </span>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile: hamburger + aksi */}
          <div className="ml-auto flex items-center gap-1 lg:hidden">
            {isMitra && (
              <button
                onClick={() => navigate("/mitra/cart")}
                title="Keranjang"
                className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            )}
            <NotificationBell userRole={role} userEmail={userEmail} variant="light" />
            <button
              onClick={() => logoutUser("/portal")}
              title="Keluar"
              className="flex items-center gap-1.5 px-2 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold pl-3 pr-3.5 py-2 rounded-xl transition-colors"
            >
              <Menu className="w-4 h-4" />
              Menu
            </button>
          </div>

          {/* Desktop: cart + bell + logout */}
          <div className="hidden lg:flex shrink-0 items-center gap-1">
            {isMitra && (
              <button
                onClick={() => navigate("/mitra/cart")}
                title="Keranjang"
                className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            )}
            <NotificationBell userRole={role} userEmail={userEmail} variant="light" />
            <button
              onClick={() => logoutUser("/portal")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Mobile: slide-over grouped menu */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-[300px] max-w-[85%] bg-white shadow-xl flex flex-col transition-transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-gray-900 leading-tight">Smart MBG</p>
                <p className="text-[10px] text-gray-500 leading-tight">{title}</p>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {groups.map((g, gi) => (
              <div key={gi} className={gi > 0 ? "mt-3 pt-3 border-t border-gray-100" : ""}>
                <p className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  {g.label}
                </p>
                {g.items.map((it) => (
                  <NavLink
                    key={it.path}
                    to={it.path}
                    className={({ isActive: act }) =>
                      `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        act ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                      }`
                    }
                  >
                    <it.icon className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="flex-1">{it.label}</span>
                    {it.badge > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {it.badge > 99 ? "99+" : it.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </aside>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav (maks. 5) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {allItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive: act }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                act ? "text-emerald-600" : "text-gray-400"
              }`
            }
          >
            <span className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {item.badge > 99 ? "99+" : item.badge}
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