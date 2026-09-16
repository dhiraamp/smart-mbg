import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  UserPlus,
  Users,
  Store,
  Truck,
  UserCheck,
  ShieldCheck,
  RefreshCw,
  Search,
  MessageCircle,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  UserX,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTimeParts, formatFullIndonesianDateTime } from "@/lib/utils";

export default function AdminPendaftarBaru() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.UserProfile.list("-created_date");
      setUsers(data || []);
    } catch (err) {
      console.error("Gagal memuat pendaftar baru:", err);
      toast.error("Gagal memuat data pendaftar baru");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Berlangganan perubahan data realtime (Supabase Cloud WebSocket + Local Broadcast)
    const unsubscribe = base44.entities.UserProfile.subscribe((event) => {
      console.log("Realtime event pendaftar baru terdeteksi:", event);
      loadData();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const toggleStatus = async (user) => {
    const newStatus = user.is_active === false ? true : false;
    try {
      await base44.entities.UserProfile.update(user.id, { is_active: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u))
      );
      toast.success(
        `Akun ${user.full_name || user.organization_name || user.user_email} berhasil ${
          newStatus ? "diaktifkan" : "dinonaktifkan"
        }`
      );
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser((prev) => ({ ...prev, is_active: newStatus }));
      }
    } catch (err) {
      toast.error("Gagal memperbarui status pengguna");
    }
  };

  // Filter berdasarkan Tab dan Search
  const filteredUsers = users.filter((u) => {
    // Exclude superadmin
    if (u.role === "admin") return false;

    // Filter role tab
    if (activeTab === "mitra" && u.role !== "mitra") return false;
    if (activeTab === "supplier" && u.role !== "supplier") return false;
    if (activeTab === "logistik" && u.role !== "logistik") return false;
    if (activeTab === "warga" && u.role !== "warga" && u.role !== "penerima") return false;

    // Filter text pencarian
    const q = search.toLowerCase();
    const match =
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.organization_name && u.organization_name.toLowerCase().includes(q)) ||
      (u.user_email && u.user_email.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.nik && u.nik.includes(q)) ||
      (u.address && u.address.toLowerCase().includes(q));

    return match;
  });

  const countMitra = users.filter((u) => u.role === "mitra").length;
  const countSupplier = users.filter((u) => u.role === "supplier").length;
  const countLogistik = users.filter((u) => u.role === "logistik").length;
  const countWarga = users.filter((u) => u.role === "warga" || u.role === "penerima").length;
  const totalVerified = users.filter((u) => u.role !== "admin" && (u.wa_verified || u.verified)).length;

  const getRoleBadge = (role) => {
    switch (role) {
      case "mitra":
        return (
          <Badge className="bg-emerald-600/15 text-emerald-800 border-emerald-300 font-medium text-xs gap-1">
            <Store className="w-3 h-3 text-emerald-600" /> Mitra / SPPG
          </Badge>
        );
      case "supplier":
        return (
          <Badge className="bg-blue-600/15 text-blue-800 border-blue-300 font-medium text-xs gap-1">
            <Users className="w-3 h-3 text-blue-600" /> Supplier
          </Badge>
        );
      case "logistik":
        return (
          <Badge className="bg-amber-600/15 text-amber-800 border-amber-300 font-medium text-xs gap-1">
            <Truck className="w-3 h-3 text-amber-600" /> Logistik
          </Badge>
        );
      case "warga":
      case "penerima":
        return (
          <Badge className="bg-purple-600/15 text-purple-800 border-purple-300 font-medium text-xs gap-1">
            <UserCheck className="w-3 h-3 text-purple-600" /> Warga / Penerima
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Utama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Pusat Data Pendaftar Baru</h2>
            <Badge className="bg-primary/15 text-primary border-primary/30">
              {users.filter((u) => u.role !== "admin").length} Total Pendaftar
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Pantau dan verifikasi setiap pengguna baru yang mendaftar (Mitra, Supplier, Logistik, dan Warga)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-2 shrink-0">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
        </Button>
      </div>

      {/* Kartu Metrik Per Kategori Pendaftar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card
          onClick={() => setActiveTab("all")}
          className={`cursor-pointer transition-all border-l-4 border-l-slate-700 shadow-sm hover:shadow ${
            activeTab === "all" ? "ring-2 ring-primary" : ""
          }`}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center justify-between">
              <span>Semua</span>
              <UserPlus className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1">
              {users.filter((u) => u.role !== "admin").length}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              {totalVerified} WA Terverifikasi
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab("mitra")}
          className={`cursor-pointer transition-all border-l-4 border-l-emerald-500 shadow-sm hover:shadow ${
            activeTab === "mitra" ? "ring-2 ring-emerald-500" : ""
          }`}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase flex items-center justify-between">
              <span>Mitra / SPPG</span>
              <Store className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1 text-emerald-900">{countMitra}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Dapur Satuan Pangan</div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab("supplier")}
          className={`cursor-pointer transition-all border-l-4 border-l-blue-500 shadow-sm hover:shadow ${
            activeTab === "supplier" ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="text-[11px] font-semibold text-blue-700 uppercase flex items-center justify-between">
              <span>Supplier</span>
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1 text-blue-900">{countSupplier}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Pemasok Komoditas</div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab("logistik")}
          className={`cursor-pointer transition-all border-l-4 border-l-amber-500 shadow-sm hover:shadow ${
            activeTab === "logistik" ? "ring-2 ring-amber-500" : ""
          }`}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="text-[11px] font-semibold text-amber-700 uppercase flex items-center justify-between">
              <span>Logistik</span>
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1 text-amber-900">{countLogistik}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Armada & Kurir</div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setActiveTab("warga")}
          className={`cursor-pointer transition-all border-l-4 border-l-purple-500 shadow-sm hover:shadow col-span-2 sm:col-span-1 ${
            activeTab === "warga" ? "ring-2 ring-purple-500" : ""
          }`}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="text-[11px] font-semibold text-purple-700 uppercase flex items-center justify-between">
              <span>Warga</span>
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1 text-purple-900">{countWarga}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Penerima Manfaat</div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Navigasi Tab & Pencarian */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className="text-xs shrink-0"
            >
              Semua Pendaftar ({users.filter((u) => u.role !== "admin").length})
            </Button>
            <Button
              variant={activeTab === "mitra" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("mitra")}
              className="text-xs shrink-0"
            >
              Mitra / SPPG ({countMitra})
            </Button>
            <Button
              variant={activeTab === "supplier" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("supplier")}
              className="text-xs shrink-0"
            >
              Supplier ({countSupplier})
            </Button>
            <Button
              variant={activeTab === "logistik" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("logistik")}
              className="text-xs shrink-0"
            >
              Logistik ({countLogistik})
            </Button>
            <Button
              variant={activeTab === "warga" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("warga")}
              className="text-xs shrink-0"
            >
              Warga ({countWarga})
            </Button>
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama, email, no. HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabel Data Pendaftar */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
              <p className="text-sm">Memuat data pendaftar baru...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <UserPlus className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-base font-semibold text-gray-700">Tidak ada pendaftar ditemukan</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? "Coba ganti filter atau kata kunci pencarian." : "Belum ada data pendaftar baru."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold">Nama / Entitas</TableHead>
                    <TableHead className="font-semibold">Peran (Role)</TableHead>
                    <TableHead className="font-semibold">Kontak & Email</TableHead>
                    <TableHead className="font-semibold">Verifikasi WhatsApp</TableHead>
                    <TableHead className="font-semibold">Hari, Tanggal & Waktu</TableHead>
                    <TableHead className="font-semibold">Status Akun</TableHead>
                    <TableHead className="font-semibold text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const isWaVerified = Boolean(u.wa_verified || u.verified);
                    const cleanPhone = (u.phone || "").replace(/\D/g, "");
                    const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}` : null;
                    const displayName = u.organization_name || u.full_name || u.name || "Tanpa Nama";
                    const subtitle = u.organization_name && u.full_name ? u.full_name : u.user_email || u.email;
                    const parts = formatDateTimeParts(u.created_date);

                    return (
                      <TableRow key={u.id || u.user_email || Math.random()} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                              {displayName[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{displayName}</div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                                {subtitle}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{getRoleBadge(u.role)}</TableCell>

                        <TableCell>
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-1 text-gray-800 font-mono">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{u.phone || "-"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground truncate max-w-[180px]">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span>{u.user_email || u.email || "-"}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {isWaVerified ? (
                            <Badge className="bg-emerald-500/15 text-emerald-800 border-emerald-300 font-normal text-xs gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              WA Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 text-xs">
                              Belum OTP
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          {parts.day !== "-" ? (
                            <div className="space-y-0.5 text-xs">
                              <div className="font-medium text-gray-900">
                                <span className="font-semibold text-emerald-800">{parts.day}</span>, {parts.dateFormatted}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                                <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{parts.time}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              u.is_active !== false
                                ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                : "bg-red-50 text-red-700 border-red-200 text-xs"
                            }
                          >
                            {u.is_active !== false ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {waLink && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Kirim Chat WhatsApp"
                                onClick={() => window.open(waLink, "_blank")}
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Lihat Detail Pendaftaran"
                              onClick={() => setSelectedUser(u)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                u.is_active !== false
                                  ? "text-red-500 hover:bg-red-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              onClick={() => toggleStatus(u)}
                              title={u.is_active !== false ? "Nonaktifkan Pengguna" : "Aktifkan Pengguna"}
                            >
                              {u.is_active !== false ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Detail Pendaftaran Lengkap */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="w-5 h-5 text-primary" />
                Detail Data Pendaftar Baru
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <div className="bg-muted/50 p-4 rounded-xl border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg uppercase">
                    {(selectedUser.organization_name || selectedUser.full_name || "U")[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-gray-900">
                      {selectedUser.organization_name || selectedUser.full_name || "Pengguna"}
                    </h4>
                    <p className="text-xs text-muted-foreground">{selectedUser.user_email || selectedUser.email}</p>
                  </div>
                </div>
                <div>{getRoleBadge(selectedUser.role)}</div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 border rounded-xl p-4 bg-gray-50/50 text-xs">
                {selectedUser.full_name && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Penanggung Jawab / Nama:</span>
                    <span className="font-semibold text-gray-900">{selectedUser.full_name}</span>
                  </div>
                )}

                {selectedUser.nik && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">NIK KTP:</span>
                    <span className="font-mono font-bold text-gray-900">{selectedUser.nik}</span>
                  </div>
                )}

                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">No. WhatsApp:</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-gray-900">{selectedUser.phone || "-"}</span>
                    {Boolean(selectedUser.wa_verified || selectedUser.verified) && (
                      <span className="block text-[10px] text-emerald-600 font-semibold">
                        ✓ Terverifikasi Gateway Fonnte
                      </span>
                    )}
                  </div>
                </div>

                {selectedUser.sim_number && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Nomor & Tipe SIM:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedUser.sim_type || "SIM"} - {selectedUser.sim_number}
                    </span>
                  </div>
                )}

                {selectedUser.vehicles && selectedUser.vehicles.length > 0 && (
                  <div className="border-b pb-2">
                    <span className="text-muted-foreground block mb-1">Armada Terdaftar:</span>
                    <div className="space-y-1 pl-2">
                      {selectedUser.vehicles.map((v, idx) => (
                        <div key={idx} className="flex justify-between font-mono text-[11px] bg-white p-1.5 rounded border">
                          <span>{v.plate || "Tanpa Plat"} ({v.type || "Kendaraan"})</span>
                          <span className="font-bold text-emerald-700">{v.capacity || "-"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.address && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground shrink-0">Alamat:</span>
                    <span className="text-right font-medium text-gray-900 max-w-[240px]">
                      {selectedUser.address}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Status Akun:</span>
                  <Badge
                    variant="outline"
                    className={
                      selectedUser.is_active !== false
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {selectedUser.is_active !== false ? "Aktif (Dapat Bertransaksi)" : "Nonaktif (Terkunci)"}
                  </Badge>
                </div>

                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Hari & Tanggal Daftar:</span>
                  <span className="text-gray-900 font-semibold">
                    {(() => {
                      const parts = formatDateTimeParts(selectedUser.created_date);
                      return parts.day !== "-" ? `${parts.day}, ${parts.dateFormatted}` : "-";
                    })()}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Waktu / Jam (Detik & Menit):</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-gray-900">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{formatDateTimeParts(selectedUser.created_date).time}</span>
                  </div>
                </div>

                {selectedUser.verified_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terverifikasi OTP Pada:</span>
                    <span className="text-emerald-700 font-mono font-medium text-right text-xs">
                      {formatFullIndonesianDateTime(selectedUser.verified_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex sm:justify-between items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={
                  selectedUser.is_active !== false
                    ? "text-red-600 border-red-200 hover:bg-red-50"
                    : "text-green-600 border-green-200 hover:bg-green-50"
                }
                onClick={() => toggleStatus(selectedUser)}
              >
                {selectedUser.is_active !== false ? "Nonaktifkan Akun" : "Aktifkan Akun"}
              </Button>

              <div className="flex gap-2">
                {selectedUser.phone && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    onClick={() => {
                      const clean = selectedUser.phone.replace(/\D/g, "");
                      const target = clean.startsWith("0") ? "62" + clean.slice(1) : clean;
                      window.open(`https://wa.me/${target}`, "_blank");
                    }}
                  >
                    <MessageCircle className="w-4 h-4" /> Chat WA
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setSelectedUser(null)}>
                  Tutup
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
