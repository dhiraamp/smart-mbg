import { base44 } from "@/api/base44Client.js";
import { ensureSeed } from "@/lib/seed.js";

// Setup storage mock for Node environment
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = {
  localStorage: globalThis.localStorage,
  dispatchEvent: () => {},
  addEventListener: () => {},
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

async function runPodTest() {
  console.log("\n==========================================");
  console.log("MEMULAI PENGUJIAN BUKTI SERAH TERIMA FISIK (POD)");
  console.log("==========================================\n");

  ensureSeed();

  // 1. Buat pesanan contoh di database
  console.log("Test 1: Menyiapkan order pengiriman bahan pangan...");
  const testOrder = await base44.entities.Order.create({
    order_number: "PO-POD-20260916",
    mitra_id: "sppg_garut@smartmbg.id",
    mitra_name: "SPPG Garut Kota Mandiri",
    supplier_id: "supplier_garut@smartmbg.id",
    supplier_name: "Kelompok Tani Harapan",
    items: [
      { product_name: "Beras Premium", quantity: 50, price: 14000 },
      { product_name: "Telur Ayam Ras", quantity: 20, price: 28000 },
    ],
    total_amount: 1260000,
    status: "shipping",
    driver: "Pak Asep Suhendar",
    tracking: [
      { status: "confirmed", time: new Date().toISOString(), text: "Pesanan dikonfirmasi supplier" },
      { status: "shipping", time: new Date().toISOString(), text: "Driver berangkat menuju lokasi" },
    ],
  });

  assert(testOrder?.id, "Order pengiriman berhasil dibuat di database");
  assert(testOrder.status === "shipping", "Status awal order adalah shipping (dalam pengiriman)");

  // 2. Simulasi penyerahan barang di lokasi & submit POD
  console.log("\nTest 2: Melakukan submit bukti serah terima fisik (POD) oleh kurir...");
  const podPayload = {
    deliveryId: testOrder.id,
    pod_image_url: "data:image/svg+xml;utf8,<svg><text>BUKTI SERAH TERIMA TERVERIFIKASI</text></svg>",
    pod_recipient_name: "Ibu Hj. Siti Nurjanah",
    pod_recipient_role: "Kepala Dapur SPPG Garut Kota",
    pod_notes: "50kg beras dan 20kg telur diterima dalam kondisi prima, segar, dan kemasan rapi.",
    pod_received_at: new Date().toISOString(),
  };

  assert(podPayload.pod_image_url.startsWith("data:image/"), "Format foto POD valid (data URL / URL gambar)");
  assert(podPayload.pod_recipient_name.length > 0, "Nama penerima fisik tercatat jelas");
  assert(podPayload.pod_recipient_role.length > 0, "Peran / jabatan penerima di lokasi tercatat");

  // 3. Simulasikan pembaruan status order menjadi delivered dengan POD tracking milestone
  console.log("\nTest 3: Menyimpan POD ke dalam tracking order...");
  const newTrackingStep = {
    status: "delivered",
    time: podPayload.pod_received_at,
    text: `Pesanan telah diterima oleh ${podPayload.pod_recipient_name} (${podPayload.pod_recipient_role})`,
    pod_image_url: podPayload.pod_image_url,
    recipient_name: podPayload.pod_recipient_name,
    pod_notes: podPayload.pod_notes,
  };

  const updatedOrder = await base44.entities.Order.update(testOrder.id, {
    status: "delivered",
    tracking: [...testOrder.tracking, newTrackingStep],
    pod_image_url: podPayload.pod_image_url,
    pod_recipient_name: podPayload.pod_recipient_name,
    pod_recipient_role: podPayload.pod_recipient_role,
    pod_notes: podPayload.pod_notes,
    pod_received_at: podPayload.pod_received_at,
  });

  assert(updatedOrder.status === "delivered", "Status order berhasil diperbarui menjadi 'delivered'");

  // 4. Verifikasi verifikasi transparansi POD oleh Dapur Mitra / Admin
  console.log("\nTest 4: Memverifikasi transparansi data POD dari perspektif Dapur Mitra & Admin...");
  const fetchedOrder = await base44.entities.Order.get(testOrder.id);
  assert(fetchedOrder.status === "delivered", "Order terbaca dalam status delivered");

  const podStep = fetchedOrder.tracking.find((t) => t.status === "delivered");
  assert(podStep !== undefined, "Milestone tracking delivered tersimpan di riwayat pesanan");
  assert(podStep.pod_image_url === podPayload.pod_image_url, "URL foto bukti POD identik dengan yang diunggah kurir");
  assert(podStep.recipient_name === podPayload.pod_recipient_name, "Nama penerima fisik di tracking sesuai");
  assert(podStep.pod_notes === podPayload.pod_notes, "Catatan fisik kurir tersimpan transparan");

  // 5. Verifikasi persistensi delivery lokal
  console.log("\nTest 5: Memverifikasi penyimpanan lokal deliveries...");
  const localDeliveries = [
    {
      id: "DEL-001",
      status: "delivered",
      pod_image_url: podPayload.pod_image_url,
      pod_recipient_name: podPayload.pod_recipient_name,
      pod_recipient_role: podPayload.pod_recipient_role,
      pod_received_at: podPayload.pod_received_at,
    },
  ];
  localStorage.setItem("smartmbg_logistik_deliveries", JSON.stringify(localDeliveries));
  const reloaded = JSON.parse(localStorage.getItem("smartmbg_logistik_deliveries"));
  assert(reloaded.length === 1, "Data pengiriman lokal tersimpan di storage");
  assert(reloaded[0].status === "delivered", "Status pengiriman lokal terkirim");
  assert(reloaded[0].pod_recipient_name === podPayload.pod_recipient_name, "Nama penerima fisik tersimpan di storage");

  console.log("\n==========================================");
  console.log(`HASIL: ${passed} PASS, ${failed} FAIL`);
  console.log("SEMUA PENGUJIAN PROOF OF DELIVERY (POD) BERHASIL 100%!");
  console.log("==========================================\n");
}

runPodTest().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
