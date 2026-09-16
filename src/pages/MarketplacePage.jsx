import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Zap,
  ArrowLeft,
  Info,
  MapPin,
  Leaf,
  Truck,
  CheckCircle2,
  X,
  Star,
} from "lucide-react";
import HomeHeader from "@/components/marketplace/HomeHeader";
import FooterStats from "@/components/marketplace/FooterStats";
import QuantityStepper from "@/components/marketplace/QuantityStepper";
import { PRODUCTS, CATEGORIES, formatRp } from "@/lib/marketplace";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/hooks/useCart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const SHIPPING_NOTE =
  "Untuk menjaga kualitas dan kesegaran produk, pengiriman ini tidak disarankan menggunakan jadwal pengiriman terjadwal (schedule delivery).";

function ProductCard({ product, onView, onAddToCart, onBuyNow }) {
  const [qty, setQty] = useState(1);
  const stock = Number(product.stock || 0);
  const outOfStock = stock <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-emerald-400 transition-all flex flex-col"
    >
      <div className="relative h-28 bg-gray-100 overflow-hidden">
        <img
          src={product.img}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold text-emerald-700 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <Leaf className="w-3 h-3" /> Segar
        </span>
        <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium text-white bg-black/50 backdrop-blur px-1.5 py-0.5 rounded capitalize">
          {product.category}
        </span>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">{product.name}</p>
        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
          <MapPin className="w-3 h-3 shrink-0" /> {product.origin}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">4.5</span>
          <span className="text-xs text-gray-500 ml-auto">Stok: {product.stock} {product.unit}</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="font-bold text-sm text-emerald-700">
            {formatRp(product.price)}
            {product.old_price > product.price && (
              <span className="text-xs text-gray-400 line-through ml-1 font-normal">{formatRp(product.old_price)}</span>
            )}
            <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
          </p>
          <button
            onClick={() => onView(product)}
            title="Info Gizi"
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg p-1.5 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
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
            onClick={() => { onAddToCart(product, qty); setQty(1); }}
            disabled={outOfStock}
            className="flex items-center justify-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg py-2 transition-colors disabled:opacity-50"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Keranjang
          </button>
          <button
            onClick={() => { onBuyNow(product, qty); setQty(1); }}
            disabled={outOfStock}
            className="flex items-center justify-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg py-2 transition-colors disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" /> Beli
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MarketplacePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const email = user?.email || "";
  const role = user?.role || localStorage.getItem("smartmbg_role") || "penerima";
  const cartUser = { email, id: user?.id || email, role };
  const { addToCart } = useCart(cartUser);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [selected, setSelected] = useState(null);

  const CART_PATH = { penerima: "/warga/keranjang", mitra: "/mitra/cart" };

  const normalizeProduct = (p) => ({
    id: p.id,
    name: p.name,
    supplier: p.origin || "",
    category: p.category,
    price: p.price,
    base_price: p.base_price ?? p.price,
    unit: p.unit,
    stock: p.stock,
    image: p.img,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchCat = category === "Semua" || p.category === category;
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, category]);

  const handleAddToCart = async (p, qty = 1) => {
    if (!isAuthenticated) {
      navigate("/portal");
      return;
    }
    await addToCart(normalizeProduct(p), qty);
    toast.success(`"${p.name}" (${qty} ${p.unit}) masuk ke keranjang`, {
      description: `${formatRp(p.price * qty)}`,
    });
  };

  const handleBuyNow = async (p, qty = 1) => {
    if (!isAuthenticated) {
      navigate("/portal");
      return;
    }
    await addToCart(normalizeProduct(p), qty);
    const path = CART_PATH[role];
    if (path) {
      navigate(path);
    } else {
      toast.success(`"${p.name}" (${qty} ${p.unit}) masuk ke keranjang`);
    }
  };

  const nutritionRows = selected
    ? [
        { label: "Kalori", value: selected.nutrition.kalori, unit: "kkal" },
        { label: "Protein", value: selected.nutrition.protein, unit: "g" },
        { label: "Karbohidrat", value: selected.nutrition.karbo, unit: "g" },
        { label: "Lemak", value: selected.nutrition.lemak, unit: "g" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      <section className="relative border-b border-gray-200">
        <div className="absolute inset-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/85 to-teal-800/80" />
        </div>
        <div className="relative max-w-full mx-auto px-4 py-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm text-white/80 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Marketplace Bahan Baku MBG</h1>
          <p className="text-white/80 text-sm mt-1.5 max-w-2xl">
            Produk segar & bahan baku dengan harga pasaran terendah di Kabupaten Garut, Jawa Barat. Foto asli menggambarkan bahan, lengkap dengan informasi gizi per 100 gram.
          </p>

          <div className="mt-5 flex items-stretch bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl">
            <div className="flex items-center pl-4">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kentang, telur, cabai, atau kebutuhan lainnya..."
              className="flex-1 px-3 py-3 text-sm outline-none"
            />
            <button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 transition-colors"
            >
              Cari
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  category === c
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white/10 text-white/85 border-white/30 hover:bg-white/20"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-full mx-auto px-4 py-6">
        <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5">
          <Truck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">{SHIPPING_NOTE}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {category === "Semua" ? "Semua Produk" : category}
            </h2>
            <p className="text-xs text-gray-500">{filtered.length} produk ditemukan</p>
          </div>
          {(query || category !== "Semua") && (
            <button
              onClick={() => {
                setQuery("");
                setCategory("Semua");
              }}
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Tidak ada produk yang cocok dengan pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onView={setSelected} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {selected.desc}
                </DialogDescription>
              </DialogHeader>
              <img
                src={selected.img}
                alt={selected.name}
                referrerPolicy="no-referrer"
                className="w-full h-44 object-cover rounded-lg"
              />
              <div className="flex items-center justify-between text-sm">
                <p className="text-emerald-600 font-bold">{formatRp(selected.price)} <span className="text-[10px] text-gray-400 font-normal">/{selected.unit}</span></p>
                <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {selected.origin}</p>
              </div>

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-emerald-600 text-white text-[11px] font-semibold px-3 py-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Informasi Gizi (per 100 g)
                </div>
                <div className="divide-y divide-gray-100">
                  {nutritionRows.map((r) => (
                    <div key={r.label} className="flex items-center justify-between px-3 py-2 text-[12px] text-gray-700">
                      <span className="font-medium">{r.label}</span>
                      <span className="font-bold text-gray-900">{r.value} {r.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="flex items-start gap-2 text-[11px] text-gray-500 leading-relaxed">
                <Truck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />
                {SHIPPING_NOTE}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddToCart(selected)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl py-2.5 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" /> Masukkan Keranjang
                </button>
                <button
                  onClick={() => handleBuyNow(selected)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl py-2.5 transition-colors"
                >
                  <Zap className="w-4 h-4" /> Beli Langsung
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="flex items-center justify-center text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl py-2.5 px-4 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <FooterStats />
    </div>
  );
}
