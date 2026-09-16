import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, MapPin, Star, ImageOff } from "lucide-react";

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const categoryEmoji = {
  sayuran: "🥬", buah: "🍎", daging: "🥩", ikan: "🐟",
  beras: "🍚", telur: "🥚", bumbu: "🧄", susu: "🥛",
  minyak: "🫒", tepung: "🌾", lainnya: "📦",
};

export default function ProductCard({ product, onAdd }) {
  const isOut = product.status === "out_of_stock" || product.stock <= 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18 }}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-300 transition-all"
    >
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <ImageOff className="w-8 h-8 mb-1" />
            <span className="text-xs">{categoryEmoji[product.category] || "📦"}</span>
          </div>
        )}
        {isOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">Stok Habis</span>
          </div>
        )}
        {product.promoteRow && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow">
            <Star className="w-2.5 h-2.5 fill-current" /> PROMO
          </div>
        )}
      </div>

      <div className="p-2.5 space-y-1">
        <p className="text-sm text-slate-800 line-clamp-2 leading-tight min-h-[2.5rem]">{product.name}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-500 flex items-center gap-0.5 truncate">
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{product.supplier_name || "Supplier"}</span>
          </span>
          <span className="text-[10px] capitalize bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
            {categoryEmoji[product.category] || "📦"} {product.category}
          </span>
        </div>
        {!isOut && onAdd && (
          <button
            onClick={() => onAdd(product)}
            className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <ShoppingCart className="w-3 h-3" /> Tambah
          </button>
        )}
      </div>
    </motion.div>
  );
}