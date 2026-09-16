import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft, Truck, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/hooks/useCart";
import { formatRp } from "@/lib/marketplace";
import { toast } from "sonner";

const DELIVERY_FEE = 12000;

export default function WargaKeranjang() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem("smartmbg_login_email") || "";
  const wargaUser = { email, id: user?.id || email, role: "penerima" };
  const { cartItems, loading, updateQty, removeFromCart, clearCart, totalItems, subtotal } = useCart(wargaUser);
  const [clearing, setClearing] = useState(false);

  const grandTotal = subtotal + DELIVERY_FEE;

  const handleClear = async () => {
    setClearing(true);
    await clearCart();
    setClearing(false);
    toast.success("Keranjang dikosongkan");
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 text-emerald-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Keranjang Kosong</h2>
          <p className="text-sm text-gray-500 mt-1">Yuk mulai belanja bahan segar untuk kebutuhan Anda.</p>
        </div>
        <button
          onClick={() => navigate("/marketplace")}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <ShoppingBag className="w-4 h-4" /> Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Keranjang</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalItems} item</p>
        </div>
        <button onClick={handleClear} disabled={clearing} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline">
          <Trash2 className="w-3 h-3" /> Kosongkan
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-3 flex gap-3">
              {item.image_url ? (
                <img src={item.image_url} alt={item.product_name} referrerPolicy="no-referrer" className="w-20 h-20 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-6 h-6 text-emerald-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.product_name}</p>
                    {item.supplier_name && <p className="text-[11px] text-gray-500">{item.supplier_name}</p>}
                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                      {formatRp(item.price)} <span className="text-[10px] text-gray-400 font-normal">/{item.unit}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                    aria-label={`Hapus ${item.product_name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.id, (item.quantity || 1) - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50" aria-label="Kurangi">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold">{item.quantity || 1}</span>
                    <button onClick={() => updateQty(item.id, (item.quantity || 1) + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50" aria-label="Tambah">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatRp(item.price * (item.quantity || 1))}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 h-fit lg:sticky lg:top-20">
          <h3 className="font-bold text-gray-900 mb-4">Ringkasan Belanja</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal ({totalItems} item)</span>
              <span className="font-medium text-gray-900">{formatRp(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Biaya Pengiriman</span>
              <span className="font-medium text-gray-900">{formatRp(DELIVERY_FEE)}</span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between font-bold text-base">
              <span>Total Bayar</span>
              <span className="text-emerald-600">{formatRp(grandTotal)}</span>
            </div>
          </div>
          <Button
            onClick={() => navigate("/warga/checkout")}
            className="w-full mt-4 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            Checkout — {formatRp(grandTotal)}
          </Button>
          <button
            onClick={() => navigate("/marketplace")}
            className="mt-2 w-full flex items-center justify-center gap-1 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Lanjut Belanja
          </button>
        </div>
      </div>
    </div>
  );
}
