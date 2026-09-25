// @ts-nocheck
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  ShoppingCart,
  Truck,
  Utensils,
  Search,
  Sparkles,
  MapPin,
  TrendingUp,
  Tag,
  Home,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useProductsQuery } from "@/lib/query-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { feedbackToast, triggerHaptic } from "@/lib/feedback";
import ProductActionDialog from "@/components/marketplace/ProductActionDialog";
import HomeHeader from "@/components/marketplace/HomeHeader";
import HeroSearch from "@/components/marketplace/HeroSearch";
import WeeklyMenuCards from "@/components/marketplace/WeeklyMenuCards";
import NewsSection from "@/components/marketplace/NewsSection";
import MarketCarousel from "@/components/marketplace/MarketCarousel";
import HomeSidebar from "@/components/marketplace/HomeSidebar";
import AdBanner from "@/components/marketplace/AdBanner";
import KnowledgeSection from "@/components/marketplace/KnowledgeSection";
import GisMap from "@/components/marketplace/GisMap";

const FALLBACK_PRODUCTS = [
  { id: "sample-1", name: "Beras Premium Setra Ramos", supplier_name: "UD. Sumber Rejeki", category: "Beras", price: 15500, stock: 200, unit: "kg", status: "active", image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300" },
  { id: "sample-2", name: "Beras Merah Organik", supplier_name: "Tani Organik", category: "Beras", price: 22000, stock: 80, unit: "kg", status: "active", image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300" },
  { id: "sample-3", name: "Ikan Nila Segar", supplier_name: "Nelayan Harapan", category: "Protein", price: 35000, stock: 50, unit: "kg", status: "active", image_url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=300" },
  { id: "sample-4", name: "Minyak Goreng Bimoli", supplier_name: "PT. Indofood", category: "Minyak", price: 18000, stock: 150, unit: "liter", status: "active", image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300" },
  { id: "sample-5", name: "Daging Sapi Segar", supplier_name: "Rumah Potong Sapi", category: "Protein", price: 135000, stock: 30, unit: "kg", status: "active", image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300" },
  { id: "sample-6", name: "Telur Ayam Negeri", supplier_name: "Peternakan Maju", category: "Protein", price: 28000, stock: 100, unit: "kg", status: "active", image_url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300" },
  { id: "sample-7", name: "Tahu Putih", supplier_name: "Pabrik Tahu Sejahtera", category: "Olahan", price: 12000, stock: 60, unit: "kg", status: "active", image_url: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb2c?w=300" },
  { id: "sample-8", name: "Tempe Kedelai", supplier_name: "Pengrajin Tempe", category: "Olahan", price: 10000, stock: 80, unit: "kg", status: "active", image_url: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb2c?w=300" },
  { id: "sample-9", name: "Kangkung Segar", supplier_name: "Petani Hidroponik", category: "Sayur", price: 5000, stock: 40, unit: "ikat", status: "active", image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300" },
  { id: "sample-10", name: "Cabai Merah Keriting", supplier_name: "Petani Cabai", category: "Bumbu", price: 45000, stock: 25, unit: "kg", status: "active", image_url: "https://images.unsplash.com/photo-1592137403099-624c888e3f4d?w=300" },
];

const CATEGORIES = [
  "Semua Kategori",
  "Beras",
  "Protein",
  "Sayur",
  "Olahan",
  "Minyak",
  "Bumbu",
];

export default function Marketplace() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const email = user?.email || "";
  const role = user?.role || localStorage.getItem("smartmbg_role") || "penerima";
  const cartUser = { email, id: user?.id || email, role };
  const { addToCart, cartItems } = useCart(cartUser);

  // TanStack Query Caching Layer (instan 0ms saat navigasi kembali)
  const { data: rawProducts, isLoading: loadingProducts } = useProductsQuery("all");
  const products = rawProducts && rawProducts.length > 0 ? rawProducts : FALLBACK_PRODUCTS;

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [activeFilter, setActiveFilter] = useState("Semua Area");
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const CART_PATH = { penerima: "/warga/keranjang", mitra: "/mitra/cart" };

  // Filter produk gabungan: text query + category pill
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.supplier_name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === "Semua Kategori" ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCategory;
    });
  }, [products, query, selectedCategory]);

  const normalizeProduct = (p) => ({
    id: p.id,
    name: p.name,
    supplier: p.supplier_name || p.supplier || "",
    category: p.category || "",
    price: p.price,
    base_price: p.base_price ?? p.price,
    unit: p.unit,
    stock: p.stock,
    image: p.image_url || p.image || "",
  });

  const handleAdd = (p) => {
    triggerHaptic("light");
    setSelected(normalizeProduct(p));
    setDialogOpen(true);
  };

  const handleAddToCartQty = async (qty) => {
    if (!isAuthenticated) {
      feedbackToast.info("Silakan masuk ke Portal terlebih dahulu untuk berbelanja");
      navigate("/portal");
      return;
    }
    if (!selected) return;
    await addToCart(selected, qty);
    feedbackToast.cartAdded(selected.name, qty, selected.unit || "kg");
    setDialogOpen(false);
  };

  const handleBuyNowQty = async (qty) => {
    if (!isAuthenticated) {
      feedbackToast.info("Silakan masuk ke Portal terlebih dahulu untuk berbelanja");
      navigate("/portal");
      return;
    }
    if (!selected) return;
    await addToCart(selected, qty);
    setDialogOpen(false);
    navigate(CART_PATH[role] || "/mitra/cart");
  };

  const totalCartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-8 flex flex-col justify-between">
      <div>
        <HomeHeader />

        {/* Live Bapokting Ticker Bar */}
        <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-800/60 overflow-x-auto whitespace-nowrap">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white">Live Bapokting Garut:</span>
            </div>
            <div className="flex items-center gap-6 text-[11px] text-emerald-200">
              <span>Beras Premium: <strong>Rp 15.500/kg</strong> (Stabil)</span>
              <span>Daging Ayam: <strong>Rp 38.000/kg</strong> (Stabil)</span>
              <span>Telur Ayam Ras: <strong>Rp 28.000/kg</strong> (Turun Rp 500)</span>
              <span>Daging Sapi: <strong>Rp 135.000/kg</strong> (Stabil)</span>
              <span>Cabai Keriting: <strong>Rp 45.000/kg</strong></span>
            </div>
            <div className="shrink-0 hidden md:block">
              <span className="text-[10px] text-emerald-300">Resmi Disperindag Garut</span>
            </div>
          </div>
        </div>

        {/* Hero Search Section */}
        <HeroSearch
          query={query}
          setQuery={setQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />

        {/* Horizontal Quick Category Chips (Mobile & Desktop) */}
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-semibold text-gray-500 shrink-0 mr-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Kategori:
            </span>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout */}
        <main className="max-w-7xl mx-auto px-4 py-4">
          <ProductActionDialog
            product={selected}
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onAddToCart={handleAddToCartQty}
            onBuyNow={handleBuyNowQty}
          />

          {activeFilter === "Semua Area" ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Kolom Kiri: Berita & Pengumuman */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <NewsSection />
              </div>

              {/* Kolom Tengah: Produk & Menu */}
              <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
                <AdBanner />
                <WeeklyMenuCards />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">
                        Katalog Komoditas Pangan Garut
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {filtered.length} komoditas siap dipesan untuk kebutuhan Dapur SPPG
                      </p>
                    </div>
                  </div>
                  <MarketCarousel products={filtered} loading={loadingProducts} onAdd={handleAdd} />
                </div>
              </div>

              {/* Kolom Kanan: Sidebar Dapur & Supplier */}
              <div className="lg:col-span-1 order-3">
                <HomeSidebar />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <KnowledgeSection activeFilter={activeFilter} />
              </div>
              <div className="lg:col-span-1">
                <HomeSidebar />
              </div>
            </div>
          )}
        </main>

        {/* GIS Map Section */}
        <div id="gis" className="max-w-7xl mx-auto px-4 py-4">
          <GisMap />
        </div>
      </div>

      {/* Floating Bottom Sticky Navigation Bar for Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 py-2 shadow-2xl flex items-center justify-around">
        <Link
          to="/"
          className="flex flex-col items-center gap-0.5 text-emerald-700 hover:text-emerald-800"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Beranda</span>
        </Link>

        <a
          href="#gis"
          className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-emerald-700"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] font-medium">Peta SPPG</span>
        </a>

        <Link
          to={CART_PATH[role] || "/warga/keranjang"}
          className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-emerald-700 relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Keranjang</span>
        </Link>

        <Link
          to="/portal"
          className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-emerald-700"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">{isAuthenticated ? "Akun" : "Masuk"}</span>
        </Link>
      </div>
    </div>
  );
}