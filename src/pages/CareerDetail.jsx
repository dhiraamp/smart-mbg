import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Wallet, Users, Briefcase, Send, CheckCircle2, UserCircle } from "lucide-react";
import HomeHeader from "@/components/marketplace/HomeHeader";
import FooterStats from "@/components/marketplace/FooterStats";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { notifyRoles } from "@/lib/notify";
import { categoryLabel, categoryColor } from "@/lib/career";

export default function CareerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nama: "", pesan: "" });
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    base44.entities.JobOpening.filter({ id })
      .then((rows) => {
        setJob(rows[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const canApply = isAuthenticated && user?.role === "penerima";

  useEffect(() => {
    if (canApply) {
      setForm((f) => ({ ...f, nama: user?.full_name || "" }));
    }
  }, [canApply, user]);

  const handleSubmit = async () => {
    if (!form.nama.trim() || !form.pesan.trim()) {
      toast.error("Lengkapi Data", { description: "Nama dan isi lamaran wajib diisi." });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.JobApplication.create({
        job_id: id,
        job_title: job?.title,
        applicant_email: user?.email,
        applicant_name: form.nama.trim(),
        message: form.pesan.trim(),
        status: "pending",
      });
      await notifyRoles(job?.owner_role || "mitra", {
        type: "job_application",
        title: "Ada Pelamar Baru",
        message: `${form.nama.trim()} melamar posisi "${job?.title}".`,
        ref_id: id,
      });
      setApplied(true);
      toast.success("Lamaran Terkirim!", { description: "Lamaran Anda berhasil dikirim." });
    } catch (err) {
      toast.error("Gagal Mengirim", { description: err?.message || "Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <button onClick={() => navigate("/career")} className="flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Lowongan
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : !job ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Lowongan tidak ditemukan.</p>
            <Link to="/career" className="inline-block mt-3 text-sm font-semibold text-emerald-600 hover:underline">Lihat semua lowongan</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded ${categoryColor(job.category)}`}>
                  {categoryLabel(job.category)}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${job.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {job.status === "open" ? "Dibuka" : "Ditutup"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">{job.title}</h1>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 text-xs text-gray-600">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {job.location}</span>
                <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-emerald-600" /> {job.salary}</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-emerald-600" /> Kebutuhan: {job.quota} orang</span>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-2">Deskripsi Pekerjaan</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
              <h2 className="font-bold text-gray-900 mt-5 mb-2">Kualifikasi / Persyaratan</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{job.requirements}</p>
            </div>

            {/* Apply */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-600" /> Lamar Posisi
              </h2>

              {applied ? (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-5 h-5" /> Lamaran Anda telah terkirim. Terima kasih!
                </div>
              ) : !isAuthenticated ? (
                <button
                  onClick={() => navigate("/portal")}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl py-3 transition-colors"
                >
                  <UserCircle className="w-4 h-4" /> Masuk untuk Melamar
                </button>
              ) : !canApply ? (
                <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  Hanya akun <strong>Warga</strong> yang dapat melamar. Silakan masuk dengan akun warga.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-900">Nama Lengkap</label>
                    <input
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      placeholder="Nama Anda"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-900">Pesan untuk Pemberi Lowongan</label>
                    <textarea
                      value={form.pesan}
                      onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                      rows={4}
                      placeholder="Ceritakan singkat pengalaman & alasan Anda melamar..."
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl py-3 transition-colors"
                  >
                    <Send className="w-4 h-4" /> {submitting ? "Mengirim..." : "Kirim Lamaran"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <FooterStats />
    </div>
  );
}