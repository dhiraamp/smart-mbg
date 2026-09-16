/**
 * Modul Pengendalian Rate Limiting & Cooldown OTP WhatsApp (Fonnte Gateway)
 * 
 * Aturan Pengendalian:
 * 1. Cooldown antar pengiriman: 60 detik (mencegah klik beruntun)
 * 2. Kuota maksimal per nomor: 3 kali permintaan dalam jendela 5 menit (300 detik)
 * 3. Persistensi: Menggunakan localStorage dengan fallback in-memory Map
 * 4. Normalisasi: Nomor telepon dinormalisasi formatnya (misal 08... -> 628...)
 */

import { formatPhoneNumber } from "@/api/whatsappService";

export const OTP_COOLDOWN_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_WINDOW_SECONDS = 300; // 5 menit

const STORAGE_KEY = "smartmbg_otp_rate_limit";
const memoryStore = new Map();

function getStore() {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn("Gagal membaca localStorage OTP rate limit:", e);
    }
  }
  const obj = {};
  for (const [k, v] of memoryStore.entries()) {
    obj[k] = v;
  }
  return obj;
}

function saveStore(data) {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return;
    } catch (e) {
      console.warn("Gagal menyimpan localStorage OTP rate limit:", e);
    }
  }
  for (const k of Object.keys(data)) {
    memoryStore.set(k, data[k]);
  }
}

/**
 * Memeriksa status rate limit OTP untuk nomor telepon tertentu.
 * @param {string} rawPhone
 * @returns {{
 *   allowed: boolean,
 *   reason: string | null,
 *   message: string | null,
 *   cooldownRemaining: number,
 *   attemptsRemaining: number,
 *   attemptsCount: number,
 *   resetInSeconds: number,
 *   waitMinutesRemaining?: number
 * }}
 */
export function checkOtpRateLimit(rawPhone) {
  const phone = formatPhoneNumber(rawPhone);
  if (!phone || phone.length < 8) {
    return {
      allowed: false,
      reason: "INVALID_PHONE",
      message: "Nomor WhatsApp tidak valid atau terlalu pendek.",
      cooldownRemaining: 0,
      attemptsRemaining: OTP_MAX_ATTEMPTS,
      attemptsCount: 0,
      resetInSeconds: 0,
    };
  }

  const now = Date.now();
  const windowMs = OTP_WINDOW_SECONDS * 1000;
  const cooldownMs = OTP_COOLDOWN_SECONDS * 1000;

  const store = getStore();
  const history = (store[phone] || []).filter((ts) => now - ts < windowMs);

  const attemptsCount = history.length;
  const attemptsRemaining = Math.max(0, OTP_MAX_ATTEMPTS - attemptsCount);
  const lastAttempt = attemptsCount > 0 ? history[history.length - 1] : 0;
  const elapsedSinceLast = now - lastAttempt;

  let cooldownRemaining = 0;
  if (lastAttempt > 0 && elapsedSinceLast < cooldownMs) {
    cooldownRemaining = Math.ceil((cooldownMs - elapsedSinceLast) / 1000);
  }

  let resetInSeconds = 0;
  if (attemptsCount >= OTP_MAX_ATTEMPTS) {
    const oldest = history[0];
    resetInSeconds = Math.max(0, Math.ceil((oldest + windowMs - now) / 1000));
  }

  // 1. Cek kuota maksimal per nomor (3x per 5 menit)
  if (attemptsCount >= OTP_MAX_ATTEMPTS) {
    const waitMinutes = Math.ceil(resetInSeconds / 60) || 1;
    return {
      allowed: false,
      reason: "LIMIT_EXCEEDED",
      message: `Batas pengiriman OTP tercapai (maksimal ${OTP_MAX_ATTEMPTS}x per 5 menit). Silakan coba lagi dalam ${waitMinutes} menit.`,
      cooldownRemaining,
      attemptsRemaining: 0,
      attemptsCount,
      resetInSeconds,
      waitMinutesRemaining: waitMinutes,
    };
  }

  // 2. Cek jeda cooldown 60 detik antar permintaan
  if (cooldownRemaining > 0) {
    return {
      allowed: false,
      reason: "COOLDOWN",
      message: `Harap tunggu ${cooldownRemaining} detik sebelum meminta kode OTP kembali.`,
      cooldownRemaining,
      attemptsRemaining,
      attemptsCount,
      resetInSeconds,
    };
  }

  // Lolos verifikasi
  return {
    allowed: true,
    reason: null,
    message: null,
    cooldownRemaining: 0,
    attemptsRemaining,
    attemptsCount,
    resetInSeconds: 0,
  };
}

/**
 * Mencatat percobaan pengiriman OTP untuk nomor telepon.
 * @param {string} rawPhone
 * @returns {object} Status terbaru setelah dicatat
 */
export function recordOtpAttempt(rawPhone) {
  const phone = formatPhoneNumber(rawPhone);
  if (!phone) return null;

  const now = Date.now();
  const windowMs = OTP_WINDOW_SECONDS * 1000;

  const store = getStore();
  const history = (store[phone] || []).filter((ts) => now - ts < windowMs);
  history.push(now);
  store[phone] = history;

  // Bersihkan data nomor kadaluarsa untuk hemat memori/storage
  for (const p of Object.keys(store)) {
    store[p] = store[p].filter((ts) => now - ts < windowMs);
    if (store[p].length === 0) {
      delete store[p];
    }
  }

  saveStore(store);
  return checkOtpRateLimit(phone);
}

/**
 * Reset / hapus histori rate limit nomor (untuk testing / admin).
 * @param {string} [rawPhone]
 */
export function clearOtpRateLimit(rawPhone) {
  const store = getStore();
  if (rawPhone) {
    const phone = formatPhoneNumber(rawPhone);
    delete store[phone];
    memoryStore.delete(phone);
  } else {
    for (const k of Object.keys(store)) {
      delete store[k];
    }
    memoryStore.clear();
  }
  saveStore(store);
}
