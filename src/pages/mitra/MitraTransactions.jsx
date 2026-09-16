import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt, Package, Truck, CheckCircle, Clock, Eye } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const paymentStatusConfig = {
  pending: { label: "Menunggu Bayar", color: "bg-yellow-50 text-yellow-700" },
  paid: { label: "Dibayar", color: "bg-green-50 text-green-700" },
  failed: { label: "Gagal", color: "bg-red-50 text-red-700" },
  cancelled: { label: "Dibatalkan", color: "bg-gray-50 text-gray-700" },
};

const deliveryStatusConfig = {
  pending: { label: "Menunggu", icon: Clock, color: "text-yellow-600" },
  processing: { label: "Diproses", icon: Package, color: "text-blue-600" },
  shipping: { label: "Dikirim", icon: Truck, color: "text-purple-600" },
  delivered: { label: "Diterima", icon: CheckCircle, color: "text-green-600" },
};

export default function MitraTransactions() {
  const { user, loading: loadingUser } = useUserProfile();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    loadTransactions();
  }, [user?.email]);

  const loadTransactions = async () => {
    setLoading(true);
    const [byEmail, byMitra] = await Promise.all([
      base44.entities.Transaction.filter({ user_email: user.email }),
      base44.entities.Transaction.filter({ mitra_id: user.email }),
    ]);
    const merged = [...byEmail, ...byMitra.filter(t => !byEmail.some(x => x.id === t.id))]
      .sort((a, b) => String(b.created_date || "").localeCompare(String(a.created_date || "")));
    setTransactions(merged);
    setLoading(false);
  };

  if (loadingUser || loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Receipt className="w-6 h-6 text-primary"/>Riwayat Transaksi</h2>
        <p className="text-muted-foreground">Semua transaksi pembelian Anda</p>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-20 text-center">
            <Receipt className="w-12 h-12 text-muted-foreground/40 mb-3"/>
            <p className="font-medium">Belum ada transaksi</p>
            <p className="text-sm text-muted-foreground">Mulai berbelanja dari katalog produk supplier</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map(tx => {
            const ps = paymentStatusConfig[tx.payment_status] || paymentStatusConfig.pending;
            const ds = deliveryStatusConfig[tx.delivery_status] || deliveryStatusConfig.pending;
            const DsIcon = ds.icon;
            return (
              <Card key={tx.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{tx.transaction_number}</span>
                        <Badge variant="outline" className={`text-xs ${ps.color}`}>{ps.label}</Badge>
                        <Badge variant="outline" className={`text-xs flex items-center gap-1 ${ds.color} bg-transparent border-current/20`}>
                          <DsIcon className="w-3 h-3"/>{ds.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tx.items?.length || 0} produk · {new Date(tx.created_date).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {tx.items?.slice(0,2).map(i => i.product_name).join(", ")}{tx.items?.length > 2 ? ` +${tx.items.length-2} lainnya` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary text-sm">{formatRp(tx.total)}</p>
                      <Button size="sm" variant="ghost" className="h-7 text-xs mt-1" onClick={() => setSelected(tx)}>
                        <Eye className="w-3 h-3 mr-1"/>Detail
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Receipt className="w-4 h-4"/>{selected.transaction_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="flex gap-2">
                <Badge variant="outline" className={paymentStatusConfig[selected.payment_status]?.color}>{paymentStatusConfig[selected.payment_status]?.label}</Badge>
                <Badge variant="outline" className="capitalize">{selected.payment_method?.replace("_"," ")}</Badge>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Item Pesanan</p>
                {(selected.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between bg-muted/30 rounded-lg p-2.5">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">{item.supplier_name} · {item.quantity} {item.unit}</p>
                    </div>
                    <p className="font-semibold">{formatRp(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatRp(selected.subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Biaya Layanan (3%)</span><span>{formatRp(selected.service_fee)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Biaya Pengiriman</span><span>{formatRp(selected.delivery_fee)}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">{formatRp(selected.total)}</span></div>
              </div>

              {selected.delivery_address && (
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Alamat Pengiriman</p>
                  <p className="text-sm font-medium">{selected.delivery_address}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}