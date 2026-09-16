import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Star, ShoppingCart } from "lucide-react";
import { base44 } from "@/api/base44Client";

const supplierProducts = [
  { id: 1, name: "Roti Cahaya (Berbagai Rasa)", supplier: "Cahaya Roti", category: "lainnya", price: 3500, unit: "pcs", stock: 10000, rating: 4.8, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop" },
  { id: 2, name: "Beras Premium Lokal", supplier: "CV Binar Kalasenja", category: "beras", price: 14000, unit: "kg", stock: 120, rating: 4.7, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop" },
  { id: 3, name: "Sayuran Segar Campuran", supplier: "CV Binar Kalasenja", category: "sayuran", price: 8000, unit: "kg", stock: 100, rating: 4.6, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80" },
  { id: 5, name: "Susu Segar", supplier: "CV Binar Kalasenja", category: "susu", price: 12000, unit: "liter", stock: 70, rating: 4.8, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop" },
  { id: 8, name: "Telur Ayam Kampung", supplier: "UMKM Batu Nanceub", category: "telur", price: 33000, unit: "kg", stock: 200, rating: 4.6, image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&h=300&fit=crop" },
  { id: 13, name: "Daging Ayam Segar", supplier: "PT Bounty Segar Distribution", category: "daging", price: 36000, unit: "kg", stock: 500, rating: 4.9, image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=300&fit=crop" },
  { id: 14, name: "Telur Ayam Negeri", supplier: "PT Bounty Segar Distribution", category: "telur", price: 28000, unit: "kg", stock: 1000, rating: 4.8, image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&h=300&fit=crop" },
  { id: 21, name: "Ayam Broiler Segar", supplier: "PT Sadang Barokah Niaga", category: "daging", price: 34000, unit: "kg", stock: 700, rating: 4.8, image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=300&fit=crop" },
  { id: 24, name: "Daging Sapi Segar", supplier: "Koperasi Binar Sarana Sejahtera", category: "daging", price: 140000, unit: "kg", stock: 80, rating: 4.9, image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80" },
  { id: 26, name: "Ikan Nila Segar", supplier: "CV Binar Kalasenja", category: "ikan", price: 32000, unit: "kg", stock: 100, rating: 4.5, image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&q=80" },
];

export default function SmartRecommendations({ userEmail, onAddToCart }) {
  const [recommendations, setRecommendations] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    analyzeAndRecommend();
  }, [userEmail]);

  const analyzeAndRecommend = async () => {
    setLoading(true);
    try {
      // Ambil riwayat belanja user
      const history = await base44.entities.ShoppingHistory.filter({ user_email: userEmail }, "-created_date", 50);
      
      if (history.length === 0) {
        // Jika belum ada riwayat, tampilkan produk populer (rating tertinggi)
        const popular = [...supplierProducts].sort((a, b) => b.rating - a.rating).slice(0, 4);
        setRecommendations(popular.map(p => ({ ...p, reason: "â­ Produk terpopuler" })));
        setLoading(false);
        return;
      }

      // Hitung frekuensi kategori dari riwayat
      const catCount = {};
      const supplierCount = {};
      history.forEach(h => {
        catCount[h.category] = (catCount[h.category] || 0) + (h.quantity || 1);
        supplierCount[h.supplier] = (supplierCount[h.supplier] || 0) + 1;
      });

      // Urutkan kategori favorit
      const sortedCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).map(e => e[0]);
      const sortedSuppliers = Object.entries(supplierCount).sort((a, b) => b[1] - a[1]).map(e => e[0]);
      setTopCategories(sortedCats.slice(0, 3));

      // Produk yang sudah pernah dibeli (untuk menandai)
      const boughtNames = new Set(history.map(h => h.product_name));

      // Rekomendasi: produk dari kategori favorit yang belum dibeli atau jarang dibeli
      const recs = [];
      for (const cat of sortedCats.slice(0, 3)) {
        const catProds = supplierProducts.filter(p => p.category === cat);
        // Prioritaskan dari supplier favorit
        catProds.sort((a, b) => {
          const aFav = sortedSuppliers.includes(a.supplier) ? -1 : 1;
          const bFav = sortedSuppliers.includes(b.supplier) ? -1 : 1;
          return aFav - bFav || b.rating - a.rating;
        });
        for (const p of catProds) {
          if (!recs.find(r => r.id === p.id)) {
            const reason = boughtNames.has(p.name)
              ? `ðŸ”„ Sering Anda beli (${cat})`
              : `ðŸ’¡ Cocok untuk kebiasaan belanja Anda`;
            recs.push({ ...p, reason });
            if (recs.length >= 6) break;
          }
        }
        if (recs.length >= 6) break;
      }

      // Tambah produk rating tinggi jika rekomendasi kurang dari 4
      if (recs.length < 4) {
        const topRated = [...supplierProducts]
          .filter(p => !recs.find(r => r.id === p.id))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4 - recs.length)
          .map(p => ({ ...p, reason: "â­ Rating tertinggi" }));
        recs.push(...topRated);
      }

      setRecommendations(recs.slice(0, 4));
    } catch {
      const popular = [...supplierProducts].sort((a, b) => b.rating - a.rating).slice(0, 4);
      setRecommendations(popular.map(p => ({ ...p, reason: "â­ Produk terpopuler" })));
    }
    setLoading(false);
  };

  if (loading) return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500" />Rekomendasi Pintar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="border-purple-100">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Rekomendasi Pintar untuk Anda
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-purple-400" />
            {topCategories.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Favorit: {topCategories.join(", ")}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {recommendations.map(p => (
            <div key={p.id} className="border border-purple-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-gradient-to-b from-purple-50/30 to-white">
              <div className="relative">
                <img src={p.image} alt={p.name} className="w-full h-24 object-cover"
                  onError={e => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"; }} />
                <div className="absolute top-1.5 left-1.5">
                  <Badge className="text-[9px] px-1.5 py-0.5 bg-purple-600 text-white border-0">{p.reason}</Badge>
                </div>
              </div>
              <div className="p-2.5">
                <p className="font-semibold text-xs leading-tight line-clamp-2">{p.name}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5 truncate">{p.supplier}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-[10px] font-medium">{p.rating}</span>
                </div>
                <div className="flex items-center justify-between mt-2 gap-1">
                  <span className="font-bold text-[11px] text-emerald-700">Rp {p.price.toLocaleString("id-ID")}<span className="text-[9px] font-normal text-muted-foreground">/{p.unit}</span></span>
                  <Button size="sm" className="h-6 text-[10px] px-2 bg-purple-600 hover:bg-purple-700" onClick={() => onAddToCart(p)}>
                    <ShoppingCart className="w-2.5 h-2.5 mr-0.5" /> Beli
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}