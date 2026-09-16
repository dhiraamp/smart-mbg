import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ChevronRight, ShoppingBag, Truck, CheckCircle2, XCircle, Hourglass, CookingPot, Clock } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getOrders, remoteToWargaOrder, syncLocalWargaOrders } from "@/lib/warga-store";
import { base44 } from "@/api/base44Client";

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const STATUS_STYLE = {
  "Menunggu Konfirmasi": { icon: Hourglass, cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Diproses: { icon: CookingPot, cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Dikirim: { icon: Truck, cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Selesai: { icon: CheckCircle2, cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  Dibatalkan: { icon: XCircle, cls: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-500" },
};

export default function WargaPesanan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem("smartmbg_login_email") || "";
  const [orders, setOrders] = useState(() => getOrders(email));

  // Gabungkan Order dari rantai pasok (sumber status nyata) dengan pesanan lokal.
  // Order remote dijadikan sumber utama agar pesanan selalu tampil.
  useEffect(() => {
    if (!email) return;
    const sync = async () => {
      try {
        await syncLocalWargaOrders(email, base44);
        const [remote, local] = await Promise.all([
          base44.entities.Order.filter({ customer_email: email }),
          Promise.resolve(getOrders(email)),
        ]);
        const merged = new Map(local.map((o) => [o.order_number, o]));
        remote.forEach((r) => merged.set(r.order_number, remoteToWargaOrder(r)));
        const sorted = [...merged.values()].sort((a, b) => {
          const dateA = new Date(a.created_iso || 0).getTime();
          const dateB = new Date(b.created_iso || 0).getTime();
          return dateB - dateA;
        });
        setOrders(sorted);
      } catch {
        setOrders(getOrders(email));
      }
    };
    sync();
    return base44.entities.Order.subscribe(sync);
  }, [email]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pantau status belanja & pengiriman Anda</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
            <Package className="w-10 h-10 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Belum Ada Pesanan</h2>
            <p className="text-sm text-gray-500 mt-1">Pesanan yang Anda buat akan muncul di sini.</p>
          </div>
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Mulai Belanja
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = STATUS_STYLE[order.status] || STATUS_STYLE["Menunggu Konfirmasi"];
            const StIcon = st.icon;
            return (
              <button
                key={order.id}
                onClick={() => navigate(`/warga/pesanan/${order.id}`)}
                className="w-full text-left bg-white rounded-2xl border border-gray-200 p-4 hover:border-emerald-400 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                      <StIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">#{order.order_number}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {order.created_at || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${st.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {order.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-100">
                  <p className="text-xs text-gray-500">
                    {(order.items || []).length} item · {order.payment_method || "-"}
                  </p>
                  <p className="text-sm font-bold text-emerald-600">{formatRp(order.grand_total)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
