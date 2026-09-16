import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Inbox } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { categoryLabel, categoryColor, statusLabel } from "@/lib/career";
import JobFormModal from "@/components/career/JobFormModal";

const EMPTY = {
  title: "",
  category: "sppg",
  location: "",
  salary: "",
  quota: 1,
  description: "",
  requirements: "",
  status: "open",
};

export default function JobManager({ allowedCategories = ["sppg", "logistik", "lainnya"] }) {
  const { user } = useAuth();
  const email = user?.email || "";
  const ownerRole = user?.role || (email.includes("logistik") ? "logistik" : "mitra");

  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: "add" } | { mode: "edit", item }

  const load = useCallback(async () => {
    try {
      const [jobRows, appRows] = await Promise.all([
        base44.entities.JobOpening.list("-created_date"),
        base44.entities.JobApplication.list("-created_date"),
      ]);
      setJobs(jobRows.filter((j) => j.owner_role === ownerRole));
      const myJobIds = new Set(jobRows.filter((j) => j.owner_role === ownerRole).map((j) => j.id));
      setApps(appRows.filter((a) => myJobIds.has(a.job_id)));
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [ownerRole]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (form) => {
    try {
      if (modal?.mode === "edit") {
        await base44.entities.JobOpening.update(modal.item.id, form);
        toast.success("Lowongan Diperbarui!");
      } else {
        await base44.entities.JobOpening.create({
          ...form,
          owner_role: ownerRole,
          owner_email: email,
          quota: Number(form.quota) || 1,
        });
        toast.success("Lowongan Dibuat!");
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error("Gagal Menyimpan", { description: err?.message || "Coba lagi." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin menghapus lowongan ini?")) return;
    try {
      await base44.entities.JobOpening.delete(id);
      toast.success("Lowongan Dihapus");
      load();
    } catch {
      toast.error("Gagal Menghapus");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & aksi */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kelola Lowongan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola lowongan kebutuhan MBG Anda.</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add", item: null })}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Lowongan
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Lowongan", value: jobs.length },
          { label: "Sedang Dibuka", value: jobs.filter((j) => j.status === "open").length },
          { label: "Total Pelamar", value: apps.length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Daftar lowongan */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada lowongan. Klik "Tambah Lowongan".</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${categoryColor(j.category)}`}>
                      {categoryLabel(j.category)}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${j.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {statusLabel(j.status)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mt-2">{j.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{j.location} · {j.salary} · {j.quota} orang</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{j.description}</p>
                  <p className="text-xs text-emerald-700 mt-1.5">{apps.filter((a) => a.job_id === j.id).length} pelamar</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { setModal({ mode: "edit", item: j }); }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(j.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal tambah/edit */}
      {modal && (
        <JobFormModal
          mode={modal.mode}
          initial={modal.item}
          allowedCategories={allowedCategories}
          applications={jobApplications(jobs, apps, modal.item)}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function jobApplications(jobs, apps, item) {
  return item ? apps.filter((a) => a.job_id === item.id) : [];
}