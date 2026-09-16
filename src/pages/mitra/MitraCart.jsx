import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight, Info } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useUserProfile } from "@/hooks/useUserProfile";
import MitraCheckout from "./MitraCheckout";

const categoryColors = {
  beras: "bg-yellow-100 text-yellow-700",
  telur: "bg-orange-100 text-orange-700",
  daging: "bg-red-100 text-red-700",
  sayuran: "bg-green-100 text-green-700",
  buah: "bg-pink-100 text-pink-700",
  lainnya: "bg-gray-100 text-gray-700",
};

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

export default function MitraCart() {
  const { user, loading: loadingUser } = useUserProfile();
  const { cartItems, loading, updateQty, removeFromCart, clearCart, subtotal, baseTotal, serviceFee, total } = useCart(user);
  const [showCheckout, setShowCheckout] = useState(false);

  if (loadingUser || loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>;
  }

  if (showCheckout) {
    return (
      <MitraCheckout
        cartItems={cartItems}
        subtotal={subtotal}
        baseTotal={baseTotal}
        serviceFee={serviceFee}
        total={total}
        clearCart={clearCart}
        user={user}
      />
    );
  }

  const handleRemove = async (id) => {
    await removeFromCart(id);
    toast("Item dihapus dari keranjang", { duration: 2000 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" /> Keranjang Pesanan
        </h2>
        <p className="text-muted-foreground">Kelola item yang akan dipesan ke supplier</p>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Package className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="font-medium">Keranjang masih kosong</p>
            <p className="text-sm text-muted-foreground">Tambahkan produk dari katalog supplier di Dashboard</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="w-14 h-14 rounded-xl object-cover shrink-0"/>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{item.product_name}</p>
                          {item.supplier_name && <p className="text-xs text-muted-foreground mt-0.5">Supplier: {item.supplier_name}</p>}
                          {item.category && <Badge className={`mt-1 text-xs ${categoryColors[item.category] || categoryColors.lainnya}`}>{item.category}</Badge>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive shrink-0" onClick={() => handleRemove(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="font-bold text-primary">{formatRp(item.price)}<span className="text-xs text-muted-foreground font-normal">/{item.unit}</span></p>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, (item.quantity || 1) - 1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-10 text-center font-semibold text-sm">{item.quantity || 1}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, (item.quantity || 1) + 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                          <span className="text-xs text-muted-foreground w-8">{item.unit}</span>
                        </div>
                      </div>
                      <p className="text-right text-sm font-medium mt-1">{formatRp(item.price * (item.quantity || 1))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-2">{item.product_name} × {item.quantity || 1}</span>
                      <span className="font-medium shrink-0">{formatRp(item.price * (item.quantity || 1))}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span><span>{formatRp(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Info className="w-3 h-3"/>Mark-up Platform (2,5%, sudah termasuk)
                    </span>
                    <span className="text-orange-600 font-medium">{formatRp(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatRp(total)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">*Belum termasuk biaya pengiriman</p>
                </div>
                <Button className="w-full" onClick={() => setShowCheckout(true)}>
                  <ArrowRight className="w-4 h-4 mr-2"/>Lanjut Checkout
                </Button>
                <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive" onClick={clearCart}>
                  Kosongkan Keranjang
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}