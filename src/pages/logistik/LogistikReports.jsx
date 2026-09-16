import React, { useEffect, useState } from "react";
import StatCard from "@/components/shared/StatCard";
import { Truck, Clock, Package, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { base44 } from "@/api/base44Client";
import { useUserProfile } from "@/hooks/useUserProfile";

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];

export default function LogistikReports() {
  const { user } = useUserProfile();
  const [orders, setOrders] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Order.list("-created_date", 200),
      base44.entities.DriverRating.list("-created_date", 200),
    ]).then(([ord, rat]) => {
      setOrders(ord);
      setRatings(rat);
      setLoading(false);
    });
  }, []);

  // Filter pesanan milik saya
  const myOrders = orders.filter(o => o.logistic_id === user?.email);
  const delivered = myOrders.filter(o => o.status === "delivered");
  const shipping  = myOrders.filter(o => o.status === "shipping");
  const myRatings = ratings.filter(r => r.logistic_id === user?.email);
  const avgRating = myRatings.length ? (myRatings.reduce((s, r) => s + r.rating, 0) / myRatings.length).toFixed(1) : "-";

  // Data chart per bulan (tahun ini)
  const year = new Date().getFullYear();
  const monthlyData = MONTHS.map((month, i) => {
    const monthOrders = myOrders.filter(o => {
      const d = new Date(o.created_date);
      return d.getFullYear() === year && d.getMonth() === i;
    });
    return {
      month,
      pengiriman: monthOrders.length,
      selesai: monthOrders.filter(o => o.status === "delivered").length,
      nilai: monthOrders.reduce((s, o) => s + (o.total_amount || 0), 0) / 1_000_000,
    };
  });

  // Rating chart
  const ratingDist = [1, 2, 3, 4, 5].map(r => ({
    bintang: `${r}⭐`,
    jumlah: myRatings.filter(rt => rt.rating === r).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Laporan Bulanan Logistik</h2>
        <p className="text-muted-foreground">Ringkasan performa pengiriman & rating driver Anda</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Pengiriman Saya" value={myOrders.length} icon={Truck} color="blue" />
            <StatCard title="Selesai Diantar" value={delivered.length} icon={Package} color="green" />
            <StatCard title="Sedang Diantar" value={shipping.length} icon={Clock} color="yellow" />
            <StatCard title="Rating Rata-rata" value={avgRating === "-" ? "-" : `${avgRating} ⭐`} icon={Star} color="purple" />
          </div>

          {/* Chart pengiriman per bulan */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Pengiriman per Bulan ({year})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="pengiriman" name="Total Pesanan" fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="selesai" name="Selesai" fill="#22c55e" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart nilai pengiriman */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" /> Nilai Pengiriman per Bulan (juta Rp)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `Rp ${(v * 1_000_000).toLocaleString("id-ID")}`} />
                  <Line type="monotone" dataKey="nilai" name="Nilai" stroke="#3b82f6" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribusi rating */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" /> Distribusi Rating ({myRatings.length} ulasan)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myRatings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Belum ada rating</p>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={ratingDist} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="bintang" type="category" tick={{ fontSize: 11 }} width={40} />
                      <Tooltip />
                      <Bar dataKey="jumlah" name="Jumlah" fill="#f59e0b" radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Ulasan terbaru */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" /> Ulasan Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-56 overflow-y-auto">
                {myRatings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Belum ada ulasan</p>
                ) : myRatings.slice(0, 8).map((r) => (
                  <div key={r.id} className="p-2 bg-muted/30 rounded-lg border text-sm space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs">{r.mitra_name || "Mitra"}</span>
                      <span className="text-yellow-500 font-bold">{"⭐".repeat(r.rating)}</span>
                    </div>
                    {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                    <p className="text-[10px] text-muted-foreground">{r.order_number}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}