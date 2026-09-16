import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, ShoppingCart, Zap, Package, MapPin, Leaf, Clock, ChevronRight, Star } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/hooks/useCart";
import { PRODUCTS, formatRp } from "@/lib/marketplace";
import { getOrders } from "@/lib/warga-store";
import { toast } from "sonner";
import QuantityStepper from "@/components/marketplace/QuantityStepper";

export default function WargaBeranda() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem("smartmbg_login_email") || "";
  const wargaUser = { email, id: user?.id || email, role: "penerima" };
  const { totalItems, addToCart } = useCart(wargaUser);
  const [qtyMap, setQtyMap] = useState({});
  const setQty = (id, v) => setQtyMap((m) => ({ ...m, [id]: v }));
  const orders = getOrders(email);
  const activeOrders = orders.filter(o => !["Selesai", "Dibatalkan"].includes(o.status));

  const name = localStorage.getItem("smartmbg_name") || email.split("@")[0] || "Warga";
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const handleAdd = (p, qty = 1) => {
    if (!email) return;
    addToCart({ ...p, image: p.img }, qty);
    toast.success(`"${p.name}" (${qty} ${p.unit}) masuk ke keranjang`, { description: `${formatRp(p.price * qty)}` });
  };

  const handleBuy = (p, qty = 1) => {
    if (!email) return;
    addToCart({ ...p, image: p.img }, qty);
    navigate("/warga/keranjang");
  };

  const quickActions = [
    { label: "Belanja", desc: "Bahan segar & kebutuhan", icon: ShoppingBag, path: "/marketplace", color: "from-emerald-400 to-teal-500", badge: null },
    { label: "Keranjang", desc: `${totalItems} item`, icon: ShoppingCart, path: "/warga/keranjang", color: "from-teal-400 to-cyan-500", badge: totalItems },
    { label: "Pesanan", desc: activeOrders.length ? `${activeOrders.length} aktif` : "Belum ada", icon: Package, path: "/warga/pesanan", color: "from-green-400 to-emerald-500", badge: activeOrders.length },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Halo, {name} 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">{today}</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <MapPin className="w-3 h-3" /> Kabupaten Garut
        </span>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((a) => (
          <motion.button
            key={a.label}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(a.path)}
            className="bg-white rounded-2xl border border-gray-200 p-4 text-left hover:border-emerald-400 hover:shadow-md transition-all relative"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center relative`}>
              <a.icon className="w-5 h-5 text-white" />
              {a.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {a.badge}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-gray-900 mt-2.5">{a.label}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{a.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Promo banner */}
      <div className="relative overflow-hidden rounded-2xl">
        <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200" alt="" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-emerald-900/70 to-transparent" />
        <div className="relative p-5">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-100">
            <Leaf className="w-3 h-3" /> Program MBG Garut
          </span>
          <h3 className="text-lg font-bold text-white mt-1 max-w-xs leading-snug">
            Bahan segar & bergizi untuk keluarga sehat
          </h3>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-xs">
            Belanja bahan pangan berkualitas dengan harga pasaran terendah.
          </p>
          <button
            onClick={() => navigate("/marketplace")}
            className="mt-3 inline-flex items-center gap-1 bg-white text-emerald-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Belanja Sekarang <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Produk pilihan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Produk Pilihan</h2>
          <button onClick={() => navigate("/marketplace")} className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 hover:underline">
            Lihat Semua <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {PRODUCTS.slice(0, 4).map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col">
              <div className="relative h-28 bg-gray-100 overflow-hidden">
                <img src={p.img} alt={p.name} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover" />
                <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium text-white bg-black/50 backdrop-blur px-1.5 py-0.5 rounded capitalize">{p.category}</span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                <p className="text-[11px] text-gray-500 flex items-center gap-0.5 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 shrink-0" /> {p.origin}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">4.5</span>
                  <span className="text-xs text-gray-500 ml-auto">Stok: {p.stock} {p.unit}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-sm font-bold text-emerald-700">
                    {formatRp(p.price)}
                    <span className="text-[10px] font-normal text-gray-400">/{p.unit}</span>
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-gray-500">Jumlah</span>
                  <QuantityStepper
                    qty={qtyMap[p.id] || 1}
                    max={Number(p.stock || 0)}
                    disabled={Number(p.stock || 0) <= 0}
                    onDec={() => setQty(p.id, Math.max(1, (qtyMap[p.id] || 1) - 1))}
                    onInc={() => setQty(p.id, Math.min(Number(p.stock || 0) || 999, (qtyMap[p.id] || 1) + 1))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <button
                    onClick={() => { handleAdd(p, qtyMap[p.id] || 1); setQty(p.id, 1); }}
                    className="flex items-center justify-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg py-2 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Keranjang
                  </button>
                  <button
                    onClick={() => { handleBuy(p, qtyMap[p.id] || 1); setQty(p.id, 1); }}
                    className="flex items-center justify-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" /> Beli
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pesanan aktif ringkas */}
      {activeOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{activeOrders.length} pesanan aktif</p>
              <p className="text-xs text-gray-500">Pantau status pengiriman Anda</p>
            </div>
          </div>
          <button onClick={() => navigate("/warga/pesanan")} className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 hover:underline">
            Lihat <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
