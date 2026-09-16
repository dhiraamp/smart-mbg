import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "@/components/shared/StatCard";
import { Truck, Package, Clock, CheckCircle2 } from "lucide-react";

const supplyData = [
  { area: "Garut Kota", supply: 85, demand: 80 },
  { area: "Tarogong", supply: 70, demand: 75 },
  { area: "Leles", supply: 60, demand: 65 },
  { area: "Bayongbong", supply: 55, demand: 50 },
  { area: "Cibatu", supply: 40, demand: 45 },
  { area: "Karangpawitan", supply: 50, demand: 55 },
];

export default function AdminSupplyChain() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Laporan Rantai Pasok</h2>
        <p className="text-muted-foreground">Analisis supply & demand bahan pangan per area</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Efisiensi Pasok" value="92%" icon={CheckCircle2} color="green" trend={3} />
        <StatCard title="Lead Time" value="2.3 hari" icon={Clock} color="blue" trend={-5} trendLabel="lebih cepat" />
        <StatCard title="Fill Rate" value="96%" icon={Package} color="yellow" trend={2} />
        <StatCard title="On-Time Delivery" value="94%" icon={Truck} color="purple" trend={4} />
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Supply vs Demand per Area (ton)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="supply" fill="hsl(var(--primary))" name="Supply" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demand" fill="hsl(var(--chart-4))" name="Demand" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}