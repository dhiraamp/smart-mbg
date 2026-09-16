import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { logoutUser } from "@/lib/rolePaths";
import {
  MapPin, Phone, Mail, BadgeCheck, Plus, Pencil, Trash2, Star, ChevronRight,
  LogOut, Clock, CreditCard, QrCode, Landmark, ShoppingBag,
} from "lucide-react";
import {
  getAddresses, addAddress, updateAddress, removeAddress, setPrimaryAddress, getOrders,
} from "@/lib/warga-store";
import AddressForm from "@/components/warga/AddressForm";

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const ADDR_ICONS = { Rumah: "🏠", Kantor: "🏢", Lainnya: "📍" };

export default function WargaProfil() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email || localStorage.getItem("smartmbg_login_email") || "";

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", nik: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addressModal, setAddressModal] = useState(null); // { mode: "add" } | { mode: "edit", item }
  const [deletingId, setDeletingId] = useState(null);

  const orders = getOrders(email);
  const lastOrder = orders[0];

  useEffect(() => {
    setAddresses(getAddresses(email));
    if (!email) return;
    base44.entities.UserProfile.filter({ user_email: email })
      .then((rows) => {
        const p = rows[0] || null;
        setProfile(p);
        setForm({
          full_name: p?.full_name || localStorage.getItem("smartmbg_name") || "",
          nik: p?.nik || localStorage.getItem("smartmbg_nik") || "",
          email,
          phone: p?.phone || localStorage.getItem("smartmbg_phone") || "",
        });
        if (p?.full_name) localStorage.setItem("smartmbg_name", p.full_name);
        if (p?.phone) localStorage.setItem("smartmbg_phone", p.phone);
        if (p?.nik) localStorage.setItem("smartmbg_nik", p.nik);
      })
      .catch(() => setForm((f) => ({ ...f, email })));
  }, [email]);

  const displayName = profile?.full_name || localStorage.getItem("smartmbg_name") || email.split("@")[0] || "Warga";
  const displayPhone = profile?.phone || localStorage.getItem("smartmbg_phone") || "-";
  const displayNik = profile?.nik || localStorage.getItem("smartmbg_nik") || "-";
  const initial = (displayName[0] || "W").toUpperCase();

  const handleSaveProfile = async () => {
    if (!form.full_name) {
      toast.error("Error", { description: "Nama lengkap wajib diisi" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_email: email,
        full_name: form.full_name,
        nik: form.nik,
        phone: form.phone,
        role: "penerima",
        is_active: true,
      };
      if (profile?.id) {
        await base44.entities.UserProfile.update(profile.id, payload);
      } else {
        await base44.entities.UserProfile.create(payload);
      }
      localStorage.setItem("smartmbg_name", form.full_name);
      if (form.phone) localStorage.setItem("smartmbg_phone", form.phone);
      if (form.nik) localStorage.setItem("smartmbg_nik", form.nik);
      setProfile((p) => ({ ...(p || {}), ...payload }));
      setEditing(false);
      toast.success("Profil Diperbarui!");
    } catch (err) {
      toast.error("Gagal Menyimpan", { description: err.message || "Terjadi kesalahan, coba lagi." });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = (addr) => {
    if (addressModal?.mode === "edit") {
      const updated = updateAddress(email, addressModal.item.id, addr);
      setAddresses(updated);
    } else {
      addAddress(email, addr);
      setAddresses(getAddresses(email));
    }
    setAddressModal(null);
    toast.success(addressModal?.mode === "edit" ? "Alamat Diperbarui!" : "Alamat Ditambahkan!");
  };

  const handleDeleteAddress = (id) => {
    const updated = removeAddress(email, id);
    setAddresses(updated);
    setDeletingId(null);
    toast.success("Alamat Dihapus");
  };

  const handleSetPrimary = (id) => {
    setAddresses(setPrimaryAddress(email, id));
    toast.success("Alamat Utama Diperbarui");
  };

  const infoRows = [
    { icon: Mail, label: "Email", value: email },
    { icon: BadgeCheck, label: "NIK", value: displayNik },
    { icon: Phone, label: "No. Telepon", value: displayPhone },
  ];

  return (
    <div className="space-y-5">
      {/* Header profil */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-300/20 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center text-2xl font-bold shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">{displayName}</h2>
            <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
              <BadgeCheck className="w-3.5 h-3.5" /> Anggota Warga Smart MBG
            </p>
            <p className="text-xs text-emerald-100 mt-0.5 truncate flex items-center gap-1">
              <Mail className="w-3 h-3" /> {email}
            </p>
          </div>
        </div>
      </div>

      {/* Informasi Pribadi */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Informasi Pribadi</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
            >
              <Pencil className="w-3 h-3" /> Edit Profil
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">Nama Lengkap</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-xl border-gray-300" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">NIK</Label>
              <Input value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, "") })} maxLength={16} inputMode="numeric" placeholder="16 digit NIK" className="rounded-xl border-gray-300" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">Email</Label>
              <Input value={form.email} disabled className="rounded-xl border-gray-300 bg-gray-50" />
              <p className="text-[11px] text-gray-400">Email tidak dapat diubah</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-900">No. Telepon</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxxx" className="rounded-xl border-gray-300" />
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setEditing(false)} disabled={saving}>
                Batal
              </Button>
              <Button className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Nama Lengkap</p>
              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            </div>
            {infoRows.map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <r.icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{r.label}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{r.value || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alamat */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" /> Alamat Saya
          </h3>
          <button
            onClick={() => setAddressModal({ mode: "add" })}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
          >
            <Plus className="w-3 h-3" /> Tambah Alamat Baru
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-6">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Belum ada alamat tersimpan.</p>
            <p className="text-xs text-gray-400 mt-0.5">Tambahkan alamat untuk pengiriman belanja.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className={`border rounded-xl p-4 ${addr.is_primary ? "border-emerald-400 bg-emerald-50/40" : "border-gray-200"}`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl shrink-0">{ADDR_ICONS[addr.label] || "📍"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">{addr.label}</p>
                      {addr.is_primary && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <Star className="w-2.5 h-2.5" /> Alamat Utama
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">{addr.recipient_name}</p>
                    {addr.phone && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {addr.phone}</p>}
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {addr.full_address}
                      {[addr.village, addr.district, addr.regency].filter(Boolean).join(", ")}
                      {addr.postal_code ? ` ${addr.postal_code}` : ""}
                    </p>
                    {addr.notes && <p className="text-[11px] text-gray-400 italic mt-1">Catatan: {addr.notes}</p>}
                    {addr.lat != null && (
                      <p className="text-[11px] text-gray-400 mt-0.5">Koordinat: {addr.lat}, {addr.lng}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {!addr.is_primary && (
                    <button onClick={() => handleSetPrimary(addr.id)} className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors">
                      <Star className="w-3 h-3" /> Jadikan Alamat Utama
                    </button>
                  )}
                  <button onClick={() => setAddressModal({ mode: "edit", item: addr })} className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  {deletingId === addr.id ? (
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-red-600">
                      <span>Hapus?</span>
                      <button onClick={() => handleDeleteAddress(addr.id)} className="bg-red-600 text-white px-2 py-1 rounded-lg">Ya</button>
                      <button onClick={() => setDeletingId(null)} className="border border-gray-200 px-2 py-1 rounded-lg">Batal</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeletingId(addr.id)} className="flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors">
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Pesanan */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-emerald-600" /> Riwayat Pesanan
          </h3>
          <button onClick={() => navigate("/warga/pesanan")} className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 hover:underline">
            Lihat Semua <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada pesanan. Mulai belanja sekarang!</p>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-semibold text-gray-900">{orders.length} pesanan</p>
              {lastOrder && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Terakhir: <strong>#{lastOrder.order_number}</strong> — {formatRp(lastOrder.grand_total)}
                </p>
              )}
            </div>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" /> Status terbaru: {lastOrder?.status || "-"}
            </span>
          </div>
        )}
      </div>

      {/* Metode Pembayaran Tersimpan */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-1.5 mb-3">
          <CreditCard className="w-4 h-4 text-emerald-600" /> Metode Pembayaran Tersimpan
        </h3>
        <div className="space-y-2">
          {[
            { icon: QrCode, label: "QRIS", desc: "Default — scan saat checkout" },
            { icon: Landmark, label: "Transfer Bank", desc: "BRI / BCA / Mandiri / BNI" },
            { icon: ShoppingBag, label: "COD (Bayar di Tempat)", desc: "Bayar tunai saat pesanan tiba" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3 border border-gray-100 rounded-xl px-3 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <m.icon className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                <p className="text-[11px] text-gray-500">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          Metode pembayaran dapat dipilih pada saat checkout (simulasi).
        </p>
      </div>

      {/* Keluar */}
      <button
        onClick={() => logoutUser("/portal")}
        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
      >
        <LogOut className="w-4 h-4" /> Keluar
      </button>

      {addressModal && (
        <AddressForm
          initial={addressModal.mode === "edit" ? addressModal.item : null}
          isPrimary={addressModal.mode === "add" && addresses.length === 0}
          onSave={handleSaveAddress}
          onClose={() => setAddressModal(null)}
        />
      )}
    </div>
  );
}
