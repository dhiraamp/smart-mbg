import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import MonthlyReport from "@/components/shared/MonthlyReport";
import { Loader2, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

const reportData = [
  { month: "Jan", pendapatan: 4500000, pengeluaran: 2800000 },
  { month: "Feb", pendapatan: 5200000, pengeluaran: 3100000 },
  { month: "Mar", pendapatan: 4800000, pengeluaran: 2900000 },
  { month: "Apr", pendapatan: 6100000, pengeluaran: 3500000 },
  { month: "Mei", pendapatan: 5700000, pengeluaran: 3200000 },
  { month: "Jun", pendapatan: 6400000, pengeluaran: 3800000 },
];

const formatRp = (v) => `Rp ${v.toLocaleString("id-ID")}`;

export default function MitraReports() {
  const [generating, setGenerating] = useState(false);

  const handleDownloadPdf = () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const startX = 14;
      const colW = [25, 45, 45, 45];
      const tableW = colW.reduce((a, b) => a + b, 0);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Laporan Bulanan Mitra", startX, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("SMART MBG - Sistem Manajemen Rantai Pasok Terintegrasi", startX, 27);

      let y = 40;
      const cols = ["Bulan", "Pendapatan", "Pengeluaran", "Selisih"];
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setFillColor(5, 150, 105);
      doc.rect(startX, y - 6, tableW, 7, "F");
      doc.setTextColor(255, 255, 255);
      let x = startX;
      cols.forEach((c, i) => {
        doc.text(c, x + 1.5, y);
        x += colW[i];
      });
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      y += 6;

      reportData.forEach((r, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(245, 250, 247);
          doc.rect(startX, y - 5, tableW, 6, "F");
        }
        const vals = [r.month, formatRp(r.pendapatan), formatRp(r.pengeluaran), formatRp(r.pendapatan - r.pengeluaran)];
        x = startX;
        vals.forEach((v, i) => {
          doc.text(v, x + 1.5, y);
          x += colW[i];
        });
        y += 6;
      });

      doc.setDrawColor(220, 220, 220);
      doc.line(startX, y, startX + tableW, y);
      y += 8;

      const totalPendapatan = reportData.reduce((s, r) => s + r.pendapatan, 0);
      const totalPengeluaran = reportData.reduce((s, r) => s + r.pengeluaran, 0);

      doc.setFont("helvetica", "bold");
      doc.text("Ringkasan", startX, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.text(`Total Pendapatan  : ${formatRp(totalPendapatan)}`, startX, y); y += 5;
      doc.text(`Total Pengeluaran : ${formatRp(totalPengeluaran)}`, startX, y); y += 5;
      doc.text(`Selisih           : ${formatRp(totalPendapatan - totalPengeluaran)}`, startX, y);

      doc.save("laporan_mitra.pdf");
      toast.success("Berhasil", { description: "File PDF laporan telah diunduh." });
    } catch (err) {
      toast.error("Gagal Mengunduh", { description: err.message || "Terjadi kesalahan." });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Laporan Bulanan</h2>
          <p className="text-muted-foreground">Ringkasan pengeluaran dan pembelian bulanan</p>
        </div>
        <Button onClick={handleDownloadPdf} disabled={generating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {generating ? "Membuat PDF..." : "Download PDF"}
        </Button>
      </div>
      <MonthlyReport title="Laporan Pengeluaran Bulanan" data={reportData} />
    </div>
  );
}