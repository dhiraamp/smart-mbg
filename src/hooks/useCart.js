import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { PLATFORM_MARKUP_RATE } from "@/lib/pricing";

export function useCart(user) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    const items = await base44.entities.CartItem.filter({ user_email: user.email });
    setCartItems(items);
    setLoading(false);
  }, [user?.email]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!user?.email) return;
    const qty = Math.max(1, Number(quantity) || 1);
    const existing = cartItems.find(c => String(c.product_id) === String(product.id));
    if (existing) {
      // Optimistic update
      const newQty = (existing.quantity || 1) + qty;
      setCartItems(prev => prev.map(c => c.id === existing.id ? { ...c, quantity: newQty } : c));
      try {
        await base44.entities.CartItem.update(existing.id, { quantity: newQty });
      } catch (e) {
        fetchCart();
      }
    } else {
      const createPayload = {
        user_id: user.id || user.email,
        user_email: user.email,
        user_role: user.role || "mitra",
        product_id: String(product.id),
        product_name: product.name,
        supplier_name: product.supplier || "",
        price: product.price,
        base_price: product.base_price ?? product.price,
        unit: product.unit,
        quantity: qty,
        category: product.category || "",
        image_url: product.image || "",
      };
      const optimisticItem = { ...createPayload, id: `temp-${Date.now()}` };
      setCartItems(prev => [...prev, optimisticItem]);
      try {
        const created = await base44.entities.CartItem.create(createPayload);
        setCartItems(prev => prev.map(c => c.id === optimisticItem.id ? created : c));
        await fetchCart();
      } catch (e) {
        await fetchCart();
      }
    }
  };

  const updateQty = async (cartItemId, qty) => {
    if (qty < 1) return removeFromCart(cartItemId);
    setCartItems(prev => prev.map(c => c.id === cartItemId ? { ...c, quantity: qty } : c));
    try {
      await base44.entities.CartItem.update(cartItemId, { quantity: qty });
    } catch (e) {
      await fetchCart();
    }
  };

  const removeFromCart = async (cartItemId) => {
    setCartItems(prev => prev.filter(c => c.id !== cartItemId));
    try {
      await base44.entities.CartItem.delete(cartItemId);
    } catch (e) {
      await fetchCart();
    }
  };

  const clearCart = async () => {
    for (const item of cartItems) {
      await base44.entities.CartItem.delete(item.id);
    }
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);
  const subtotal = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const baseTotal = cartItems.reduce((s, i) => s + (i.base_price ?? i.price) * (i.quantity || 1), 0);
  const serviceFee = Math.round(subtotal - baseTotal);
  const total = subtotal;

  return {
    cartItems,
    loading,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    fetchCart,
    totalItems,
    subtotal,
    baseTotal,
    serviceFee,
    total,
  };
}