// ════════════════════════════════════════════════════════════════════════════
// SISTEM MONETISASI SMART MBG — MARK-UP PLATFORM
//
// Supplier memasukkan harga asli (base_price) ke dalam sistem, kemudian
// aplikasi secara otomatis menambahkan mark-up 2,5% sebagai biaya layanan
// platform. Harga yang ditampilkan ke pembeli = base_price × (1 + 2,5%).
// Selisih 2,5% menjadi pendapatan Smart MBG; supplier menerima harga asli.
// ════════════════════════════════════════════════════════════════════════════

// Tarif mark-up platform (2,5%)
export const PLATFORM_MARKUP_RATE = 0.025;

// Hitung harga jual ke pembeli (sudah termasuk mark-up 2,5%) dari harga asli supplier
export function computeMarkedUpPrice(basePrice) {
  return Math.round(Number(basePrice || 0) * (1 + PLATFORM_MARKUP_RATE));
}

// Hitung nilai mark-up (pendapatan platform) dari harga asli supplier
export function computePlatformFee(basePrice) {
  return computeMarkedUpPrice(basePrice) - Number(basePrice || 0);
}

// Back-calculate harga asli dari harga jual (untuk data lama yang belum punya base_price)
export function estimateBasePrice(markedUpPrice) {
  return Math.round(Number(markedUpPrice || 0) / (1 + PLATFORM_MARKUP_RATE));
}

export const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;