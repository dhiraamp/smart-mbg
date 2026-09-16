import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/shared/StatCard";
import StockAlertPanel from "@/components/admin/StockAlertPanel";
import {
  Users,
  Store,
  Truck,
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Warehouse,
  UserPlus,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Phone,
  Clock,
  MapPinned,
} from "lucide-react";
import { formatFullIndonesianDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import GisMap from "@/components/marketplace/GisMap";
import GisImportModal from "@/components/admin/GisImportModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const monthlyData = [
  { month: "Jan", order: 120, revenue: 45 },
  { month: "Feb", order: 145, revenue: 52 },
  { month: "Mar", order: 130, revenue: 48 },
  { month: "Apr", order: 165, revenue: 61 },
  { month: "Mei", order: 155, revenue: 57 },
  { month: "Jun", order: 180, revenue: 64 },
];

const categoryData = [
  { name: "Beras", value: 30 },
  { name: "Sayuran", value: 25 },
  { name: "Daging", value: 20 },
  { name: "Ikan", value: 15 },
  { name: "Lainnya", value: 10 },
];

const COLORS = [
  "hsl(217, 91%, 50%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(270, 60%, 50%)",
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userCounts, setUserCounts] = useState({
    supplier: 24,
    mitra: 42,
    logistik: 18,
    warga: 35,
    totalNew: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [gisModalOpen, setGisModalOpen] = useState(false);

  useEffect(() => {
    const fetchLiveUsers = async () => {
      try {
        const users = await base44.entities.UserProfile.list("-created_date");
        if (users && users.length > 0) {
          const nonAdmin = users.filter((u) => u.role !== "admin");
          const suppliers = users.filter((u) => u.role === "supplier").length;
          const mitras = users.filter((u) => u.role === "mitra").length;
          const logistiks = users.filter((u) => u.role === "logistik").length;
          const wargas = users.filter((u) => u.role === "warga" || u.role === "penerima").length;

          setUserCounts({
            supplier: Math.max(suppliers, 1),
            mitra: Math.max(mitras, 1),
            logistik: Math.max(logistiks, 4),
            warga: Math.max(wargas, 1),
            totalNew: nonAdmin.length,
          });

          setRecentUsers(nonAdmin.slice(0, 5));
        }
      } catch (err) {
        console.warn("Gagal memuat profil pengguna dashboard:", err);
      }
    };

    fetchLiveUsers();

    // Berlangganan perubahan data realtime pengguna baru
    const unsubscribe = base44.entities.UserProfile.subscribe(() => {
      fetchLiveUsers();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case "mitra":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Mitra / SPPG</Badge>;
      case "supplier":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Supplier</Badge>;
      case "logistik":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Logistik</Badge>;
      case "warga":
      case "penerima":
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">Warga</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Admin</h2>
          <p className="text-muted-foreground text-sm">Ringkasan seluruh data pengguna dan rantai pasok SMART MBG</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/admin/gis")}
            className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 shadow-sm"
          >
            <MapPinned className="w-4 h-4 text-emerald-600" /> Buka Peta GIS Garut
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setGisModalOpen(true)}
            className="gap-1.5 text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            Sinkronkan Disperindag
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/admin/pendaftar-baru")}
            className="gap-1.5 bg-primary text-primary-foreground shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Kelola Pendaftar Baru ({userCounts.totalNew})
          </Button>
        </div>
      </div>

      {/* Kartu Manajemen Pengguna */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mitra / SPPG"
          value={String(userCounts.mitra)}
          icon={Store}
          color="green"
          trend={12}
          onClick={() => navigate("/admin/mitra")}
        />
        <StatCard
          title="Total Supplier Pangan"
          value={String(userCounts.supplier)}
          icon={Users}
          color="blue"
          trend={8}
          onClick={() => navigate("/admin/suppliers")}
        />
        <StatCard
          title="Armada Logistik"
          value={String(userCounts.logistik)}
          icon={Truck}
          color="yellow"
          trend={5}
          onClick={() => navigate("/admin/logistik")}
        />
        <StatCard
          title="Warga / Penerima MBG"
          value={String(userCounts.warga)}
          icon={UserCheck}
          color="purple"
          trend={15}
          onClick={() => navigate("/admin/warga")}
        />
      </div>

      {/* Panel Pendaftar Baru Terkini */}
      {recentUsers.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Pendaftar Pengguna Terbaru</CardTitle>
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">
                Live Data
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/pendaftar-baru")}
              className="text-xs text-primary gap-1 h-7 px-2"
            >
              Lihat Semua Data <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y text-xs">
              {recentUsers.map((u) => {
                const displayName = u.organization_name || u.full_name || u.name || "Pendaftar Baru";
                const isWa = Boolean(u.wa_verified || u.verified);
                return (
                  <div
                    key={u.id || Math.random()}
                    className="p-3 sm:px-4 flex items-center justify-between hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {displayName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <span>{displayName}</span>
                          {isWa && (
                            <span className="inline-flex items-center text-[10px] text-emerald-600 font-medium">
                              <ShieldCheck className="w-3 h-3" /> WA Verified
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span>{u.user_email || u.email}</span>
                          {u.phone && (
                            <span className="flex items-center gap-0.5 font-mono">
                              <Phone className="w-2.5 h-2.5 text-emerald-600" />
                              {u.phone}
                            </span>
                          )}
                        </div>
                        {u.created_date && (
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{formatFullIndonesianDateTime(u.created_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(u.role)}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs hidden sm:inline-flex"
                        onClick={() => navigate("/admin/pendaftar-baru")}
                      >
                        Detail
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <StockAlertPanel />

      {/* Peta Geospasial Rantai Pasok Terintegrasi Disperindag Garut */}
      <Card className="border-emerald-100 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-transparent border-b border-emerald-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900">
                <MapPinned className="w-5 h-5 text-emerald-600" />
                Peta Geospasial Rantai Pasok MBG Garut
              </CardTitle>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-semibold">
                Terintegrasi Disperindag Garut
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Visualisasi Dapur SPPG, Sekolah Sasaran, dan Supplier Komoditas se-Kabupaten Garut
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/admin/gis")}
              className="text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-8"
            >
              Layar Penuh GIS <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <GisMap />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Pesanan" value="895" icon={ShoppingCart} color="blue" trend={18} />
        <StatCard title="Revenue Bulan Ini" value="Rp 64jt" icon={TrendingUp} color="green" trend={12} />
        <StatCard title="Stok Rendah" value="12" icon={Warehouse} color="red" />
        <StatCard title="Pengaduan Aktif" value="5" icon={AlertTriangle} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pesanan & Revenue Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="order" fill="hsl(var(--primary))" name="Pesanan" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name="Revenue (jt)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribusi Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <GisImportModal
        open={gisModalOpen}
        onClose={() => setGisModalOpen(false)}
      />
    </div>
  );
}