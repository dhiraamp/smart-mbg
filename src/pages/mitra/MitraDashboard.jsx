import React, { useState, useEffect, useCallback } from "react";
import StatCard from "@/components/shared/StatCard";
import { ShoppingCart, Package, TrendingUp, AlertCircle, Search, Star, Filter, CheckCircle } from "lucide-react";
import SmartRecommendations from "@/components/mitra/SmartRecommendations";
import StockAlertBanner from "@/components/mitra/StockAlertBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useUserProfile } from "@/hooks/useUserProfile";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/shared/PullToRefreshIndicator";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import AddToCartDialog from "@/components/mitra/AddToCartDialog";

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipping: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
};
const statusLabels = { pending: "Menunggu", processing: "Diproses", shipping: "Dikirim", delivered: "Diterima" };

const categories = ["semua", "beras", "telur", "daging", "ikan", "sayuran", "buah", "minyak", "bumbu", "susu", "tepung", "lainnya"];

export default function MitraDashboard() {
  const navigate = useNavigate();
  const { user } = useUserProfile();
  const { addToCart, totalItems, cartItems } = useCart(user);
  const { products: allProducts, loading: productsLoading } = useSupplierProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("semua");
  const [addedIds, setAddedIds] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [txCount, setTxCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);

  const loadData = useCallback(async () => {
    if (!user?.email) return;
    const [txs, orders] = await Promise.all([
      base44.entities.Transaction.filter({ user_email: user.email }),
      base44.entities.Order.list("-created_date", 5),
    ]);
    setTxCount(txs.length);
    setRecentOrders(orders.filter(o => o.mitra_id === user.email || o.mitra_id === user.id));
  }, [user?.email]);

  useEffect(() => { loadData(); }, [loadData]);

  const { isRefreshing, pullDistance } = usePullToRefresh(loadData);

  useEffect(() => {
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.type === "create") {
        setRecentOrders(prev => [event.data, ...prev].slice(0, 5));
      } else if (event.type === "update") {
        setRecentOrders(prev => prev.map(o => o.id === event.id ? event.data : o));
      }
    });
    return unsub;
  }, []);

  const filtered = allProducts.filter(p => {
    const matchCat = category === "semua" || p.category === category;
    const matchQ = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier_name || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  const handleAddClick = (p) => {
    setSelectedProduct({
      id: p.id,
      name: p.name,
      supplier: p.supplier_name || p.supplier,
      category: p.category,
      price: p.price,
      base_price: p.base_price ?? p.price,
      unit: p.unit,
      stock: p.stock,
      image: p.image_url || p.image,
    });
    setDialogOpen(true);
  };

  const handleConfirmAdd = async (qty) => {
    if (!selectedProduct) return;
    await addToCart(selectedProduct, qty);
    setAddedIds(prev => ({ ...prev, [selectedProduct.id]: true }));
    toast(`${selectedProduct.name} (${qty} ${selectedProduct.unit}) ditambahkan ke keranjang`, { duration: 2000 });
    setTimeout(() => setAddedIds(prev => ({ ...prev, [selectedProduct.id]: false })), 2000);
  };

  return (
    <div className="space-y-6">
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Mitra</h2>
          <p className="text-muted-foreground">Selamat datang di portal mitra SMART MBG</p>
        </div>
        {totalItems > 0 && (
          <Button onClick={() => navigate("/mitra/cart")} className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4"/>{totalItems} item di keranjang
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Transaksi" value={String(txCount)} icon={ShoppingCart} color="blue" />
        <StatCard title="Produk Tersedia" value={String(allProducts.length)} icon={Package} color="green" trend={5} />
        <StatCard title="Pengeluaran Bulan Ini" value="Rp 8.5jt" icon={TrendingUp} color="yellow" trend={-3} />
        <StatCard title="Pengaduan Aktif" value="2" icon={AlertCircle} color="red" />
      </div>

      <StockAlertBanner userEmail={user?.email} sppgName={user?.organization_name || user?.full_name} />

      {/* Rekomendasi Pintar */}
      <SmartRecommendations userEmail={user?.email} onAddToCart={handleAddClick} />

      {/* Produk Supplier */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-primary"/>
            Produk Supplier Tersedia
          </CardTitle>
          <div className="flex gap-2 flex-col sm:flex-row mt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <Input placeholder="Cari produk atau nama supplier..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-3 h-3 mr-1"/><SelectValue/>
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c === "semua" ? "Semua Kategori" : c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-xl overflow-hidden animate-pulse">
                  <div className="w-full h-28 bg-muted" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(p => (
              <div key={p.id} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src={p.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"} alt={p.name} className="w-full h-28 object-cover" onError={e => { e.target.onerror = null; e.target.src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`; }}/>
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium text-white bg-black/50 backdrop-blur px-1.5 py-0.5 rounded capitalize">{p.category}</span>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm leading-tight">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.supplier_name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/>
                    <span className="text-xs font-medium">4.5</span>
                    <span className="text-xs text-muted-foreground ml-auto">Stok: {p.stock} {p.unit}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm text-emerald-700">Rp {Number(p.price).toLocaleString("id-ID")}<span className="text-xs font-normal text-muted-foreground">/{p.unit}</span></span>
                    <Button
                      size="sm"
                      className={`h-7 text-xs px-2 transition-all ${addedIds[p.id] ? 'bg-green-600 hover:bg-green-600' : ''}`}
                      onClick={() => handleAddClick(p)}
                      disabled={p.stock <= 0}
                    >
                      {addedIds[p.id] ? <><CheckCircle className="w-3 h-3 mr-1"/>Ditambahkan</> : p.stock <= 0 ? "Habis" : "+ Keranjang"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && !productsLoading && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40"/>
                <p className="text-sm">Belum ada produk yang tersedia</p>
              </div>
            )}
          </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Pesanan Terbaru</CardTitle></CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada pesanan. Tambahkan produk ke keranjang!</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{order.order_number}</span>
                      <Badge variant="outline" className={statusColors[order.status] || statusColors.pending}>{statusLabels[order.status] || order.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {order.supplier_name && <span>Supplier: {order.supplier_name}</span>}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-sm">Rp {Number(order.total_amount || 0).toLocaleString("id-ID")}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.created_date && new Date(order.created_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddToCartDialog
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirmAdd}
      />
    </div>
  );
}