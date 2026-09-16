import React, { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import {
  MapPinned,
  Utensils,
  School,
  Factory,
  Route,
  Flame,
  ChevronRight,
  Globe,
  RefreshCw,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  CheckCircle2,
  Plus,
  Minus,
  Search,
  Crosshair,
  Maximize2,
  X,
  Filter,
  Building2,
  Users,
  MapPin,
  ArrowRight,
  Check,
  ChevronDown,
  Truck,
  Phone,
  ShieldCheck,
  Clock,
  Calendar,
  Award,
  Heart,
  Baby,
  BookOpen,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getGisData, KECAMATAN_COORDS, GARUT_HUB } from "@/api/gisService";
import GisImportModal from "@/components/admin/GisImportModal";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Konfigurasi icon default Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const COLOR = {
  dapur: "#059669",
  sekolah: "#2563eb",
  penerima: "#db2777",
  supplier: "#ea580c",
  jalur: "#8b5cf6",
  heatmap: "#ef4444",
};

const GARUT_CENTER = [-7.2275, 107.9028];

function makeIcon(color, size = 22) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 7px rgba(0,0,0,.35)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Helper pembersih nama sekolah dari teks header PDF
export function cleanSchoolName(name) {
  if (!name) return "Sasaran Penerima MBG";
  let str = name.trim();
  if (str.toUpperCase().includes("SPPG")) {
    const match = str.match(
      /\b(SDN|SD|SMPN|SMP|SMAN|SMA|SMKN|SMK|TK|PAUD|KOBER|RA|MI|MTS|MTs|MA|SPS|SLB|SLBS|POSYANDU|POS YANDU|BALITA|BUMIL|BUSUI)\b.*$/i
    );
    if (match) {
      return match[0].trim();
    }
  }
  return str.replace(/^\d+\s+SPPG\s+[^a-z0-9]+/i, "").trim();
}

// Helper pengkategori penerima manfaat
export function getPenerimaCategory(item) {
  const n = (item.name || "").toUpperCase();
  const j = (item.jenjang || "").toUpperCase();

  if (n.includes("BALITA") || n.includes("BASUTA") || n.includes("BAYI")) {
    return { label: "Balita & Baduta", color: "bg-pink-100 text-pink-800 border-pink-200", icon: Baby };
  }
  if (n.includes("BUMIL") || n.includes("BUSUI") || n.includes("IBU HAMIL") || n.includes("IBU MENYUSUI")) {
    return { label: "Ibu Hamil & Menyusui", color: "bg-rose-100 text-rose-800 border-rose-200", icon: Heart };
  }
  if (n.includes("POSYANDU") || n.includes("POS YANDU") || n.includes("KADER")) {
    return { label: "Posyandu & Balita", color: "bg-purple-100 text-purple-800 border-purple-200", icon: Users };
  }
  if (j.includes("PAUD") || n.includes("PAUD") || n.includes("TK ") || n.includes("KOBER") || n.includes("RA ")) {
    return { label: "PAUD & TK", color: "bg-amber-100 text-amber-800 border-amber-200", icon: Baby };
  }
  if (j.includes("SMA") || j.includes("SMK") || n.includes("SMA") || n.includes("SMK") || n.includes("MA ")) {
    return { label: "Siswa SMA / SMK / MA", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: BookOpen };
  }
  if (j.includes("SMP") || n.includes("SMP") || n.includes("MTS")) {
    return { label: "Siswa SMP / MTs", color: "bg-cyan-100 text-cyan-800 border-cyan-200", icon: BookOpen };
  }
  return { label: "Siswa SD / MI", color: "bg-blue-100 text-blue-800 border-blue-200", icon: School };
}

// Helper untuk menghubungkan instance peta ke ref parent
function MapInstanceBridge({ setMapInstance }) {
  const map = useMap();
  useEffect(() => {
    setMapInstance(map);
  }, [map, setMapInstance]);
  return null;
}

// Komponen penyesuai ukuran peta agar tile ter-render seketika
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (err) {
        // ignore
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Komponen kontrol navigasi peta (Zoom In, Zoom Out, Pusat Garut, Fit Bounds)
function MapNavigationControls({ center, selectedKecamatan, filteredEntities }) {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(11);

  useEffect(() => {
    const onZoom = () => setCurrentZoom(map.getZoom());
    map.on("zoomend", onZoom);
    return () => {
      map.off("zoomend", onZoom);
    };
  }, [map]);

  // Efek perpindahan kamera halus saat kecamatan dipilih
  useEffect(() => {
    if (!selectedKecamatan || selectedKecamatan === "all") return;
    const coord = KECAMATAN_COORDS[selectedKecamatan];
    if (coord) {
      map.flyTo([coord.lat, coord.lng], 13, { duration: 1.2 });
    }
  }, [selectedKecamatan, map]);

  const handleZoomIn = (e) => {
    e.stopPropagation();
    map.zoomIn();
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    map.zoomOut();
  };

  const handleReset = (e) => {
    e.stopPropagation();
    map.flyTo(center, 11, { duration: 1 });
  };

  const handleFitAll = (e) => {
    e.stopPropagation();
    if (!filteredEntities || filteredEntities.length === 0) return;
    const validCoords = filteredEntities
      .filter((item) => item.lat && item.lng)
      .map((item) => [item.lat, item.lng]);
    if (validCoords.length === 0) return;
    const bounds = L.latLngBounds(validCoords);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  };

  return (
    <div
      className="leaflet-top leaflet-right"
      style={{ pointerEvents: "auto", margin: "14px", zIndex: 1000 }}
    >
      <div className="flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-gray-200">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-emerald-50 text-gray-800 hover:text-emerald-700 shadow-sm border border-gray-100 transition-all active:scale-95 cursor-pointer"
          title="Perbesar Peta (Zoom In)"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-emerald-50 text-gray-800 hover:text-emerald-700 shadow-sm border border-gray-100 transition-all active:scale-95 cursor-pointer"
          title="Perkecil Peta (Zoom Out)"
        >
          <Minus className="w-5 h-5" />
        </button>
        <div className="h-px bg-gray-200 my-0.5" />
        <button
          type="button"
          onClick={handleReset}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-emerald-50 text-gray-800 hover:text-emerald-700 shadow-sm border border-gray-100 transition-all active:scale-95 cursor-pointer"
          title="Pusatkan ke Garut Kota"
        >
          <Crosshair className="w-4 h-4 text-emerald-600" />
        </button>
        <button
          type="button"
          onClick={handleFitAll}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-emerald-50 text-gray-800 hover:text-emerald-700 shadow-sm border border-gray-100 transition-all active:scale-95 cursor-pointer"
          title="Fokuskan Titik Terfilter"
        >
          <Maximize2 className="w-4 h-4 text-blue-600" />
        </button>
        <div className="text-[10px] font-bold text-gray-500 text-center pt-0.5">
          {currentZoom}x
        </div>
      </div>
    </div>
  );
}

export default function GisMap() {
  const [gisData, setGisData] = useState(() => getGisData());
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [active, setActive] = useState({
    dapur: true,
    sekolah: true,
    supplier: true,
    jalur: true,
    heatmap: false,
  });

  // Modal State
  const [selectedSppgModal, setSelectedSppgModal] = useState(null);
  const [selectedSekolahModal, setSelectedSekolahModal] = useState(null);
  const [selectedSupplierModal, setSelectedSupplierModal] = useState(null);
  const [selectedJalurModal, setSelectedJalurModal] = useState(null);
  const [selectedPenerimaModal, setSelectedPenerimaModal] = useState(null);

  const [mapInstance, setMapInstance] = useState(null);

  // DROPDOWN ENTITAS UTAMA (Samping Search Bar)
  // Opsi: "dapur" | "sekolah" | "penerima" | "supplier" | "jalur"
  const [selectedEntityType, setSelectedEntityType] = useState("dapur");

  // State Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState("all");
  const [entitySubFilter, setEntitySubFilter] = useState("all");
  const [visibleListCount, setVisibleListCount] = useState(9);

  // Berlangganan event perubahan data GIS dari gisService
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail) {
        setGisData(e.detail);
      } else {
        setGisData(getGisData());
      }
    };

    window.addEventListener("smartmbg_gis_updated", handleUpdate);
    return () => window.removeEventListener("smartmbg_gis_updated", handleUpdate);
  }, []);

  const toggle = (key) => setActive((prev) => ({ ...prev, [key]: !prev[key] }));

  const rawDapur = gisData.dapur || [];
  const rawSekolah = gisData.sekolah || [];
  const rawSupplier = gisData.supplier || [];
  const rawJalur = gisData.jalur || [];
  const rawHeatmap = gisData.heatmap || [];

  // Peta lookup ID SPPG -> Dapur Object untuk relasi sekolah
  const dapurLookup = useMemo(() => {
    const map = new Map();
    rawDapur.forEach((d) => {
      map.set(d.id, d);
      if (d.code) map.set(d.code, d);
      const cleanNum = d.id.replace("sppg_", "");
      map.set(`sppg_${parseInt(cleanNum, 10)}`, d);
    });
    return map;
  }, [rawDapur]);

  // Daftar unik kecamatan gabungan se-Garut
  const kecamatanList = useMemo(() => {
    const setKec = new Set([
      ...rawDapur.map((d) => d.kecamatan).filter(Boolean),
      ...rawSekolah.map((s) => s.kecamatan).filter(Boolean),
      ...rawSupplier.map((s) => s.kecamatan).filter(Boolean),
    ]);
    return Array.from(setKec).sort();
  }, [rawDapur, rawSekolah, rawSupplier]);

  // Hitung jumlah item per kecamatan berdasarkan entitas aktif
  const entityCountPerKec = useMemo(() => {
    const map = {};
    const dataset =
      selectedEntityType === "dapur"
        ? rawDapur
        : selectedEntityType === "sekolah" || selectedEntityType === "penerima"
        ? rawSekolah
        : selectedEntityType === "supplier"
        ? rawSupplier
        : [];

    dataset.forEach((item) => {
      const k = item.kecamatan || "Garut Kota";
      map[k] = (map[k] || 0) + 1;
    });
    return map;
  }, [selectedEntityType, rawDapur, rawSekolah, rawSupplier]);

  // FILTER 1: Dapur SPPG
  const filteredDapur = useMemo(() => {
    return rawDapur.filter((d) => {
      if (selectedKecamatan !== "all" && d.kecamatan !== selectedKecamatan) return false;

      // Sub-filter Kapasitas
      const kap = Number(d.kapasitas) || 0;
      if (selectedEntityType === "dapur") {
        if (entitySubFilter === "high" && kap < 2500) return false;
        if (entitySubFilter === "medium" && (kap < 1500 || kap >= 2500)) return false;
        if (entitySubFilter === "low" && kap >= 1500) return false;
      }

      // Query Pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (d.name || "").toLowerCase().includes(q);
        const matchTitle = (d.clean_title || "").toLowerCase().includes(q);
        const matchDesa = (d.desa_unit || "").toLowerCase().includes(q);
        const matchYayasan = (d.yayasan || "").toLowerCase().includes(q);
        const matchKec = (d.kecamatan || "").toLowerCase().includes(q);
        const matchSasaran = (d.sasaran || []).some((s) => (s.name || "").toLowerCase().includes(q));
        if (!matchName && !matchTitle && !matchDesa && !matchYayasan && !matchKec && !matchSasaran) {
          return false;
        }
      }
      return true;
    });
  }, [rawDapur, selectedKecamatan, entitySubFilter, searchQuery, selectedEntityType]);

  // FILTER 2: Sekolah Sasaran
  const filteredSekolah = useMemo(() => {
    return rawSekolah.filter((s) => {
      if (selectedKecamatan !== "all" && s.kecamatan !== selectedKecamatan) return false;

      // Sub-filter Jenjang
      if (selectedEntityType === "sekolah" && entitySubFilter !== "all") {
        if (entitySubFilter === "SD" && s.jenjang !== "SD") return false;
        if (entitySubFilter === "SMP" && s.jenjang !== "SMP") return false;
        if (entitySubFilter === "SMA" && s.jenjang !== "SMA/SMK") return false;
        if (entitySubFilter === "PAUD" && s.jenjang !== "PAUD/Posyandu") return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cleaned = cleanSchoolName(s.name).toLowerCase();
        const matchName = (s.name || "").toLowerCase().includes(q) || cleaned.includes(q);
        const matchKec = (s.kecamatan || "").toLowerCase().includes(q);
        const matchJenjang = (s.jenjang || "").toLowerCase().includes(q);
        if (!matchName && !matchKec && !matchJenjang) return false;
      }
      return true;
    });
  }, [rawSekolah, selectedKecamatan, entitySubFilter, searchQuery, selectedEntityType]);

  // FILTER 3: Penerima Manfaat
  const filteredPenerima = useMemo(() => {
    return rawSekolah.filter((s) => {
      if (selectedKecamatan !== "all" && s.kecamatan !== selectedKecamatan) return false;

      const cat = getPenerimaCategory(s).label.toLowerCase();
      if (selectedEntityType === "penerima" && entitySubFilter !== "all") {
        if (entitySubFilter === "sekolah" && !cat.includes("siswa")) return false;
        if (entitySubFilter === "balita" && !cat.includes("balita") && !cat.includes("paud")) return false;
        if (entitySubFilter === "bumil" && !cat.includes("ibu hamil") && !cat.includes("menyusui")) return false;
        if (entitySubFilter === "posyandu" && !cat.includes("posyandu")) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cleaned = cleanSchoolName(s.name).toLowerCase();
        const matchName = (s.name || "").toLowerCase().includes(q) || cleaned.includes(q);
        const matchKec = (s.kecamatan || "").toLowerCase().includes(q);
        const matchCat = cat.includes(q);
        if (!matchName && !matchKec && !matchCat) return false;
      }
      return true;
    });
  }, [rawSekolah, selectedKecamatan, entitySubFilter, searchQuery, selectedEntityType]);

  // FILTER 4: Supplier Pangan
  const filteredSupplier = useMemo(() => {
    return rawSupplier.filter((s) => {
      if (selectedKecamatan !== "all" && s.kecamatan && !s.kecamatan.includes(selectedKecamatan)) {
        return false;
      }

      // Sub-filter Komoditas
      if (selectedEntityType === "supplier" && entitySubFilter !== "all") {
        const j = (s.jenis || "").toLowerCase();
        if (entitySubFilter === "beras" && !j.includes("beras") && !j.includes("padi")) return false;
        if (
          entitySubFilter === "protein" &&
          !j.includes("telur") &&
          !j.includes("daging") &&
          !j.includes("ikan") &&
          !j.includes("nabati")
        )
          return false;
        if (entitySubFilter === "sayur" && !j.includes("sayur") && !j.includes("organik")) return false;
        if (entitySubFilter === "bumbu" && !j.includes("bumbu") && !j.includes("rempah")) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (s.name || "").toLowerCase().includes(q);
        const matchJenis = (s.jenis || "").toLowerCase().includes(q);
        const matchKec = (s.kecamatan || "").toLowerCase().includes(q);
        if (!matchName && !matchJenis && !matchKec) return false;
      }
      return true;
    });
  }, [rawSupplier, selectedKecamatan, entitySubFilter, searchQuery, selectedEntityType]);

  // FILTER 5: Jalur Logistik
  const filteredJalur = useMemo(() => {
    return rawJalur.filter((j) => {
      const distanceNum = parseInt(j.jarak, 10) || 0;
      if (selectedEntityType === "jalur" && entitySubFilter !== "all") {
        if (entitySubFilter === "dekat" && distanceNum >= 10) return false;
        if (entitySubFilter === "sedang" && (distanceNum < 10 || distanceNum > 20)) return false;
        if (entitySubFilter === "jauh" && distanceNum <= 20) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTarget = (j.target || "").toLowerCase().includes(q);
        const matchJarak = (j.jarak || "").toLowerCase().includes(q);
        const matchWaktu = (j.waktu || "").toLowerCase().includes(q);
        if (!matchTarget && !matchJarak && !matchWaktu) return false;
      }
      return true;
    });
  }, [rawJalur, entitySubFilter, searchQuery, selectedEntityType]);

  // Hitung Agregat
  const totalSiswaFiltered = filteredSekolah.reduce((sum, s) => sum + (Number(s.siswa) || 0), 0);
  const totalKapasitasFiltered = filteredDapur.reduce((sum, d) => sum + (Number(d.kapasitas) || 0), 0);

  // Reset pagination saat filter atau entitas berubah
  useEffect(() => {
    setVisibleListCount(9);
  }, [searchQuery, selectedKecamatan, entitySubFilter, selectedEntityType]);

  // Reset filter sub saat ganti entity
  const handleEntityChange = (newType) => {
    setSelectedEntityType(newType);
    setEntitySubFilter("all");
    setVisibleListCount(9);

    // Otomatis aktifkan layer peta terkait
    if (newType === "dapur") setActive((p) => ({ ...p, dapur: true }));
    if (newType === "sekolah") setActive((p) => ({ ...p, sekolah: true }));
    if (newType === "penerima") setActive((p) => ({ ...p, sekolah: true }));
    if (newType === "supplier") setActive((p) => ({ ...p, supplier: true }));
    if (newType === "jalur") setActive((p) => ({ ...p, jalur: true }));
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedKecamatan !== "all" || entitySubFilter !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedKecamatan("all");
    setEntitySubFilter("all");
  };

  // Navigasi fokus titik di peta
  const handleFocusItemOnMap = (lat, lng, zoom = 14) => {
    if (!mapInstance || !lat || !lng) return;
    mapInstance.flyTo([lat, lng], zoom, { duration: 1.2 });
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  // Navigasi fokus jalur di peta
  const handleFocusJalurOnMap = (jalurItem) => {
    if (!mapInstance || !jalurItem.path) return;
    const bounds = L.latLngBounds(jalurItem.path);
    mapInstance.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  // Placeholder pencarian adaptif sesuai dropdown
  const getSearchPlaceholder = () => {
    switch (selectedEntityType) {
      case "dapur":
        return "Cari Kode SPPG, Nama Desa, Yayasan...";
      case "sekolah":
        return "Cari Nama Sekolah, Jenjang (SD, SMP, SMA)...";
      case "penerima":
        return "Cari Sasaran Balita, Siswa, Posyandu, Bumil...";
      case "supplier":
        return "Cari Supplier, Komoditas (Beras, Telur, Sayur)...";
      case "jalur":
        return "Cari Dapur Tujuan, Rute Distribusi...";
      default:
        return "Cari data...";
    }
  };

  const LAYERS = [
    { key: "dapur", label: "Lokasi Dapur (SPPG)", icon: Utensils, color: COLOR.dapur, count: filteredDapur.length },
    { key: "sekolah", label: "Sekolah Sasaran", icon: School, color: COLOR.sekolah, count: filteredSekolah.length },
    { key: "supplier", label: "Supplier Pangan", icon: Factory, color: COLOR.supplier, count: filteredSupplier.length },
    { key: "jalur", label: "Jalur Distribusi", icon: Route, color: COLOR.jalur, count: filteredJalur.length },
    { key: "heatmap", label: "Heatmap Layanan", icon: Flame, color: COLOR.heatmap, count: rawHeatmap.length },
  ];

  return (
    <section className="w-full mx-auto py-2">
      {/* Header GIS dengan Badge Integrasi Disperindag */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <MapPinned className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Peta Sebaran GIS MBG Garut</h2>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 text-[11px] font-semibold py-0.5">
              <Globe className="w-3 h-3 text-emerald-600" />
              Terintegrasi Disperindag Garut
            </Badge>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] font-semibold py-0.5">
              {rawDapur.length} Dapur SPPG · {rawSekolah.length} Sekolah
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Sumber Data:{" "}
            <a
              href="https://mistermbg.disperindag.garutkab.go.id/mbg"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 font-medium hover:underline inline-flex items-center gap-0.5"
            >
              mistermbg.disperindag.garutkab.go.id/mbg
              <ExternalLink className="w-2.5 h-2.5" />
            </a>{" "}
            · Pemetaan 446 Dapur SPPG, 1.611 Sekolah Sasaran, Penerima Manfaat, Supplier &amp; Logistik Garut
          </p>
        </div>

        {/* Tombol Sinkronisasi / Kelola GIS */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setImportModalOpen(true)}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 shadow-sm gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Sinkronkan Data Disperindag
          </Button>
        </div>
      </div>

      {/* PANEL FILTERING & PENCARIAN TERPADU */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-3 sm:p-4 mb-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Filter Geospasial &amp; Pencarian Terpadu
            </span>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset Semua Filter
            </button>
          )}
        </div>

        {/* BARIS UTAMA: DROPDOWN ENTITAS DI SAMPING SEARCH BAR + KECAMATAN */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* 1. DROPDOWN PILIHAN ENTITAS (Dapur, Sekolah, Penerima, Supplier, Jalur) */}
          <div className="md:col-span-4 lg:col-span-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Pilih Entitas GIS:
            </label>
            <div className="relative">
              <select
                value={selectedEntityType}
                onChange={(e) => handleEntityChange(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs font-bold bg-emerald-50/90 border-2 border-emerald-500/50 text-emerald-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs transition-all appearance-none"
              >
                <option value="dapur">🏢 Dapur SPPG ({filteredDapur.length})</option>
                <option value="sekolah">🏫 Sekolah Sasaran ({filteredSekolah.length})</option>
                <option value="penerima">👥 Penerima Manfaat ({totalSiswaFiltered.toLocaleString("id-ID")})</option>
                <option value="supplier">🌾 Supplier Pangan ({filteredSupplier.length})</option>
                <option value="jalur">🚚 Jalur Logistik ({filteredJalur.length})</option>
              </select>
              <ChevronDown className="w-4 h-4 text-emerald-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2. INPUT PENCARIAN DI SAMPING DROPDOWN */}
          <div className="md:col-span-5 lg:col-span-5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Kata Kunci Pencarian:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-800 placeholder-gray-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 3. DROPDOWN KECAMATAN GARUT */}
          <div className="md:col-span-3 lg:col-span-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Wilayah Kecamatan ({kecamatanList.length}):
            </label>
            <div className="relative">
              <select
                value={selectedKecamatan}
                onChange={(e) => setSelectedKecamatan(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-800 font-medium cursor-pointer appearance-none"
              >
                <option value="all">📍 Semua Kecamatan ({kecamatanList.length} Wilayah)</option>
                {kecamatanList.map((kec) => (
                  <option key={kec} value={kec}>
                    Kec. {kec} ({entityCountPerKec[kec] || 0} unit)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* SUB-FILTER DINAMIS MENYESUAIKAN ENTITAS YANG DIPILIH */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap mr-1">
              Kategori Spesifik:
            </span>

            {/* Sub-filter untuk Dapur SPPG */}
            {selectedEntityType === "dapur" && (
              <>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("all")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "all"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Semua Kapasitas ({rawDapur.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("high")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "high"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  &gt; 2.500 Porsi
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("medium")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "medium"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  1.500 – 2.500
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("low")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "low"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  &lt; 1.500
                </button>
              </>
            )}

            {/* Sub-filter untuk Sekolah Sasaran */}
            {selectedEntityType === "sekolah" && (
              <>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("all")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "all"
                      ? "bg-blue-700 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Semua Jenjang ({rawSekolah.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("SD")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "SD"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  SD / MI
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("SMP")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "SMP"
                      ? "bg-cyan-600 text-white shadow-xs"
                      : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                  }`}
                >
                  SMP / MTs
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("SMA")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "SMA"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  SMA / SMK
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("PAUD")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "PAUD"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  PAUD / Posyandu
                </button>
              </>
            )}

            {/* Sub-filter untuk Penerima Manfaat */}
            {selectedEntityType === "penerima" && (
              <>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("all")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "all"
                      ? "bg-pink-700 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Semua Penerima
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("sekolah")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "sekolah"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  Siswa Sekolah
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("balita")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "balita"
                      ? "bg-pink-600 text-white shadow-xs"
                      : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                  }`}
                >
                  Balita &amp; PAUD
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("bumil")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "bumil"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                  Ibu Hamil &amp; Menyusui
                </button>
              </>
            )}

            {/* Sub-filter untuk Supplier */}
            {selectedEntityType === "supplier" && (
              <>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("all")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "all"
                      ? "bg-orange-700 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Semua Komoditas ({rawSupplier.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("beras")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "beras"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  Beras &amp; Pangan
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("protein")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "protein"
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  Telur &amp; Daging
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("sayur")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "sayur"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  Sayuran &amp; Buah
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("bumbu")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "bumbu"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  Bumbu &amp; Rempah
                </button>
              </>
            )}

            {/* Sub-filter untuk Jalur Logistik */}
            {selectedEntityType === "jalur" && (
              <>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("all")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "all"
                      ? "bg-purple-700 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Semua Rute ({rawJalur.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("dekat")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "dekat"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                  }`}
                >
                  &lt; 10 km
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("sedang")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "sedang"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  10 – 20 km
                </button>
                <button
                  type="button"
                  onClick={() => setEntitySubFilter("jauh")}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    entitySubFilter === "jauh"
                      ? "bg-violet-600 text-white shadow-xs"
                      : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                  }`}
                >
                  &gt; 20 km
                </button>
              </>
            )}
          </div>

          <span className="text-[11px] text-gray-500 font-medium">
            Entitas Terfilter:{" "}
            <strong className="text-gray-900">
              {selectedEntityType === "dapur"
                ? `${filteredDapur.length} Dapur SPPG`
                : selectedEntityType === "sekolah"
                ? `${filteredSekolah.length} Sekolah Sasaran`
                : selectedEntityType === "penerima"
                ? `${totalSiswaFiltered.toLocaleString("id-ID")} Siswa & Balita`
                : selectedEntityType === "supplier"
                ? `${filteredSupplier.length} Supplier Pangan`
                : `${filteredJalur.length} Jalur Distribusi`}
            </strong>
          </span>
        </div>
      </div>

      {/* Layer Toggle Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {LAYERS.map((layer) => {
          const isOn = active[layer.key];
          return (
            <button
              key={layer.key}
              type="button"
              onClick={() => toggle(layer.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                isOn
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-gray-200 bg-white text-gray-500 hover:border-emerald-300"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: layer.color }} />
              <layer.icon className="w-3.5 h-3.5" />
              {layer.label}
              <span className="text-[10px] font-bold opacity-75">({layer.count})</span>
            </button>
          );
        })}
      </div>

      {/* Wadah Peta Leaflet dengan Tombol Zoom In / Zoom Out Interaktif */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm relative z-0">
        <div style={{ height: "560px", width: "100%", position: "relative" }}>
          <MapContainer
            center={GARUT_CENTER}
            zoom={11}
            style={{ height: "100%", width: "100%", minHeight: "560px" }}
            scrollWheelZoom={true}
            zoomControl={false}
          >
            <MapInstanceBridge setMapInstance={setMapInstance} />
            <MapResizer />
            <MapNavigationControls
              center={GARUT_CENTER}
              selectedKecamatan={selectedKecamatan}
              filteredEntities={
                selectedEntityType === "dapur"
                  ? filteredDapur
                  : selectedEntityType === "sekolah" || selectedEntityType === "penerima"
                  ? filteredSekolah
                  : selectedEntityType === "supplier"
                  ? filteredSupplier
                  : filteredDapur
              }
            />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Disperindag Garut'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Heatmap Area */}
            {active.heatmap &&
              rawHeatmap.map((h, i) => (
                <Circle
                  key={`hm-${i}`}
                  center={[h.lat, h.lng]}
                  radius={(h.intensitas || 5) * 220}
                  pathOptions={{
                    color: COLOR.heatmap,
                    fillColor: COLOR.heatmap,
                    fillOpacity: 0.18 + (h.intensitas || 5) * 0.04,
                    weight: 1,
                    opacity: 0.5,
                  }}
                >
                  <Popup>
                    <p className="text-xs font-bold text-red-600">Zona Heatmap Layanan MBG</p>
                    <p className="text-xs text-gray-700 font-medium">Wilayah: {h.area || "Garut"}</p>
                    <p className="text-[11px] text-gray-500">Tingkat Konsumsi: {h.intensitas || 5}/10</p>
                  </Popup>
                </Circle>
              ))}

            {/* Jalur Pengiriman */}
            {active.jalur &&
              filteredJalur.map((j, i) => (
                <Polyline
                  key={`jalur-${i}`}
                  positions={j.path}
                  pathOptions={{ color: COLOR.jalur, weight: 3.5, opacity: 0.85, dashArray: "6 8" }}
                >
                  <Popup>
                    <div className="p-1 space-y-1.5 max-w-[240px]">
                      <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        Rute Logistik Terjadwal
                      </span>
                      <p className="text-xs text-gray-900 font-bold leading-tight">{j.target}</p>
                      <div className="text-[11px] text-gray-600 bg-purple-50/50 p-2 rounded-lg space-y-0.5">
                        <p>
                          Jarak Tempuh: <strong>{j.jarak}</strong>
                        </p>
                        <p>
                          Estimasi Waktu: <strong>± {j.waktu}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedJalurModal(j)}
                        className="w-full mt-1 py-1 text-[11px] font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer"
                      >
                        Detail Rute Logistik
                      </button>
                    </div>
                  </Popup>
                </Polyline>
              ))}

            {/* Marker Supplier */}
            {active.supplier &&
              filteredSupplier.map((s, i) => (
                <Marker key={`sup-${i}`} position={[s.lat, s.lng]} icon={makeIcon(COLOR.supplier)}>
                  <Popup>
                    <div className="p-1 space-y-2 max-w-[250px]">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
                          Supplier Pangan
                        </span>
                        <Badge variant="outline" className="text-[9px] border-orange-200 text-orange-700">
                          Kec. {s.kecamatan}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{s.name}</p>
                      <div className="text-xs text-gray-600 bg-orange-50/60 p-2 rounded-xl">
                        <p className="font-semibold text-orange-950">Komoditas: {s.jenis}</p>
                        {s.kontak && <p className="text-[11px] text-emerald-700 mt-1">📞 {s.kontak}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSupplierModal(s)}
                        className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold rounded-xl cursor-pointer"
                      >
                        Lihat Profil Supplier
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* Marker Sekolah / Sasaran Penerima */}
            {active.sekolah &&
              filteredSekolah.map((s, i) => {
                const cleanedName = cleanSchoolName(s.name);
                const category = getPenerimaCategory(s);

                return (
                  <Marker key={`sek-${i}`} position={[s.lat, s.lng]} icon={makeIcon(COLOR.sekolah, 20)}>
                    <Popup>
                      <div className="p-1 space-y-2 max-w-[260px]">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${category.color}`}
                          >
                            {category.label}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-500">
                            Kec. {s.kecamatan}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-900 leading-snug">{cleanedName}</p>
                        <div className="bg-blue-50/70 border border-blue-100 p-2 rounded-xl text-xs space-y-0.5">
                          <p className="text-blue-900 font-bold">
                            Alokasi: {(s.siswa || 0).toLocaleString("id-ID")} Porsi/Hari
                          </p>
                          <p className="text-[11px] text-gray-600">Jenjang: {s.jenjang || "SD"}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedEntityType === "penerima") {
                              setSelectedPenerimaModal(s);
                            } else {
                              setSelectedSekolahModal(s);
                            }
                          }}
                          className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl cursor-pointer"
                        >
                          Lihat Detail Lengkap
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

            {/* Marker Dapur (SPPG) Terfilter */}
            {active.dapur &&
              filteredDapur.map((d, i) => {
                const sppgCode = d.code || `SPPG-${String(i + 1).padStart(3, "0")}`;
                const displayName = d.desa_unit || d.clean_title || d.name;

                return (
                  <Marker key={`dapur-${d.id || i}`} position={[d.lat, d.lng]} icon={makeIcon(COLOR.dapur)}>
                    <Popup className="custom-sppg-popup">
                      <div className="p-1 space-y-2 max-w-[280px]">
                        {/* Header Popup */}
                        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5">
                          <span className="text-[11px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow-xs tracking-wider">
                            {sppgCode}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Aktif
                          </span>
                        </div>

                        {/* Judul & Lokasi */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 leading-snug">{displayName}</h4>
                          <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                            Kecamatan {d.kecamatan || "Garut Kota"}
                          </p>
                        </div>

                        {/* Kapasitas & Yayasan */}
                        <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-600 font-medium">Kapasitas Harian:</span>
                            <span className="font-bold text-emerald-800">
                              {(d.kapasitas || 0).toLocaleString("id-ID")} Porsi
                            </span>
                          </div>
                          {d.yayasan && (
                            <div className="text-[10px] text-gray-600 pt-1 border-t border-emerald-100/80 truncate">
                              <span className="font-semibold text-gray-700">🏢 Yayasan:</span> {d.yayasan}
                            </div>
                          )}
                        </div>

                        {/* Tombol Detail Sasaran */}
                        <button
                          type="button"
                          onClick={() => setSelectedSppgModal(d)}
                          className="w-full py-1.5 bg-gray-900 hover:bg-black text-white text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                        >
                          Lihat Rincian Sasaran &amp; Sekolah
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        </div>
      </div>

      {/* Legenda Peta */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 text-xs text-gray-500 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR.dapur }} /> Dapur SPPG (
            {filteredDapur.length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR.sekolah }} /> Sekolah (
            {filteredSekolah.length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR.supplier }} /> Supplier (
            {filteredSupplier.length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR.jalur }} /> Jalur Distribusi (
            {filteredJalur.length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR.heatmap }} /> Heatmap Layanan
          </span>
        </div>
        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Data Aktif Disperindag Garut
        </span>
      </div>

      {/* DIREKTORI DINAMIS: MENAMPILKAN KARTU RINCIAN ENTITAS SESUAI DROPDOWN PILIHAN */}
      <div className="mt-8 space-y-4">
        {/* Header Direktori */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              {selectedEntityType === "dapur" && (
                <>
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  Direktori Dapur SPPG Terverifikasi
                </>
              )}
              {selectedEntityType === "sekolah" && (
                <>
                  <School className="w-5 h-5 text-blue-600" />
                  Direktori Sekolah Sasaran Distribusi MBG
                </>
              )}
              {selectedEntityType === "penerima" && (
                <>
                  <Users className="w-5 h-5 text-pink-600" />
                  Direktori Sasaran Penerima Manfaat Gizi
                </>
              )}
              {selectedEntityType === "supplier" && (
                <>
                  <Factory className="w-5 h-5 text-orange-600" />
                  Direktori Supplier Pangan Binaan Garut
                </>
              )}
              {selectedEntityType === "jalur" && (
                <>
                  <Route className="w-5 h-5 text-purple-600" />
                  Direktori Jalur Distribusi Logistik
                </>
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedEntityType === "dapur" &&
                "Daftar Satuan Pelayanan Pangan Bergizi resmi di Kabupaten Garut dengan rincian nama, wilayah, dan kapasitas"}
              {selectedEntityType === "sekolah" &&
                "Daftar 1.611 satuan pendidikan penerima paket MBG harian terdata resmi di 36 kecamatan Kabupaten Garut"}
              {selectedEntityType === "penerima" &&
                "Rincian penerima manfaat harian: Siswa SD/SMP/SMA, PAUD, Balita, serta Ibu Hamil & Menyusui"}
              {selectedEntityType === "supplier" &&
                "Kelompok tani, peternak, nelayan & UMKM pangan lokal terverifikasi pemasok bahan baku dapur SPPG"}
              {selectedEntityType === "jalur" &&
                "Jalur distribusi logistik terjadwal dari Central Hub Garut Kota menuju unit dapur SPPG kecamatan"}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              {selectedEntityType === "dapur" &&
                `Menampilkan ${Math.min(visibleListCount, filteredDapur.length)} dari ${filteredDapur.length} Dapur`}
              {selectedEntityType === "sekolah" &&
                `Menampilkan ${Math.min(visibleListCount, filteredSekolah.length)} dari ${filteredSekolah.length} Sekolah`}
              {selectedEntityType === "penerima" &&
                `Menampilkan ${Math.min(visibleListCount, filteredPenerima.length)} dari ${filteredPenerima.length} Sasaran`}
              {selectedEntityType === "supplier" &&
                `Menampilkan ${Math.min(visibleListCount, filteredSupplier.length)} dari ${filteredSupplier.length} Supplier`}
              {selectedEntityType === "jalur" &&
                `Menampilkan ${Math.min(visibleListCount, filteredJalur.length)} dari ${filteredJalur.length} Jalur`}
            </span>
          </div>
        </div>

        {/* 1. KONTEN DIREKTORI DAPUR SPPG */}
        {selectedEntityType === "dapur" && (
          <>
            {filteredDapur.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6">
                <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-800">Tidak ada Dapur SPPG yang sesuai</h4>
                <p className="text-xs text-gray-500 mt-1">Coba ganti kata kunci pencarian atau reset filter.</p>
                <Button size="sm" variant="outline" onClick={handleResetFilters} className="mt-3 text-xs">
                  Reset Filter
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredDapur.slice(0, visibleListCount).map((d, idx) => {
                    const sppgCode = d.code || `SPPG-${String(idx + 1).padStart(3, "0")}`;
                    const displayName = d.desa_unit || d.clean_title || d.name;
                    const sasaranCount = d.jumlah_sasaran || (d.sasaran || []).length || 0;

                    return (
                      <div
                        key={d.id || idx}
                        className="bg-white border border-gray-200 hover:border-emerald-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-2.5">
                          {/* Badge Header Bar */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg shadow-xs tracking-wide">
                              {sppgCode}
                            </span>
                            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200">
                              Kec. {d.kecamatan}
                            </Badge>
                          </div>

                          {/* Nama SPPG */}
                          <div>
                            <h4 className="text-base font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
                              {displayName}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              Wilayah {d.kecamatan}, Garut
                            </p>
                          </div>

                          {/* Detail Kapasitas & Yayasan */}
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 font-medium">Kapasitas Produksi:</span>
                              <span className="font-extrabold text-emerald-700">
                                {(d.kapasitas || 0).toLocaleString("id-ID")} Porsi/Hari
                              </span>
                            </div>
                            {d.yayasan && (
                              <div className="text-[11px] text-gray-600 pt-1 border-t border-gray-200/60 truncate" title={d.yayasan}>
                                <span className="font-semibold text-gray-700">🏢 Yayasan:</span> {d.yayasan}
                              </div>
                            )}
                            {sasaranCount > 0 && (
                              <div className="text-[11px] text-blue-700 font-semibold flex items-center gap-1 pt-0.5">
                                <School className="w-3.5 h-3.5" />
                                {sasaranCount} Titik Sasaran (Sekolah/Posyandu)
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => handleFocusItemOnMap(d.lat, d.lng, 14)}
                            className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
                            Fokus di Peta
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSppgModal(d)}
                            className="py-1.5 px-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            Detail Sasaran
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {visibleListCount < filteredDapur.length && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleListCount((prev) => prev + 12)}
                      className="rounded-xl px-6 border-gray-300 text-gray-800 hover:bg-gray-50 text-xs font-semibold gap-1.5 shadow-xs"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Tampilkan 12 Dapur Berikutnya ({filteredDapur.length - visibleListCount} Tersisa)
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* 2. KONTEN DIREKTORI SEKOLAH SASARAN */}
        {selectedEntityType === "sekolah" && (
          <>
            {filteredSekolah.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6">
                <School className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-800">Tidak ada Sekolah yang sesuai</h4>
                <p className="text-xs text-gray-500 mt-1">Coba ganti kata kunci atau pilih jenjang lainnya.</p>
                <Button size="sm" variant="outline" onClick={handleResetFilters} className="mt-3 text-xs">
                  Reset Filter
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredSekolah.slice(0, visibleListCount).map((s, idx) => {
                    const cleanedName = cleanSchoolName(s.name);
                    const linkedDapur = dapurLookup.get(s.sppg_id);

                    return (
                      <div
                        key={s.id || idx}
                        className="bg-white border border-gray-200 hover:border-blue-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <Badge className="bg-blue-600 text-white text-[11px] font-bold">
                              {s.jenjang || "SD"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-800 border-blue-200">
                              Kec. {s.kecamatan}
                            </Badge>
                          </div>

                          <div>
                            <h4 className="text-base font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">
                              {cleanedName}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              Kecamatan {s.kecamatan}, Garut
                            </p>
                          </div>

                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 font-medium">Siswa Penerima MBG:</span>
                              <span className="font-extrabold text-blue-700 text-sm">
                                {(s.siswa || 0).toLocaleString("id-ID")} Siswa
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-600 pt-1 border-t border-gray-200/60 truncate">
                              <span className="font-semibold text-gray-700">🏢 Dapur Penyuplai:</span>{" "}
                              {linkedDapur ? linkedDapur.clean_title || linkedDapur.name : "SPPG Garut Terdekat"}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => handleFocusItemOnMap(s.lat, s.lng, 15)}
                            className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                            Fokus di Peta
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSekolahModal(s)}
                            className="py-1.5 px-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            Detail Sekolah
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {visibleListCount < filteredSekolah.length && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleListCount((prev) => prev + 12)}
                      className="rounded-xl px-6 border-gray-300 text-gray-800 hover:bg-gray-50 text-xs font-semibold gap-1.5 shadow-xs"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Tampilkan 12 Sekolah Berikutnya ({filteredSekolah.length - visibleListCount} Tersisa)
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* 3. KONTEN DIREKTORI PENERIMA MANFAAT */}
        {selectedEntityType === "penerima" && (
          <>
            {filteredPenerima.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-800">Tidak ada data penerima yang sesuai</h4>
                <p className="text-xs text-gray-500 mt-1">Coba ganti kata kunci atau reset filter.</p>
                <Button size="sm" variant="outline" onClick={handleResetFilters} className="mt-3 text-xs">
                  Reset Filter
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredPenerima.slice(0, visibleListCount).map((p, idx) => {
                    const cleanedName = cleanSchoolName(p.name);
                    const category = getPenerimaCategory(p);
                    const linkedDapur = dapurLookup.get(p.sppg_id);

                    return (
                      <div
                        key={p.id || idx}
                        className="bg-white border border-gray-200 hover:border-pink-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-lg border ${category.color}`}
                            >
                              {category.label}
                            </span>
                            <Badge variant="outline" className="text-[10px] bg-pink-50 text-pink-800 border-pink-200">
                              Kec. {p.kecamatan}
                            </Badge>
                          </div>

                          <div>
                            <h4 className="text-base font-bold text-gray-900 leading-tight group-hover:text-pink-700 transition-colors">
                              {cleanedName}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                              Titik Sasaran Kecamatan {p.kecamatan}
                            </p>
                          </div>

                          <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-2.5 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-medium">Alokasi Paket Harian:</span>
                              <span className="font-extrabold text-pink-700 text-sm">
                                {(p.siswa || 0).toLocaleString("id-ID")} Porsi
                              </span>
                            </div>
                            <div className="text-[11px] text-gray-600 pt-1 border-t border-pink-100">
                              <span className="font-semibold text-gray-700">🏢 Dapur Distribusi:</span>{" "}
                              {linkedDapur ? linkedDapur.clean_title || linkedDapur.name : "SPPG Garut Terdekat"}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => handleFocusItemOnMap(p.lat, p.lng, 15)}
                            className="py-1.5 px-2 bg-pink-50 hover:bg-pink-100 text-pink-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <Crosshair className="w-3.5 h-3.5 text-pink-600" />
                            Fokus di Peta
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPenerimaModal(p)}
                            className="py-1.5 px-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            Detail Penerima
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {visibleListCount < filteredPenerima.length && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleListCount((prev) => prev + 12)}
                      className="rounded-xl px-6 border-gray-300 text-gray-800 hover:bg-gray-50 text-xs font-semibold gap-1.5 shadow-xs"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Tampilkan 12 Sasaran Berikutnya ({filteredPenerima.length - visibleListCount} Tersisa)
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* 4. KONTEN DIREKTORI SUPPLIER PANGAN */}
        {selectedEntityType === "supplier" && (
          <>
            {filteredSupplier.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6">
                <Factory className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-800">Tidak ada Supplier yang sesuai</h4>
                <p className="text-xs text-gray-500 mt-1">Coba ganti kata kunci atau pilih jenis komoditas lain.</p>
                <Button size="sm" variant="outline" onClick={handleResetFilters} className="mt-3 text-xs">
                  Reset Filter
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredSupplier.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="bg-white border border-gray-200 hover:border-orange-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-orange-600 text-white text-[11px] font-bold">
                          Mitra Binaan Disperindag
                        </Badge>
                        <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-800 border-orange-200">
                          Kec. {s.kecamatan}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-gray-900 leading-tight group-hover:text-orange-700 transition-colors">
                          {s.name}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          Wilayah {s.kecamatan}, Garut
                        </p>
                      </div>

                      <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-2.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">Komoditas Bahan Baku:</span>
                          <span className="font-bold text-orange-800">{s.jenis}</span>
                        </div>
                        {s.kontak && (
                          <div className="text-[11px] text-emerald-800 font-semibold pt-1 border-t border-orange-100 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            Kontak: {s.kontak}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleFocusItemOnMap(s.lat, s.lng, 14)}
                        className="py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Crosshair className="w-3.5 h-3.5 text-orange-600" />
                        Fokus di Peta
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSupplierModal(s)}
                        className="py-1.5 px-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        Detail Supplier
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 5. KONTEN DIREKTORI JALUR DISTRIBUSI */}
        {selectedEntityType === "jalur" && (
          <>
            {filteredJalur.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-6">
                <Route className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-800">Tidak ada rute yang sesuai</h4>
                <p className="text-xs text-gray-500 mt-1">Coba ganti kata kunci atau reset filter.</p>
                <Button size="sm" variant="outline" onClick={handleResetFilters} className="mt-3 text-xs">
                  Reset Filter
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredJalur.map((j, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 hover:border-purple-400 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-purple-600 text-white text-[11px] font-bold">
                          Rute Logistik #{idx + 1}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-800 border-purple-200">
                          Jarak: {j.jarak}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-gray-900 leading-tight group-hover:text-purple-700 transition-colors">
                          {j.target}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                          <Truck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          Hub Garut Kota ➔ {j.target}
                        </p>
                      </div>

                      <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-2.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">Estimasi Waktu Tempuh:</span>
                          <span className="font-bold text-purple-900">± {j.waktu}</span>
                        </div>
                        <div className="text-[11px] text-gray-600 pt-1 border-t border-purple-100">
                          <span className="font-semibold text-gray-700">Jadwal Pengiriman:</span> Pukul 06.00 – 07.30 WIB
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleFocusJalurOnMap(j)}
                        className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Crosshair className="w-3.5 h-3.5 text-purple-600" />
                        Fokus di Peta
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedJalurModal(j)}
                        className="py-1.5 px-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        Detail Rute
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL DIALOG DETAIL LENGKAP TIAP ENTITAS */}
      {/* ======================================================== */}

      {/* 1. MODAL DETAIL SATU SPPG */}
      <Dialog
        open={Boolean(selectedSppgModal)}
        onOpenChange={(open) => {
          if (!open) setSelectedSppgModal(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          {selectedSppgModal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg shadow-xs">
                    {selectedSppgModal.code || selectedSppgModal.id}
                  </span>
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[11px] font-semibold">
                    Kecamatan {selectedSppgModal.kecamatan}
                  </Badge>
                  <span className="text-xs font-bold text-gray-500 ml-auto">
                    Kapasitas: {(selectedSppgModal.kapasitas || 0).toLocaleString("id-ID")} Porsi/Hari
                  </span>
                </div>
                <DialogTitle className="text-xl font-extrabold text-gray-900 leading-tight">
                  {selectedSppgModal.desa_unit || selectedSppgModal.clean_title || selectedSppgModal.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-600 mt-0.5">
                  Lembaga Penyelenggara:{" "}
                  <strong>{selectedSppgModal.yayasan || "Yayasan Mitra MBG Garut"}</strong>
                </DialogDescription>
              </DialogHeader>

              {/* Rincian Koordinat & Wilayah */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3 text-xs">
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  <span className="text-gray-500 font-medium block">Kecamatan</span>
                  <span className="font-bold text-gray-900">{selectedSppgModal.kecamatan}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  <span className="text-gray-500 font-medium block">Koordinat Lat / Lng</span>
                  <span className="font-bold text-gray-900">
                    {selectedSppgModal.lat}, {selectedSppgModal.lng}
                  </span>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 col-span-2 sm:col-span-1">
                  <span className="text-emerald-700 font-medium block">Total Sasaran</span>
                  <span className="font-bold text-emerald-900">
                    {selectedSppgModal.sasaran?.length || selectedSppgModal.jumlah_sasaran || 0} Titik Penerima
                  </span>
                </div>
              </div>

              {/* Daftar Sekolah & Sasaran */}
              <div className="space-y-2 mt-2">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                  <School className="w-4 h-4 text-emerald-600" />
                  Daftar Sekolah &amp; Posyandu Sasaran Distribusi:
                </h4>

                {selectedSppgModal.sasaran && selectedSppgModal.sasaran.length > 0 ? (
                  <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 max-h-64 overflow-y-auto">
                    {selectedSppgModal.sasaran.map((s, si) => (
                      <div
                        key={si}
                        className="p-2.5 text-xs flex items-center justify-between hover:bg-gray-50/80 transition-colors"
                      >
                        <span className="font-semibold text-gray-800">{cleanSchoolName(s.name)}</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {s.penerima} Porsi
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 text-center">
                    Data rincian nama sekolah untuk dapur ini terdaftar dalam agregasi wilayah kecamatan.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleFocusItemOnMap(selectedSppgModal.lat, selectedSppgModal.lng, 15);
                    setSelectedSppgModal(null);
                  }}
                  className="rounded-xl text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  Buka Titik di Peta
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedSppgModal(null)}
                  className="rounded-xl text-xs bg-gray-900 hover:bg-black text-white"
                >
                  Tutup
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. MODAL DETAIL SATU SEKOLAH SASARAN */}
      <Dialog
        open={Boolean(selectedSekolahModal)}
        onOpenChange={(open) => {
          if (!open) setSelectedSekolahModal(null);
        }}
      >
        <DialogContent className="sm:max-w-xl rounded-3xl p-6">
          {selectedSekolahModal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-600 text-white text-xs font-bold">
                    {selectedSekolahModal.jenjang || "SD"}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-[11px] font-semibold">
                    Kecamatan {selectedSekolahModal.kecamatan}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-extrabold text-gray-900 leading-tight">
                  {cleanSchoolName(selectedSekolahModal.name)}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-600 mt-0.5">
                  Satuan Pendidikan Penerima Manfaat MBG Terdata Resmi Disperindag Kabupaten Garut
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-2.5 my-3 text-xs">
                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                  <span className="text-blue-800 font-medium block">Alokasi Penerima Harian</span>
                  <span className="text-xl font-black text-blue-950">
                    {(selectedSekolahModal.siswa || 0).toLocaleString("id-ID")}{" "}
                    <span className="text-xs font-normal text-blue-700">Siswa / Hari</span>
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <span className="text-gray-500 font-medium block">Jadwal Pengantaran</span>
                  <span className="text-sm font-bold text-gray-800">Pukul 06.30 – 07.45 WIB</span>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Dapur Penyuplai (SPPG):</span>
                  <span className="font-bold text-gray-900">
                    {(() => {
                      const d = dapurLookup.get(selectedSekolahModal.sppg_id);
                      return d ? `${d.clean_title || d.name} (Kec. ${d.kecamatan})` : "SPPG Garut Terdekat";
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Koordinat Lokasi:</span>
                  <span className="font-mono text-[11px] text-gray-700">
                    {selectedSekolahModal.lat}, {selectedSekolahModal.lng}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Standar Menu:</span>
                  <span className="font-semibold text-emerald-700">Nasi, Lauk Hewani, Nabati, Sayur, &amp; Buah</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleFocusItemOnMap(selectedSekolahModal.lat, selectedSekolahModal.lng, 15);
                    setSelectedSekolahModal(null);
                  }}
                  className="rounded-xl text-xs gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  Buka Titik di Peta
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedSekolahModal(null)}
                  className="rounded-xl text-xs bg-gray-900 hover:bg-black text-white"
                >
                  Tutup
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. MODAL DETAIL PENERIMA MANFAAT */}
      <Dialog
        open={Boolean(selectedPenerimaModal)}
        onOpenChange={(open) => {
          if (!open) setSelectedPenerimaModal(null);
        }}
      >
        <DialogContent className="sm:max-w-xl rounded-3xl p-6">
          {selectedPenerimaModal && (
            <>
              {(() => {
                const category = getPenerimaCategory(selectedPenerimaModal);
                const cleanedName = cleanSchoolName(selectedPenerimaModal.name);
                const linkedDapur = dapurLookup.get(selectedPenerimaModal.sppg_id);

                return (
                  <>
                    <DialogHeader>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-lg border ${category.color}`}
                        >
                          {category.label}
                        </span>
                        <Badge variant="outline" className="text-xs bg-pink-50 text-pink-800 border-pink-200">
                          Kecamatan {selectedPenerimaModal.kecamatan}
                        </Badge>
                      </div>
                      <DialogTitle className="text-xl font-extrabold text-gray-900 leading-tight">
                        {cleanedName}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-gray-600 mt-0.5">
                        Kelompok Sasaran Intervensi Gizi Terpadu Program Makanan Bergizi Gratis Garut
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-2.5 my-3 text-xs">
                      <div className="bg-pink-50/70 p-3 rounded-xl border border-pink-100">
                        <span className="text-pink-800 font-medium block">Total Porsi Nutrisi</span>
                        <span className="text-2xl font-black text-pink-950">
                          {(selectedPenerimaModal.siswa || 0).toLocaleString("id-ID")}{" "}
                          <span className="text-xs font-normal text-pink-700">Paket</span>
                        </span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <span className="text-gray-500 font-medium block">Frekuensi Distribusi</span>
                        <span className="text-sm font-bold text-gray-800">Senin – Sabtu (Harian)</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                        <span className="text-gray-500">Unit Dapur Penyedia:</span>
                        <span className="font-bold text-gray-900">
                          {linkedDapur ? linkedDapur.clean_title || linkedDapur.name : "SPPG Garut Terdekat"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                        <span className="text-gray-500">Wilayah Sasaran:</span>
                        <span className="font-semibold text-gray-800">
                          Kecamatan {selectedPenerimaModal.kecamatan}, Garut
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Kebutuhan Gizi:</span>
                        <span className="font-semibold text-pink-700">Memenuhi AKG Nasional BGN RI</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleFocusItemOnMap(selectedPenerimaModal.lat, selectedPenerimaModal.lng, 15);
                          setSelectedPenerimaModal(null);
                        }}
                        className="rounded-xl text-xs gap-1 border-pink-300 text-pink-700 hover:bg-pink-50"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        Buka Titik di Peta
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedPenerimaModal(null)}
                        className="rounded-xl text-xs bg-gray-900 hover:bg-black text-white"
                      >
                        Tutup
                      </Button>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 4. MODAL DETAIL SUPPLIER PANGAN */}
      <Dialog
        open={Boolean(selectedSupplierModal)}
        onOpenChange={(open) => {
          if (!open) setSelectedSupplierModal(null);
        }}
      >
        <DialogContent className="sm:max-w-xl rounded-3xl p-6">
          {selectedSupplierModal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-orange-600 text-white text-xs font-bold">Supplier Pangan Binaan</Badge>
                  <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200 text-xs">
                    Kecamatan {selectedSupplierModal.kecamatan}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-extrabold text-gray-900 leading-tight">
                  {selectedSupplierModal.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-600 mt-0.5">
                  Mitra Penyedia Bahan Baku Resmi Program MBG Disperindag Kabupaten Garut
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-2.5 my-3 text-xs">
                <div className="bg-orange-50/70 p-3 rounded-xl border border-orange-100">
                  <span className="text-orange-800 font-medium block">Komoditas Bahan</span>
                  <span className="text-sm font-bold text-orange-950">{selectedSupplierModal.jenis}</span>
                </div>
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                  <span className="text-emerald-800 font-medium block">Kontak / Narahubung</span>
                  <span className="text-sm font-bold text-emerald-950">
                    {selectedSupplierModal.kontak || "Tersedia di Disperindag"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Status Verifikasi:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Higiene &amp; Halal
                  </span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Wilayah Sentra:</span>
                  <span className="font-semibold text-gray-800">
                    Kecamatan {selectedSupplierModal.kecamatan}, Garut
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Penyaluran:</span>
                  <span className="font-semibold text-gray-800">Pasokan Bahan Pokok Harian Dapur SPPG</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleFocusItemOnMap(selectedSupplierModal.lat, selectedSupplierModal.lng, 14);
                    setSelectedSupplierModal(null);
                  }}
                  className="rounded-xl text-xs gap-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  Buka Titik di Peta
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedSupplierModal(null)}
                  className="rounded-xl text-xs bg-gray-900 hover:bg-black text-white"
                >
                  Tutup
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 5. MODAL DETAIL JALUR DISTRIBUSI */}
      <Dialog
        open={Boolean(selectedJalurModal)}
        onOpenChange={(open) => {
          if (!open) setSelectedJalurModal(null);
        }}
      >
        <DialogContent className="sm:max-w-xl rounded-3xl p-6">
          {selectedJalurModal && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-purple-600 text-white text-xs font-bold">Rute Distribusi Logistik</Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 text-xs">
                    Jarak: {selectedJalurModal.jarak}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-extrabold text-gray-900 leading-tight">
                  Hub Garut Kota ➔ {selectedJalurModal.target}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-600 mt-0.5">
                  Rute Distribusi Makanan Bergizi dari Central Hub menuju SPPG Kecamatan
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-2.5 my-3 text-xs">
                <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-100">
                  <span className="text-purple-800 font-medium block">Panjang Lintasan</span>
                  <span className="text-xl font-black text-purple-950">{selectedJalurModal.jarak}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <span className="text-gray-500 font-medium block">Estimasi Waktu Tempuh</span>
                  <span className="text-xl font-black text-gray-900">± {selectedJalurModal.waktu}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Armada Pengangkut:</span>
                  <span className="font-bold text-gray-900">Mobil Boks Berpendingin (Insulated Van)</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Keberangkatan:</span>
                  <span className="font-semibold text-emerald-700">Pukul 06.00 WIB (Tiba Maksimal 07.30 WIB)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status Jalan:</span>
                  <span className="font-semibold text-gray-800">Jalur Protokol &amp; Arteri Garut</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleFocusJalurOnMap(selectedJalurModal);
                    setSelectedJalurModal(null);
                  }}
                  className="rounded-xl text-xs gap-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  Buka Rute di Peta
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedJalurModal(null)}
                  className="rounded-xl text-xs bg-gray-900 hover:bg-black text-white"
                >
                  Tutup
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Sinkronisasi Disperindag Garut */}
      <GisImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={(newData) => setGisData(newData)}
      />
    </section>
  );
}
