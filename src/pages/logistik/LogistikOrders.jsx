import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, Receipt, TrendingUp, Camera, CheckCircle2, ShieldCheck, Play, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { notifyRoles } from "@/lib/notify";
import { toast } from "sonner";
import PodSubmitModal from "@/components/logistik/PodSubmitModal";
import PodViewModal from "@/components/logistik/PodViewModal";

const FEE_PER_KM = 2500; // Rp 2.500/km
const PLATFORM_FEE_RATE = 0.05; // 5% dari biaya pengiriman untuk platform
const STORAGE_KEY = "smartmbg_logistik_deliveries";

const DEFAULT_DELIVERIES = [
  {
    id: "DEL-001",
    mitra: "SPPG Garut Kota",
    area: "Kec. Garut Kota",
    distance: "5 km",
    status: "in_transit",
    items: "Beras Pandanwangi 50kg, Telur Ayam 20kg",
    date: "16 Sep 2026",
    driver: "Pak Asep Suhendar",
  },
  {
    id: "DEL-002",
    mitra: "SPPG Tarogong Kidul",
    area: "Kec. Tarogong Kidul",
    distance: "12 km",
    status: "delivered",
    items: "Sayur Bayam, Wortel, Bumbu Dapur",
    date: "15 Sep 2026",
    driver: "Pak Dedi Kusnadi",
    pod_image_url:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%2310b981'/><rect x='20' y='20' width='560' height='360' fill='%23ffffff' rx='16'/><circle cx='300' cy='150' r='60' fill='%23ecfdf5'/><path d='M275 150 L292 167 L325 134' stroke='%23059669' stroke-width='10' stroke-linecap='round' stroke-linejoin='round' fill='none'/><text x='300' y='240' font-family='Arial, sans-serif' font-size='20' font-weight='bold' text-anchor='middle' fill='%23065f46'>BUKTI SERAH TERIMA FISIK (POD)</text><text x='300' y='270' font-family='Arial, sans-serif' font-size='14' text-anchor='middle' fill='%234b5563'>Penerimaan Bahan Baku Dapur SPPG Tarogong Kidul</text><rect x='80' y='305' width='440' height='40' fill='%23f3f4f6' rx='8'/><text x='300' y='330' font-family='monospace' font-size='13' text-anchor='middle' fill='%231f2937'>KONDISI: LENGKAP &amp; DITERIMA IBU NINA</text></svg>",
    pod_recipient_name: "Ibu Nina Herlina",
    pod_recipient_role: "Pengelola Dapur SPPG",
    pod_notes: "Bahan pangan diterima segar, jumlah pas sesuai nota pesanan.",
    pod_received_at: "2026-09-15T14:30:00.000Z",
  },
  {
    id: "DEL-003",
    mitra: "SPPG Leles Mandiri",
    area: "Kec. Leles",
    distance: "18 km",
    status: "pending",
    items: "Daging Sapi Segar 25kg, Ikan Nila 30kg",
    date: "16 Sep 2026",
    driver: "Pak Asep Suhendar",
  },
  {
    id: "DEL-004",
    mitra: "SPPG Bayongbong Sejahtera",
    area: "Kec. Bayongbong",
    distance: "25 km",
    status: "in_transit",
    items: "Tepung Terigu 40kg, Gula Pasir 20kg",
    date: "16 Sep 2026",
    driver: "Pak Ujang Mulyana",
  },
  {
    id: "DEL-005",
    mitra: "SPPG Cibatu Hebat",
    area: "Kec. Cibatu",
    distance: "30 km",
    status: "pending",
    items: "Minyak Goreng 30L, Beras 60kg",
    date: "17 Sep 2026",
    driver: "-",
  },
];

const statusConfig = {
  pending: { label: "Menunggu", color: "bg-amber-50 text-amber-700 border-amber-200" },
  shipping: { label: "Dalam Pengiriman", color: "bg-blue-50 text-blue-700 border-blue-200" },
  in_transit: { label: "Dalam Pengiriman", color: "bg-blue-50 text-blue-700 border-blue-200" },
  delivered: { label: "Terkirim (Selesai)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const calcFee = (distStr) => {
  const km = parseFloat(distStr) || 10;
  const shippingFee = km * FEE_PER_KM;
  const platformFee = Math.round(shippingFee * PLATFORM_FEE_RATE);
  return { shippingFee, platformFee, total: shippingFee + platformFee };
};

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

export default function LogistikOrders() {
  const [deliveries, setDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState(null);
  const [podSubmitTarget, setPodSubmitTarget] = useState(null);
  const [podViewTarget, setPodViewTarget] = useState(null);

  // Inisialisasi daftar pengiriman (lokal + entitas Order Cloud)
  useEffect(() => {
    let localData = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        localData = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Gagal membaca localStorage logistik deliveries:", e);
    }

    if (!localData || localData.length === 0) {
      localData = DEFAULT_DELIVERIES;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DELIVERIES));
      } catch (e) {}
    }

    // Ambil order cloud dari base44.entities.Order
    base44.entities.Order.list()
      .then((cloudOrders) => {
        const relevant = (cloudOrders || []).filter(
          (o) => o.status === "shipping" || o.status === "delivered" || o.status === "in_transit" || o.logistic_id
        );

        const mappedCloud = relevant.map((o) => {
          const itemsStr = Array.isArray(o.items)
            ? o.items.map((i) => `${i.product_name || i.name} (${i.quantity || 1})`).join(", ")
            : "Bahan Baku Pangan";

          // Cek jika order sudah memiliki POD di tracking
          let podData = null;
          if (Array.isArray(o.tracking)) {
            const deliveredStep = o.tracking.find((t) => t.status === "delivered" && t.pod_image_url);
            if (deliveredStep) podData = deliveredStep;
          }

          return {
            id: o.order_number || o.id,
            realOrderId: o.id,
            mitra: o.mitra_name || "Mitra SPPG",
            area: o.delivery_area || o.mitra_address || "Garut",
            distance: o.distance || "10 km",
            status: o.status,
            items: itemsStr,
            date: o.created_date ? new Date(o.created_date).toLocaleDateString("id-ID") : "Hari ini",
            driver: o.driver || o.logistic_name || "Pak Asep Suhendar",
            pod_image_url: o.pod_image_url || podData?.pod_image_url,
            pod_recipient_name: o.pod_recipient_name || podData?.recipient_name,
            pod_recipient_role: o.pod_recipient_role || "Petugas Dapur SPPG",
            pod_notes: o.pod_notes || podData?.pod_notes,
            pod_received_at: o.pod_received_at || podData?.time,
          };
        });

        // Gabungkan tanpa duplikat id
        const idSet = new Set(mappedCloud.map((m) => m.id));
        const combined = [...mappedCloud, ...localData.filter((d) => !idSet.has(d.id))];
        setDeliveries(combined);
      })
      .catch((err) => {
        console.warn("Gagal memuat orders cloud:", err);
        setDeliveries(localData);
      });
  }, []);

  const saveDeliveries = (newItems) => {
    setDeliveries(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.warn("Gagal menyimpan deliveries:", e);
    }
  };

  // 1. Mulai Pengantaran (dari Pending ke In Transit)
  const handleStartTransit = async (d) => {
    const updated = deliveries.map((item) =>
      item.id === d.id ? { ...item, status: "in_transit" } : item
    );
    saveDeliveries(updated);

    if (d.realOrderId) {
      try {
        await base44.entities.Order.update(d.realOrderId, { status: "shipping" });
      } catch (e) {
        console.warn("Gagal update real order ke shipping:", e);
      }
    }

    toast.info("Pengantaran Dimulai", {
      description: `Kurir sedang menuju lokasi tujuan ${d.mitra}.`,
    });
  };

  // 2. Submit POD (Menyelesaikan Pengantaran dengan Foto Bukti)
  const handlePodSubmit = async ({
    deliveryId,
    pod_image_url,
    pod_recipient_name,
    pod_recipient_role,
    pod_notes,
    pod_received_at,
  }) => {
    const target = deliveries.find((d) => d.id === deliveryId);

    const updated = deliveries.map((item) => {
      if (item.id === deliveryId) {
        return {
          ...item,
          status: "delivered",
          pod_image_url,
          pod_recipient_name,
          pod_recipient_role,
          pod_notes,
          pod_received_at,
        };
      }
      return item;
    });

    saveDeliveries(updated);

    // Update entitas Order di Supabase / base44Client bila ada ID riil
    if (target?.realOrderId) {
      try {
        const existingOrder = await base44.entities.Order.get(target.realOrderId);
        const existingTracking = Array.isArray(existingOrder?.tracking) ? existingOrder.tracking : [];

        const newTrackingStep = {
          status: "delivered",
          time: pod_received_at,
          text: `Pesanan telah diterima oleh ${pod_recipient_name} (${pod_recipient_role})`,
          pod_image_url,
          recipient_name: pod_recipient_name,
          pod_notes,
        };

        await base44.entities.Order.update(target.realOrderId, {
          status: "delivered",
          tracking: [...existingTracking, newTrackingStep],
        });
      } catch (err) {
        console.warn("Gagal sync POD ke Supabase Order:", err);
      }
    }

    // Beri notifikasi realtime ke Mitra Dapur SPPG, Supplier, dan Admin
    try {
      await notifyRoles(["mitra", "supplier", "admin"], {
        type: "pod_submitted",
        title: "Pengantaran Selesai (POD)",
        message: `Bahan baku untuk ${target?.mitra || "Dapur SPPG"} telah tiba dan diserahterimakan kepada ${pod_recipient_name}. Bukti foto POD telah terverifikasi.`,
        ref_id: deliveryId,
      });
    } catch (notifErr) {
      console.warn("Gagal kirim notifikasi POD:", notifErr);
    }
  };

  // Filter tab
  const filteredDeliveries = deliveries.filter((d) => {
    if (activeTab === "all") return true;
    if (activeTab === "in_transit") return d.status === "in_transit" || d.status === "shipping";
    if (activeTab === "delivered") return d.status === "delivered";
    if (activeTab === "pending") return d.status === "pending";
    return true;
  });

  const totalShipping = deliveries.reduce((s, d) => s + calcFee(d.distance).shippingFee, 0);
  const totalPlatform = deliveries.reduce((s, d) => s + calcFee(d.distance).platformFee, 0);
  const totalEarnings = totalShipping - totalPlatform;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Data Pengiriman &amp; Biaya</h2>
          <p className="text-sm text-muted-foreground">
            Kelola pengiriman bahan baku pangan dan verifikasi bukti serah terima fisik (POD)
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50/70 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-bold uppercase tracking-wider">Total Pendapatan Kotor</span>
            </div>
            <p className="text-2xl font-extrabold text-blue-900">{formatRp(totalShipping)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{deliveries.length} total pengiriman terdaftar</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/70 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-orange-700 font-bold uppercase tracking-wider">Biaya Platform (5%)</span>
            </div>
            <p className="text-2xl font-extrabold text-orange-800">{formatRp(totalPlatform)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Dipotong otomatis sistem</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/70 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Pendapatan Bersih</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-900">{formatRp(totalEarnings)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Siap dicairkan ke rekening driver</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Filter */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { key: "all", label: "Semua Pengiriman", count: deliveries.length },
          {
            key: "in_transit",
            label: "Dalam Perjalanan",
            count: deliveries.filter((d) => d.status === "in_transit" || d.status === "shipping").length,
          },
          {
            key: "delivered",
            label: "Terkirim (Selesai)",
            count: deliveries.filter((d) => d.status === "delivered").length,
          },
          {
            key: "pending",
            label: "Menunggu Penjemputan",
            count: deliveries.filter((d) => d.status === "pending").length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.key ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Data Pengiriman */}
      <Card className="rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  <TableHead className="font-bold text-gray-700">No. Kirim</TableHead>
                  <TableHead className="font-bold text-gray-700">Mitra SPPG</TableHead>
                  <TableHead className="font-bold text-gray-700">Area</TableHead>
                  <TableHead className="font-bold text-gray-700">Jarak</TableHead>
                  <TableHead className="font-bold text-gray-700">Biaya Kirim</TableHead>
                  <TableHead className="font-bold text-gray-700">Driver</TableHead>
                  <TableHead className="font-bold text-gray-700">Status &amp; POD</TableHead>
                  <TableHead className="font-bold text-gray-700 text-right">Aksi Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      Tidak ada data pengiriman pada kategori ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeliveries.map((d) => {
                    const fee = calcFee(d.distance);
                    const isDelivered = d.status === "delivered";
                    const isShipping = d.status === "in_transit" || d.status === "shipping";
                    const isPending = d.status === "pending";
                    const hasPod = Boolean(d.pod_image_url);

                    return (
                      <TableRow key={d.id} className="hover:bg-slate-50/60 transition-colors">
                        <TableCell className="font-semibold text-gray-900 font-mono text-xs">{d.id}</TableCell>
                        <TableCell>
                          <p className="font-semibold text-gray-900 text-sm">{d.mitra}</p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{d.items}</p>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                            {d.area}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{d.distance}</TableCell>
                        <TableCell className="font-semibold text-xs text-gray-900">{formatRp(fee.shippingFee)}</TableCell>
                        <TableCell className="text-xs text-gray-700">{d.driver}</TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                            <Badge
                              variant="outline"
                              className={`text-[11px] px-2 py-0.5 font-semibold ${
                                statusConfig[d.status]?.color || "bg-gray-50 text-gray-700"
                              }`}
                            >
                              {statusConfig[d.status]?.label || d.status}
                            </Badge>
                            {hasPod && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <ShieldCheck className="w-3 h-3" /> Bukti POD Terlampir
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Tombol Mulai Kirim jika Pending */}
                            {isPending && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartTransit(d)}
                                className="text-xs h-8 rounded-xl border-blue-300 text-blue-700 hover:bg-blue-50 gap-1"
                              >
                                <Play className="w-3.5 h-3.5" />
                                Mulai Kirim
                              </Button>
                            )}

                            {/* Tombol Selesaikan (POD) jika sedang in_transit */}
                            {isShipping && (
                              <Button
                                size="sm"
                                onClick={() => setPodSubmitTarget(d)}
                                className="text-xs h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm gap-1.5"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                Selesaikan (POD)
                              </Button>
                            )}

                            {/* Tombol Lihat POD jika sudah Terkirim */}
                            {isDelivered && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPodViewTarget(d)}
                                className="text-xs h-8 rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-medium gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Bukti POD
                              </Button>
                            )}

                            {/* Tombol Rincian Detail */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-8 rounded-xl text-gray-600 hover:text-gray-900"
                              onClick={() => setSelected(d)}
                            >
                              Rincian
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Rincian Biaya & Manifest Pengiriman */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Truck className="w-5 h-5 text-emerald-600" />
              Rincian Pengiriman {selected?.id}
            </DialogTitle>
          </DialogHeader>
          {selected && (() => {
            const fee = calcFee(selected.distance);
            const hasPod = Boolean(selected.pod_image_url);

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-muted-foreground">Tujuan Mitra SPPG</p>
                    <p className="font-bold text-gray-900 mt-0.5">{selected.mitra}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jarak Tempuh</p>
                    <p className="font-bold text-gray-900 mt-0.5">{selected.distance}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Muatan Bahan Pangan</p>
                    <p className="font-medium text-gray-800 mt-0.5">{selected.items}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Driver Logistik</p>
                    <p className="font-bold text-gray-900 mt-0.5">{selected.driver}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tanggal</p>
                    <p className="font-medium text-gray-800 mt-0.5">{selected.date}</p>
                  </div>
                </div>

                {/* Section POD di Rincian */}
                {hasPod && (
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-emerald-900">Bukti Serah Terima Tersedia</p>
                        <p className="text-[11px] text-emerald-700">Diterima oleh: {selected.pod_recipient_name || "Petugas SPPG"}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelected(null);
                        setPodViewTarget(selected);
                      }}
                      className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                    >
                      Buka Foto
                    </Button>
                  </div>
                )}

                {/* Rincian Biaya */}
                <div className="bg-muted/40 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Rincian Tarif &amp; Pendapatan
                  </p>
                  <div className="flex justify-between text-xs text-gray-700">
                    <span>Biaya Pengiriman ({selected.distance} × Rp 2.500)</span>
                    <span className="font-semibold">{formatRp(fee.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-orange-600">
                    <span className="flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5" />
                      Biaya Layanan Platform (5%)
                    </span>
                    <span className="font-semibold">- {formatRp(fee.platformFee)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm text-emerald-700">
                    <span>Pendapatan Bersih Driver</span>
                    <span>{formatRp(fee.shippingFee - fee.platformFee)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Badge
                    variant="outline"
                    className={`${statusConfig[selected.status]?.color} py-1 px-3 text-xs font-semibold`}
                  >
                    {statusConfig[selected.status]?.label || selected.status}
                  </Badge>

                  {selected.status !== "delivered" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelected(null);
                        setPodSubmitTarget(selected);
                      }}
                      className="text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Input Bukti POD
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Modal Input Bukti Serah Terima (POD) */}
      <PodSubmitModal
        open={Boolean(podSubmitTarget)}
        delivery={podSubmitTarget}
        onClose={() => setPodSubmitTarget(null)}
        onSubmit={handlePodSubmit}
      />

      {/* Modal Lihat Bukti Serah Terima (POD) */}
      <PodViewModal
        open={Boolean(podViewTarget)}
        delivery={podViewTarget}
        onClose={() => setPodViewTarget(null)}
      />
    </div>
  );
}