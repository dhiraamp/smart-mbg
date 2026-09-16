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
  Star,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Users,
  ShieldCheck,
  MessageCircle,
  Building2,
  Mail,
  UserCheck,
  UserX,
  Clock,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTimeParts, formatFullIndonesianDateTime } from "@/lib/utils";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${
            s <= Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-xs ml-1 text-muted-foreground">{rating > 0 ? rating.toFixed(1) : "-"}</span>
    </div>
  );
}

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [profiles, supplierRatings] = await Promise.all([
        base44.entities.UserProfile.filter({ role: "supplier" }),
        base44.entities.SupplierRating.list(),
      ]);
      setSuppliers(profiles || []);
      setRatings(supplierRatings || []);
    } catch (err) {
      console.error("Gagal memuat supplier:", err);
      toast.error("Gagal memuat data supplier");
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

  const getRatingInfo = (supplierEmail) => {
    const relevant = ratings.filter(
      (r) => r.supplier_id === supplierEmail || r.supplier_name === supplierEmail
    );
    if (!relevant.length) return { avg: 0, count: 0 };
    const avg =
      relevant.reduce(
        (sum, r) =>
          sum + (r.rating_overall || (r.rating_ketepatan + r.rating_kualitas) / 2),
        0
      ) / relevant.length;
    return { avg: Math.round(avg * 10) / 10, count: relevant.length };
  };

  const toggleStatus = async (supplier) => {
    const newStatus = supplier.is_active === false;
    try {
      await base44.entities.UserProfile.update(supplier.id, { is_active: newStatus });
      setSuppliers((prev) =>
        prev.map((s) => (s.id === supplier.id ? { ...s, is_active: newStatus } : s))
      );
      toast.success(
        `Supplier ${supplier.organization_name || supplier.full_name} berhasil ${
          newStatus ? "diaktifkan" : "dinonaktifkan"
        }`
      );
      if (selectedSupplier && selectedSupplier.id === supplier.id) {
        setSelectedSupplier((prev) => ({ ...prev, is_active: newStatus }));
      }
    } catch (e) {
      toast.error("Gagal memperbarui status supplier");
    }
  };

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.organization_name && s.organization_name.toLowerCase().includes(q)) ||
      (s.full_name && s.full_name.toLowerCase().includes(q)) ||
      (s.user_email && s.user_email.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Manajemen Supplier Bahan Pangan</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {suppliers.length} Supplier Terdaftar
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Kelola pemasok komoditas pangan segar dan bahan pokok untuk kebutuhan program MBG
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
            placeholder="Cari nama PT/CV, PIC, no. WA..."
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
              <p className="text-sm">Memuat data supplier...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-base font-semibold text-gray-700">Belum ada supplier terdaftar</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? "Coba gunakan kata kunci pencarian yang lain." : "Pendaftar baru akan muncul di sini secara otomatis."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold">Nama Usaha / PT / CV</TableHead>
                    <TableHead className="font-semibold">Penanggung Jawab</TableHead>
                    <TableHead className="font-semibold">Kontak WA</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Hari, Tanggal & Waktu</TableHead>
                    <TableHead className="font-semibold">Alamat</TableHead>
                    <TableHead className="font-semibold">Rating</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => {
                    const { avg, count } = getRatingInfo(s.user_email || s.email);
                    const isWaVerified = Boolean(s.wa_verified || s.verified);
                    const cleanPhone = (s.phone || "").replace(/\D/g, "");
                    const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}` : null;
                    const orgName = s.organization_name || s.company_name || s.full_name || "Supplier";
                    const parts = formatDateTimeParts(s.created_date);

                    return (
                      <TableRow key={s.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
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
                          {s.full_name || s.contact_person || "-"}
                        </TableCell>

                        <TableCell>
                          {s.phone ? (
                            <div className="flex items-center gap-1.5 text-xs font-mono">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{s.phone}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {s.user_email || s.email || "-"}
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
                          {s.address ? (
                            <span className="flex items-center gap-1 text-xs max-w-[160px] truncate text-gray-600" title={s.address}>
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                              {s.address}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {count > 0 ? (
                            <div>
                              <StarRating rating={avg} />
                              <span className="text-[10px] text-muted-foreground">({count} ulasan)</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Belum ada</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              s.is_active !== false
                                ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                : "bg-red-50 text-red-700 border-red-200 text-xs"
                            }
                          >
                            {s.is_active !== false ? "Aktif" : "Nonaktif"}
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
                              onClick={() => setSelectedSupplier(s)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                s.is_active !== false ? "text-red-500 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                              }`}
                              onClick={() => toggleStatus(s)}
                              title={s.is_active !== false ? "Nonaktifkan Supplier" : "Aktifkan Supplier"}
                            >
                              {s.is_active !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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

      {/* Modal Detail Supplier */}
      {selectedSupplier && (
        <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
                Detail Data Supplier
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-sm">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg uppercase">
                  {(selectedSupplier.organization_name || selectedSupplier.full_name || "S")[0]}
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900">
                    {selectedSupplier.organization_name || selectedSupplier.full_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-white text-xs">
                      Role: Supplier Bahan Pangan
                    </Badge>
                    <Badge className={selectedSupplier.is_active !== false ? "bg-green-600 text-white text-xs" : "bg-red-600 text-white text-xs"}>
                      {selectedSupplier.is_active !== false ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-3.5 bg-gray-50/50 space-y-2 text-xs">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Penanggung Jawab:</span>
                  <span className="font-semibold text-gray-900">{selectedSupplier.full_name || "-"}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Email Akun:</span>
                  <span className="font-medium text-gray-900">{selectedSupplier.user_email || selectedSupplier.email || "-"}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">No. WhatsApp:</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-gray-900">{selectedSupplier.phone || "-"}</span>
                    {Boolean(selectedSupplier.wa_verified || selectedSupplier.verified) && (
                      <span className="block text-[10px] text-emerald-600 font-semibold">
                        ✓ Terverifikasi Gateway Fonnte
                      </span>
                    )}
                  </div>
                </div>
                {selectedSupplier.address && (
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground shrink-0">Alamat Usaha:</span>
                    <span className="text-right font-medium text-gray-900 max-w-[220px]">{selectedSupplier.address}</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Hari & Tanggal Daftar:</span>
                  <span className="text-gray-900 font-semibold">
                    {(() => {
                      const parts = formatDateTimeParts(selectedSupplier.created_date);
                      return parts.day !== "-" ? `${parts.day}, ${parts.dateFormatted}` : "-";
                    })()}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Waktu / Jam (Jam:Menit:Detik):</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-gray-900">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{formatDateTimeParts(selectedSupplier.created_date).time}</span>
                  </div>
                </div>
                {selectedSupplier.verified_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terverifikasi OTP Pada:</span>
                    <span className="text-emerald-700 font-mono font-medium text-xs">
                      {formatFullIndonesianDateTime(selectedSupplier.verified_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              {selectedSupplier.phone && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => {
                    const clean = selectedSupplier.phone.replace(/\D/g, "");
                    const target = clean.startsWith("0") ? "62" + clean.slice(1) : clean;
                    window.open(`https://wa.me/${target}`, "_blank");
                  }}
                >
                  <MessageCircle className="w-4 h-4" /> Chat WA
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setSelectedSupplier(null)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}