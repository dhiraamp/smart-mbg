import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Users, ShoppingCart, Truck, Utensils } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import ProductActionDialog from "@/components/marketplace/ProductActionDialog";
import HomeHeader from "@/components/marketplace/HomeHeader";
import HeroSearch from "@/components/marketplace/HeroSearch";
import WeeklyMenuCards from "@/components/marketplace/WeeklyMenuCards";
import NewsSection from "@/components/marketplace/NewsSection";
import MarketCarousel from "@/components/marketplace/MarketCarousel";
import HomeSidebar from "@/components/marketplace/HomeSidebar";
import AdBanner from "@/components/marketplace/AdBanner";
import FooterStats from "@/components/marketplace/FooterStats";
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

export default function Marketplace() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const email = user?.email || "";
  const role = user?.role || localStorage.getItem("smartmbg_role") || "penerima";
  const cartUser = { email, id: user?.id || email, role };
  const { addToCart } = useCart(cartUser);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua Area");
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const CART_PATH = { penerima: "/warga/keranjang", mitra: "/mitra/cart" };

  useEffect(() => {
    base44.entities.Product
      .list("-created_date", 100)
      .then((data) => {
        const active = data.filter((p) => p.status === "active");
        setProducts(active.length ? active : FALLBACK_PRODUCTS);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Gagal memuat produk Marketplace:', error?.status, error?.message, error);
        setProducts(FALLBACK_PRODUCTS);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.supplier_name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [products, query]);

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
    if (!isAuthenticated) {
      navigate("/portal");
      return;
    }
    setSelected(normalizeProduct(p));
    setDialogOpen(true);
  };

  const handleAddToCart = async (p, qty = 1) => {
    if (!isAuthenticated) {
      navigate("/portal");
      return;
    }
    await addToCart(normalizeProduct(p), qty);
    toast.success(`"${p.name}" (${qty} ${p.unit}) masuk ke keranjang`);
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

  const handleAddToCartQty = async (qty) => {
    if (!selected) return;
    await addToCart(selected, qty);
    toast.success(`"${selected.name}" masuk ke keranjang`);
    setDialogOpen(false);
  };

  const handleBuyNowQty = async (qty) => {
    if (!selected) return;
    await addToCart(selected, qty);
    setDialogOpen(false);
    navigate(CART_PATH[role] || "/mitra/cart");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />
      <HeroSearch
        query={query}
        setQuery={setQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      <main className="max-w-full mx-auto px-4 py-6">
        <ProductActionDialog
          product={selected}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onAddToCart={handleAddToCartQty}
          onBuyNow={handleBuyNowQty}
        />
        {activeFilter === "Semua Area" ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <NewsSection />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <AdBanner />
              <WeeklyMenuCards />
              <MarketCarousel products={filtered} loading={loading} onAdd={handleAdd} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
            </div>
            <div className="lg:col-span-1">
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

      <GisMap />

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="max-w-full mx-auto px-4 pb-8"
      >
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-lg font-bold text-gray-900 mb-4"
        >
          Cara Kerja Smart MBG
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Users, step: "1", title: "Supplier Mendaftar", desc: "Supplier bahan pangan mendaftar dan diverifikasi ke platform" },
            { icon: ShoppingCart, step: "2", title: "Mitra/SPPG Memesan", desc: "Dapur MBG memesan kebutuhan bahan pangan sesuai menu mingguan" },
            { icon: Truck, step: "3", title: "Logistik Mengirim", desc: "Sistem logistik terintegrasi mengatur pengiriman ke seluruh dapur" },
            { icon: Utensils, step: "4", title: "Distribusi ke Sekolah", desc: "Makanan bergizi sampai ke siswa tepat waktu dan berkualitas" },
          ].map((item) => (
            <motion.div
              key={item.step}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3"
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {item.step}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <FooterStats />
    </div>
  );
}