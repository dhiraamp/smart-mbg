import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Menu, LogOut, ChevronRight, Trash2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import BottomTabBar from "@/components/layout/BottomTabBar";
import NotificationBell from "@/components/shared/NotificationBell";
import { base44 } from "@/api/base44Client";

export default function DashboardLayout({ menuItems, title, roleColor }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("smart_mbg_user") || '{"name":"User","role":"mitra"}');

  const handleLogout = () => {
    localStorage.removeItem("smart_mbg_role");
    localStorage.removeItem("smartmbg_role");
    localStorage.removeItem("smartmbg_login_email");
    localStorage.removeItem("smart_mbg_user");
    base44.auth.logout("/portal");
  };

  const handleDeleteAccount = () => {
    // In a real app, call the delete account API here
    localStorage.removeItem("smart_mbg_role");
    localStorage.removeItem("smart_mbg_user");
    navigate("/");
  };

  // Detect role from current path
  const role = location.pathname.split("/")[1] || "mitra";

  // Root tab paths per role (from BottomTabBar config)
  const rootPaths = {
    mitra: ["/mitra/dashboard", "/mitra/orders", "/mitra/reports", "/mitra/menu", "/mitra/products", "/mitra/nutrition", "/mitra/complaints", "/mitra/digital-services", "/mitra/recipients", "/mitra/cart", "/mitra/transactions"],
    supplier: ["/supplier/dashboard", "/supplier/orders", "/supplier/income", "/supplier/complaints", "/supplier/ratings", "/supplier/chat", "/supplier/digital-services", "/supplier/products"],
    logistik: ["/logistik/dashboard", "/logistik/orders", "/logistik/priority", "/logistik/map", "/logistik/reports", "/logistik/chat", "/logistik/digital-services", "/logistik/agent"],
    admin: ["/admin/dashboard", "/admin/stock", "/admin/suppliers", "/admin/mitra", "/admin/logistik", "/admin/financial", "/admin/inflation", "/admin/supply-chain", "/admin/food-report", "/admin/chat-mitra", "/admin/chat-supplier", "/admin/chat-logistik", "/admin/notifications", "/admin/bapokting"],
    penerima: ["/warga/beranda", "/warga/keranjang", "/warga/pesanan", "/warga/profil"],
    warga: ["/warga/beranda", "/warga/keranjang", "/warga/pesanan", "/warga/profil"],
  };
  const isNestedPath = !(rootPaths[role] || []).includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col`}
        style={{ paddingTop: "env(safe-area-inset-top)", paddingLeft: "env(safe-area-inset-left)" }}
      >
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-sm">SMART MBG</h2>
              <p className="text-xs text-sidebar-foreground/60">{title}</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 py-3">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              if (item.separator) return (
                <div key={item.separator} className="pt-4 pb-1 px-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-sidebar-foreground/40">{item.separator}</span>
                </div>
              );
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 min-h-[44px] ${
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-3 border-t border-sidebar-border" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}>
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/50 capitalize">{user.role}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 min-h-[44px]">
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
          {/* Delete Account — iOS App Store requirement */}
          {!showDeleteConfirm ? (
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)}
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs mt-1 min-h-[44px]">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Hapus Akun
            </Button>
          ) : (
            <div className="mt-2 p-2 rounded-lg bg-red-900/20 border border-red-800/40 text-xs">
              <p className="text-red-300 mb-2">Yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="flex-1 text-xs min-h-[36px]">Batal</Button>
                <Button size="sm" onClick={handleDeleteAccount} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs min-h-[36px]">Hapus</Button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen pb-14 md:pb-0">
        <header
          className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b px-4 lg:px-6 h-14 flex items-center gap-4"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {isNestedPath ? (
            <Button variant="ghost" size="icon" className="lg:hidden min-h-[44px] min-w-[44px]" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="lg:hidden min-h-[44px] min-w-[44px]" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold flex-1">{title}</h1>
          {(role === "admin" || role === "logistik") && (
            <div className="bg-sidebar rounded-xl">
              <NotificationBell userRole={role} userEmail={user.email || ""} />
            </div>
          )}
        </header>
        <div className="flex-1 p-4 lg:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar role={role} />
    </div>
  );
}