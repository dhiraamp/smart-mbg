import React from "react";
import MonthlyReport from "@/components/shared/MonthlyReport";
import StatCard from "@/components/shared/StatCard";
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AdminFinancial() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Laporan Keuangan Bulanan</h2>
        <p className="text-muted-foreground">Ringkasan keuangan dan stok SMART MBG</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="Rp 384jt" icon={TrendingUp} color="green" trend={12} />
        <StatCard title="Total Pengeluaran" value="Rp 210jt" icon={ArrowDownRight} color="red" trend={8} />
        <StatCard title="Laba Bersih" value="Rp 174jt" icon={Wallet} color="blue" trend={18} />
        <StatCard title="Transaksi" value="895" icon={ArrowUpRight} color="yellow" trend={15} />
      </div>
      <MonthlyReport title="Grafik Pendapatan vs Pengeluaran" />
      <MonthlyReport title="Trend Keuangan" type="line" />
    </div>
  );
}