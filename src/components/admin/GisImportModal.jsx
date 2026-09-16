import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MapPinned,
  Upload,
  Globe,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  getGisData,
  importDisperindagData,
  resetToDisperindagBaseline,
  exportToGeoJson,
} from "@/api/gisService";
import { toast } from "sonner";

export default function GisImportModal({ open, onClose, onImportSuccess }) {
  const [activeTab, setActiveTab] = useState("file"); // "file", "paste", "status"
  const [pastedText, setPastedText] = useState("");
  const [previewResult, setPreviewResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const currentGis = getGisData();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target.result;
        const res = importDisperindagData(content);
        if (res.success) {
          setPreviewResult(res);
          toast.success("Data Berhasil Dimuat", { description: res.message });
          onImportSuccess?.(res.data);
        } else {
          toast.error("Format Tidak Dikenali", { description: res.message });
        }
      } catch (err) {
        toast.error("Gagal Membaca File", { description: err.message });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    if (!pastedText.trim()) {
      toast.error("Data Kosong", { description: "Harap tempelkan data CSV, JSON, atau GeoJSON." });
      return;
    }

    setLoading(true);
    try {
      const res = importDisperindagData(pastedText);
      if (res.success) {
        setPreviewResult(res);
        toast.success("Data Berhasil Disinkronkan", { description: res.message });
        onImportSuccess?.(res.data);
      } else {
        toast.error("Gagal Membaca Format Data", { description: res.message });
      }
    } catch (err) {
      toast.error("Gagal Memproses Teks", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBaseline = () => {
    setLoading(true);
    try {
      const data = resetToDisperindagBaseline();
      toast.success("Dataset Disperindag Garut Disinkronkan", {
        description: `Memuat ${data.dapur.length} Dapur SPPG, ${data.sekolah.length} Sekolah Sasaran, dan ${data.supplier.length} Supplier Pangan binaan Disperindag.`,
      });
      setPreviewResult({
        success: true,
        importedCounts: {
          dapur: data.dapur.length,
          sekolah: data.sekolah.length,
          supplier: data.supplier.length,
          jalur: data.jalur.length,
        },
        message: "Dataset resmi Disperindag Kabupaten Garut berhasil diaktifkan.",
      });
      onImportSuccess?.(data);
    } catch (err) {
      toast.error("Gagal Sinkronisasi", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadGeoJson = () => {
    try {
      const geojson = exportToGeoJson();
      const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GIS_Disperindag_Garut_${new Date().toISOString().slice(0, 10)}.geojson`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("GeoJSON Berhasil Diunduh");
    } catch (err) {
      toast.error("Gagal Ekspor", { description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-6 rounded-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <MapPinned className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Integrasi Portal MBG Garut</span>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold flex items-center gap-1">
              <Globe className="w-3 h-3" /> Disperindag Kab. Garut
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 mt-1">
            Sinkronisasi Data GIS &amp; Pemetaan
          </DialogTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <span>Sumber:</span>
            <a
              href="https://mistermbg.disperindag.garutkab.go.id/mbg"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:underline font-medium inline-flex items-center gap-0.5"
            >
              mistermbg.disperindag.garutkab.go.id/mbg
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </DialogHeader>

        {/* Action Utama: Sinkronkan Dataset Resmi */}
        <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Dataset Resmi Disperindag Garut
            </p>
            <p className="text-xs text-emerald-800/80 mt-0.5">
              Sinkronkan otomatis data 12 Dapur SPPG, 16 Sekolah, dan 8 Supplier terverifikasi.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleSyncBaseline}
            disabled={loading}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm gap-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sinkronkan Sekarang
          </Button>
        </div>

        {/* Tab Pilihan Metode */}
        <div className="flex border-b border-gray-200 mt-4 text-xs font-semibold gap-2">
          <button
            onClick={() => setActiveTab("file")}
            className={`pb-2 px-1 transition-colors flex items-center gap-1.5 ${
              activeTab === "file"
                ? "border-b-2 border-emerald-600 text-emerald-700 font-bold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Unggah Berkas Ekspor
          </button>
          <button
            onClick={() => setActiveTab("paste")}
            className={`pb-2 px-1 transition-colors flex items-center gap-1.5 ${
              activeTab === "paste"
                ? "border-b-2 border-emerald-600 text-emerald-700 font-bold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Tempel Teks (JSON/CSV)
          </button>
          <button
            onClick={() => setActiveTab("status")}
            className={`pb-2 px-1 transition-colors flex items-center gap-1.5 ${
              activeTab === "status"
                ? "border-b-2 border-emerald-600 text-emerald-700 font-bold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Status Layer Saat Ini
          </button>
        </div>

        {/* Konten Tab */}
        <div className="mt-4 space-y-3">
          {activeTab === "file" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-emerald-50/40 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.geojson,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-800">
                Pilih Berkas Ekspor dari Mister MBG
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mendukung format GeoJSON (.geojson), JSON (.json), atau Tabel CSV (.csv)
              </p>
            </div>
          )}

          {activeTab === "paste" && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700">
                Tempelkan Data JSON / CSV dari Mister MBG:
              </Label>
              <Textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder='Contoh: [{"nama": "SPPG Tarogong", "tipe": "dapur", "lat": -7.245, "lng": 107.885, "kapasitas": 2500}] atau CSV...'
                rows={5}
                className="font-mono text-xs rounded-xl border-gray-300 focus:border-emerald-500"
              />
              <Button
                size="sm"
                onClick={handlePasteImport}
                disabled={loading || !pastedText.trim()}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Proses &amp; Simpan ke Peta GIS
              </Button>
            </div>
          )}

          {activeTab === "status" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl text-center">
                <p className="text-xl font-bold text-emerald-800">{currentGis.dapur?.length || 0}</p>
                <p className="text-[11px] font-semibold text-emerald-700">Dapur SPPG</p>
              </div>
              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-2xl text-center">
                <p className="text-xl font-bold text-blue-800">{currentGis.sekolah?.length || 0}</p>
                <p className="text-[11px] font-semibold text-blue-700">Sekolah Sasaran</p>
              </div>
              <div className="bg-orange-50/70 border border-orange-200 p-3 rounded-2xl text-center">
                <p className="text-xl font-bold text-orange-800">{currentGis.supplier?.length || 0}</p>
                <p className="text-[11px] font-semibold text-orange-700">Supplier Pangan</p>
              </div>
              <div className="bg-purple-50/70 border border-purple-200 p-3 rounded-2xl text-center">
                <p className="text-xl font-bold text-purple-800">{currentGis.jalur?.length || 0}</p>
                <p className="text-[11px] font-semibold text-purple-700">Jalur Distribusi</p>
              </div>
            </div>
          )}

          {/* Banner Hasil Impor */}
          {previewResult && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Sinkronisasi Berhasil!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">{previewResult.message}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-gray-100 pt-3 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadGeoJson}
            className="rounded-xl h-9 text-xs border-gray-300 text-gray-700 gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor GeoJSON
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="rounded-xl h-9 text-xs bg-gray-900 hover:bg-black text-white"
          >
            Selesai &amp; Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
