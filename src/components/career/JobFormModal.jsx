import React, { useState } from "react";
import { XCircle } from "lucide-react";
import { CATEGORIES } from "@/lib/career";

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

export default function JobFormModal({ mode, initial, allowedCategories = [], applications = [], onSave, onClose }) {
  const [form, setForm] = useState(
    initial
      ? { ...EMPTY, ...initial, quota: initial.quota }
      : { ...EMPTY, category: allowedCategories[0] || "sppg", quota: 1 }
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const cats = CATEGORIES.filter((c) => allowedCategories.includes(c.key));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{initial ? "Edit Lowongan" : "Tambah Lowongan"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><XCircle className="w-5 h-5" /></button>
        </div>

        <div className="px-5 py-4 space-y-3 overflow-y-auto">
          <Field label="Judul Posisi">
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="cth. Petugas Dapur SPPG Cikajang" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kategori">
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500">
                {cats.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500">
                <option value="open">Dibuka</option>
                <option value="closed">Ditutup</option>
              </select>
            </Field>
          </div>
          <Field label="Lokasi">
            <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="cth: SPPG Cikajang, Garut" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Upah / Gaji">
              <input value={form.salary} onChange={(e) => set("salary", e.target.value)} placeholder="cth: Rp 1.750.000 / bulan" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </Field>
            <Field label="Jumlah (orang)">
              <input type="number" min={1} value={form.quota} onChange={(e) => set("quota", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </Field>
          </div>
          <Field label="Deskripsi">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </Field>
          <Field label="Persyaratan">
            <input value={form.requirements} onChange={(e) => set("requirements", e.target.value)} placeholder="cth: Sehat • Siap kerja pagi" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </Field>
        </div>

        {initial && applications.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 max-h-40 overflow-y-auto">
            <p className="text-xs font-bold text-gray-700 mb-2">{applications.length} Pelamar</p>
            {applications.map((a) => (
              <div key={a.id} className="text-xs text-gray-600 border-b border-gray-100 py-1.5">
                <span className="font-semibold">{a.applicant_name}</span> · {a.applicant_email}
                <p className="text-gray-500 italic">{a.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 py-2.5">Batal</button>
          <button onClick={() => onSave(form)} className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5">
            {initial ? "Simpan" : "Buat Lowongan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[13px] font-semibold text-gray-800">{label}</label>
      {children}
    </div>
  );
}
