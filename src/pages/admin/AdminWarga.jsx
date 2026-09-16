import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Eye,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  ShieldCheck,
  MessageCircle,
  Calendar,
  IdCard,
  Mail,
  UserX,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTimeParts, formatFullIndonesianDateTime } from "@/lib/utils";

export default function AdminWarga() {
  const [wargaList, setWargaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedWarga, setSelectedWarga] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      // Ambil user dengan role penerima atau warga
      const [penerimaProfiles, allProfiles] = await Promise.all([
        base44.entities.UserProfile.filter({ role: "penerima" }),
        base44.entities.UserProfile.list(),
      ]);

      const wargaFromAll = (allProfiles || []).filter(
        (p) => p.role === "warga" || p.role === "penerima"
      );

      // Gabungkan dan deduplikasi berdasarkan id atau email
      const map = new Map();
      [...(penerimaProfiles || []), ...wargaFromAll].forEach((w) => {
        const key = w.id || w.user_email || w.email;
        if (key && !map.has(key)) {
          map.set(key, w);
        }
      });

      setWargaList(Array.from(map.values()));
    } catch (err) {
      console.error("Gagal memuat data warga:", err);
      toast.error("Gagal memuat data warga penerima");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    // Berlangganan perubahan data realtime warga
    const unsubscribe = base44.entities.UserProfile.subscribe(() => {
      load();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const toggleStatus = async (warga) => {
    const newStatus = warga.is_active === false ? true : false;
    try {
      await base44.entities.UserProfile.update(warga.id, { is_active: newStatus });
      setWargaList((prev) =>
        prev.map((w) => (w.id === warga.id ? { ...w, is_active: newStatus } : w))
      );
      toast.success(
        `Akun ${warga.full_name || warga.user_email} berhasil ${
          newStatus ? "diaktifkan" : "dinonaktifkan"
        }`
      );
      if (selectedWarga && selectedWarga.id === warga.id) {
        setSelectedWarga((prev) => ({ ...prev, is_active: newStatus }));
      }
    } catch (err) {
      toast.error("Gagal memperbarui status warga");
    }
  };

  const filtered = wargaList.filter((w) => {
    const term = search.toLowerCase();
    const matchSearch =
      (w.full_name && w.full_name.toLowerCase().includes(term)) ||
      (w.user_email && w.user_email.toLowerCase().includes(term)) ||
      (w.phone && w.phone.includes(term)) ||
      (w.nik && w.nik.includes(term)) ||
      (w.address && w.address.toLowerCase().includes(term));

    if (filterStatus === "active") return matchSearch && w.is_active !== false;
    if (filterStatus === "inactive") return matchSearch && w.is_active === false;
    if (filterStatus === "verified") return matchSearch && (w.wa_verified || w.verified);
    return matchSearch;
  });

  const totalVerified = wargaList.filter((w) => w.wa_verified || w.verified).length;
  const totalActive = wargaList.filter((w) => w.is_active !== false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Manajemen Warga / Penerima MBG</h2>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {wargaList.length} Terdaftar
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Daftar data warga & penerima manfaat program MBG yang mendaftar melalui portal publik
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2 shrink-0">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
        </Button>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Total Warga Terdaftar
            </CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wargaList.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Akun penerima manfaat MBG</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Terverifikasi WhatsApp
            </CardTitle>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{totalVerified}</div>
            <p className="text-xs text-muted-foreground mt-1">Tervalidasi OTP WhatsApp Gateway</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
              Akun Aktif
            </CardTitle>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalActive}</div>
            <p className="text-xs text-muted-foreground mt-1">Dapat memesan & menerima manfaat</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama, NIK, no. HP, alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
              className="h-8 text-xs"
            >
              Semua ({wargaList.length})
            </Button>
            <Button
              variant={filterStatus === "verified" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("verified")}
              className="h-8 text-xs"
            >
              WA Terverifikasi ({totalVerified})
            </Button>
            <Button
              variant={filterStatus === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("active")}
              className="h-8 text-xs"
            >
              Aktif ({totalActive})
            </Button>
            <Button
              variant={filterStatus === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("inactive")}
              className="h-8 text-xs"
            >
              Nonaktif ({wargaList.length - totalActive})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Data Warga */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
              <p className="text-sm">Memuat data warga penerima...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-base font-semibold text-gray-700">Tidak ada data warga ditemukan</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? "Coba gunakan kata kunci pencarian yang lain." : "Belum ada warga yang mendaftar."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold">Nama Lengkap</TableHead>
                    <TableHead className="font-semibold">NIK</TableHead>
                    <TableHead className="font-semibold">Kontak & Email</TableHead>
                    <TableHead className="font-semibold">Hari, Tanggal & Waktu</TableHead>
                    <TableHead className="font-semibold">Alamat</TableHead>
                    <TableHead className="font-semibold">Status WA</TableHead>
                    <TableHead className="font-semibold">Status Akun</TableHead>
                    <TableHead className="font-semibold text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((w) => {
                    const isWaVerified = Boolean(w.wa_verified || w.verified);
                    const cleanPhone = (w.phone || "").replace(/\D/g, "");
                    const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}` : null;
                    const parts = formatDateTimeParts(w.created_date);

                    return (
                      <TableRow key={w.id || w.user_email || Math.random()} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                              {(w.full_name || "W")[0]}
                            </div>
                            <div>
                              <div className="font-semibold">{w.full_name || "Tanpa Nama"}</div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                                {w.user_email || w.email || "-"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {w.nik ? (
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 border border-gray-200">
                              {w.nik}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5 text-xs">
                            {w.phone ? (
                              <div className="flex items-center gap-1.5 text-xs">
                                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="font-mono">{w.phone}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                            <div className="flex items-center gap-1 text-muted-foreground truncate max-w-[160px] text-[11px]">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span>{w.user_email || w.email || "-"}</span>
                            </div>
                          </div>
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
                          {w.address ? (
                            <span className="flex items-center gap-1 text-xs max-w-[180px] truncate text-gray-600" title={w.address}>
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              {w.address}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isWaVerified ? (
                            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300 font-normal text-xs gap-1">
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
                          <Badge
                            variant="outline"
                            className={
                              w.is_active !== false
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {w.is_active !== false ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {waLink && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Chat via WhatsApp"
                                onClick={() => window.open(waLink, "_blank")}
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Lihat Detail"
                              onClick={() => setSelectedWarga(w)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                w.is_active !== false
                                  ? "text-red-500 hover:bg-red-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              onClick={() => toggleStatus(w)}
                              title={w.is_active !== false ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                            >
                              {w.is_active !== false ? (
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

      {/* Modal Detail Warga */}
      {selectedWarga && (
        <Dialog open={!!selectedWarga} onOpenChange={() => setSelectedWarga(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <IdCard className="w-5 h-5 text-emerald-600" />
                Detail Data Warga / Penerima
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                  {(selectedWarga.full_name || "W")[0]}
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900">{selectedWarga.full_name || "Warga"}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-white text-xs">
                      Role: Penerima MBG
                    </Badge>
                    <Badge
                      className={
                        selectedWarga.is_active !== false
                          ? "bg-green-600 text-white text-xs"
                          : "bg-red-600 text-white text-xs"
                      }
                    >
                      {selectedWarga.is_active !== false ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 border rounded-xl p-4 bg-gray-50/50">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <IdCard className="w-4 h-4" /> NIK KTP
                  </span>
                  <span className="font-mono font-bold text-gray-900">
                    {selectedWarga.nik || "Belum diisi"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-4 h-4" /> Email
                  </span>
                  <span className="font-medium text-gray-900">
                    {selectedWarga.user_email || selectedWarga.email || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-4 h-4" /> No. WhatsApp
                  </span>
                  <div className="text-right">
                    <span className="font-mono font-medium text-gray-900">{selectedWarga.phone || "-"}</span>
                    {Boolean(selectedWarga.wa_verified || selectedWarga.verified) && (
                      <span className="block text-[10px] text-emerald-600 font-semibold">
                        ✓ Terverifikasi Gateway Fonnte
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <MapPin className="w-4 h-4" /> Alamat
                  </span>
                  <span className="text-right font-medium text-gray-900 max-w-[200px]">
                    {selectedWarga.address || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" /> Hari & Tanggal Daftar
                  </span>
                  <span className="text-gray-900 font-semibold text-xs">
                    {(() => {
                      const parts = formatDateTimeParts(selectedWarga.created_date);
                      return parts.day !== "-" ? `${parts.day}, ${parts.dateFormatted}` : "-";
                    })()}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" /> Waktu (Jam:Menit:Detik)
                  </span>
                  <span className="font-mono font-bold text-gray-900 text-xs">
                    {formatDateTimeParts(selectedWarga.created_date).time}
                  </span>
                </div>

                {selectedWarga.verified_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verifikasi WhatsApp
                    </span>
                    <span className="text-emerald-700 font-mono font-medium text-xs">
                      {formatFullIndonesianDateTime(selectedWarga.verified_at)}
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
                  selectedWarga.is_active !== false
                    ? "text-red-600 border-red-200 hover:bg-red-50"
                    : "text-green-600 border-green-200 hover:bg-green-50"
                }
                onClick={() => toggleStatus(selectedWarga)}
              >
                {selectedWarga.is_active !== false ? "Nonaktifkan Akun" : "Aktifkan Akun"}
              </Button>

              <div className="flex gap-2">
                {selectedWarga.phone && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    onClick={() => {
                      const clean = selectedWarga.phone.replace(/\D/g, "");
                      const target = clean.startsWith("0") ? "62" + clean.slice(1) : clean;
                      window.open(`https://wa.me/${target}`, "_blank");
                    }}
                  >
                    <MessageCircle className="w-4 h-4" /> Chat WA
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setSelectedWarga(null)}>
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
