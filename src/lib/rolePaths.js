import { base44 } from "@/api/base44Client";

export const DASHBOARD_PATHS = {
  mitra: "/mitra/dashboard",
  supplier: "/supplier/dashboard",
  logistik: "/logistik/dashboard",
  penerima: "/marketplace",
  admin: "/admin/dashboard",
};

export const PROFILE_PATHS = {
  mitra: "/mitra/reports",
  supplier: "/supplier/income",
  logistik: "/logistik/reports",
  penerima: "/warga/profil",
  admin: "/admin/dashboard",
};

export function getRole() {
  return localStorage.getItem("smartmbg_role") || "mitra";
}

export function getDashboardPath(role = getRole()) {
  return DASHBOARD_PATHS[role] || "/portal";
}

export function getProfilePath(role = getRole()) {
  return PROFILE_PATHS[role] || "/portal";
}

export function logoutUser(redirectPath = "/portal") {
  localStorage.removeItem("smartmbg_role");
  localStorage.removeItem("smart_mbg_user");
  localStorage.removeItem("smartmbg_login_email");
  localStorage.removeItem("smartmbg_intended");
  localStorage.removeItem("smartmbg_name");
  base44.auth.logout(redirectPath);
}
