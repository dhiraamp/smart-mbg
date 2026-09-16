import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, CreditCard, Building2, QrCode, Truck, ShoppingCart, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { notifyRoles } from "@/lib/notify";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

export default function MitraCheckout({ cartItems, subtotal, baseTotal, serviceFee, total, clearCart, user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=detail, 2=logistik, 3=payment, 4=success
  const [address, setAddress] = useState(user?.address || "");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer_bank");
  const [loading, setLoading] = useState(false);
  const [txNumber, setTxNumber] = useState("");
  const [paidSummary, setPaidSummary] = useState(null);

  // Logistik
  const [logistikList, setLogistikList] = useState([]);
  const [loadingLogistik, setLoadingLogistik] = useState(false);
  const [selectedLogistik, setSelectedLogistik] = useState(null);

  const DELIVERY_FEE = selectedLogistik ? (selectedLogistik.delivery_fee || 15000) : 15000;
  const grandTotal = total + DELIVERY_FEE;

  const handleConfirmOrder = () => {
    if (!address) {
      toast.error("Alamat pengiriman harus diisi", { duration: 2000 });
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const tx = `TRX-${ymd}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const customerName = user?.full_name || user?.organization_name || user?.email?.split("@")[0] || "Mitra";

      const items = cartItems || [];
      if (items.length === 0) {
        toast.error("Keranjang kosong, tidak ada yang bisa dipesan");
        return;
      }

      // Kelompokkan per supplier, lalu buat Order untuk masing-masing
      const groups = {};
      items.forEach((i) => {
        const key = i.supplier_name || "Supplier Utama";
        if (!groups[key]) groups[key] = [];
        groups[key].push(i);
      });

      const groupCount = Object.keys(groups).length;
      for (const [supplierName, supplierItems] of Object.entries(groups)) {
        const itemsPayload = supplierItems.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          supplier_name: supplierName,
          price: i.price,
          base_price: i.base_price ?? i.price,
          unit: i.unit || "pcs",
          quantity: i.quantity || 1,
          subtotal: i.price * (i.quantity || 1),
          image_url: i.image_url || "",
        }));

        const supplierSubtotal = supplierItems.reduce(
          (acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 1),
          0
        );
        const supplierDeliveryFee = groupCount === 1 ? DELIVERY_FEE : Math.round(DELIVERY_FEE / groupCount);
        const supplierTotal = supplierSubtotal + supplierDeliveryFee;

        await base44.entities.Order.create({
          order_number: `MBG-${ymd}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          status: "pending",
          customer_role: "mitra",
          mitra_id: user?.email || "mitra@demo.local",
          mitra_name: customerName,
          mitra_email: user?.email,
          mitra_address: address,
          delivery_area: user?.district || user?.regency || "Kabupaten Garut",
          logistic_id: selectedLogistik?.user_email || selectedLogistik?.id || null,
          logistic_name: selectedLogistik?.full_name || selectedLogistik?.organization_name || null,
          driver: selectedLogistik?.full_name || selectedLogistik?.organization_name || null,
          supplier_name: supplierName,
          supplier_id: supplierItems[0]?.supplier_id || "supplier@demo.local",
          total: supplierTotal,
          total_amount: supplierTotal,
          subtotal: supplierSubtotal,
          delivery_fee: supplierDeliveryFee,
          payment_method: paymentMethod,
          notes,
          items: itemsPayload,
          tracking: [
            {
              status: "Menunggu Konfirmasi",
              at: new Date().toISOString(),
              note: notes || "Pesanan dibuat oleh Mitra SPPG",
            },
          ],
          created_date: new Date().toISOString(),
        });
      }

      // Notifikasi supplier bahwa ada pesanan baru dari mitra
      await notifyRoles(["supplier"], {
        type: "new_order",
        title: "Pesanan Baru dari Mitra",
        message: `${tx} · ${customerName} · ${formatRp(grandTotal)}`,
        link: "/supplier/orders",
      });

      // Catat transaksi
      await base44.entities.Transaction.create({
        transaction_number: tx,
        user_email: user?.email,
        mitra_id: user?.email,
        customer_role: "mitra",
        payment_status: "paid",
        delivery_status: "pending",
        payment_method: paymentMethod,
        items: items.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          supplier_name: i.supplier_name || "Supplier Utama",
          quantity: i.quantity || 1,
          unit: i.unit || "pcs",
          subtotal: i.price * (i.quantity || 1),
        })),
        subtotal,
        service_fee: serviceFee,
        delivery_fee: DELIVERY_FEE,
        total: grandTotal,
        delivery_address: address,
        item_count: items.length,
        logistic_id: selectedLogistik?.user_email || selectedLogistik?.id || null,
        logistic_name: selectedLogistik?.full_name || selectedLogistik?.organization_name || null,
      });

      // Bekukan ringkasan pembayaran sebelum keranjang dikosongkan
      const summary = {
        txNumber: tx,
        grandTotal,
        subtotal,
        deliveryFee: DELIVERY_FEE,
        paymentMethod,
        logisticName: selectedLogistik?.full_name || selectedLogistik?.organization_name || "-",
        itemCount: items.length,
      };
      setPaidSummary(summary);
      setTxNumber(tx);
      setStep(4);
      await clearCart();
    } catch (err) {
      console.error(err);
      toast.error("Pembayaran gagal", { description: err?.message || "Terjadi kesalahan, coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Detail Pengiriman", "Pembayaran"];

  if (step === 4) {
    const displayTotal = paidSummary?.grandTotal ?? grandTotal;
    const displaySubtotal = paidSummary?.subtotal ?? subtotal;
    const displayDelivery = paidSummary?.deliveryFee ?? DELIVERY_FEE;
    const displayMethod = paidSummary?.paymentMethod ?? paymentMethod;
    const displayLogistik = paidSummary?.logisticName ?? (selectedLogistik?.full_name || selectedLogistik?.organization_name || "-");

    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-700">Pembayaran Berhasil!</h2>
        <p className="text-muted-foreground max-w-sm">Pesanan <strong>{paidSummary?.txNumber || txNumber}</strong> telah dikonfirmasi. Supplier dan logistik akan segera memproses pesanan Anda.</p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 w-full max-w-xs space-y-2 text-sm text-left">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal Produk</span><span className="font-medium">{formatRp(displaySubtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Biaya Kirim</span><span className="font-medium">{formatRp(displayDelivery)}</span></div>
          <div className="border-t pt-1 flex justify-between"><span className="text-muted-foreground font-semibold">Total Bayar</span><span className="font-bold text-green-700">{formatRp(displayTotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Metode</span><span className="font-medium capitalize">{displayMethod.replace("_", " ")}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Logistik</span><span className="font-medium">{displayLogistik}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className="bg-green-100 text-green-700">Dibayar</Badge></div>
        </div>
        <Button onClick={() => navigate("/mitra/dashboard")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" /> Checkout
        </h2>
        <p className="text-muted-foreground">Selesaikan pesanan Anda</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 text-sm">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${step > i + 1 ? 'bg-green-100 text-green-700' : step === i + 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">{step > i + 1 ? "✓" : i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">

          {/* Step 1: Alamat */}
          {step === 1 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Truck className="w-4 h-4" />Detail Pengiriman</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Alamat Pengiriman <span className="text-destructive">*</span></Label>
                  <Input placeholder="Masukkan alamat lengkap..." value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Catatan untuk Supplier</Label>
                  <Input placeholder="Instruksi khusus (opsional)..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                <Button className="w-full" onClick={handleConfirmOrder}>Lanjut ke Pembayaran</Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Pembayaran */}
          {step === 2 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" />Metode Pembayaran</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {selectedLogistik && (
                  <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-3 text-sm">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-800">{selectedLogistik.full_name || selectedLogistik.organization_name}</p>
                      <p className="text-xs text-emerald-600">Biaya kirim: {formatRp(DELIVERY_FEE)}</p>
                    </div>
                  </div>
                )}
                {[
                  { value: "transfer_bank", label: "Transfer Bank", icon: Building2, desc: "BCA / Mandiri / BNI / BRI" },
                  { value: "qris", label: "QRIS", icon: QrCode, desc: "Scan barcode dari aplikasi dompet digital" },
                  { value: "tunai", label: "Tunai (COD)", icon: ShoppingCart, desc: "Bayar saat barang tiba" },
                ].map(m => (
                  <div key={m.value}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === m.value ? 'border-primary bg-primary/5' : 'hover:border-primary/40'}`}
                    onClick={() => setPaymentMethod(m.value)}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${paymentMethod === m.value ? 'bg-primary text-white' : 'bg-muted'}`}>
                        <m.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                      {paymentMethod === m.value && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                    </div>
                  </div>
                ))}

                {paymentMethod === "transfer_bank" && (
                  <div className="bg-emerald-50 rounded-xl p-4 text-sm space-y-2">
                    <p className="font-semibold text-emerald-800">Rekening Tujuan Transfer:</p>
                    <div className="bg-white rounded-lg p-3 border border-emerald-200 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-900 text-base">BRI</span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Rekening Utama</span>
                      </div>
                      <p className="font-bold text-emerald-800 text-lg tracking-widest">0934 0100 0040 566</p>
                      <p className="text-emerald-700 font-medium">a.n. TRICON</p>
                    </div>
                    <p className="text-xs text-emerald-500">*Simpan bukti transfer untuk konfirmasi pesanan. Pembayaran dikonfirmasi dalam 1×24 jam.</p>
                  </div>
                )}

                {paymentMethod === "qris" && (
                  <div className="flex flex-col items-center py-4 bg-gray-50 rounded-xl">
                    <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-gray-400" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Scan QR Code untuk membayar {formatRp(grandTotal)}</p>
                  </div>
                )}

                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handlePayment} disabled={loading}>
                  {loading ? "Memproses..." : `Bayar Sekarang — ${formatRp(grandTotal)}`}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setStep(1)} disabled={loading}>
                  <ArrowLeft className="w-4 h-4 mr-2" />Kembali
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Ringkasan Pesanan</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground truncate mr-2">{item.product_name} × {item.quantity}</span>
                    <span className="font-medium shrink-0">{formatRp(item.price * (item.quantity || 1))}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 space-y-1.5">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatRp(subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Mark-up Platform (2,5%) <span className="text-[10px]">(sudah termasuk)</span></span><span>{formatRp(serviceFee)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Biaya Pengiriman</span>
                  <span>{selectedLogistik ? formatRp(DELIVERY_FEE) : "Belum dipilih"}</span>
                </div>
                {selectedLogistik && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{selectedLogistik.full_name || selectedLogistik.organization_name}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span><span className="text-primary">{formatRp(grandTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}