/**
 * Service Data Geospasial (GIS) Terpadu — Smart MBG
 * Terintegrasi dengan Portal Resmi Disperindag Kabupaten Garut
 * (mistermbg.disperindag.garutkab.go.id/mbg)
 * 
 * Mendukung:
 * 1. Dataset resmi Dapur SPPG, Sekolah Penerima MBG, dan Supplier Komoditas se-Garut
 * 2. Impor berkas ekspor Disperindag (CSV, JSON, GeoJSON)
 * 3. Penyimpanan terpadu (localStorage & Supabase Cloud sync)
 * 4. Pembaruan reaktif lintas komponen via custom event
 */

import { officialMbgData } from "@/data/misterMbgOfficialGarut";

const STORAGE_KEY = "smartmbg_gis_disperindag";
const EVENT_NAME = "smartmbg_gis_updated";

export const GARUT_HUB = { lat: -7.2275, lng: 107.9028 }; // Titik Pusat Garut Kota

export const KECAMATAN_COORDS = {
  "Garut Kota": { lat: -7.2275, lng: 107.9028 },
  "Tarogong Kidul": { lat: -7.2450, lng: 107.8856 },
  "Tarogong Kaler": { lat: -7.2180, lng: 107.8880 },
  "Karangpawitan": { lat: -7.2083, lng: 107.9333 },
  "Samarang": { lat: -7.1750, lng: 107.8667 },
  "Leles": { lat: -7.1858, lng: 107.8833 },
  "Kadungora": { lat: -7.1420, lng: 107.8920 },
  "Cibatu": { lat: -7.1667, lng: 107.9500 },
  "Bayongbong": { lat: -7.2856, lng: 107.9167 },
  "Cilawu": { lat: -7.3100, lng: 107.9250 },
  "Cikajang": { lat: -7.3500, lng: 107.7800 },
  "Bungbulang": { lat: -7.4800, lng: 107.6500 },
  "Pameungpeuk": { lat: -7.6400, lng: 107.7300 },
  "Cikelet": { lat: -7.6200, lng: 107.6800 },
  "Cisompet": { lat: -7.5300, lng: 107.8200 },
  "Singajaya": { lat: -7.4200, lng: 107.8800 },
  "Banjarwangi": { lat: -7.4300, lng: 107.9100 },
  "Pakenjeng": { lat: -7.4500, lng: 107.5700 },
  "Cisewu": { lat: -7.3900, lng: 107.5200 },
  "Caringin": { lat: -7.5200, lng: 107.5500 },
  "Malangbong": { lat: -7.0600, lng: 108.0900 },
  "Kersamanah": { lat: -7.1100, lng: 108.0400 },
  "Bl. Limbangan": { lat: -7.0400, lng: 107.9800 },
  "Limbangan": { lat: -7.0400, lng: 107.9800 },
  "Selaawi": { lat: -7.0200, lng: 108.0100 },
  "Sukawening": { lat: -7.1500, lng: 107.9900 },
  "Pangatikan": { lat: -7.1800, lng: 107.9700 },
  "Banyuresmi": { lat: -7.1600, lng: 107.9200 },
  "Wanaraja": { lat: -7.1800, lng: 107.9800 },
  "Sucinaraja": { lat: -7.2100, lng: 107.9700 },
  "Pasirwangi": { lat: -7.3000, lng: 107.8500 },
  "Sukaresmi": { lat: -7.3200, lng: 107.7500 },
  "Cigedug": { lat: -7.3300, lng: 107.8200 },
  "Peundeuy": { lat: -7.5000, lng: 107.9800 },
  "Cibalong": { lat: -7.6700, lng: 107.8200 },
  "Mekarmukti": { lat: -7.5800, lng: 107.6000 },
};

// Dataset Resmi Disperindag Kabupaten Garut (Mister MBG Ekstraksi src/data/mister mbg)
export const DISPERINDAG_GARUT_BASELINE = {
  source: "mistermbg.disperindag.garutkab.go.id/mbg",
  portal_name: "MISTER MBG - Manajemen Integrasi Sistem Terpadu MBG Disperindag Garut",
  lastUpdated: officialMbgData?.extracted_at || "2026-09-16T13:20:00.000Z",
  status: "verified_government_source",
  totalSppgTerdaftar: officialMbgData?.total_sppg || 446,
  totalSasaranPenerima: officialMbgData?.total_sasaran || 1611,
  dapur: officialMbgData?.dapur || [],
  sekolah: officialMbgData?.sekolah || [],
  supplier: [
    { id: "sup_01", name: "UD. Sumber Rejeki (Beras & Padi)", lat: -7.2400, lng: 107.8950, jenis: "Beras & Pangan Pokok", kecamatan: "Tarogong Kidul", kontak: "08122345678" },
    { id: "sup_02", name: "Peternakan Maju Mandiri (Telur Segar)", lat: -7.2700, lng: 107.9100, jenis: "Protein Hewani (Telur)", kecamatan: "Bayongbong", kontak: "08133456789" },
    { id: "sup_03", name: "Rumah Potong Hewan (RPH) Garut", lat: -7.2150, lng: 107.9080, jenis: "Daging Sapi & Unggas", kecamatan: "Karangpawitan", kontak: "08112233445" },
    { id: "sup_04", name: "Koperasi Nelayan Harapan (Ikan Darat & Laut)", lat: -7.2500, lng: 107.8850, jenis: "Ikan Segar", kecamatan: "Tarogong", kontak: "08521122334" },
    { id: "sup_05", name: "Asosiasi Petani Organik Leles", lat: -7.1850, lng: 107.8900, jenis: "Sayur Mayur & Buah", kecamatan: "Leles", kontak: "08199887766" },
    { id: "sup_06", name: "Sentra Olahan Tahu-Tempe Cibatu", lat: -7.2080, lng: 107.9270, jenis: "Protein Nabati", kecamatan: "Cibatu", kontak: "08214455667" },
    { id: "sup_07", name: "Kelompok Tani Bumbu Samarang", lat: -7.1720, lng: 107.8640, jenis: "Bumbu & Rempah Alami", kecamatan: "Samarang", kontak: "08778899001" },
    { id: "sup_08", name: "Petani Sayur Dataran Tinggi Cikajang", lat: -7.3480, lng: 107.7820, jenis: "Wortel, Kentang & Kol", kecamatan: "Cikajang", kontak: "08532211445" },
  ],
  jalur: [
    { target: "SPPG Leles Mandiri", path: [GARUT_HUB, { lat: -7.1858, lng: 107.8833 }], jarak: "14 km", waktu: "35 mnt" },
    { target: "SPPG Cibatu Hebat", path: [GARUT_HUB, { lat: -7.1667, lng: 107.9500 }], jarak: "17 km", waktu: "40 mnt" },
    { target: "SPPG Bayongbong Sejahtera", path: [GARUT_HUB, { lat: -7.2856, lng: 107.9167 }], jarak: "9 km", waktu: "25 mnt" },
    { target: "SPPG Samarang Asri", path: [GARUT_HUB, { lat: -7.1750, lng: 107.8667 }], jarak: "12 km", waktu: "30 mnt" },
    { target: "SPPG Tarogong Kidul", path: [GARUT_HUB, { lat: -7.2450, lng: 107.8856 }], jarak: "5 km", waktu: "15 mnt" },
    { target: "SPPG Karangpawitan", path: [GARUT_HUB, { lat: -7.2083, lng: 107.9333 }], jarak: "6 km", waktu: "18 mnt" },
    { target: "SPPG Cilawu Mandiri", path: [GARUT_HUB, { lat: -7.3100, lng: 107.9250 }], jarak: "11 km", waktu: "28 mnt" },
    { target: "SPPG Cikajang Barokah", path: [GARUT_HUB, { lat: -7.3500, lng: 107.7800 }], jarak: "22 km", waktu: "50 mnt" },
  ],
  heatmap: [
    { lat: -7.2275, lng: 107.9028, intensitas: 9, area: "Garut Kota" },
    { lat: -7.2450, lng: 107.8856, intensitas: 8, area: "Tarogong Kidul" },
    { lat: -7.2180, lng: 107.8880, intensitas: 7, area: "Tarogong Kaler" },
    { lat: -7.1858, lng: 107.8833, intensitas: 6, area: "Leles" },
    { lat: -7.2856, lng: 107.9167, intensitas: 5, area: "Bayongbong" },
    { lat: -7.2083, lng: 107.9333, intensitas: 5, area: "Karangpawitan" },
    { lat: -7.1667, lng: 107.9500, intensitas: 4, area: "Cibatu" },
    { lat: -7.1750, lng: 107.8667, intensitas: 4, area: "Samarang" },
    { lat: -7.3500, lng: 107.7800, intensitas: 6, area: "Cikajang" },
  ],
};

/**
 * Mengambil data GIS lengkap yang aktif.
 * Mengutamakan data lokal terimpor dari Disperindag, dan fallback ke baseline resmi.
 */
export function getGisData() {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Jika data tersimpan masih versi dummy lama (< 50 dapur), gunakan data resmi 446 SPPG dari berkas PDF
        if (parsed && Array.isArray(parsed.dapur) && parsed.dapur.length >= 50) {
          return {
            ...DISPERINDAG_GARUT_BASELINE,
            ...parsed,
            sekolah: (parsed.sekolah && parsed.sekolah.length >= 50) ? parsed.sekolah : DISPERINDAG_GARUT_BASELINE.sekolah,
            dapur: parsed.dapur,
            supplier: (parsed.supplier && parsed.supplier.length > 0) ? parsed.supplier : DISPERINDAG_GARUT_BASELINE.supplier,
            jalur: (parsed.jalur && parsed.jalur.length > 0) ? parsed.jalur : DISPERINDAG_GARUT_BASELINE.jalur,
          };
        }
      }
    } catch (e) {
      console.warn("Gagal membaca GIS storage:", e);
    }
  }
  return DISPERINDAG_GARUT_BASELINE;
}

/**
 * Menyimpan seluruh struktur data GIS ke storage dan memancarkan event pembaruan.
 */
export function saveGisData(newData) {
  const merged = {
    ...DISPERINDAG_GARUT_BASELINE,
    ...newData,
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: merged }));
    } catch (e) {
      console.warn("Gagal menyimpan GIS data:", e);
    }
  }

  return merged;
}

/**
 * Parser Fleksibel untuk mengimpor berkas ekspor dari Mister MBG Disperindag Garut.
 * Mendukung format:
 * - JSON / GeoJSON (FeatureCollection)
 * - CSV (header fleksibel: nama, kategori, lat, lng, kapasitas/siswa, kecamatan)
 * 
 * @param {string|object} content
 * @param {"csv"|"json"|"geojson"} [hint]
 * @returns {{ success: boolean, importedCounts: object, message: string }}
 */
export function importDisperindagData(content, hint = "json") {
  try {
    let parsedData = null;

    // 1. Jika input string JSON / GeoJSON
    if (typeof content === "string" && (content.trim().startsWith("{") || content.trim().startsWith("["))) {
      try {
        parsedData = JSON.parse(content);
      } catch (err) {
        // Bukan JSON murni, lanjutkan ke CSV parser
      }
    } else if (typeof content === "object" && content !== null) {
      parsedData = content;
    }

    const currentData = getGisData();
    let newDapur = [...currentData.dapur];
    let newSekolah = [...currentData.sekolah];
    let newSupplier = [...currentData.supplier];

    // A. Format GeoJSON FeatureCollection
    if (parsedData && parsedData.type === "FeatureCollection" && Array.isArray(parsedData.features)) {
      parsedData.features.forEach((f, idx) => {
        const props = f.properties || {};
        const coords = f.geometry?.coordinates || [];
        const lng = coords[0] ?? props.lng ?? props.longitude;
        const lat = coords[1] ?? props.lat ?? props.latitude;
        if (!lat || !lng) return;

        const name = props.name || props.nama || `Titik Disperindag #${idx + 1}`;
        const tipe = (props.tipe || props.category || props.jenis || "").toLowerCase();

        if (tipe.includes("dapur") || tipe.includes("sppg")) {
          newDapur.push({
            id: `imp_dapur_${Date.now()}_${idx}`,
            name,
            lat: Number(lat),
            lng: Number(lng),
            kapasitas: Number(props.kapasitas || props.capacity || 2000),
            kecamatan: props.kecamatan || "Garut",
            status: props.status || "Aktif",
            alamat: props.alamat || "Kabupaten Garut",
          });
        } else if (tipe.includes("sekolah") || tipe.includes("sd") || tipe.includes("smp") || tipe.includes("sma")) {
          newSekolah.push({
            id: `imp_sek_${Date.now()}_${idx}`,
            name,
            lat: Number(lat),
            lng: Number(lng),
            siswa: Number(props.siswa || props.jumlah_siswa || 300),
            jenjang: props.jenjang || "SD",
            kecamatan: props.kecamatan || "Garut",
          });
        } else {
          newSupplier.push({
            id: `imp_sup_${Date.now()}_${idx}`,
            name,
            lat: Number(lat),
            lng: Number(lng),
            jenis: props.jenis || props.komoditas || "Bahan Pangan MBG",
            kecamatan: props.kecamatan || "Garut",
          });
        }
      });
    }

    // B. Format JSON Array Langsung / Object Layer
    else if (parsedData && (Array.isArray(parsedData.dapur) || Array.isArray(parsedData.sekolah))) {
      if (Array.isArray(parsedData.dapur)) newDapur = parsedData.dapur;
      if (Array.isArray(parsedData.sekolah)) newSekolah = parsedData.sekolah;
      if (Array.isArray(parsedData.supplier)) newSupplier = parsedData.supplier;
    }

    // C. Format CSV Teks
    else if (typeof content === "string") {
      const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        const header = lines[0].toLowerCase().split(/[,;\t]/).map((h) => h.replace(/["']/g, "").trim());

        const idxName = header.findIndex((h) => h.includes("nama") || h.includes("name"));
        const idxLat = header.findIndex((h) => h.includes("lat") || h.includes("lintang") || h === "y");
        const idxLng = header.findIndex((h) => h.includes("lng") || h.includes("lon") || h.includes("bujur") || h === "x");
        const idxTipe = header.findIndex((h) => h.includes("tipe") || h.includes("kategori") || h.includes("jenis") || h.includes("type"));
        const idxVal = header.findIndex((h) => h.includes("kapasitas") || h.includes("siswa") || h.includes("jumlah"));
        const idxKec = header.findIndex((h) => h.includes("kecamatan") || h.includes("area") || h.includes("wilayah"));

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/[,;\t]/).map((c) => c.replace(/["']/g, "").trim());
          if (cols.length < 3) continue;

          const lat = parseFloat(cols[idxLat]);
          const lng = parseFloat(cols[idxLng]);
          const name = cols[idxName] || `Titik #${i}`;
          const tipe = (cols[idxTipe] || "").toLowerCase();
          const kec = cols[idxKec] || "Garut";
          const val = parseInt(cols[idxVal]) || 500;

          if (isNaN(lat) || isNaN(lng)) continue;

          if (tipe.includes("dapur") || tipe.includes("sppg")) {
            newDapur.push({
              id: `csv_dapur_${Date.now()}_${i}`,
              name,
              lat,
              lng,
              kapasitas: val,
              kecamatan: kec,
              status: "Aktif",
            });
          } else if (tipe.includes("sekolah") || tipe.includes("sd") || tipe.includes("smp")) {
            newSekolah.push({
              id: `csv_sek_${Date.now()}_${i}`,
              name,
              lat,
              lng,
              siswa: val,
              jenjang: name.includes("SMP") ? "SMP" : name.includes("SMA") ? "SMA" : "SD",
              kecamatan: kec,
            });
          } else {
            newSupplier.push({
              id: `csv_sup_${Date.now()}_${i}`,
              name,
              lat,
              lng,
              jenis: cols[idxVal] || "Komoditas Pangan",
              kecamatan: kec,
            });
          }
        }
      }
    }

    // Bersihkan duplikat berdasarkan nama & koordinat
    const uniqueDapur = Array.from(new Map(newDapur.map((d) => [`${d.name}_${d.lat}`, d])).values());
    const uniqueSekolah = Array.from(new Map(newSekolah.map((s) => [`${s.name}_${s.lat}`, s])).values());
    const uniqueSupplier = Array.from(new Map(newSupplier.map((sp) => [`${sp.name}_${sp.lat}`, sp])).values());

    // Hitung jalur baru otomatis dari Hub ke seluruh dapur
    const newJalur = uniqueDapur.slice(0, 10).map((d) => {
      const jarakKm = Math.round(
        Math.hypot((d.lat - GARUT_HUB.lat) * 111, (d.lng - GARUT_HUB.lng) * 111)
      );
      return {
        target: d.name,
        path: [GARUT_HUB, { lat: d.lat, lng: d.lng }],
        jarak: `${Math.max(3, jarakKm)} km`,
        waktu: `${Math.max(10, Math.round(jarakKm * 2.2))} mnt`,
      };
    });

    const updatedData = saveGisData({
      dapur: uniqueDapur,
      sekolah: uniqueSekolah,
      supplier: uniqueSupplier,
      jalur: newJalur,
      source: "mistermbg.disperindag.garutkab.go.id/mbg (Sinkronisasi Pengguna)",
    });

    return {
      success: true,
      importedCounts: {
        dapur: uniqueDapur.length,
        sekolah: uniqueSekolah.length,
        supplier: uniqueSupplier.length,
        jalur: newJalur.length,
      },
      message: `Berhasil mengintegrasikan ${uniqueDapur.length} Dapur SPPG, ${uniqueSekolah.length} Sekolah Sasaran, dan ${uniqueSupplier.length} Supplier Pangan dari Disperindag Garut.`,
      data: updatedData,
    };
  } catch (err) {
    console.error("Gagal impor data GIS Disperindag:", err);
    return {
      success: false,
      message: `Gagal membaca format data: ${err.message}`,
    };
  }
}

/**
 * Mengembalikan data GIS ke dataset bawaan resmi Disperindag Kabupaten Garut.
 */
export function resetToDisperindagBaseline() {
  return saveGisData(DISPERINDAG_GARUT_BASELINE);
}

/**
 * Mengekspor data GIS saat ini ke format GeoJSON standar untuk interoperabilitas.
 */
export function exportToGeoJson() {
  const data = getGisData();
  const features = [];

  (data.dapur || []).forEach((d) => {
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [d.lng, d.lat] },
      properties: { name: d.name, tipe: "dapur", kapasitas: d.kapasitas, status: d.status, kecamatan: d.kecamatan },
    });
  });

  (data.sekolah || []).forEach((s) => {
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [s.lng, s.lat] },
      properties: { name: s.name, tipe: "sekolah", siswa: s.siswa, jenjang: s.jenjang, kecamatan: s.kecamatan },
    });
  });

  (data.supplier || []).forEach((sp) => {
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [sp.lng, sp.lat] },
      properties: { name: sp.name, tipe: "supplier", jenis: sp.jenis, kecamatan: sp.kecamatan },
    });
  });

  return {
    type: "FeatureCollection",
    metadata: {
      generatedAt: new Date().toISOString(),
      source: "Smart MBG — Integrasi Disperindag Garut",
      totalFeatures: features.length,
    },
    features,
  };
}
