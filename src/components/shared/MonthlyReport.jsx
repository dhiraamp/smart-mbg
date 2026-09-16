import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { FileText } from "lucide-react";

const defaultData = [
  { month: "Jan", pendapatan: 4500000, pengeluaran: 2800000 },
  { month: "Feb", pendapatan: 5200000, pengeluaran: 3100000 },
  { month: "Mar", pendapatan: 4800000, pengeluaran: 2900000 },
  { month: "Apr", pendapatan: 6100000, pengeluaran: 3500000 },
  { month: "Mei", pendapatan: 5700000, pengeluaran: 3200000 },
  { month: "Jun", pendapatan: 6400000, pengeluaran: 3800000 },
];

const formatRp = (val) => `Rp ${(val / 1000000).toFixed(1)}jt`;

export default function MonthlyReport({ title = "Laporan Bulanan", data = defaultData, type = "bar" }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatRp} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `Rp ${v.toLocaleString("id-ID")}`} />
                <Bar dataKey="pendapatan" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pengeluaran" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatRp} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `Rp ${v.toLocaleString("id-ID")}`} />
                <Line type="monotone" dataKey="pendapatan" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="pengeluaran" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}