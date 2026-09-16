import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft, ClipboardList, CookingPot, Truck, CheckCircle2, XCircle,
  MapPin, Phone, User, CreditCard, Package, Ban,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getOrders, updateOrder, remoteToWargaOrder, REMOTE_STATUS_LABEL } from "@/lib/warga-store";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { restoreOrderStock } from "@/lib/stockManager";

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const FLOW = [
  { key: "Menunggu Konfirmasi", icon: ClipboardList, label: "Pesanan Dibuat" },
  { key: "Diproses", icon: CookingPot, label: "Dikemas & Disiapkan" },
  { key: "Dikirim", icon: Truck, label: "Dalam Perjalanan" },
  { key: "Selesai", icon: CheckCircle2, label: "Pesanan Diterima" },
];

const STATUS_STYLE = {
  "Menunggu Konfirmasi": "bg-amber-50 text-amber-700 border-amber-200",
  Diproses: "bg-blue-50 text-blue-700 border-blue-200",
  Dikirim: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Selesai: "bg-green-50 text-green-700 border-green-200",
  Dibatalkan: "bg-red-50 text-red-600 border-red-200",
};

const SIM_STATUSES = ["Menunggu Konfirmasi", "Diproses", "Dikirim", "Selesai", "Dibatalkan"];

export default function WargaPesananDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem("smartmbg_login_email") || "";

  const [order, setOrder] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Muat pesanan: prioritaskan Order cloud (remote), fallback ke daftar lokal
  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    const load = async () => {
      try {
        const remote = await base44.entities.Order.filter({ customer_email: email });
        const r = remote.find((o) => o.id === id || o.order_number === id);
        if (r) {
          if (!cancelled) setOrder(remoteToWargaOrder(r));
          return;
        }
        const local = getOrders(email).find((o) => o.id === id || o.order_number === id);
        if (local && !cancelled) {
          setOrder(local);
        }
      } catch {
        if (!cancelled) setOrder(getOrders(email).find((o) => o.id === id || o.order_number === id) || null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [email, id]);

  // Sinkronkan status dari Order nyata (di-update Supplier/Logistik)
  useEffect(() => {
    if (!email || !order?.order_number) return;
    const sync = async () => {
      try {
        const remote = await base44.entities.Order.filter({ customer_email: email });
        const r = remote.find((o) => o.order_number === order.order_number);
        if (!r) return;
        const label = REMOTE_STATUS_LABEL[r.status] || r.status;
        if (label && label !== order.status) {
          setOrder((prev) => ({ ...prev, status: label, remote_status: r.status }));
          updateOrder(email, order.id, { status: label, remote_status: r.status });
        }
      } catch {
        /* tetap pakai data lokal */
      }
    };
    sync();
    return base44.entities.Order.subscribe(sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, order?.order_number, order?.id]);

  const pushRemoteStatus = async (remoteStatus) => {
    if (!email) return;
    try {
      let targetId = order.remote_id || (order.remote ? order.id : null);
      if (!targetId) {
        const list = await base44.entities.Order.filter({ order_number: order.order_number });
        targetId = list[0]?.id;
      }
      if (targetId) {
        await base44.entities.Order.update(targetId, { status: remoteStatus });
      }
    } catch (err) {
      console.warn("Gagal mengirim status ke Order jarak jauh:", err);
    }
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <Package className="w-10 h-10 text-red-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Pesanan Tidak Ditemukan</h2>
          <p className="text-sm text-gray-500 mt-1">Pesanan mungkin telah dihapus.</p>
        </div>
        <button onClick={() => navigate("/warga/pesanan")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          Kembali ke Pesanan
        </button>
      </div>
    );
  }

  const cancelled = order.status === "Dibatalkan";
  const statusIndex = cancelled ? 0 : FLOW.findIndex((f) => f.key === order.status);
  const canCancel = !cancelled && !["Dikirim", "Selesai"].includes(order.status);
  const canReceive = order.status === "Dikirim";

  const trackingByLabel = (label) =>
    (order.tracking || []).find((t) => t.label.toLowerCase().includes(label.toLowerCase()));

  const setStatus = (status) => {
    const now = new Date();
    const time = now.toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const patch = { status };
    if (status === "Selesai") {
      patch.tracking = [...(order.tracking || []), { label: "Pesanan diterima", time, done: true }];
    } else if (status === "Dibatalkan") {
      patch.tracking = [...(order.tracking || []), { label: "Pesanan dibatalkan", time, done: true }];
    } else {
      patch.tracking = [
        { label: "Pesanan dibuat", time: order.tracking?.[0]?.time || time, done: true },
        ...(status === "Diproses"
          ? [{ label: "Pesanan dikemas", time, done: true }]
          : status === "Dikirim"
            ? [
                { label: "Pesanan dikemas", time: order.tracking?.[1]?.time || time, done: true },
                { label: "Pesanan dikirim", time, done: true },
              ]
            : []),
      ];
    }
    const updated = updateOrder(email, order.id, patch);
    setOrder((prev) => updated.find((o) => o.id === prev?.id) || { ...prev, ...patch });
    return time;
  };

  const handleReceive = () => {
    setStatus("Selesai");
    pushRemoteStatus("delivered");
    toast.success("Pesanan Diterima!", { description: "Terima kasih, semoga berbelanja menyenangkan." });
  };

  const handleCancel = async () => {
    setStatus("Dibatalkan");
    await restoreOrderStock(order);
    pushRemoteStatus("cancelled");
    toast.info("Pesanan Dibatalkan", { description: "Status pesanan diubah menjadi Dibatalkan." });
  };

  const handleSimulate = (status) => {
    setSimulating(true);
    setTimeout(() => {
      setStatus(status);
      setSimulating(false);
      toast.success(`Status: ${status}`);
    }, 400);
  };

  const addr = order.address || {};
  const trackingTime = (idx, label) => {
    const t = trackingByLabel(label);
    if (t?.time) return t.time;
    if (idx === 0) return order.created_at || "-";
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/warga/pesanan")} className="text-gray-400 hover:text-emerald-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">Pesanan #{order.order_number}</h1>
          <p className="text-xs text-gray-500">{order.created_at}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[order.status] || STATUS_STYLE["Menunggu Konfirmasi"]}`}>
          {order.status}
        </span>
      </div>

      {/* Tracking timeline */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-1.5 mb-5">
          <Truck className="w-4 h-4 text-emerald-600" /> Lacak Pesanan
        </h3>
        <div className="flex items-center">
          {FLOW.map((step, idx) => {
            const StIcon = step.icon;
            const isDone = !cancelled && idx <= statusIndex;
            const isCurrent = !cancelled && idx === statusIndex;
            const time = trackingTime(idx, step.label);
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center flex-1 relative">
                  <div
                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isDone
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-gray-200 text-gray-300"
                    }`}
                  >
                    {isDone && !isCurrent ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StIcon className="w-5 h-5" />
                    )}
                  </div>
                  <p className={`text-[10px] font-semibold mt-1.5 text-center ${isDone ? "text-gray-900" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  {time && <p className="text-[9px] text-gray-400 mt-0.5">{time}</p>}
                </div>
                {idx < FLOW.length - 1 && (
                  <div className={`flex-1 h-0.5 -mt-7 rounded ${!cancelled && idx < statusIndex ? "bg-emerald-500" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {cancelled && (
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <XCircle className="w-4 h-4" /> Pesanan ini telah dibatalkan.
          </div>
        )}

        <div className="flex gap-2.5 mt-5">
          {canReceive && (
            <button onClick={handleReceive} className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl py-2.5 transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Terima Pesanan
            </button>
          )}
          {canCancel && (
            <button onClick={handleCancel} className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl py-2.5 transition-colors">
              <Ban className="w-4 h-4" /> Batalkan Pesanan
            </button>
          )}
        </div>
      </div>

      {/* Simulasi status (demo) */}
      <div className="bg-white rounded-2xl border border-dashed border-emerald-300 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Simulasi Update Status</h3>
        <p className="text-[11px] text-gray-500 mb-3">
          Status asli diperbarui oleh Supplier & Logistik dan tampil otomatis di sini. Tombol di bawah
          untuk simulasi demo (hanya mengubah tampilan lokal).
        </p>
        <div className="flex flex-wrap gap-2">
          {SIM_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleSimulate(s)}
              disabled={simulating || order.status === s}
              className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 ${
                order.status === s
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Detail */}
        <div className="lg:col-span-2 space-y-5">
          {/* Alamat pengiriman */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5 mb-3">
              <MapPin className="w-4 h-4 text-emerald-600" /> Alamat Pengiriman
            </h3>
            {Object.keys(addr).length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada data alamat.</p>
            ) : (
              <div className="space-y-1.5 text-sm">
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" /> {addr.recipient_name || "-"}
                </p>
                <p className="text-gray-600 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  {addr.full_address}
                  {[addr.village, addr.district, addr.regency].filter(Boolean).join(", ")}
                  {addr.postal_code ? ` ${addr.postal_code}` : ""}
                </p>
                {addr.phone && <p className="text-gray-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-600" /> {addr.phone}</p>}
                {addr.notes && <p className="text-gray-500 italic text-xs">Catatan: {addr.notes}</p>}
              </div>
            )}
          </div>

          {/* Item pesanan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5 mb-3">
              <Package className="w-4 h-4 text-emerald-600" /> Item Pesanan ({order.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {(order.items || []).map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  {i.image_url ? (
                    <img src={i.image_url} alt={i.product_name} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-emerald-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{i.product_name}</p>
                    <p className="text-[11px] text-gray-500">{i.quantity} × {formatRp(i.price)} {i.unit && `/${i.unit}`}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatRp(i.price * i.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ringkasan pembayaran */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 h-fit lg:sticky lg:top-20">
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5 mb-4">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Pembayaran
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Metode</span>
              <span className="font-semibold text-gray-900">{order.payment_method || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900">{formatRp(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Biaya Pengiriman</span>
              <span className="font-medium text-gray-900">{formatRp(order.delivery_fee)}</span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between font-bold text-base">
              <span>Total Bayar</span>
              <span className="text-emerald-600">{formatRp(order.grand_total)}</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 text-center">
            {order.status === "Dibatalkan" ? "Pembayaran dibatalkan." : order.status === "Selesai" ? "Pembayaran lunas." : "Menunggu pembayaran / status berikutnya."}
          </p>
        </div>
      </div>
    </div>
  );
}
