import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Truck, User, Calendar, MapPin, Download, ShieldCheck, FileText } from "lucide-react";

export default function PodViewModal({
  open,
  delivery,
  onClose,
}) {
  if (!open || !delivery) return null;

  const podUrl = delivery.pod_image_url || delivery.pod?.pod_image_url;
  const recipientName = delivery.pod_recipient_name || delivery.pod?.pod_recipient_name || delivery.recipient_name || "Petugas Dapur SPPG";
  const recipientRole = delivery.pod_recipient_role || delivery.pod?.pod_recipient_role || "Pengelola Dapur";
  const receivedAt = delivery.pod_received_at || delivery.pod?.pod_received_at || delivery.date;
  const notes = delivery.pod_notes || delivery.pod?.pod_notes || "Bahan baku diterima dalam kondisi baik & lengkap.";
  const driver = delivery.driver || delivery.driver_name || "Driver Logistik";
  const destination = delivery.mitra || delivery.mitra_name || "Dapur SPPG";
  const area = delivery.area || delivery.delivery_area || delivery.mitra_address || "Garut";

  const handleDownload = () => {
    if (!podUrl) return;
    const a = document.createElement("a");
    a.href = podUrl;
    a.download = `POD_${delivery.id || "delivery"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Verifikasi Digital POD</span>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Terkirim
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 mt-1">
            Bukti Serah Terima Fisik
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            No. Pengiriman: <span className="font-semibold text-gray-800">{delivery.id || delivery.order_number}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Tampilan Foto POD */}
          <div className="rounded-2xl overflow-hidden border border-emerald-100 bg-slate-950 aspect-video flex items-center justify-center shadow-md relative group">
            {podUrl ? (
              <img
                src={podUrl}
                alt="Foto Bukti Serah Terima"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-4 text-gray-400">
                <Truck className="w-10 h-10 mx-auto mb-1 opacity-50" />
                <p className="text-xs">Foto dokumentasi fisik</p>
              </div>
            )}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-semibold backdrop-blur-sm">
              Dokumentasi Resmi
            </div>
          </div>

          {/* Rincian Serah Terima */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5 text-xs text-gray-700">
            <div className="flex items-start justify-between pb-2 border-b border-gray-200/60">
              <div className="flex items-center gap-2 text-gray-500">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Penerima Fisik:</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{recipientName}</p>
                <p className="text-[11px] text-muted-foreground">{recipientRole}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Waktu Serah Terima:</span>
              </div>
              <p className="font-semibold text-gray-900">
                {receivedAt ? (
                  isNaN(Date.parse(receivedAt))
                    ? receivedAt
                    : new Date(receivedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) + " WIB"
                ) : "-"}
              </p>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
              <div className="flex items-center gap-2 text-gray-500">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Driver Pengantar:</span>
              </div>
              <p className="font-semibold text-gray-900">{driver}</p>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Lokasi / Tujuan:</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{destination}</p>
                <p className="text-[11px] text-muted-foreground">{area}</p>
              </div>
            </div>

            {notes && (
              <div className="pt-1">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Catatan Petugas:</span>
                </div>
                <p className="bg-white p-2 rounded-xl border border-gray-200 text-gray-800 text-[11px] italic">
                  "{notes}"
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl h-10 flex-1"
          >
            Tutup
          </Button>
          {podUrl && (
            <Button
              type="button"
              onClick={handleDownload}
              className="rounded-xl h-10 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md gap-1.5"
            >
              <Download className="w-4 h-4" />
              Unduh Foto
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
