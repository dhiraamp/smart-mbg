import React from "react";
import TopNavLayout from "@/components/layout/TopNavLayout";
import {
  LayoutDashboard,
  Users,
  Store,
  Truck,
  FileBarChart,
  MessageCircle,
  Bell,
  TrendingUp,
  BarChart3,
  Apple,
  Warehouse,
  ShoppingBasket,
  CalendarDays,
  UserPlus,
  UserCheck,
  MapPinned,
} from "lucide-react";

const menuItems = [
  { separator: "Menu Utama" },
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/gis", label: "Peta Geospasial GIS", icon: MapPinned },
  { path: "/admin/stock", label: "Manajemen Stok", icon: Warehouse },
  { path: "/admin/bapokting", label: "SIHARBATING & MISTER MBG", icon: ShoppingBasket },

  { separator: "Data Pendaftar & Pengguna" },
  { path: "/admin/pendaftar-baru", label: "Pusat Pendaftar Baru", icon: UserPlus },
  { path: "/admin/mitra", label: "Manajemen Mitra/SPPG", icon: Store },
  { path: "/admin/suppliers", label: "Manajemen Supplier", icon: Users },
  { path: "/admin/logistik", label: "Manajemen Logistik", icon: Truck },
  { path: "/admin/warga", label: "Manajemen Warga/Penerima", icon: UserCheck },
  { path: "/admin/sppg-menus", label: "Menu Harian SPPG", icon: CalendarDays },

  { separator: "Laporan" },
  { path: "/admin/financial", label: "Laporan Keuangan", icon: FileBarChart },
  { path: "/admin/inflation", label: "Laporan Inflasi/Harga", icon: TrendingUp },
  { path: "/admin/supply-chain", label: "Laporan Rantai Pasok", icon: BarChart3 },
  { path: "/admin/food-report", label: "Laporan Bahan Pangan", icon: Apple },

  { separator: "Komunikasi" },
  { path: "/admin/chat-mitra", label: "Chat Mitra/SPPG", icon: MessageCircle },
  { path: "/admin/chat-supplier", label: "Chat Supplier", icon: MessageCircle },
  { path: "/admin/chat-logistik", label: "Chat Logistik", icon: MessageCircle },
  { path: "/admin/notifications", label: "Notifikasi Stok", icon: Bell },
];

export default function AdminLayout() {
  return <TopNavLayout menuItems={menuItems} title="Admin Panel" />;
}