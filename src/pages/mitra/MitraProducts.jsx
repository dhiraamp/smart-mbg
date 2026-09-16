import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Filter, Star, Package, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import AddToCartDialog from "@/components/mitra/AddToCartDialog";

const categories = ["semua", "beras", "telur", "daging", "ikan", "sayuran", "buah", "minyak", "bumbu", "susu", "tepung", "lainnya"];

export default function MitraProducts() {
  const navigate = useNavigate();
  const { user } = useUserProfile();
  const { addToCart, totalItems } = useCart(user);
  const { products, loading } = useSupplierProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("semua");
  const [addedIds, setAddedIds] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = products.filter((p) => {
    const matchCat = category === "semua" || p.category === category;
    const matchQ = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplier_name || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  const handleAddClick = (p) => {
    setSelectedProduct({
      id: p.id,
      name: p.name,
      supplier: p.supplier_name,
      category: p.category,
      price: p.price,
      base_price: p.base_price ?? p.price,
      unit: p.unit,
      stock: p.stock,
      image: p.image_url,
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Produk Bahan Pangan</h2>
          <p className="text-muted-foreground">Pilih dan pesan kebutuhan bahan pangan Anda</p>
        </div>
        {totalItems > 0 && (
          <Button onClick={() => navigate("/mitra/cart")} className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />{totalItems} item di keranjang
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari produk atau nama supplier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c} value={c} className="capitalize">
                {c === "semua" ? "Semua Kategori" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border rounded-xl overflow-hidden animate-pulse">
              <div className="w-full h-32 bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-card">
              <img
                src={p.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80"}
                alt={p.name}
                className="w-full h-32 object-cover"
                onError={e => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80"; }}
              />
              <div className="p-3">
                <Badge variant="outline" className="text-xs mb-1 capitalize">{p.category}</Badge>
                <p className="font-semibold text-sm leading-tight">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.supplier_name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">4.5</span>
                  <span className="text-xs text-muted-foreground ml-auto">Stok: {p.stock} {p.unit}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-sm text-emerald-700">
                    Rp {Number(p.price).toLocaleString("id-ID")}
                    <span className="text-xs font-normal text-muted-foreground">/{p.unit}</span>
                  </span>
                  <Button
                    size="sm"
                    className={`h-7 text-xs px-2 transition-all ${addedIds[p.id] ? 'bg-green-600 hover:bg-green-600' : ''}`}
                    onClick={() => handleAddClick(p)}
                    disabled={p.stock <= 0}
                  >
                    {addedIds[p.id] ? <><CheckCircle className="w-3 h-3 mr-1" />Ditambahkan</> : p.stock <= 0 ? "Habis" : "+ Keranjang"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada produk yang tersedia</p>
            </div>
          )}
        </div>
      )}

      <AddToCartDialog
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirmAdd}
      />
    </div>
  );
}