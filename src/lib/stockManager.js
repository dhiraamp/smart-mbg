// @ts-nocheck
import { base44 } from "@/api/base44Client";

/**
 * Memeriksa apakah pesanan sudah pernah memotong stok
 */
export function isOrderStockDeducted(order) {
  if (!order) return false;
  if (order.stock_deducted === true) return true;
  if (Array.isArray(order.tracking)) {
    return order.tracking.some((t) => t.stock_deducted === true);
  }
  return false;
}

/**
 * Memotong stok produk komoditas secara otomatis berdasarkan item pada Order.
 * Jika stok mencapai 0, status produk otomatis diubah menjadi "out_of_stock" (Habis).
 */
export async function deductOrderStock(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    return { success: false, reason: "No items in order" };
  }

  if (isOrderStockDeducted(order)) {
    return { success: false, reason: "Stock already deducted for this order" };
  }

  try {
    const products = await base44.entities.Product.list();
    const updatedProducts = [];
    const lowStockAlerts = [];

    for (const item of order.items) {
      const product = products.find(
        (p) =>
          (item.product_id && String(p.id) === String(item.product_id)) ||
          (p.name && item.product_name && p.name.toLowerCase().trim() === item.product_name.toLowerCase().trim())
      );

      if (product) {
        const currentStock = Number(product.stock || 0);
        const orderedQty = Number(item.quantity || 1);
        const newStock = Math.max(0, currentStock - orderedQty);
        const newStatus = newStock === 0 ? "out_of_stock" : product.status === "out_of_stock" ? "active" : product.status || "active";

        await base44.entities.Product.update(product.id, {
          stock: newStock,
          status: newStatus,
        });

        updatedProducts.push({
          id: product.id,
          name: product.name,
          previousStock: currentStock,
          newStock,
          unit: product.unit || "pcs",
          status: newStatus,
        });

        if (newStock <= 5) {
          lowStockAlerts.push({
            name: product.name,
            stock: newStock,
            unit: product.unit || "pcs",
            isZero: newStock === 0,
          });
        }
      }
    }

    // Catat penanda stock_deducted pada order
    try {
      const currentTracking = Array.isArray(order.tracking) ? [...order.tracking] : [];
      currentTracking.push({
        status: "Stok Terpotong",
        label: "Stok produk terpotong otomatis",
        at: new Date().toISOString(),
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        stock_deducted: true,
        done: true,
      });

      order.stock_deducted = true;
      order.tracking = currentTracking;

      await base44.entities.Order.update(order.id, {
        stock_deducted: true,
        tracking: currentTracking,
      });
    } catch (err) {
      console.warn("Gagal update tracking stock_deducted pada order:", err);
    }

    return {
      success: true,
      updatedProducts,
      lowStockAlerts,
    };
  } catch (err) {
    console.error("Gagal memotong stok produk:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Mengembalikan stok produk komoditas jika pesanan dibatalkan / ditolak setelah sebelumnya sempat dikonfirmasi.
 */
export async function restoreOrderStock(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    return { success: false, reason: "No items in order" };
  }

  if (!isOrderStockDeducted(order)) {
    return { success: false, reason: "Stock was not previously deducted for this order" };
  }

  try {
    const products = await base44.entities.Product.list();
    const restoredProducts = [];

    for (const item of order.items) {
      const product = products.find(
        (p) =>
          (item.product_id && String(p.id) === String(item.product_id)) ||
          (p.name && item.product_name && p.name.toLowerCase().trim() === item.product_name.toLowerCase().trim())
      );

      if (product) {
        const currentStock = Number(product.stock || 0);
        const orderedQty = Number(item.quantity || 1);
        const restoredStock = currentStock + orderedQty;
        const newStatus = restoredStock > 0 && product.status === "out_of_stock" ? "active" : product.status || "active";

        await base44.entities.Product.update(product.id, {
          stock: restoredStock,
          status: newStatus,
        });

        restoredProducts.push({
          id: product.id,
          name: product.name,
          previousStock: currentStock,
          restoredStock,
          unit: product.unit || "pcs",
        });
      }
    }

    // Catat penanda stock_restored pada order
    try {
      const currentTracking = Array.isArray(order.tracking) ? [...order.tracking] : [];
      currentTracking.push({
        status: "Stok Dikembalikan",
        label: "Stok produk dikembalikan otomatis",
        at: new Date().toISOString(),
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        stock_deducted: false,
        done: true,
      });

      order.stock_deducted = false;
      order.tracking = currentTracking;

      await base44.entities.Order.update(order.id, {
        stock_deducted: false,
        tracking: currentTracking,
      });
    } catch (err) {
      console.warn("Gagal update tracking stock_deducted=false pada order:", err);
    }

    return {
      success: true,
      restoredProducts,
    };
  } catch (err) {
    console.error("Gagal mengembalikan stok produk:", err);
    return { success: false, error: err.message };
  }
}
