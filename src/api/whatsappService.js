// Service Pengiriman Pesan & Kode OTP WhatsApp
// Mendukung Fonnte Gateway & mode simulasi lokal otomatis saat API token belum disetel.

export function formatPhoneNumber(phone) {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("620")) {
    clean = "62" + clean.slice(3);
  } else if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  } else if (!clean.startsWith("62")) {
    clean = "62" + clean;
  }
  return clean;
}

export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendWhatsAppOtp({ phone, name = "Pengguna", otpCode }) {
  const targetPhone = formatPhoneNumber(phone);
  const token =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_FONNTE_TOKEN) ||
    "pWm4FsSP3o4o2TuHEaxJ";

  const message = `*SMART MBG — Kode Verifikasi Pendaftaran*\n\nHalo ${name},\n\nKode OTP verifikasi akun Smart MBG Anda adalah:\n\n👉 *${otpCode}* 👈\n\nKode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapa pun untuk menjaga keamanan akun Anda.\n\n_Sistem Manajemen Rantai Pasok MBG_`;

  // Jika token Fonnte / WhatsApp Gateway tersedia
  if (token && token.trim() !== "") {
    try {
      const formData = new FormData();
      formData.append("target", targetPhone);
      formData.append("message", message);
      formData.append("countryCode", "0");
      formData.append("connectOnly", "true");

      const isDev = Boolean(
        typeof import.meta !== "undefined" &&
          (import.meta.env?.DEV || import.meta.env?.MODE === "development")
      );
      const isLocalHost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname.startsWith("192.168.") ||
          window.location.hostname.startsWith("10.") ||
          window.location.hostname.endsWith(".localhost") ||
          Boolean(window.location.port));

      // Gunakan proxy lokal bila berada di development server untuk mencegah browser CORS block
      const endpoint = isDev || isLocalHost ? "/fonnte-api/send" : "https://api.fonnte.com/send";

      let response;
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: token.trim(),
          },
          body: formData,
        });
      } catch (fetchErr) {
        if (endpoint.startsWith("/fonnte-api")) {
          console.warn("Proxy /fonnte-api gagal, mencoba fallback ke https://api.fonnte.com/send...", fetchErr);
          response = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
              Authorization: token.trim(),
            },
            body: formData,
          });
        } else {
          throw fetchErr;
        }
      }

      const resJson = await response.json();
      console.log("Fonnte API Response:", resJson);

      if (resJson.status === true) {
        return { success: true, via: "fonnte", target: targetPhone, otpCode, raw: resJson };
      } else {
        console.warn("Fonnte gagal mengirim:", resJson?.reason);
        return {
          success: false,
          via: "fonnte_error",
          reason: resJson?.reason || "Gagal dari gateway Fonnte",
          target: targetPhone,
          otpCode,
        };
      }
    } catch (err) {
      console.error("Gagal mengirim WA via Fonnte:", err);
      return { success: false, via: "network_error", reason: err.message, target: targetPhone, otpCode };
    }
  }

  // Mode Simulasi (hanya jika token benar-benar kosong)
  console.log(`%c[SIMULASI WHATSAPP OTP] Dikirim ke ${targetPhone}: ${otpCode}`, "color: #10b981; font-weight: bold; font-size: 14px;");
  return { success: true, via: "simulation", target: targetPhone };
}
