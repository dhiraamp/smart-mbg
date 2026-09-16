import {
  checkOtpRateLimit,
  recordOtpAttempt,
  clearOtpRateLimit,
  OTP_COOLDOWN_SECONDS,
  OTP_MAX_ATTEMPTS,
  OTP_WINDOW_SECONDS,
} from "@/lib/otpRateLimiter.js";
import { formatPhoneNumber } from "@/api/whatsappService.js";

// Setup mock window & localStorage
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = {
  localStorage: globalThis.localStorage,
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

async function runRateLimitTests() {
  console.log("\n==========================================");
  console.log("MEMULAI PENGUJIAN OTP RATE LIMITER & COOLDOWN");
  console.log("==========================================\n");

  const testPhone = "081298765432";
  const expectedNormalized = "6281298765432";

  // 1. Reset awal
  clearOtpRateLimit();
  console.log("Test 1: Memverifikasi normalisasi nomor WhatsApp...");
  assert(formatPhoneNumber(testPhone) === expectedNormalized, "Nomor lokal 08xxx terformat ke 62xxx");
  assert(formatPhoneNumber("+6281298765432") === expectedNormalized, "Nomor dengan + terformat bersih");
  assert(formatPhoneNumber("6281298765432") === expectedNormalized, "Nomor 62xxx tetap terjaga");

  // 2. Status awal
  console.log("\nTest 2: Memverifikasi status awal (belum ada request)...");
  const initStatus = checkOtpRateLimit(testPhone);
  assert(initStatus.allowed === true, "Nomor baru diperbolehkan meminta OTP");
  assert(initStatus.cooldownRemaining === 0, "Cooldown awal adalah 0 detik");
  assert(initStatus.attemptsRemaining === OTP_MAX_ATTEMPTS, `Sisa percobaan awal adalah ${OTP_MAX_ATTEMPTS}`);
  assert(initStatus.attemptsCount === 0, "Jumlah percobaan awal adalah 0");

  // 3. Catat request ke-1
  console.log("\nTest 3: Mencatat request OTP ke-1...");
  recordOtpAttempt(testPhone);
  const status1 = checkOtpRateLimit(testPhone);
  assert(status1.allowed === false, "Setelah request 1, tidak boleh kirim seketika (cooldown aktif)");
  assert(status1.reason === "COOLDOWN", "Alasan penolakan adalah COOLDOWN");
  assert(status1.cooldownRemaining > 0 && status1.cooldownRemaining <= OTP_COOLDOWN_SECONDS, `Cooldown bernilai ~${OTP_COOLDOWN_SECONDS}s`);
  assert(status1.attemptsRemaining === 2, "Sisa percobaan sekarang berkurang menjadi 2");
  assert(status1.attemptsCount === 1, "Jumlah percobaan tercatat 1");

  // 4. Simulasi jeda 61 detik (cooldown selesai)
  console.log("\nTest 4: Simulasi lewat 61 detik (cooldown selesai, request ke-2)...");
  // Manipulasi waktu histori untuk simulasi
  const rawStore = JSON.parse(localStorage.getItem("smartmbg_otp_rate_limit"));
  rawStore[expectedNormalized][0] = Date.now() - 61 * 1000;
  localStorage.setItem("smartmbg_otp_rate_limit", JSON.stringify(rawStore));

  const statusAfterCooldown = checkOtpRateLimit(testPhone);
  assert(statusAfterCooldown.allowed === true, "Setelah 61 detik cooldown selesai, diperbolehkan meminta lagi");
  assert(statusAfterCooldown.cooldownRemaining === 0, "Cooldown sudah 0");
  assert(statusAfterCooldown.attemptsRemaining === 2, "Sisa percobaan masih 2");

  // 5. Catat request ke-2
  console.log("\nTest 5: Mencatat request OTP ke-2...");
  recordOtpAttempt(testPhone);
  const status2 = checkOtpRateLimit(testPhone);
  assert(status2.allowed === false, "Cooldown aktif kembali setelah request ke-2");
  assert(status2.reason === "COOLDOWN", "Alasan penolakan adalah COOLDOWN");
  assert(status2.attemptsRemaining === 1, "Sisa percobaan sekarang berkurang menjadi 1");

  // 6. Simulasi jeda 61 detik & catat request ke-3 (kuota habis)
  console.log("\nTest 6: Simulasi jeda 61 detik & request ke-3...");
  const rawStore2 = JSON.parse(localStorage.getItem("smartmbg_otp_rate_limit"));
  rawStore2[expectedNormalized][1] = Date.now() - 61 * 1000;
  localStorage.setItem("smartmbg_otp_rate_limit", JSON.stringify(rawStore2));

  recordOtpAttempt(testPhone);
  const status3 = checkOtpRateLimit(testPhone);
  assert(status3.attemptsRemaining === 0, "Sisa percobaan sekarang 0 (kuota 3x terpenuhi)");
  assert(status3.attemptsCount === 3, "Jumlah request tercatat 3 kali");

  // 7. Percobaan ke-4 (Batas Tercapai / LIMIT_EXCEEDED)
  console.log("\nTest 7: Uji pencegahan spam ke-4 walau cooldown sudah lewat...");
  // Geser attempt ke-3 agar cooldown lewat
  const rawStore3 = JSON.parse(localStorage.getItem("smartmbg_otp_rate_limit"));
  rawStore3[expectedNormalized][2] = Date.now() - 61 * 1000;
  localStorage.setItem("smartmbg_otp_rate_limit", JSON.stringify(rawStore3));

  const status4 = checkOtpRateLimit(testPhone);
  assert(status4.allowed === false, "Request ke-4 ditolak walau cooldown sudah lewat!");
  assert(status4.reason === "LIMIT_EXCEEDED", "Alasan penolakan adalah LIMIT_EXCEEDED");
  assert(status4.attemptsRemaining === 0, "Sisa percobaan tetap 0");
  assert(status4.waitMinutesRemaining > 0, `Harus menunggu jendela reset (~${status4.waitMinutesRemaining} menit)`);
  assert(status4.message.includes("maksimal 3x"), "Pesan penolakan informatif dan ramah pengguna");

  // 8. Isolasi nomor lain (Phone B tidak terpengaruh)
  console.log("\nTest 8: Uji isolasi antar nomor telepon...");
  const phoneB = "081311223344";
  const statusB = checkOtpRateLimit(phoneB);
  assert(statusB.allowed === true, "Nomor telepon B independen dan tetap diizinkan");
  assert(statusB.attemptsRemaining === OTP_MAX_ATTEMPTS, "Nomor telepon B memiliki kuota penuh 3x");

  // 9. Simulasi jeda 5 menit (jendela bergeser)
  console.log("\nTest 9: Simulasi 5 menit berlalu (jendela rate limit bergeser)...");
  const rawStore4 = JSON.parse(localStorage.getItem("smartmbg_otp_rate_limit"));
  // Request 1 sudah lebih dari 5 menit (301 detik yang lalu)
  rawStore4[expectedNormalized][0] = Date.now() - 301 * 1000;
  localStorage.setItem("smartmbg_otp_rate_limit", JSON.stringify(rawStore4));

  const statusWindowShift = checkOtpRateLimit(testPhone);
  assert(statusWindowShift.allowed === true, "Request ke-1 gugur dari jendela 5 menit -> user kembali diizinkan!");
  assert(statusWindowShift.attemptsRemaining === 1, "Sisa percobaan bertambah menjadi 1");

  // 10. Clear reset
  console.log("\nTest 10: Uji fungsi clearOtpRateLimit...");
  clearOtpRateLimit(testPhone);
  const statusReset = checkOtpRateLimit(testPhone);
  assert(statusReset.allowed === true, "Setelah di-reset, kembali diizinkan");
  assert(statusReset.attemptsRemaining === OTP_MAX_ATTEMPTS, "Kuota kembali penuh");

  console.log("\n==========================================");
  console.log(`HASIL: ${passed} PASS, ${failed} FAIL`);
  console.log("SEMUA PENGUJIAN RATE LIMITING BERHASIL 100%!");
  console.log("==========================================\n");
}

runRateLimitTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
