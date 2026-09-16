import React from "react";
import TopNavLayout from "@/components/layout/TopNavLayout";
import { LayoutDashboard, Truck, FileBarChart, MessageCircle, Smartphone, AlertTriangle, Map, Bot, Briefcase } from "lucide-react";

const menuItems = [
  { separator: "Menu Utama" },
  { path: "/logistik/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/logistik/orders", label: "Data Pengiriman", icon: Truck },
  { path: "/logistik/priority", label: "Prioritas Pesanan", icon: AlertTriangle },
  { separator: "Peta & Area" },
  { path: "/logistik/map", label: "Peta Sebaran Area", icon: Map },
  { separator: "Laporan & Komunikasi" },
  { path: "/logistik/reports", label: "Laporan Bulanan", icon: FileBarChart },
  { path: "/logistik/chat", label: "Chat Admin", icon: MessageCircle },
  { separator: "Layanan" },
  { path: "/logistik/digital-services", label: "Layanan Digital", icon: Smartphone },
  { path: "/logistik/agent", label: "Asisten AI", icon: Bot },
  { separator: "Career" },
  { path: "/logistik/career", label: "Kelola Lowongan", icon: Briefcase },
];

export default function LogistikLayout() {
  return <TopNavLayout menuItems={menuItems} title="Portal Logistik — Pemda Kab. Garut" />;
}