import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { getDashboardPath } from "@/lib/rolePaths";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
      <p className="text-xs text-muted-foreground font-medium">Memverifikasi hak akses...</p>
    </div>
  </div>
);

export default function ProtectedRoute({
  fallback = <DefaultFallback />,
  unauthenticatedElement = <Navigate to="/portal" replace />,
  allowedRoles,
}) {
  const { user, isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth } = useAuth();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    }
    return unauthenticatedElement;
  }

  // 1. Wajib terautentikasi (sudah login)
  if (!isAuthenticated || !user) {
    return unauthenticatedElement;
  }

  // 2. Proteksi Peran (Role Guard): Cek apakah peran pengguna diizinkan
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || localStorage.getItem("smartmbg_role") || "").toLowerCase();

    const isMatch =
      allowedRoles.includes(userRole) ||
      (allowedRoles.includes("warga") && userRole === "penerima") ||
      (allowedRoles.includes("penerima") && userRole === "warga");

    if (!isMatch) {
      console.warn(
        `[Akses Ditolak] Peran "${userRole}" tidak memiliki hak akses untuk rute ini. Memerlukan:`,
        allowedRoles
      );
      // Tendang ke dashboard milik pengguna sendiri sesuai perannya
      return <Navigate to={getDashboardPath(userRole)} replace />;
    }
  }

  return <Outlet />;
}
