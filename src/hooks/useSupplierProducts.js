import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { PLATFORM_MARKUP_RATE, estimateBasePrice } from "@/lib/pricing";

const staticProducts = [
  { id: "s1", name: "Roti Cahaya (Berbagai Rasa)", supplier_name: "Cahaya Roti", category: "lainnya", price: 3500, unit: "pcs", stock: 10000, image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop" },
  { id: "s2", name: "Beras Premium Lokal", supplier_name: "CV Binar Kalasenja", category: "beras", price: 14000, unit: "kg", stock: 120, image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80" },
  { id: "s3", name: "Sayuran Segar Campuran", supplier_name: "CV Binar Kalasenja", category: "sayuran", price: 8000, unit: "kg", stock: 100, image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80" },
  { id: "s4", name: "Buah Segar Lokal", supplier_name: "CV Binar Kalasenja", category: "buah", price: 15000, unit: "kg", stock: 80, image_url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80" },
  { id: "s5", name: "Susu Segar", supplier_name: "CV Binar Kalasenja", category: "susu", price: 12000, unit: "liter", stock: 70, image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80" },
  { id: "s6", name: "Beras Cihurip", supplier_name: "UMKM Batu Nanceub", category: "beras", price: 13500, unit: "kg", stock: 300, image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80" },
  { id: "s7", name: "Bumbu Dapur Lokal", supplier_name: "UMKM Batu Nanceub", category: "bumbu", price: 45000, unit: "kg", stock: 150, image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80" },
  { id: "s8", name: "Telur Ayam Kampung", supplier_name: "UMKM Batu Nanceub", category: "telur", price: 33000, unit: "kg", stock: 200, image_url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80" },
  { id: "s9", name: "Minyak Goreng Curah", supplier_name: "UMKM Batu Nanceub", category: "minyak", price: 17500, unit: "liter", stock: 180, image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80" },
  { id: "s10", name: "Pisang Cavendish", supplier_name: "PT Berkah Jaya Supplier", category: "buah", price: 14000, unit: "kg", stock: 2600, image_url: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=300&fit=crop" },
  { id: "s11", name: "Pepaya California", supplier_name: "PT Berkah Jaya Supplier", category: "buah", price: 8000, unit: "kg", stock: 800, image_url: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80" },
  { id: "s12", name: "Jeruk Siam", supplier_name: "PT Berkah Jaya Supplier", category: "buah", price: 18000, unit: "kg", stock: 600, image_url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop" },
  { id: "s13", name: "Daging Ayam Segar", supplier_name: "PT Bounty Segar Distribution", category: "daging", price: 36000, unit: "kg", stock: 500, image_url: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80" },
  { id: "s14", name: "Telur Ayam Negeri", supplier_name: "PT Bounty Segar Distribution", category: "telur", price: 28000, unit: "kg", stock: 1000, image_url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80" },
  { id: "s15", name: "Beras Premium Garut", supplier_name: "UD Shafira Jaya Abadi", category: "beras", price: 14500, unit: "kg", stock: 400, image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80" },
  { id: "s16", name: "Wortel Segar", supplier_name: "UD Shafira Jaya Abadi", category: "sayuran", price: 10000, unit: "kg", stock: 200, image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop" },
  { id: "s17", name: "Kentang Segar", supplier_name: "UD Shafira Jaya Abadi", category: "sayuran", price: 12000, unit: "kg", stock: 250, image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80" },
  { id: "s18", name: "Bawang Merah", supplier_name: "UD Shafira Jaya Abadi", category: "bumbu", price: 35000, unit: "kg", stock: 150, image_url: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80" },
  { id: "s19", name: "Bawang Putih", supplier_name: "UD Shafira Jaya Abadi", category: "bumbu", price: 40000, unit: "kg", stock: 120, image_url: "https://images.unsplash.com/photo-1540151812223-b30b3fab58e6?w=400&q=80" },
  { id: "s20", name: "Tepung Terigu", supplier_name: "UD Shafira Jaya Abadi", category: "tepung", price: 12000, unit: "kg", stock: 300, image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80" },
  { id: "s21", name: "Ayam Broiler Segar", supplier_name: "PT Sadang Barokah Niaga", category: "daging", price: 34000, unit: "kg", stock: 700, image_url: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=300&fit=crop" },
  { id: "s22", name: "Karkas Ayam Beku", supplier_name: "PT Sadang Barokah Niaga", category: "daging", price: 32000, unit: "kg", stock: 400, image_url: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop" },
  { id: "s23", name: "Tahu Kuning Segar", supplier_name: "Cahaya Mekar", category: "lainnya", price: 2500, unit: "pcs", stock: 3000, image_url: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb2c?w=400&q=80" },
  { id: "s24", name: "Daging Sapi Segar", supplier_name: "Koperasi Binar Sarana Sejahtera", category: "daging", price: 140000, unit: "kg", stock: 80, image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80" },
  { id: "s25", name: "Tempe Segar", supplier_name: "Koperasi Binar Sarana Sejahtera", category: "lainnya", price: 5000, unit: "pcs", stock: 500, image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80" },
  { id: "s26", name: "Ikan Nila Segar", supplier_name: "CV Binar Kalasenja", category: "ikan", price: 32000, unit: "kg", stock: 100, image_url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&q=80" },
  { id: "s27", name: "Ikan Lele Segar", supplier_name: "CV Binar Kalasenja", category: "ikan", price: 22000, unit: "kg", stock: 130, image_url: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400&q=80" },
  { id: "s28", name: "Kangkung Segar", supplier_name: "UD Shafira Jaya Abadi", category: "sayuran", price: 5000, unit: "ikat", stock: 300, image_url: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=400&h=300&fit=crop" },
  { id: "s29", name: "Tomat Segar", supplier_name: "UD Shafira Jaya Abadi", category: "sayuran", price: 8000, unit: "kg", stock: 200, image_url: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop" },
  { id: "s30", name: "Cabai Merah", supplier_name: "UMKM Batu Nanceub", category: "bumbu", price: 45000, unit: "kg", stock: 100, image_url: "https://images.unsplash.com/photo-1587131787055-e62b21a7752a?w=400&q=80" },
  { id: "s31", name: "Bumbu Rempah Mix", supplier_name: "UMKM Batu Nanceub", category: "bumbu", price: 60000, unit: "kg", stock: 120, image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80" },
  { id: "s32", name: "Gula Pasir", supplier_name: "Koperasi Binar Sarana Sejahtera", category: "lainnya", price: 17000, unit: "kg", stock: 400, image_url: "https://images.unsplash.com/photo-1581795669223-09203b83bf61?w=400&q=80" },
  { id: "s33", name: "Garam Dapur", supplier_name: "UMKM Batu Nanceub", category: "bumbu", price: 5000, unit: "kg", stock: 500, image_url: "https://images.unsplash.com/photo-1626078571935-0eaa4f40c64a?w=400&q=80" },
  { id: "s34", name: "Daging Kambing", supplier_name: "PT Sadang Barokah Niaga", category: "daging", price: 120000, unit: "kg", stock: 60, image_url: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&q=80" },
  { id: "s35", name: "Jagung Pipilan", supplier_name: "CV Binar Kalasenja", category: "lainnya", price: 8000, unit: "kg", stock: 280, image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80" },
];

export function useSupplierProducts() {
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Product.filter({ status: "active" }, "-created_date");
      setDbProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Gagal memuat produk aktif dari database:", err);
      setDbProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const unsub = base44.entities.Product.subscribe((event) => {
      if (event.type === "create") {
        if (event.data?.status === "active") {
          setDbProducts(prev => [event.data, ...prev]);
        }
      } else if (event.type === "update") {
        setDbProducts(prev =>
          event.data?.status === "active"
            ? prev.map(p => p.id === event.id ? event.data : p)
            : prev.filter(p => p.id !== event.id)
        );
      } else if (event.type === "delete") {
        setDbProducts(prev => prev.filter(p => p.id !== event.id));
      }
    });
    return unsub;
  }, []);

  const products = useMemo(() => {
    const dbNames = new Set(dbProducts.map(p => p.name.toLowerCase()));
    const dbWithBase = dbProducts.map(p => ({
      ...p,
      base_price: p.base_price ?? estimateBasePrice(p.price),
    }));
    const uniqueStatic = staticProducts
      .filter(p => !dbNames.has(p.name.toLowerCase()))
      .map(p => {
        const basePrice = p.base_price ?? p.price;
        return { ...p, base_price: basePrice, price: Math.round(basePrice * (1 + PLATFORM_MARKUP_RATE)) };
      });
    return [...dbWithBase, ...uniqueStatic];
  }, [dbProducts]);

  return { products, loading, refetch: fetchProducts };
}