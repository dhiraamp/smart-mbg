import React from "react";
import HomeHeader from "@/components/marketplace/HomeHeader";
import GisMap from "@/components/marketplace/GisMap";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPinned, ExternalLink, ShieldCheck, Database } from "lucide-react";

export default function GisPetaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <HomeHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Banner Pengantar Integrasi Disperindag */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl text-white p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 px-3 py-1 text-xs font-semibold backdrop-blur-md gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                Integrasi Resmi Disperindag Garut
              </Badge>
              <Badge className="bg-teal-500/30 text-teal-100 border border-teal-400/40 px-3 py-1 text-xs font-semibold backdrop-blur-md gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                Terverifikasi 42 Kecamatan
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">
              Peta Geospasial (GIS) Program Makan Bergizi Gratis
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed mb-4">
              Visualisasi pemetaan geospasial rantai pasok pangan Kabupaten Garut. Menghubungkan titik Satuan Pelayanan Pangan Bergizi (SPPG), sekolah sasaran penerima manfaat, dan supplier komoditas lokal binaan Disperindag Garut.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200 pt-2 border-t border-emerald-600/60">
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-300" />
                <span>Sumber Data Portal MBG:</span>
                <a
                  href="https://mistermbg.disperindag.garutkab.go.id/mbg"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white underline font-semibold hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
                >
                  mistermbg.disperindag.garutkab.go.id/mbg
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Peta GIS Lengkap */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-4 sm:p-6">
          <GisMap />
        </div>
      </main>
    </div>
  );
}
