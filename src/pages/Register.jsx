import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus } from "lucide-react";

import SupplierRegForm from "@/components/register/SupplierRegForm";
import MitraRegForm from "@/components/register/MitraRegForm";
import LogistikRegForm from "@/components/register/LogistikRegForm";
import WargaRegForm from "@/components/register/WargaRegForm";

const DRP_LOGO_URL = "/images/logo-drp.jpeg";

const roleTitles = {
  supplier: "Pendaftaran Supplier",
  mitra: "Pendaftaran Mitra / SPPG",
  logistik: "Pendaftaran Logistik",
  penerima: "Pendaftaran Warga",
  warga: "Pendaftaran Warga",
};

export default function Register() {
  const { role } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-300/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src={DRP_LOGO_URL}
              alt="PT. Duta Realtindo Perkasa"
              className="h-14 object-contain bg-white rounded-xl px-2 py-1 shadow-sm"
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
            SMART MBG
          </h1>
          <p className="text-white/85 mt-1 text-sm font-medium">
            Sistem Manajemen Rantai Pasok Terintegrasi
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl">
          <CardHeader className="pb-3">
            <button
              onClick={() => navigate("/portal")}
              className="flex items-center text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Portal
            </button>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4 text-white" />
              </div>
              {roleTitles[role] || "Pendaftaran"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {role === "supplier" && <SupplierRegForm onSuccess={() => navigate("/supplier/dashboard")} />}
            {role === "mitra" && <MitraRegForm onSuccess={() => navigate("/mitra/dashboard")} />}
            {role === "logistik" && <LogistikRegForm onSuccess={() => navigate("/logistik/dashboard")} />}
            {(role === "penerima" || role === "warga") && <WargaRegForm onSuccess={() => navigate("/warga/profil")} />}
          </CardContent>
        </Card>
        <p className="text-center text-white/70 text-xs mt-6">
          &copy; 2026 SMART MBG &mdash; Powered by PT. Duta Realtindo Perkasa
        </p>
      </motion.div>
    </div>
  );
}