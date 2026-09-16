import React from "react";
import MonthlyReport from "@/components/shared/MonthlyReport";
import StatCard from "@/components/shared/StatCard";
import { TrendingUp, Wallet, ArrowUpRight } from "lucide-react";

export default function SupplierIncome() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Laporan Pendapatan</h2>
        <p className="text-muted-foreground">Ringkasan pendapatan per bulan</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Pendapatan" value="Rp 24.5jt" icon={TrendingUp} color="green" trend={12} />
        <StatCard title="Transaksi Bulan Ini" value="32" icon={Wallet} color="blue" trend={8} />
        <StatCard title="Rata-rata Per Pesanan" value="Rp 765rb" icon={ArrowUpRight} color="yellow" trend={5} />
      </div>
      <MonthlyReport title="Grafik Pendapatan Bulanan" />
      <MonthlyReport title="Perbandingan Pendapatan & Pengeluaran" type="line" />
    </div>
  );
}