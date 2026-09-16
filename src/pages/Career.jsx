import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Wallet, Users, Search, ChevronRight, Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import HomeHeader from "@/components/marketplace/HomeHeader";
import FooterStats from "@/components/marketplace/FooterStats";
import JobFormModal from "@/components/career/JobFormModal";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { CATEGORIES, categoryLabel, categoryColor } from "@/lib/career";

const OWNER_CATEGORIES = { mitra: ["sppg", "lainnya"], logistik: ["logistik", "lainnya"] };

export default function Career() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [addOpen, setAddOpen] = useState(false);

  const canManage = user && ["mitra", "logistik"].includes(user.role);
  const allowedCategories = user ? OWNER_CATEGORIES[user.role] || [] : [];

  const load = () => {
    base44.entities.JobOpening.list("-created_date")
      .then((rows) => {
        setJobs(rows.filter((j) => j.status === "open"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (form) => {
    try {
      await base44.entities.JobOpening.create({
        ...form,
        owner_role: user.role,
        owner_email: user.email,
        quota: Number(form.quota) || 1,
      });
      toast.success("Lowongan Dibuat!");
      setAddOpen(false);
      load();
    } catch (err) {
      toast.error("Gagal Menyimpan", { description: err?.message || "Coba lagi." });
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      const matchCat = category === "Semua" || j.category === category;
      const matchQ =
        !q ||
        (j.title || "").toLowerCase().includes(q) ||
        (j.location || "").toLowerCase().includes(q) ||
        (j.description || "").toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [jobs, query, category]);

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      <section className="relative border-b border-gray-200 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-teal-800/80" />
        </div>
        <div className="relative max-w-full mx-auto px-4 py-12">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-100 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-full w-fit">
            <Building2 className="w-3.5 h-3.5" /> Career Program MBG Garut
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3">Lowongan Kerja Terbuka</h1>
          <p className="text-sm text-white/80 mt-1.5 max-w-2xl">
            Bergabunglah mendukung program Makan Bergizi Gratis. Tersedia posisi
            di dapur SPPG, logistik, dan kebutuhan lain seputar MBG.
          </p>

          <div className="mt-6 flex items-stretch bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl">
            <div className="flex items-center pl-4">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari posisi, lokasi, atau deskripsi..."
              className="flex-1 px-3 py-3 text-sm outline-none"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[{ key: "Semua", label: "Semua" }, ...CATEGORIES].map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  category === c.key
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white/10 text-white/85 border-white/30 hover:bg-white/20"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              {category === "Semua" ? "Semua Lowongan" : categoryLabel(category)}
            </h2>
            <span className="text-xs text-gray-500">{filtered.length} lowongan</span>
          </div>
          {canManage && (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Tambah Lowongan
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada lowongan yang cocok dengan pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((j) => (
              <motion.button
                key={j.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/career/${j.id}`)}
                className="bg-white rounded-2xl border border-gray-200 p-5 text-left hover:border-emerald-400 hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${categoryColor(j.category)}`}>
                    {categoryLabel(j.category)}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Open
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mt-2.5">{j.title}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3 h-3" /> {j.location}
                </p>
                <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5 text-emerald-600" /> {j.salary}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-600" /> {j.quota} orang</span>
                </div>
                <p className="text-xs text-gray-500 mt-3 leading-relaxed line-clamp-2">{j.description}</p>
                <span className="mt-auto pt-3 flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                  Lihat & Lamar <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </main>

      <FooterStats />

      {addOpen && (
        <JobFormModal
          mode="add"
          allowedCategories={allowedCategories}
          onSave={handleCreate}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}