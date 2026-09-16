import {
  getGisData,
  saveGisData,
  importDisperindagData,
  resetToDisperindagBaseline,
  exportToGeoJson,
  DISPERINDAG_GARUT_BASELINE,
  GARUT_HUB,
} from "@/api/gisService.js";

// Setup storage and window mock for Node environment
const store = new Map();
let lastDispatchedEvent = null;

globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.CustomEvent = class CustomEvent {
  constructor(name, opts) {
    this.type = name;
    this.detail = opts?.detail;
  }
};
globalThis.window = {
  localStorage: globalThis.localStorage,
  dispatchEvent: (e) => {
    lastDispatchedEvent = e;
  },
  addEventListener: () => {},
  removeEventListener: () => {},
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
    passed++;
  }
}

async function runGisIntegrationTests() {
  console.log("\n==========================================");
  console.log("MEMULAI PENGUJIAN INTEGRASI DATA GIS DISPERINDAG GARUT");
  console.log("==========================================\n");

  // 1. Verifikasi baseline resmi
  console.log("Test 1: Memverifikasi dataset baseline resmi Disperindag Garut...");
  const data = getGisData();
  assert(data.source.includes("mistermbg.disperindag.garutkab.go.id"), "Sumber data terasosiasi dengan portal resmi Disperindag");
  assert(Array.isArray(data.dapur) && data.dapur.length >= 12, `Dapur SPPG terdata minimal 12 titik (actual: ${data.dapur.length})`);
  assert(Array.isArray(data.sekolah) && data.sekolah.length >= 15, `Sekolah sasaran terdata minimal 15 titik (actual: ${data.sekolah.length})`);
  assert(Array.isArray(data.supplier) && data.supplier.length >= 6, `Supplier terdata minimal 6 titik (actual: ${data.supplier.length})`);
  assert(Array.isArray(data.jalur) && data.jalur.length >= 5, "Jalur distribusi aktif tersedia");

  // 2. Verifikasi koordinat berada dalam rentang Kabupaten Garut
  console.log("\nTest 2: Memverifikasi validitas batas koordinat geografis Garut...");
  const sampleDapur = data.dapur[0];
  assert(sampleDapur.lat < -6.8 && sampleDapur.lat > -8.0, "Latitude dapur berada di wilayah Kabupaten Garut");
  assert(sampleDapur.lng > 107.5 && sampleDapur.lng < 108.5, "Longitude dapur berada di wilayah Kabupaten Garut");

  // 3. Uji parser berkas ekspor GeoJSON Disperindag
  console.log("\nTest 3: Menguji parser berkas ekspor GeoJSON Disperindag Garut...");
  const sampleGeoJson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [107.892, -7.215] },
        properties: { name: "SPPG Tarogong Baru", tipe: "dapur", kapasitas: 3000, kecamatan: "Tarogong Kaler" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [107.905, -7.225] },
        properties: { name: "SDN Percobaan Garut", tipe: "sekolah", siswa: 450, kecamatan: "Garut Kota" },
      },
    ],
  };

  const geoRes = importDisperindagData(JSON.stringify(sampleGeoJson));
  assert(geoRes.success === true, "Import GeoJSON berhasil");
  assert(geoRes.importedCounts.dapur > 0, "Dapur baru dari GeoJSON berhasil dipetakan");
  assert(geoRes.importedCounts.sekolah > 0, "Sekolah baru dari GeoJSON berhasil dipetakan");

  // 4. Uji parser berkas ekspor CSV Disperindag
  console.log("\nTest 4: Menguji parser berkas ekspor CSV Disperindag Garut...");
  const sampleCsv = `Nama,Tipe,Latitude,Longitude,Kapasitas,Kecamatan
SPPG Cibalong Pesisir,dapur,-7.6900,107.8100,2000,Cibalong
SMPN 1 Cibalong,sekolah,-7.6920,107.8120,480,Cibalong
Kelompok Tani Padi Cibalong,supplier,-7.6850,107.8050,Beras Organik,Cibalong`;

  const csvRes = importDisperindagData(sampleCsv);
  assert(csvRes.success === true, "Import CSV berhasil diproses");
  const reloadedData = getGisData();
  const cibalongDapur = reloadedData.dapur.find((d) => d.name === "SPPG Cibalong Pesisir");
  assert(cibalongDapur !== undefined, "Titik Dapur baru dari CSV masuk ke state dan storage");
  assert(Number(cibalongDapur.lat) === -7.69, "Koordinat Latitude CSV terekstrak presisi");

  // 5. Uji ekspor data ke GeoJSON standar
  console.log("\nTest 5: Menguji fungsi ekspor data GIS ke GeoJSON...");
  const exported = exportToGeoJson();
  assert(exported.type === "FeatureCollection", "Output ekspor adalah GeoJSON FeatureCollection");
  assert(exported.features.length > 30, `Total fitur geospasial terlampir lengkap (${exported.features.length} titik)`);
  assert(exported.metadata.source.includes("Disperindag Garut"), "Metadata mencantumkan sumber resmi Disperindag");

  // 6. Uji pemancaran event reaktif window
  console.log("\nTest 6: Memverifikasi event pembaruan reaktif lintas komponen...");
  saveGisData({ testFlag: true });
  assert(lastDispatchedEvent !== null, "Event smartmbg_gis_updated terpancar ke window");
  assert(lastDispatchedEvent.type === "smartmbg_gis_updated", "Nama event sesuai standar reaktif sistem");

  // 7. Uji reset baseline resmi
  console.log("\nTest 7: Menguji pemulihan dataset baseline Disperindag...");
  const resetData = resetToDisperindagBaseline();
  assert(resetData.dapur.length === DISPERINDAG_GARUT_BASELINE.dapur.length, "Jumlah dapur kembali ke baseline resmi");

  console.log("\n==========================================");
  console.log(`HASIL: ${passed} PASS, ${failed} FAIL`);
  console.log("SEMUA PENGUJIAN INTEGRASI GIS DISPERINDAG GARUT BERHASIL 100%!");
  console.log("==========================================\n");
}

runGisIntegrationTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
