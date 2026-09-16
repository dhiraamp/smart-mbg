import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Download, FileSpreadsheet } from "lucide-react";

const foodData = [
  { category: "Beras & Serealia", items: 12, stock: "4.2 ton", demand: "3.8 ton", status: "surplus" },
  { category: "Sayuran", items: 25, stock: "1.8 ton", demand: "2.1 ton", status: "deficit" },
  { category: "Daging & Unggas", items: 8, stock: "0.9 ton", demand: "1.0 ton", status: "deficit" },
  { category: "Ikan & Seafood", items: 6, stock: "0.5 ton", demand: "0.6 ton", status: "deficit" },
  { category: "Telur & Susu", items: 5, stock: "1.2 ton", demand: "1.0 ton", status: "surplus" },
  { category: "Bumbu & Rempah", items: 18, stock: "0.3 ton", demand: "0.25 ton", status: "surplus" },
  { category: "Minyak & Tepung", items: 6, stock: "2.0 ton", demand: "1.8 ton", status: "surplus" },
];

const pieData = [
  { name: "Beras", value: 30 }, { name: "Sayuran", value: 22 }, { name: "Daging", value: 18 },
  { name: "Ikan", value: 12 }, { name: "Telur", value: 10 }, { name: "Lainnya", value: 8 },
];

const COLORS = ["hsl(217,91%,50%)", "hsl(160,84%,39%)", "hsl(0,84%,60%)", "hsl(38,92%,50%)", "hsl(270,60%,50%)", "hsl(200,70%,50%)"];

function escapeCsv(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function AdminFoodReport() {
  const handleExportCsv = () => {
    const headers = ["Kategori", "Jumlah Item", "Stok", "Kebutuhan", "Status"];
    const rows = foodData.map(f => [f.category, f.items, f.stock, f.demand, f.status === "surplus" ? "Surplus" : "Defisit"]);
    const csv = [headers, ...rows].map(r => r.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const now = new Date().toISOString().slice(0, 7);
    link.href = url;
    link.download = `laporan-bahan-pangan-${now}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Laporan Bahan Pangan</h2>
          <p className="text-muted-foreground">Analisis ketersediaan dan kebutuhan bahan pangan</p>
        </div>
        <Button onClick={handleExportCsv} variant="outline">
          <Download className="w-4 h-4" />
          Ekspor CSV
        </Button>
      </div>
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 flex items-start gap-2">
        <FileSpreadsheet className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800">
          Klik <strong>Ekspor CSV</strong> untuk mengunduh laporan, lalu impor file tersebut ke Google Sheets via <strong>File → Import → Upload</strong> untuk mengolah data lebih lanjut.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Status Bahan Pangan per Kategori</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead><TableHead>Item</TableHead><TableHead>Stok</TableHead>
                  <TableHead>Kebutuhan</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foodData.map((f, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{f.category}</TableCell>
                    <TableCell>{f.items}</TableCell>
                    <TableCell>{f.stock}</TableCell>
                    <TableCell>{f.demand}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={f.status === "surplus" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                        {f.status === "surplus" ? "Surplus" : "Defisit"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Distribusi Permintaan</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}