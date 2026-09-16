import { base44 } from "@/api/base44Client.js";
import { deductOrderStock, restoreOrderStock } from "@/lib/stockManager.js";
import { ensureSeed } from "@/lib/seed.js";

// Setup storage mock for Node environment
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = {
  localStorage: globalThis.localStorage,
  dispatchEvent: () => {},
  addEventListener: () => {},
};

ensureSeed();

async function runStockTest() {
  console.log("1. Membaca daftar produk...");
  const products = await base44.entities.Product.list();
  console.log(`Ditemukan ${products.length} produk di katalog.`);
  if (products.length === 0) throw new Error("Produk tidak ditemukan!");

  const targetProd = products[0];
  const initialStock = Number(targetProd.stock);
  console.log("Produk target uji:", {
    id: targetProd.id,
    name: targetProd.name,
    stock: initialStock,
    status: targetProd.status,
  });

  console.log("2. Menyiapkan order sebanyak 4 unit...");
  const testOrder = {
    id: "order_stock_test_1",
    order_number: "MBG-STK-001",
    status: "pending",
    items: [
      {
        product_id: targetProd.id,
        product_name: targetProd.name,
        quantity: 4,
        price: targetProd.price,
      },
    ],
    tracking: [],
  };

  console.log("3. Menjalankan deductOrderStock (saat Supplier konfirmasi pesanan)...");
  const deductRes = await deductOrderStock(testOrder);
  console.log("Hasil pemotongan stok:", deductRes);
  if (!deductRes.success) throw new Error("Gagal potong stok: " + deductRes.reason);

  const prodAfterDeduct = (await base44.entities.Product.list()).find(
    (p) => p.id === targetProd.id
  );
  console.log("Stok setelah dipotong:", {
    sebelum: initialStock,
    terpotong: 4,
    sekarang: prodAfterDeduct.stock,
    status: prodAfterDeduct.status,
  });
  if (prodAfterDeduct.stock !== initialStock - 4) {
    throw new Error(`Stok salah! Diharapkan ${initialStock - 4}, didapat ${prodAfterDeduct.stock}`);
  }

  console.log("4. Menyiapkan order kedua yang menghabiskan sisa stok...");
  const remainingStock = prodAfterDeduct.stock;
  const secondOrder = {
    id: "order_stock_test_2",
    order_number: "MBG-STK-002",
    status: "pending",
    items: [
      {
        product_id: targetProd.id,
        product_name: targetProd.name,
        quantity: remainingStock,
        price: targetProd.price,
      },
    ],
    tracking: [],
  };

  await deductOrderStock(secondOrder);
  const prodEmpty = (await base44.entities.Product.list()).find(
    (p) => p.id === targetProd.id
  );
  console.log("Stok setelah habis:", {
    stok: prodEmpty.stock,
    status: prodEmpty.status,
  });
  if (prodEmpty.stock !== 0) throw new Error("Stok harusnya 0!");
  if (prodEmpty.status !== "out_of_stock") {
    throw new Error(`Status harusnya 'out_of_stock', didapat '${prodEmpty.status}'`);
  }

  console.log("5. Menguji restoreOrderStock (saat pesanan dibatalkan/ditolak)...");
  await restoreOrderStock(secondOrder);
  const prodRestored = (await base44.entities.Product.list()).find(
    (p) => p.id === targetProd.id
  );
  console.log("Stok setelah pesanan kedua dibatalkan:", {
    stok: prodRestored.stock,
    status: prodRestored.status,
  });
  if (prodRestored.stock !== remainingStock) {
    throw new Error(`Stok tidak kembali! Diharapkan ${remainingStock}, didapat ${prodRestored.stock}`);
  }
  if (prodRestored.status !== "active") {
    throw new Error(`Status harusnya 'active' setelah stok ada kembali!`);
  }

  console.log("=== SEMUA TEST PEMOTONGAN & PEMULIHAN STOK LULUS 100%! ===");
}

runStockTest().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
