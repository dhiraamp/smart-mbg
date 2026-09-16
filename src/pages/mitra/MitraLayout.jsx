import React from "react";
import TopNavLayout from "@/components/layout/TopNavLayout";
import { LayoutDashboard, ShoppingCart, Package, Sparkles, Apple, MessageSquare, MapPin, FileBarChart, Smartphone, Users, Receipt, ClipboardList, Briefcase } from "lucide-react";

const menuItems = [
  { separator: "Menu Utama" },
  { path: "/mitra/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/mitra/cart", label: "Keranjang Pesanan", icon: ShoppingCart },
  { path: "/mitra/transactions", label: "Riwayat Transaksi", icon: Receipt },
  { path: "/mitra/products", label: "Produk Bahan Pangan", icon: Package },
  { path: "/mitra/orders", label: "Tracking Pesanan", icon: MapPin },
  { separator: "Informasi" },
  { path: "/mitra/kebutuhan", label: "Kebutuhan Bahan & PO", icon: ClipboardList },
  { path: "/mitra/menu", label: "Rekomendasi Menu", icon: Sparkles },
  { path: "/mitra/nutrition", label: "Nutrition Page", icon: Apple },
  { path: "/mitra/recipients", label: "Penerima Bantuan", icon: Users },
  { separator: "Layanan" },
  { path: "/mitra/career", label: "Kelola Lowongan", icon: Briefcase },
  { path: "/mitra/complaints", label: "Pengaduan", icon: MessageSquare },
  { path: "/mitra/reports", label: "Laporan Bulanan", icon: FileBarChart },
  { path: "/mitra/digital-services", label: "Layanan Digital", icon: Smartphone },
];

export default function MitraLayout() {
  return <TopNavLayout menuItems={menuItems} title="Portal Mitra / SPPG" />;
}