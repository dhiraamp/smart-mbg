import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, X } from "lucide-react";
import MapPicker from "@/components/warga/MapPicker";

const LABEL_OPTIONS = ["Rumah", "Kantor", "Lainnya"];

const emptyForm = {
  label: "Rumah",
  recipient_name: "",
  phone: "",
  full_address: "",
  village: "",
  district: "",
  regency: "Kabupaten Garut",
  postal_code: "",
  notes: "",
  lat: null,
  lng: null,
};

export default function AddressForm({ initial, isPrimary, onSave, onClose }) {
  const [form, setForm] = useState({ ...emptyForm, ...(initial || {}) });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.recipient_name || !form.full_address) {
      toast.error("Error", { description: "Nama penerima dan alamat lengkap wajib diisi" });
      return;
    }
    onSave({ ...form, is_primary: isPrimary });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1002] p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            {initial ? "Edit Alamat" : "Tambah Alamat Baru"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-900 font-semibold text-sm">Label Alamat</Label>
            <div className="flex gap-2">
              {LABEL_OPTIONS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => update("label", l)}
                  className={`flex-1 text-sm font-semibold py-2 rounded-lg border transition-colors ${
                    form.label === l
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-900 font-semibold text-sm">Nama Penerima <span className="text-red-500">*</span></Label>
              <Input value={form.recipient_name} onChange={(e) => update("recipient_name", e.target.value)} placeholder="Nama penerima" required className="rounded-xl border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 font-semibold text-sm">No. Telepon Penerima</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="08xxxxxxxxxx" className="rounded-xl border-gray-300" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900 font-semibold text-sm">Alamat Lengkap <span className="text-red-500">*</span></Label>
            <Textarea value={form.full_address} onChange={(e) => update("full_address", e.target.value)} placeholder="Jalan / dusun / RT/RW" rows={2} required className="rounded-xl border-gray-300" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-900 font-semibold text-sm">Desa / Kelurahan</Label>
              <Input value={form.village} onChange={(e) => update("village", e.target.value)} placeholder="Desa / Kelurahan" className="rounded-xl border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 font-semibold text-sm">Kecamatan</Label>
              <Input value={form.district} onChange={(e) => update("district", e.target.value)} placeholder="Kecamatan" className="rounded-xl border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 font-semibold text-sm">Kabupaten / Kota</Label>
              <Input value={form.regency} onChange={(e) => update("regency", e.target.value)} className="rounded-xl border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-900 font-semibold text-sm">Kode Pos</Label>
              <Input value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} placeholder="Contoh: 44111" inputMode="numeric" className="rounded-xl border-gray-300" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900 font-semibold text-sm">Catatan Tambahan (Patokan)</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Contoh: Depan masjid, rumah hijau" rows={2} className="rounded-xl border-gray-300" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900 font-semibold text-sm">Koordinat Lokasi</Label>
            <MapPicker
              value={(form.lat != null && form.lng != null) ? { lat: form.lat, lng: form.lng } : null}
              onChange={(pos) => {
                update("lat", pos.lat);
                update("lng", pos.lng);
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              Simpan Alamat
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
