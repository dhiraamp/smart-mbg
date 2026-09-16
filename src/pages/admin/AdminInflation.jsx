import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const priceData = [
  { month: "Jan", beras: 14000, ayam: 35000, cabai: 40000, telur: 26000 },
  { month: "Feb", beras: 14200, ayam: 36000, cabai: 55000, telur: 27000 },
  { month: "Mar", beras: 14100, ayam: 37000, cabai: 45000, telur: 27500 },
  { month: "Apr", beras: 14500, ayam: 38000, cabai: 60000, telur: 28000 },
  { month: "Mei", beras: 14300, ayam: 37500, cabai: 50000, telur: 28500 },
  { month: "Jun", beras: 14600, ayam: 39000, cabai: 45000, telur: 28000 },
];

const priceChanges = [
  { name: "Beras Premium", current: 14600, prev: 14300, unit: "kg" },
  { name: "Ayam Potong", current: 39000, prev: 37500, unit: "kg" },
  { name: "Cabai Merah", current: 45000, prev: 50000, unit: "kg" },
  { name: "Telur Ayam", current: 28000, prev: 28500, unit: "kg" },
  { name: "Minyak Goreng", current: 18500, prev: 18000, unit: "liter" },
  { name: "Gula Pasir", current: 15200, prev: 15000, unit: "kg" },
];

export default function AdminInflation() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Laporan Inflasi & Harga Pasar</h2>
        <p className="text-muted-foreground">Pantau fluktuasi harga bahan pangan di pasar</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Trend Harga Bahan Pokok</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v/1000)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `Rp ${v.toLocaleString("id-ID")}`} />
                <Line type="monotone" dataKey="beras" stroke="hsl(217, 91%, 50%)" strokeWidth={2} name="Beras" />
                <Line type="monotone" dataKey="ayam" stroke="hsl(160, 84%, 39%)" strokeWidth={2} name="Ayam" />
                <Line type="monotone" dataKey="cabai" stroke="hsl(0, 84%, 60%)" strokeWidth={2} name="Cabai" />
                <Line type="monotone" dataKey="telur" stroke="hsl(38, 92%, 50%)" strokeWidth={2} name="Telur" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {priceChanges.map((item, i) => {
          const change = ((item.current - item.prev) / item.prev * 100).toFixed(1);
          const isUp = item.current > item.prev;
          return (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.name}</p>
                  <p className="text-xl font-bold mt-1">Rp {item.current.toLocaleString("id-ID")}<span className="text-xs font-normal text-muted-foreground">/{item.unit}</span></p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? "text-red-600" : "text-green-600"}`}>
                  {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isUp ? "+" : ""}{change}%
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}