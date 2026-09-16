import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Package, AlertCircle } from "lucide-react";

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

export default function AddToCartDialog({ product, open, onOpenChange, onConfirm }) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (open) setQty(1);
  }, [open, product?.id]);

  if (!product) return null;

  const stock = Number(product.stock || 0);
  const max = stock > 0 ? stock : 1;
  const outOfStock = stock <= 0;

  const setQuantity = (v) => {
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 1) setQty(1);
    else setQty(Math.min(n, max));
  };

  const handleConfirm = async () => {
    await onConfirm(qty);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Tambah ke Keranjang</DialogTitle>
          <DialogDescription>Pilih kuantitas produk yang ingin dipesan</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Package className="w-7 h-7 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight">{product.name}</p>
            <p className="text-xs text-muted-foreground truncate">{product.supplier}</p>
            <p className="font-bold text-emerald-700 text-sm mt-0.5">
              {formatRp(product.price)}
              <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
            </p>
          </div>
        </div>

        {outOfStock ? (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Stok produk habis</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Kuantitas</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>
                  <Minus className="w-4 h-4" />
                </Button>
                <input
                  type="number"
                  min={1}
                  max={max}
                  value={qty}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-16 text-center font-semibold text-sm border rounded-md h-8 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQty(q => Math.min(max, q + 1))} disabled={qty >= max}>
                  <Plus className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground ml-1">{product.unit}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Stok tersedia: {stock} {product.unit}</p>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-bold text-primary text-base">{formatRp(product.price * qty)}</span>
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleConfirm}>
              <ShoppingCart className="w-4 h-4 mr-2" />Tambah ke Keranjang
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}