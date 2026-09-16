import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, CheckCircle2, X, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Contoh foto serah terima bawaan (SVG data URL) untuk kemudahan pengujian di desktop browser
const SAMPLE_POD_IMAGES = [
  {
    label: "Foto Serah Terima Dapur SPPG",
    dataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%2310b981'/><rect x='20' y='20' width='560' height='360' fill='%23ffffff' rx='16'/><circle cx='300' cy='150' r='60' fill='%23ecfdf5'/><path d='M275 150 L292 167 L325 134' stroke='%23059669' stroke-width='10' stroke-linecap='round' stroke-linejoin='round' fill='none'/><text x='300' y='240' font-family='Arial, sans-serif' font-size='20' font-weight='bold' text-anchor='middle' fill='%23065f46'>BUKTI SERAH TERIMA FISIK (POD)</text><text x='300' y='270' font-family='Arial, sans-serif' font-size='14' text-anchor='middle' fill='%234b5563'>Penerimaan Bahan Baku Dapur SPPG Garut</text><rect x='80' y='305' width='440' height='40' fill='%23f3f4f6' rx='8'/><text x='300' y='330' font-family='monospace' font-size='13' text-anchor='middle' fill='%231f2937'>KONDISI: LENGKAP &amp; SESUAI MANIFEST</text></svg>",
  },
  {
    label: "Foto Penyerahan di Gudang Pangan",
    dataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%230284c7'/><rect x='20' y='20' width='560' height='360' fill='%23ffffff' rx='16'/><circle cx='300' cy='150' r='60' fill='%23f0f9ff'/><path d='M275 150 L292 167 L325 134' stroke='%230284c7' stroke-width='10' stroke-linecap='round' stroke-linejoin='round' fill='none'/><text x='300' y='240' font-family='Arial, sans-serif' font-size='20' font-weight='bold' text-anchor='middle' fill='%23075985'>DOKUMENTASI PENYERAHAN LOGISTIK</text><text x='300' y='270' font-family='Arial, sans-serif' font-size='14' text-anchor='middle' fill='%234b5563'>Gudang Penerima Satuan Pelayanan MBG</text><rect x='80' y='305' width='440' height='40' fill='%23f3f4f6' rx='8'/><text x='300' y='330' font-family='monospace' font-size='13' text-anchor='middle' fill='%231f2937'>STATUS: DIVERIFIKASI PETUGAS</text></svg>",
  },
];

export default function PodSubmitModal({
  open,
  delivery,
  onClose,
  onSubmit,
}) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientRole, setRecipientRole] = useState("Pengelola Dapur SPPG");
  const [notes, setNotes] = useState("Bahan baku diterima dalam kondisi lengkap, segar, dan sesuai jumlah manifes.");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!open || !delivery) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format File Salah", { description: "Harap unggah berkas gambar (JPG/PNG)." });
      return;
    }

    // Batasi ukuran maksimal 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran Terlalu Besar", { description: "Maksimal ukuran foto adalah 5MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUseSample = (sampleUrl) => {
    setImageUrl(sampleUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      toast.error("Nama Penerima Diperlukan", {
        description: "Harap isi nama petugas/penerima yang menandatangani serah terima barang di lokasi.",
      });
      return;
    }

    if (!imageUrl) {
      toast.error("Foto Bukti Diperlukan", {
        description: "Ambil foto bukti serah terima atau gunakan contoh foto dokumentasi.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        deliveryId: delivery.id,
        pod_image_url: imageUrl,
        pod_recipient_name: recipientName.trim(),
        pod_recipient_role: recipientRole,
        pod_notes: notes.trim(),
        pod_received_at: new Date().toISOString(),
      });
      toast.success("Pengantaran Selesai!", {
        description: `Bukti serah terima fisik (POD) untuk ${delivery.id} berhasil disimpan.`,
      });
      onClose();
    } catch (err) {
      toast.error("Gagal Menyimpan POD", { description: err.message || "Terjadi kesalahan." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 rounded-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Konfirmasi Serah Terima</span>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Bukti Serah Terima Fisik (POD)
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            No. Pengiriman: <span className="font-semibold text-gray-800">{delivery.id}</span> · Tujuan:{" "}
            <span className="font-semibold text-gray-800">{delivery.mitra || delivery.mitra_name || "Dapur SPPG"}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Section Foto Dokumentasi */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
              <span>Foto Bukti Penyerahan Barang <span className="text-red-500">*</span></span>
              <span className="text-[11px] font-normal text-muted-foreground">Kamera HP / Berkas</span>
            </Label>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black/5 aspect-video flex items-center justify-center group shadow-sm">
                <img
                  src={imageUrl}
                  alt="Bukti Serah Terima"
                  className="w-full h-full object-contain bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 shadow-lg transition-all"
                  title="Hapus / Ambil Ulang Foto"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Foto Terlampir
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-emerald-50/50 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  Ambil Foto Kamera HP / Unggah Gambar
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Format JPG, PNG (Maks. 5MB)
                </p>
              </div>
            )}

            {/* Tombol Opsi Cepat (Preset Sample) */}
            {!imageUrl && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Opsi Cepat:
                </span>
                {SAMPLE_POD_IMAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUseSample(sample.dataUrl)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 text-gray-700 transition-colors font-medium border border-gray-200"
                  >
                    + {sample.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form Detail Penerima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Nama Petugas Penerima <span className="text-red-500">*</span>
              </Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Contoh: Ibu Siti Rahmawati"
                required
                className="rounded-xl h-10 border-gray-300 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Peran / Jabatan
              </Label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:border-emerald-500 text-gray-800 font-medium"
              >
                <option value="Pengelola Dapur SPPG">Pengelola Dapur SPPG</option>
                <option value="Kepala Dapur">Kepala Dapur</option>
                <option value="Staf Gudang &amp; Logistik">Staf Gudang &amp; Logistik</option>
                <option value="Guru Piket Sekolah">Guru Piket Sekolah</option>
                <option value="Pengurus Posyandu">Pengurus Posyandu</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Catatan Kondisi Barang (Opsional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kondisi barang saat diserahterimakan..."
              rows={2}
              className="rounded-xl text-sm border-gray-300 focus:border-emerald-500"
            />
          </div>

          {/* Metadata serah terima */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Waktu Penyerahan:</span>
              <span className="font-semibold text-gray-800">
                {new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} WIB
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status Selanjutnya:</span>
              <span className="font-semibold text-emerald-600">Delivered (Terkirim &amp; Terverifikasi)</span>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl h-10 flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting || !imageUrl || !recipientName.trim()}
              className="rounded-xl h-10 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md gap-1.5"
            >
              {submitting ? (
                "Menyimpan..."
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi Serah Terima
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
