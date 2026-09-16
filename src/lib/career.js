export const CATEGORIES = [
  { key: "sppg", label: "SPPG (Dapur)" },
  { key: "logistik", label: "Logistik" },
  { key: "lainnya", label: "Lainnya (MBG)" },
];

export function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || key || "Lainnya";
}

export function categoryColor(key) {
  switch (key) {
    case "sppg":
      return "bg-emerald-600 text-white";
    case "logistik":
      return "bg-sky-600 text-white";
    default:
      return "bg-amber-500 text-white";
  }
}

export function statusLabel(status) {
  return status === "open" ? "Dibuka" : "Ditutup";
}