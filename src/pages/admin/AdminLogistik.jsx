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
  Truck,
  Star,
  RefreshCw,
  Phone,
  MessageCircle,
  ShieldCheck,
  Search,
  UserCheck,
  UserX,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTimeParts, formatFullIndonesianDateTime } from "@/lib/utils";

const defaultFleet = [
  { id: "fl_1", name: "Pak Asep", sim: "SIM B1 - 12345678", vehicle: "Mobil Box (D 1234 AB)", capacity: "1000 kg", deliveries: 45, status: "active", rating: 4.7, ratingCount: 30, phone: "081234567801", wa_verified: true },
  { id: "fl_2", name: "Pak Dedi", sim: "SIM B1 - 87654321", vehicle: "Pickup (D 5678 CD)", capacity: "500 kg", deliveries: 38, status: "active", rating: 4.4, ratingCount: 22, phone: "081234567802", wa_verified: true },
  { id: "fl_3", name: "Pak Ujang", sim: "SIM A - 11223344", vehicle: "Mobil Box (D 9012 EF)", capacity: "800 kg", deliveries: 32, status: "active", rating: 4.1, ratingCount: 18, phone: "081234567803", wa_verified: true },
  { id: "fl_4", name: "Pak Ade", sim: "SIM C - 55667788", vehicle: "Motor (D 3456 GH)", capacity: "50 kg", deliveries: 28, status: "active", rating: 3.9, ratingCount: 12, phone: "081234567804", wa_verified: true },
];

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

export default function AdminLogistik() {
  const [logistikList, setLogistikList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  const [newRating, setNewRating] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const profiles = await base44.entities.UserProfile.filter({ role: "logistik" });
      const mergedMap = new Map();

      // Masukkan armada default terlebih dahulu
      defaultFleet.forEach((f) => mergedMap.set(f.id, f));

      // Masukkan profile riil dari database (termasuk yang baru register)
      (profiles || []).forEach((p) => {
        const key = p.id || p.user_email || p.phone;
        const vehicleInfo =
          p.vehicles && p.vehicles.length > 0
            ? `${p.vehicles[0].type || "Kendaraan"} (${p.vehicles[0].plate || "-"})`
            : p.vehicle_type || "Mobil Box";
        const capacityInfo =
          p.vehicles && p.vehicles.length > 0
            ? p.vehicles[0].capacity || "500 kg"
            : "500 kg";

        mergedMap.set(key, {
          id: p.id || key,
          name: p.full_name || p.organization_name || p.name || "Driver Logistik",
          email: p.user_email || p.email,
          phone: p.phone,
          sim: p.sim_number ? `${p.sim_type || "SIM"} - ${p.sim_number}` : (p.sim || "-"),
          vehicle: vehicleInfo,
          capacity: capacityInfo,
          vehicles: p.vehicles || [],
          deliveries: p.deliveries || 0,
          status: p.is_active !== false ? "active" : "pending",
          is_active: p.is_active !== false,
          rating: p.rating || 4.5,
          ratingCount: p.ratingCount || 5,
          wa_verified: Boolean(p.wa_verified || p.verified),
          created_date: p.created_date,
        });
      });

      setLogistikList(Array.from(mergedMap.values()));
    } catch (err) {
      console.error("Gagal memuat logistik:", err);
      toast.error("Gagal memuat data logistik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribe = base44.entities.UserProfile.subscribe(() => {
      loadData();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const toggleStatus = async (item) => {
    const newStatus = item.is_active === false;
    try {
      if (item.id && !item.id.startsWith("fl_")) {
        await base44.entities.UserProfile.update(item.id, { is_active: newStatus });
      }
      setLogistikList((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, is_active: newStatus, status: newStatus ? "active" : "pending" } : l))
      );
      toast.success(`Armada ${item.name} berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}`);
      if (selectedDriver && selectedDriver.id === item.id) {
        setSelectedDriver((prev) => ({ ...prev, is_active: newStatus, status: newStatus ? "active" : "pending" }));
      }
    } catch (e) {
      toast.error("Gagal mengubah status armada");
    }
  };

  const submitRating = () => {
    if (!newRating) return;
    setLogistikList((prev) =>
      prev.map((l) => {
        if (l.id === ratingModal.id) {
          const total = l.rating * l.ratingCount + newRating;
          const count = l.ratingCount + 1;
          return { ...l, rating: Math.round((total / count) * 10) / 10, ratingCount: count };
        }
        return l;
      })
    );
    toast.success(`Rating ${newRating} bintang untuk ${ratingModal.name} berhasil disimpan.`);
    setRatingModal(null);
    setNewRating(0);
  };

  const filtered = logistikList.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      (l.phone && l.phone.includes(q)) ||
      (l.sim && l.sim.toLowerCase().includes(q)) ||
      (l.vehicle && l.vehicle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Manajemen Logistik & Armada</h2>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
              {logistikList.length} Armada Terdaftar
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Kelola supir, kurir, dan armada distribusi yang terdaftar di ekosistem MBG
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-2 shrink-0">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari driver, nopol, nomor SIM..."
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
              <p className="text-sm">Memuat data armada logistik...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Truck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-base font-semibold text-gray-700">Tidak ada armada ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold">Nama Driver</TableHead>
                    <TableHead className="font-semibold">Kontak WA</TableHead>
                    <TableHead className="font-semibold">SIM</TableHead>
                    <TableHead className="font-semibold">Kendaraan</TableHead>
                    <TableHead className="font-semibold">Kapasitas</TableHead>
                    <TableHead className="font-semibold">Hari, Tanggal & Waktu</TableHead>
                    <TableHead className="font-semibold">Rating</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => {
                    const cleanPhone = (l.phone || "").replace(/\D/g, "");
                    const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}` : null;
                    const parts = formatDateTimeParts(l.created_date);

                    return (
                      <TableRow key={l.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                              {l.name[0]}
                            </div>
                            <div>
                              <div className="font-semibold">{l.name}</div>
                              {l.wa_verified && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold">
                                  <ShieldCheck className="w-3 h-3" /> WA Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {l.phone ? (
                            <div className="flex items-center gap-1.5 text-xs font-mono">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{l.phone}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs font-mono">{l.sim}</TableCell>

                        <TableCell>
                          <span className="flex items-center gap-1 text-xs font-medium">
                            <Truck className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                            {l.vehicle}
                          </span>
                        </TableCell>

                        <TableCell className="text-xs">{l.capacity}</TableCell>

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
                          {l.ratingCount > 0 ? (
                            <div>
                              <StarRating rating={l.rating} />
                              <span className="text-[10px] text-muted-foreground">({l.ratingCount})</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              l.is_active !== false
                                ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                            }
                          >
                            {l.is_active !== false ? "Aktif" : "Pending"}
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
                              onClick={() => setSelectedDriver(l)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                              onClick={() => {
                                setRatingModal(l);
                                setNewRating(0);
                              }}
                              title="Beri Rating"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                l.is_active !== false ? "text-red-500" : "text-green-600"
                              }`}
                              onClick={() => toggleStatus(l)}
                              title={l.is_active !== false ? "Nonaktifkan" : "Aktifkan"}
                            >
                              {l.is_active !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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

      {/* Modal Detail Driver */}
      {selectedDriver && (
        <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Truck className="w-5 h-5 text-amber-600" />
                Detail Driver / Kurir Logistik
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-sm">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg uppercase">
                  {selectedDriver.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900">{selectedDriver.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-white text-xs">
                      Role: Logistik MBG
                    </Badge>
                    <Badge className={selectedDriver.is_active !== false ? "bg-green-600 text-white text-xs" : "bg-yellow-600 text-white text-xs"}>
                      {selectedDriver.is_active !== false ? "Siap Bertugas" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-3 bg-gray-50/50 space-y-2 text-xs">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Nomor & Tipe SIM:</span>
                  <span className="font-mono font-bold text-gray-900">{selectedDriver.sim}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Kendaraan:</span>
                  <span className="font-semibold text-gray-900">{selectedDriver.vehicle}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Kapasitas Muatan:</span>
                  <span className="font-bold text-emerald-700">{selectedDriver.capacity}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">No. WhatsApp:</span>
                  <span className="font-mono font-bold text-gray-900">{selectedDriver.phone || "-"}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Verifikasi WhatsApp:</span>
                  <span className={selectedDriver.wa_verified ? "text-emerald-600 font-bold" : "text-gray-400"}>
                    {selectedDriver.wa_verified ? "✓ Terverifikasi Fonnte" : "Belum Verifikasi"}
                  </span>
                </div>
                {selectedDriver.created_date && (
                  <>
                    <div className="flex justify-between border-b pb-1.5">
                      <span className="text-muted-foreground">Hari & Tanggal Daftar:</span>
                      <span className="text-gray-900 font-semibold">
                        {(() => {
                          const parts = formatDateTimeParts(selectedDriver.created_date);
                          return parts.day !== "-" ? `${parts.day}, ${parts.dateFormatted}` : "-";
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Waktu / Jam (Jam:Menit:Detik):</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-gray-900">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{formatDateTimeParts(selectedDriver.created_date).time}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              {selectedDriver.phone && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => {
                    const clean = selectedDriver.phone.replace(/\D/g, "");
                    const target = clean.startsWith("0") ? "62" + clean.slice(1) : clean;
                    window.open(`https://wa.me/${target}`, "_blank");
                  }}
                >
                  <MessageCircle className="w-4 h-4" /> Chat WA
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setSelectedDriver(null)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Rating */}
      {ratingModal && (
        <Dialog open={!!ratingModal} onOpenChange={() => setRatingModal(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Beri Rating Driver</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium text-center">{ratingModal.name}</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setNewRating(s)}>
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        s <= newRating ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {newRating > 0 && (
                <p className="text-center text-sm font-medium text-primary">{newRating} Bintang</p>
              )}
              <Button className="w-full" onClick={submitRating} disabled={!newRating}>
                Kirim Rating
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}