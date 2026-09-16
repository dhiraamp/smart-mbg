import React, { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingCart, Zap, Package } from "lucide-react";

const formatRp = (n) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function ProductActionDialog({ product, open, onClose, onAddToCart, onBuyNow }) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (open) setQty(1);
  }, [open]);

  if (!open || !product) return null;

  const stock = product.stock ?? 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-44 bg-gray-100">
          {product.image_url || product.image ? (
            <img
              src={product.image_url || product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base font-bold text-gray-900 leading-snug">{product.name}</p>
              {product.supplier_name && <p className="text-xs text-gray-500 mt-0.5">{product.supplier_name}</p>}
            </div>
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
              {stock > 0 ? `Stok ${stock} ${product.unit || ""}` : "Habis"}
            </span>
          </div>

          <p className="mt-3 text-lg font-bold text-emerald-600">
            {formatRp(product.price)}
            <span className="text-xs text-gray-400 font-normal"> / {product.unit}</span>
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Jumlah</span>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={stock <= 0} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40" aria-label="Kurangi">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(stock || 999, q + 1))} disabled={stock <= 0} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40" aria-label="Tambah">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400">{stock <= 0 ? "Stok tidak tersedia" : `Sisa stok ${stock}`}</p>
          </div>

          <div className="mt-5 space-y-2">
            <button
              onClick={() => onAddToCart(qty)}
              disabled={stock <= 0}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl py-3 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" /> Masukkan ke Keranjang
            </button>
            <button
              onClick={() => onBuyNow(qty)}
              disabled={stock <= 0}
              className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 text-sm font-semibold rounded-xl py-3 transition-colors"
            >
              <Zap className="w-4 h-4" /> Beli Langsung
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
