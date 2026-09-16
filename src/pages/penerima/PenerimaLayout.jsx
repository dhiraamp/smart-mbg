import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Star, School } from "lucide-react";

const menuItems = [
  { separator: "Menu" },
  { path: "/penerima/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/penerima/daftar", label: "Daftar Penerima", icon: School },
  { path: "/penerima/rating", label: "Nilai SPPG", icon: Star },
];

export default function PenerimaLayout() {
  return <DashboardLayout menuItems={menuItems} title="Portal Warga" />;
}