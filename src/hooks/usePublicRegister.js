import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { generateOtpCode, sendWhatsAppOtp, formatPhoneNumber } from "@/api/whatsappService";
import {
  checkOtpRateLimit,
  recordOtpAttempt,
  OTP_COOLDOWN_SECONDS,
} from "@/lib/otpRateLimiter";
import { toast } from "sonner";

export function usePublicRegister() {
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpPhone, setOtpPhone] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [expectedOtp, setExpectedOtp] = useState("");
  const [simulatedCode, setSimulatedCode] = useState("");
  const [pendingRegistration, setPendingRegistration] = useState(null);

  // Rate Limiting & Cooldown State
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [failedVerificationCount, setFailedVerificationCount] = useState(0);

  // Timer hitung mundur otomatis untuk cooldown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const sendRegister = async ({ email, password, phone, name = "Pengguna", profileData = {} }) => {
    setOtpLoading(true);
    setOtpError("");

    if (!phone || phone.trim().length < 8) {
      toast.error("Nomor WhatsApp Diperlukan", {
        description: "Masukkan nomor WhatsApp yang aktif untuk menerima kode verifikasi OTP.",
      });
      setOtpLoading(false);
      return false;
    }

    // 1. Validasi Rate Limit & Cooldown sebelum memanggil gateway Fonnte
    const rateCheck = checkOtpRateLimit(phone);
    if (!rateCheck.allowed) {
      setCooldownSeconds(rateCheck.cooldownRemaining);
      setAttemptsRemaining(rateCheck.attemptsRemaining);
      setOtpError(rateCheck.message);

      if (rateCheck.reason === "LIMIT_EXCEEDED") {
        toast.error("Batas Pengiriman OTP Tercapai", {
          description: rateCheck.message,
          duration: 9000,
        });
      } else {
        toast.error("Mohon Menunggu", {
          description: rateCheck.message,
          duration: 5000,
        });
        // Jika form ditutup tapi OTP sudah terkirim sebelumnya ke nomor yang sama, buka kembali dialog
        if (pendingRegistration?.phone === phone && expectedOtp) {
          setOtpOpen(true);
        }
      }

      setOtpLoading(false);
      return false;
    }

    try {
      const code = generateOtpCode();
      setExpectedOtp(code);
      setOtpPhone(phone);
      setOtpEmail(email);
      setPendingRegistration({ email, password, phone, name, profileData });
      setFailedVerificationCount(0);

      const res = await sendWhatsAppOtp({ phone, name, otpCode: code });

      if (res.success === false) {
        toast.error("Gagal Mengirim WhatsApp OTP", {
          description: `Gateway Fonnte: "${res.reason}". Hubungkan bot WhatsApp Anda di dashboard Fonnte.`,
          duration: 9000,
        });
        setOtpError(`Gagal mengirim pesan WhatsApp: ${res.reason}. Silakan hubungkan bot WhatsApp di dashboard Fonnte.`);
        return false;
      }

      // Catat percobaan pengiriman yang berhasil & aktifkan cooldown 60 detik
      recordOtpAttempt(phone);
      const updatedRate = checkOtpRateLimit(phone);
      setCooldownSeconds(updatedRate.cooldownRemaining || OTP_COOLDOWN_SECONDS);
      setAttemptsRemaining(updatedRate.attemptsRemaining);

      toast.success("Kode OTP Dikirim ke WhatsApp", {
        description: `Pesan kode OTP 6 digit telah dikirimkan ke nomor ${phone}. Silakan periksa pesan WhatsApp Anda.`,
        duration: 8000,
      });

      setOtpOpen(true);
      return true;
    } catch (err) {
      const msg = err?.message || "Gagal mengirim kode OTP ke WhatsApp.";
      toast.error("Gagal Mengirim OTP", { description: msg });
      setOtpError(msg);
      return false;
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!pendingRegistration?.phone) return;
    setOtpLoading(true);
    setOtpError("");

    // 1. Validasi Rate Limit & Cooldown sebelum kirim ulang
    const rateCheck = checkOtpRateLimit(pendingRegistration.phone);
    if (!rateCheck.allowed) {
      setCooldownSeconds(rateCheck.cooldownRemaining);
      setAttemptsRemaining(rateCheck.attemptsRemaining);
      setOtpError(rateCheck.message);

      if (rateCheck.reason === "LIMIT_EXCEEDED") {
        toast.error("Batas Kirim Ulang Tercapai", {
          description: rateCheck.message,
          duration: 9000,
        });
      } else {
        toast.error("Mohon Menunggu", {
          description: rateCheck.message,
        });
      }

      setOtpLoading(false);
      return;
    }

    try {
      const newCode = generateOtpCode();
      setExpectedOtp(newCode);
      setFailedVerificationCount(0);

      const res = await sendWhatsAppOtp({
        phone: pendingRegistration.phone,
        name: pendingRegistration.name,
        otpCode: newCode,
      });

      if (res.success === false) {
        toast.error("Gagal Mengirim Ulang WhatsApp", {
          description: `Gateway Fonnte: "${res.reason}". Periksa koneksi bot WhatsApp di Fonnte.`,
          duration: 9000,
        });
        setOtpError(`Gagal mengirim ulang WhatsApp: ${res.reason}`);
        return;
      }

      // Catat percobaan pengiriman & reset cooldown 60 detik
      recordOtpAttempt(pendingRegistration.phone);
      const updatedRate = checkOtpRateLimit(pendingRegistration.phone);
      setCooldownSeconds(updatedRate.cooldownRemaining || OTP_COOLDOWN_SECONDS);
      setAttemptsRemaining(updatedRate.attemptsRemaining);

      toast.success("Kode OTP Baru Dikirim ke WhatsApp", {
        description: `Silakan periksa pesan WhatsApp Anda di ${pendingRegistration.phone}.`,
      });
    } catch (err) {
      toast.error("Gagal Mengirim Ulang", {
        description: err.message || "Silakan coba lagi beberapa saat lagi.",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtpAndFinalize = async ({ enteredCode, onSuccess }) => {
    setOtpLoading(true);
    setOtpError("");

    const isValid = enteredCode === expectedOtp;

    if (!isValid) {
      const newFailCount = failedVerificationCount + 1;
      setFailedVerificationCount(newFailCount);

      if (newFailCount >= 5) {
        setExpectedOtp("");
        const msg = "Kode OTP kedaluwarsa karena salah 5 kali. Silakan minta kode baru.";
        setOtpError(msg);
        toast.error("Verifikasi Gagal", { description: msg });
      } else {
        const sisaPercobaan = 5 - newFailCount;
        const msg = `Kode OTP tidak cocok. Sisa kesempatan verifikasi: ${sisaPercobaan} kali.`;
        setOtpError(msg);
        toast.error("Kode OTP Salah", { description: msg });
      }

      setOtpLoading(false);
      return false;
    }

    try {
      if (!pendingRegistration) {
        throw new Error("Data pendaftaran tidak ditemukan. Silakan isi form kembali.");
      }

      const { email, password, profileData } = pendingRegistration;

      // Buat akun di sistem
      await base44.auth.register({
        email,
        password,
        profileData: {
          ...profileData,
          phone: pendingRegistration.phone,
          wa_verified: true,
          verified_at: new Date().toISOString(),
        },
      });

      // Login otomatis jika memungkinkan
      try {
        await base44.auth.loginViaEmailPassword(email, password);
      } catch (loginErr) {
        console.warn("Login otomatis opsional:", loginErr);
      }

      setOtpOpen(false);
      toast.success("Verifikasi WhatsApp Berhasil!", {
        description: `Akun dengan nomor ${pendingRegistration.phone} berhasil diaktifkan.`,
      });

      onSuccess?.();
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Gagal mengaktifkan akun. Silakan coba lagi.";
      setOtpError(msg);
      toast.error("Aktivasi Gagal", { description: msg });
      return false;
    } finally {
      setOtpLoading(false);
    }
  };

  const closeOtp = () => setOtpOpen(false);

  return {
    otpOpen,
    otpPhone,
    otpEmail,
    otpLoading,
    otpError,
    simulatedCode,
    cooldownSeconds,
    attemptsRemaining,
    sendRegister,
    resendOtp,
    verifyOtpAndFinalize,
    closeOtp,
  };
}
