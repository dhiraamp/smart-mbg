import confetti from "canvas-confetti";
import { toast } from "sonner";

/**
 * Smart Feedback & Micro-Interactions System — Smart MBG Garut
 * 
 * Modul ini menyediakan:
 * 1. Haptic Feedback (Vibration API untuk smartphone pengguna)
 * 2. Visual Confetti Bursts (canvas-confetti saat pesanan selesai / armada tiba)
 * 3. Notifikasi Toast Cerdas dengan Rich Context & Action Buttons
 * 4. Motion Presets untuk komponen interaktif
 */

/**
 * 1. Haptic Feedback untuk Perangkat Mobile
 */
export function triggerHaptic(type = "light") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  try {
    switch (type) {
      case "light":
        navigator.vibrate(12); // Sentuhan tombol / tab switch
        break;
      case "medium":
        navigator.vibrate(28); // Tambah ke keranjang / aksi dialog
        break;
      case "success":
        navigator.vibrate([25, 45, 25]); // Konfirmasi transaksi / pesanan tiba
        break;
      case "warning":
        navigator.vibrate([40, 70, 40]); // Peringatan HACCP suhu / stok menipis
        break;
      case "error":
        navigator.vibrate([60, 100, 60]); // Validasi gagal
        break;
      default:
        navigator.vibrate(15);
    }
  } catch (e) {
    // Non-blocking fallback jika browser membatasi izin getar
  }
}

/**
 * 2. Celebratory Confetti Burst (Garut Smart MBG Theme)
 */
export function triggerCelebrationConfetti(options = {}) {
  try {
    // Warna tema Smart MBG: Emerald Green, Teal, Emas Garut, dan Putih
    const colors = ["#059669", "#10b981", "#f59e0b", "#06b6d4", "#ffffff"];

    confetti({
      particleCount: options.particleCount || 75,
      spread: options.spread || 65,
      origin: options.origin || { y: 0.65 },
      colors: options.colors || colors,
      disableForReducedMotion: true,
    });
  } catch (e) {
    // Fallback jika canvas tidak didukung
  }
}

/**
 * 3. Smart Toast Notifications Berbasis Sonner
 */
export const feedbackToast = {
  success: (title, description = "", options = {}) => {
    triggerHaptic("success");
    return toast.success(title, {
      description,
      duration: options.duration || 4000,
      ...options,
    });
  },

  cartAdded: (productName, quantity = 1, unit = "kg") => {
    triggerHaptic("medium");
    return toast.success(`"${productName}" masuk ke keranjang`, {
      description: `Jumlah: ${quantity} ${unit}. Siap diproses untuk kebutuhan Dapur SPPG.`,
      duration: 3500,
    });
  },

  orderSuccess: (orderNumber, totalAmountFormatted, options = {}) => {
    triggerHaptic("success");
    triggerCelebrationConfetti({ particleCount: 90, spread: 75 });
    return toast.success(`Pesanan ${orderNumber} Berhasil Dikonfirmasi! 🎉`, {
      description: `Total pembayaran: ${totalAmountFormatted}. Dapur SPPG dan logistik telah menerima notifikasi.`,
      duration: 6000,
      action: options.onViewOrder
        ? {
            label: "Lihat Surat Jalan",
            onClick: options.onViewOrder,
          }
        : undefined,
    });
  },

  deliveryArrived: (fleetName, schoolName, portions) => {
    triggerHaptic("success");
    triggerCelebrationConfetti({ particleCount: 60, spread: 50 });
    return toast.success(`🚚 ${fleetName} Telah Tiba!`, {
      description: `Sebanyak ${portions} porsi makan bergizi siap diserahterimakan di ${schoolName}.`,
      duration: 5000,
    });
  },

  haccpAlert: (currentTemp, threshold = 60) => {
    triggerHaptic("warning");
    return toast.warning("⚠️ Peringatan Suhu Makanan HACCP", {
      description: `Suhu saat ini ${currentTemp}°C mendekati ambang batas minimal (${threshold}°C). Segera percepat serah terima!`,
      duration: 6000,
    });
  },

  info: (title, description = "") => {
    triggerHaptic("light");
    return toast.info(title, {
      description,
      duration: 3000,
    });
  },

  error: (title, description = "") => {
    triggerHaptic("error");
    return toast.error(title, {
      description,
      duration: 5000,
    });
  },
};

/**
 * 4. Motion Presets untuk Framer-Motion Micro-Interactions
 */
export const MOTION_PRESETS = {
  tapScale: {
    whileTap: { scale: 0.97 },
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  cardHover: {
    whileHover: { y: -4, transition: { duration: 0.2, ease: "easeOut" } },
    whileTap: { scale: 0.98 },
  },
  buttonClick: {
    whileTap: { scale: 0.95 },
    transition: { duration: 0.1 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.35, ease: "easeOut" },
  },
};
