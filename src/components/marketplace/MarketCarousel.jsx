import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Zap, BadgeCheck, Package, Star } from "lucide-react";
import QuantityStepper from "@/components/marketplace/QuantityStepper";

const formatRp = (n) => "Rp " + (n || 0).toLocaleString("id-ID");

function ProductTile({ product, onAdd, onAddToCart, onBuyNow }) {
  const [qty, setQty] = useState(1);
  const stock = Number(product.stock || 0);
  const outOfStock = stock <= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      onClick={() => onAdd(product)}
      className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-emerald-400 cursor-pointer"
    >
      <div className="relative h-28 bg-gray-100">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
        )}
        <span className="absolute top-1.5 left-1.5 text-[10px] font-medium text-emerald-700 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <BadgeCheck className="w-3 h-3" /> Supplier Terverifikasi
        </span>
        {product.category && (
          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium text-white bg-black/50 backdrop-blur px-1.5 py-0.5 rounded capitalize">
            {product.category}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
        <p className="text-[10px] text-gray-500 truncate">{product.supplier_name || "Supplier MBG"}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] font-medium">4.5</span>
          <span className="text-[10px] text-gray-500 ml-auto">Stok: {product.stock ?? 0} {product.unit}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm font-bold text-emerald-700">
            {formatRp(product.price)}
            <span className="text-[10px] font-normal text-muted-foreground">/{product.unit}</span>
          </p>
        </div>
        <div className="flex items-center justify-between mt-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] text-gray-500">Jumlah</span>
          <QuantityStepper
            qty={qty}
            max={stock}
            disabled={outOfStock}
            onDec={() => setQty((q) => Math.max(1, q - 1))}
            onInc={() => setQty((q) => Math.min(stock || 999, q + 1))}
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product, qty); setQty(1); }}
            disabled={outOfStock}
            className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg py-1.5 transition-colors disabled:opacity-50"
          >
            <ShoppingCart className="w-3 h-3" /> Keranjang
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onBuyNow(product, qty); setQty(1); }}
            disabled={outOfStock}
            className="flex items-center justify-center gap-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg py-1.5 transition-colors disabled:opacity-50"
          >
            <Zap className="w-3 h-3" /> Beli
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MarketCarousel({ products, loading, onAdd, onAddToCart, onBuyNow }) {
  const navigate = useNavigate();
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Marketplace</h2>
        </div>
        <button
          onClick={() => navigate("/marketplace")}
          className="text-xs font-medium text-emerald-600 hover:underline"
        >
          Lihat Semua Produk
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))
          : products.slice(0, 8).map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ProductTile product={p} onAdd={() => onAdd(p)} onAddToCart={() => onAddToCart(p)} onBuyNow={() => onBuyNow(p)} />
              </motion.div>
            ))}
      </div>
    </section>
  );
}