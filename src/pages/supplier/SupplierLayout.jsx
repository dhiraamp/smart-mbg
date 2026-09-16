import React, { useEffect, useState } from "react";
import TopNavLayout from "@/components/layout/TopNavLayout";
import { LayoutDashboard, Package, FileBarChart, Bell, ShoppingCart, Smartphone, MessageCircle, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SupplierLayout() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const orders = await base44.entities.Order.list("-created_date", 200);
        setPendingCount(orders.filter((o) => o.status === "pending").length);
      } catch {
        /* noop */
      }
    };
    load();
    const unsub = base44.entities.Order.subscribe(() => load());
    return unsub;
  }, []);

  const menuItems = [
    { separator: "Menu Utama" },
    { path: "/supplier/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/supplier/products", label: "Manajemen Produk", icon: Package },
    { path: "/supplier/orders", label: "Notifikasi Pesanan", icon: ShoppingCart, badge: pendingCount },
    { separator: "Laporan & Komunikasi" },
    { path: "/supplier/income", label: "Laporan Pendapatan", icon: FileBarChart },
    { path: "/supplier/ratings", label: "Rating & Ulasan", icon: Star },
    { path: "/supplier/complaints", label: "Notifikasi Pengaduan", icon: Bell },
    { path: "/supplier/chat", label: "Chat Admin", icon: MessageCircle },
    { separator: "Layanan" },
    { path: "/supplier/digital-services", label: "Layanan Digital", icon: Smartphone },
  ];

  return <TopNavLayout menuItems={menuItems} title="Portal Supplier" />;
}
