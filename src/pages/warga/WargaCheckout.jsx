import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MapPin, Plus, CreditCard, QrCode, Landmark, ShoppingBag, Truck, CheckCircle2,
  ChevronLeft, ClipboardList, Banknote,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/hooks/useCart";
import { formatRp } from "@/lib/marketplace";
import { getAddresses, getPrimaryAddress, addAddress, updateAddress, saveOrder } from "@/lib/warga-store";
import { base44 } from "@/api/base44Client";
import { notifyRoles } from "@/lib/notify";
import AddressForm from "@/components/warga/AddressForm";
import { toast } from "sonner";

const DELIVERY_FEE = 12000;

const PAYMENT_METHODS = [
  { id: "qris", label: "QRIS", desc: "Scan kode QR saat pembayaran", icon: QrCode },
  { id: "transfer", label: "Transfer Bank", desc: "BRI / BCA / Mandiri / BNI", icon: Landmark },
  { id: "cod", label: "COD (Bayar di Tempat)", desc: "Bayar tunai saat pesanan tiba", icon: ShoppingBag },
];

const BANK_ACCOUNTS = [
  { bank: "BRI", account: "0023-01-0456-7890", holder: "Smart MBG Garut" },
  { bank: "BCA", account: "1234 5678 90", holder: "Smart MBG Garut" },
  { bank: "Mandiri", account: "9000-0000-1234", holder: "Smart MBG Garut" },
  { bank: "BNI", account: "0981-2345-67", holder: "Smart MBG Garut" },
];

export default function WargaCheckout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem("smartmbg_login_email") || "";
  const wargaUser = { email, id: user?.id || email, role: "penerima" };
  const { cartItems, loading, clearCart, totalItems, subtotal } = useCart(wargaUser);

  const [addresses, setAddresses] = useState(() => getAddresses(email));
  const [addressId, setAddressId] = useState(() => getPrimaryAddress(email)?.id || null);
  const [addressModal, setAddressModal] = useState(null);
  const [method, setMethod] = useState("qris");
  const [paying, setPaying] = useState(false);
  const [placed, setPlaced] = useState(null);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === addressId) || null,
    [addresses, addressId]
  );
  const grandTotal = subtotal + DELIVERY_FEE;
  const currentMethod = PAYMENT_METHODS.find((m) => m.id === method);

  const openAddAddress = () => setAddressModal({ mode: "add" });

  const onAddressSaved = (addr) => {
    if (addressModal?.mode === "edit") {
      const updated = updateAddress(email, addressModal.item.id, addr);
      setAddresses(updated);
      setAddressId(addressModal.item.id);
    } else {
      const created = addAddress(email, addr);
      setAddresses(getAddresses(email));
      setAddressId(created.id);
    }
    setAddressModal(null);
    toast.success(addressModal?.mode === "edit" ? "Alamat Diperbarui!" : "Alamat Ditambahkan!");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Pilih Alamat", { description: "Pilih atau tambahkan alamat pengiriman terlebih dahulu." });
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Keranjang Kosong", { description: "Tidak ada item untuk di-checkout." });
      return;
    }
    setPaying(true);
    try {
      const now = new Date();
      const order = {
        id: `ord-${Date.now()}`,
        order_number: `MBG-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        email,
        items: cartItems.map((i) => ({
          id: i.id,
          product_id: i.product_id,
          product_name: i.product_name,
          supplier_name: i.supplier_name || "",
          price: i.price,
          unit: i.unit || "pcs",
          quantity: i.quantity || 1,
          image_url: i.image_url || "",
        })),
        subtotal,
        delivery_fee: DELIVERY_FEE,
        grand_total: grandTotal,
        address: selectedAddress,
        payment_method: currentMethod.label,
        status: "Menunggu Konfirmasi",
        created_at: now.toLocaleString("id-ID", { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        created_iso: now.toISOString(),
        tracking: [
          { label: "Pesanan dibuat", time: now.toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" }), done: true },
        ],
      };

      // Kirim ke rantai pasok: buat Order di penyimpanan bersama (dilihat Supplier & Logistik).
      let remoteId = null;
      try {
        const customerName = localStorage.getItem("smartmbg_name") || user?.full_name || email.split("@")[0] || "Warga";
        const addressText = [selectedAddress.full_address, selectedAddress.village, selectedAddress.district, selectedAddress.regency].filter(Boolean).join(", ");
        const remote = await base44.entities.Order.create({
          order_number: order.order_number,
          status: "pending",
          customer_role: "penerima",
          customer_email: email,
          mitra_id: email,
          mitra_name: customerName,
          mitra_email: email,
          mitra_address: addressText,
          delivery_area: selectedAddress.district || selectedAddress.village || "Kabupaten Garut",
          supplier_name: order.items[0]?.supplier_name || "Supplier Utama",
          supplier_id: order.items[0]?.supplier_id || "supplier@demo.local",
          total: grandTotal,
          total_amount: grandTotal,
          subtotal,
          delivery_fee: DELIVERY_FEE,
          payment_method: currentMethod.label,
          notes: selectedAddress.notes || "",
          items: order.items.map((i) => ({
            product_id: i.product_id,
            product_name: i.product_name,
            supplier_name: i.supplier_name,
            price: i.price,
            unit: i.unit,
            quantity: i.quantity,
            subtotal: i.price * i.quantity,
            image_url: i.image_url,
          })),
          tracking: [
            {
              status: "Menunggu Konfirmasi",
              label: "Pesanan dibuat",
              at: now.toISOString(),
              time: now.toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              note: selectedAddress.notes || "Pesanan dibuat oleh Warga",
              done: true,
            },
          ],
        });
        remoteId = remote.id;
        await notifyRoles(["supplier"], {
          type: "new_order",
          title: "Pesanan Baru dari Warga",
          message: `${order.order_number} · ${customerName} · ${formatRp(grandTotal)}`,
          ref_id: remote.id,
          link: "/supplier/orders",
        });
      } catch (err) {
        console.warn("Gagal membuat Order jarak jauh (tetap disimpan lokal):", err);
      }
      order.remote_id = remoteId || null;
      order.remote_status = remoteId ? "pending" : null;

      saveOrder(email, order);
      await clearCart().catch(() => {});
      setPlaced(order);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Pesanan Berhasil Dibuat!");
    } catch (err) {
      toast.error("Gagal Membuat Pesanan", { description: err.message || "Terjadi kesalahan, coba lagi." });
    } finally {
      setPaying(false);
    }
  };

  if (placed) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-5 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-11 h-11 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan Berhasil Dibuat!</h1>
          <p className="text-sm text-gray-500 mt-2">
            Terima kasih, pesanan Anda sedang kami proses.
          </p>
        </div>
        <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">No. Pesanan</span>
            <span className="font-bold text-gray-900">#{placed.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Pembayaran</span>
            <span className="font-bold text-emerald-600">{formatRp(placed.grand_total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Metode</span>
            <span className="font-semibold text-gray-900">{placed.payment_method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="font-semibold text-amber-600">{placed.status}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={() => navigate("/warga/pesanan")}>
            Lihat Pesanan Saya
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => navigate("/marketplace")}>
            Belanja Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-emerald-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Keranjang Kosong</h2>
          <p className="text-sm text-gray-500 mt-1">Tidak ada item untuk di-checkout.</p>
        </div>
        <button onClick={() => navigate("/marketplace")} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          <ShoppingBag className="w-4 h-4" /> Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/warga/keranjang")} className="text-gray-400 hover:text-emerald-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500 mt-0.5">Lengkapi alamat pengiriman & pembayaran</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Alamat Pengiriman */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" /> Alamat Pengiriman
              </h3>
              <button onClick={openAddAddress} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline">
                <Plus className="w-3 h-3" /> Tambah Alamat
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Belum ada alamat.</p>
                <button onClick={openAddAddress} className="mt-2 text-xs font-semibold text-emerald-600 hover:underline">
                  Tambah alamat sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setAddressId(addr.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      addr.id === addressId
                        ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500"
                        : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-gray-900">{addr.label}</p>
                          <span className="text-xs text-gray-500">{addr.recipient_name}</span>
                          {addr.is_primary && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Utama</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {addr.full_address}
                          {[addr.village, addr.district, addr.regency].filter(Boolean).join(", ")}
                          {addr.postal_code ? ` ${addr.postal_code}` : ""}
                        </p>
                        {addr.phone && <p className="text-[11px] text-gray-500 mt-0.5">Telp: {addr.phone}</p>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metode Pembayaran */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5 mb-4">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Metode Pembayaran
            </h3>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((m) => {
                const MIcon = m.icon;
                const active = method === m.id;
                return (
                  <div key={m.id}>
                    <button
                      onClick={() => setMethod(m.id)}
                      className={`w-full text-left rounded-xl border p-4 flex items-center gap-3 transition-all ${
                        active ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500" : "border-gray-200 hover:border-emerald-300"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <MIcon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{m.label}</p>
                        <p className="text-[11px] text-gray-500">{m.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-emerald-600" : "border-gray-300"}`}>
                        {active && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                      </div>
                    </button>

                    {active && m.id === "transfer" && (
                      <div className="mt-2 rounded-xl bg-gray-50 border border-gray-200 p-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Transfer ke salah satu rekening berikut:</p>
                        <div className="space-y-2">
                          {BANK_ACCOUNTS.map((b) => (
                            <div key={b.bank} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <Landmark className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-bold text-gray-900">{b.bank}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-semibold text-gray-700">{b.account}</p>
                                <p className="text-[10px] text-gray-400">{b.holder}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {active && m.id === "qris" && (
                      <div className="mt-2 rounded-xl bg-gray-50 border border-gray-200 p-4 flex items-center gap-4">
                        <div className="w-24 h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                          <QrCode className="w-14 h-14 text-gray-800" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Scan QRIS saat pembayaran</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Kode QR disediakan kurir/petugas saat pesanan diproses.
                            <br />(Simulasi — gateway pembayaran nyata menyusul)
                          </p>
                        </div>
                      </div>
                    )}

                    {active && m.id === "cod" && (
                      <div className="mt-2 rounded-xl bg-gray-50 border border-gray-200 p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                          <Banknote className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-xs text-gray-600">
                          Siapkan uang tunai sesuai total pembayaran. Pembayaran dilakukan saat pesanan tiba di lokasi Anda.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ringkasan Pesanan */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 h-fit lg:sticky lg:top-20">
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5 mb-4">
            <ClipboardList className="w-4 h-4 text-emerald-600" /> Rincian Pesanan
          </h3>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cartItems.map((i) => (
              <div key={i.id} className="flex items-center gap-3">
                {i.image_url ? (
                  <img src={i.image_url} alt={i.product_name} referrerPolicy="no-referrer" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-emerald-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{i.product_name}</p>
                  <p className="text-[10px] text-gray-500">{i.quantity} × {formatRp(i.price)}</p>
                </div>
                <p className="text-xs font-bold text-gray-900">{formatRp(i.price * i.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-200 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal ({totalItems} item)</span>
              <span className="font-medium text-gray-900">{formatRp(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Biaya Pengiriman</span>
              <span className="font-medium text-gray-900">{formatRp(DELIVERY_FEE)}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total Bayar</span>
              <span className="text-emerald-600">{formatRp(grandTotal)}</span>
            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            disabled={paying}
            className="w-full mt-4 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {paying ? "Memproses..." : `Buat Pesanan — ${formatRp(grandTotal)}`}
          </Button>
          <p className="text-[11px] text-gray-400 text-center mt-2">
            {selectedAddress ? `Dikirim ke: ${selectedAddress.label} · ${selectedAddress.recipient_name}` : "Belum pilih alamat"}
          </p>
        </div>
      </div>

      {addressModal && (
        <AddressForm
          initial={addressModal.mode === "edit" ? addressModal.item : null}
          isPrimary={addresses.length === 0}
          onSave={onAddressSaved}
          onClose={() => setAddressModal(null)}
        />
      )}
    </div>
  );
}
