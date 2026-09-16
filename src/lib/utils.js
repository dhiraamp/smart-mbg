import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const isIframe = typeof window !== "undefined" && window.self !== window.top;

/**
 * Format tanggal lengkap Indonesia dengan Hari, Tanggal, Bulan, Tahun, dan Jam:Menit:Detik WIB
 * Contoh hasil: "Selasa, 15 September 2026 • 08:55:30 WIB"
 */
export function formatFullIndonesianDateTime(dateInput) {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayName = days[d.getDay()];
  const date = d.getDate();
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");

  return `${dayName}, ${date} ${monthName} ${year} • ${hh}:${mm}:${ss} WIB`;
}

/**
 * Mengembalikan objek bagian tanggal dan waktu lengkap untuk tampilan tabel & modal
 */
export function formatDateTimeParts(dateInput) {
  if (!dateInput) {
    return {
      day: "-",
      date: "-",
      month: "-",
      year: "-",
      dateFormatted: "-",
      time: "-",
      full: "-",
    };
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return {
      day: "-",
      date: "-",
      month: "-",
      year: "-",
      dateFormatted: "-",
      time: "-",
      full: "-",
    };
  }

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const day = days[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const time = `${hh}:${mm}:${ss} WIB`;

  return {
    day,
    date,
    month,
    year,
    dateFormatted: `${date} ${month} ${year}`,
    time,
    full: `${day}, ${date} ${month} ${year} • ${time}`,
  };
}
