import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
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
  Store,
  ShieldCheck,
  MessageCircle,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Building2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTimeParts, formatFullIndonesianDateTime } from "@/lib/utils";

export default function AdminMitra() {
  const [mitraList, setMitraList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMitra, setSelectedMitra] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [profiles, allOrders] = await Promise.all([
        base44.entities.UserProfile.filter({ role: "mitra" }),
        base44.entities.Order.list(),
      ]);
      setMitraList(profiles || []);
      setOrders(allOrders || []);
    } catch (err) {
      console.error("Gagal memuat mitra:", err);
      toast.error("Gagal memuat data mitra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const unsubscribe = base44.entities.UserProfile.subscribe(() => {
      load();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const getOrderCount = (email) =>
    orders.filter((o) => o.mitra_id === email || o.mitra_email === email).length;

  const toggleStatus = async (mitra) => {
    const newStatus = mitra.is_active === false;
    try {
      await base44.entities.UserProfile.update(mitra.id, { is_active: newStatus });
      setMitraList((prev) =>
        prev.map((m) => (m.id === mitra.id ? { ...m, is_active: newStatus } : m))
      );
      toast.success(
        `Mitra ${mitra.organization_name || mitra.full_name} berhasil ${
          newStatus ? "diaktifkan" : "dinonaktifkan"
        }`
      );
      if (selectedMitra && selectedMitra.id === mitra.id) {
        setSelectedMitra((prev) => ({ ...prev, is_active: newStatus }));
      }
    } catch (e) {
      toast.error("Gagal memperbarui status mitra");
    }
  };

  const filtered = mitraList.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.organization_name && m.organization_name.toLowerCase().includes(q)) ||
      (m.full_name && m.full_name.toLowerCase().includes(q)) ||
      (m.user_email && m.user_email.toLowerCase().includes(q)) ||
      (m.phone && m.phone.includes(q)) ||
      (m.address && m.address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Manajemen Mitra / SPPG</h2>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {mitraList.length} Mitra Terdaftar
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Kelola data satuan pelayanan pangan bergizi (SPPG) dan dapur mitra MBG
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2 shrink-0">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama dapur, penanggung jawab, no. WA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
              <p className="text-sm">Memuat data mitra/SPPG...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Store className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-base font-semibold text-gray-700">Belum ada mitra terdaftar</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? "Coba gunakan kata kunci pencarian yang lain." : "Data pendaftar baru akan otomatis muncul di sini."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold">Nama Mitra / Dapur</TableHead>
                    <TableHead className="font-semibold">Penanggung Jawab</TableHead>
                    <TableHead className="font-semibold">Kontak WA</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Hari, Tanggal & Waktu</TableHead>
                    <TableHead className="font-semibold">Alamat</TableHead>
                    <TableHead className="font-semibold">Pesanan</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => {
                    const isWaVerified = Boolean(m.wa_verified || m.verified);
                    const cleanPhone = (m.phone || "").replace(/\D/g, "");
                    const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}` : null;
                    const orgName = m.organization_name || m.dapur_name || m.full_name || "Dapur SPPG";
                    const parts = formatDateTimeParts(m.created_date);

                    return (
                      <TableRow key={m.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                              {orgName[0]}
                            </div>
                            <div>
                              <div className="font-semibold">{orgName}</div>
                              {isWaVerified && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold">
                                  <ShieldCheck className="w-3 h-3" /> WA Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm">
                          {m.full_name || m.contact_person || "-"}
                        </TableCell>

                        <TableCell>
                          {m.phone ? (
                            <div className="flex items-center gap-1.5 text-xs font-mono">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{m.phone}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {m.user_email || m.email || "-"}
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
                          {m.address ? (
                            <span className="flex items-center gap-1 text-xs max-w-[160px] truncate text-gray-600" title={m.address}>
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                              {m.address}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs font-medium">
                          {getOrderCount(m.user_email || m.email)} pesanan
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              m.is_active !== false
                                ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                : "bg-red-50 text-red-700 border-red-200 text-xs"
                            }
                          >
                            {m.is_active !== false ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {waLink && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Chat WhatsApp"
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
                              onClick={() => setSelectedMitra(m)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                m.is_active !== false ? "text-red-500 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                              }`}
                              onClick={() => toggleStatus(m)}
                              title={m.is_active !== false ? "Nonaktifkan Mitra" : "Aktifkan Mitra"}
                            >
                              {m.is_active !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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

      {/* Modal Detail Mitra */}
      {selectedMitra && (
        <Dialog open={!!selectedMitra} onOpenChange={() => setSelectedMitra(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Store className="w-5 h-5 text-emerald-600" />
                Detail Mitra / SPPG
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-sm">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg uppercase">
                  {(selectedMitra.organization_name || selectedMitra.full_name || "M")[0]}
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900">
                    {selectedMitra.organization_name || selectedMitra.full_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-white text-xs">
                      Role: Mitra / SPPG
                    </Badge>
                    <Badge className={selectedMitra.is_active !== false ? "bg-green-600 text-white text-xs" : "bg-red-600 text-white text-xs"}>
                      {selectedMitra.is_active !== false ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-3.5 bg-gray-50/50 space-y-2 text-xs">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Penanggung Jawab:</span>
                  <span className="font-semibold text-gray-900">{selectedMitra.full_name || "-"}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Email Akun:</span>
                  <span className="font-medium text-gray-900">{selectedMitra.user_email || selectedMitra.email || "-"}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">No. WhatsApp:</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-gray-900">{selectedMitra.phone || "-"}</span>
                    {Boolean(selectedMitra.wa_verified || selectedMitra.verified) && (
                      <span className="block text-[10px] text-emerald-600 font-semibold">
                        ✓ Terverifikasi Gateway Fonnte
                      </span>
                    )}
                  </div>
                </div>
                {selectedMitra.address && (
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground shrink-0">Alamat Dapur:</span>
                    <span className="text-right font-medium text-gray-900 max-w-[220px]">{selectedMitra.address}</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Hari & Tanggal Daftar:</span>
                  <span className="text-gray-900 font-semibold">
                    {(() => {
                      const parts = formatDateTimeParts(selectedMitra.created_date);
                      return parts.day !== "-" ? `${parts.day}, ${parts.dateFormatted}` : "-";
                    })()}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Waktu / Jam (Jam:Menit:Detik):</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-gray-900">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{formatDateTimeParts(selectedMitra.created_date).time}</span>
                  </div>
                </div>
                {selectedMitra.verified_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terverifikasi OTP Pada:</span>
                    <span className="text-emerald-700 font-mono font-medium text-xs">
                      {formatFullIndonesianDateTime(selectedMitra.verified_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              {selectedMitra.phone && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => {
                    const clean = selectedMitra.phone.replace(/\D/g, "");
                    const target = clean.startsWith("0") ? "62" + clean.slice(1) : clean;
                    window.open(`https://wa.me/${target}`, "_blank");
                  }}
                >
                  <MessageCircle className="w-4 h-4" /> Chat WA
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setSelectedMitra(null)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}