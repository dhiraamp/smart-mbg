import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, User } from "lucide-react";

// Maps role prefix to bottom tab routes
const TAB_CONFIG = {
  mitra:    [
    { label: "Dashboard", icon: LayoutDashboard, path: "/mitra/dashboard" },
    { label: "Pesanan",   icon: ShoppingCart,    path: "/mitra/orders" },
    { label: "Profil",    icon: User,            path: "/mitra/reports" },
  ],
  supplier: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/supplier/dashboard" },
    { label: "Pesanan",   icon: ShoppingCart,    path: "/supplier/orders" },
    { label: "Profil",    icon: User,            path: "/supplier/income" },
  ],
  logistik: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/logistik/dashboard" },
    { label: "Pesanan",   icon: ShoppingCart,    path: "/logistik/orders" },
    { label: "Profil",    icon: User,            path: "/logistik/reports" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Stok",      icon: ShoppingCart,    path: "/admin/stock" },
    { label: "Profil",    icon: User,            path: "/admin/suppliers" },
  ],
  penerima: [
    { label: "Beranda",   icon: LayoutDashboard, path: "/warga/beranda" },
    { label: "Pesanan",   icon: ShoppingCart,    path: "/warga/pesanan" },
    { label: "Profil",    icon: User,            path: "/warga/profil" },
  ],
  warga: [
    { label: "Beranda",   icon: LayoutDashboard, path: "/warga/beranda" },
    { label: "Pesanan",   icon: ShoppingCart,    path: "/warga/pesanan" },
    { label: "Profil",    icon: User,            path: "/warga/profil" },
  ],
};

// Paths where the bottom bar should be hidden (deep/modal views)
const HIDDEN_PATHS = [
  "/mitra/cart",
  "/mitra/transactions",
  "/mitra/recipients",
];

// Session-persisted last-visited URL per tab root
function getTabMemoryKey(role) { return `tab_memory_${role}`; }

function loadTabMemory(role) {
  try { return JSON.parse(sessionStorage.getItem(getTabMemoryKey(role)) || "{}"); }
  catch { return {}; }
}

function saveTabMemory(role, tabRoot, path) {
  try {
    const mem = loadTabMemory(role);
    mem[tabRoot] = path;
    sessionStorage.setItem(getTabMemoryKey(role), JSON.stringify(mem));
  } catch { /* ignore */ }
}

export default function BottomTabBar({ role }) {
  const location = useLocation();
  const tabs = TAB_CONFIG[role] || [];
  const prevPathRef = useRef(location.pathname);

  // Save the current path into the memory of whichever tab root owns it
  useEffect(() => {
    if (!tabs.length) return;
    const currentPath = location.pathname;
    // Find the tab whose root path prefix matches the current path
    const owningTab = tabs.find(t => currentPath.startsWith(t.path.split("/").slice(0, 3).join("/")));
    if (owningTab) {
      saveTabMemory(role, owningTab.path, currentPath);
    }
    prevPathRef.current = currentPath;
  }, [location.pathname, role, tabs]);

  if (!tabs.length) return null;
  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  const tabMemory = loadTabMemory(role);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(
          tab.path.split("/").slice(0, 3).join("/")
        );
        // Navigate to last remembered URL for this tab, or its root path
        const destination = tabMemory[tab.path] || tab.path;

        return (
          <Link
            key={tab.path}
            to={destination}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors
              ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            style={{ minHeight: 56 }}
          >
            <tab.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}