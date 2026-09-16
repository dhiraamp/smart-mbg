import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Apple, Leaf, Droplets, Flame } from "lucide-react";

const macroData = [
  { name: "Karbohidrat", value: 55, color: "hsl(38, 92%, 50%)" },
  { name: "Protein", value: 25, color: "hsl(160, 84%, 39%)" },
  { name: "Lemak", value: 20, color: "hsl(0, 84%, 60%)" },
];

const weeklyNutrition = [
  { day: "Sen", kalori: 2100, protein: 60, target: 2000 },
  { day: "Sel", kalori: 1950, protein: 55, target: 2000 },
  { day: "Rab", kalori: 2200, protein: 65, target: 2000 },
  { day: "Kam", kalori: 2050, protein: 58, target: 2000 },
  { day: "Jum", kalori: 1800, protein: 50, target: 2000 },
  { day: "Sab", kalori: 2300, protein: 70, target: 2000 },
  { day: "Min", kalori: 2150, protein: 62, target: 2000 },
];

const tips = [
  { icon: Apple, title: "Konsumsi Buah Harian", desc: "Pastikan menu harian mengandung minimal 2 porsi buah segar untuk asupan vitamin." },
  { icon: Leaf, title: "Sayuran Hijau", desc: "Sayuran berdaun hijau kaya akan zat besi dan kalsium yang penting untuk pertumbuhan." },
  { icon: Droplets, title: "Cukup Air Mineral", desc: "Sediakan minimal 8 gelas air putih per porsi makanan untuk menjaga hidrasi." },
  { icon: Flame, title: "Protein Seimbang", desc: "Kombinasikan protein hewani dan nabati untuk nutrisi yang optimal." },
];

export default function MitraNutrition() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Nutrition Page</h2>
        <p className="text-muted-foreground">Informasi gizi dan panduan nutrisi harian</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Komposisi Makro Nutrisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={macroData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                    {macroData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Asupan Kalori Mingguan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyNutrition}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="kalori" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Tips Nutrisi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tips.map((tip, i) => (
            <Card key={i} className="flex items-start gap-4 p-4">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <tip.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{tip.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{tip.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}