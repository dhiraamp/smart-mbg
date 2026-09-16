import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, Users, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const formatRp = (n) => Number(n || 0).toLocaleString("id-ID");

export default function StockAlertPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchAlerts();
    const unsub = base44.entities.StockAlert.subscribe((event) => {
      if (event.type === "create") setAlerts(prev => [event.data, ...prev]);
      else if (event.type === "update") setAlerts(prev => prev.map(a => a.id === event.id ? event.data : a));
      else if (event.type === "delete") setAlerts(prev => prev.filter(a => a.id !== event.id));
    });
    return unsub;
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    const data = await base44.entities.StockAlert.filter({ status: "active" }, "-created_date", 50);
    setAlerts(data);
    setLoading(false);
  };

  const runCheck = async () => {
    setChecking(true);
    try {
      const res = await base44.functions.invoke("checkStockAlerts", {});
      toast({ title: `✅ Pengecekan selesai: ${res.data?.message || "OK"}` });
      fetchAlerts();
    } catch (e) {
      toast({ title: "Gagal memeriksa stok", variant: "destructive" });
    }
    setChecking(false);
  };

  const dismissAlert = async (id) => {
    await base44.entities.StockAlert.update(id, { status: "dismissed" });
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast({ title: "Alert diabaikan" });
  };

  const resolveAlert = async (id) => {
    await base44.entities.StockAlert.update(id, { status: "resolved" });
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast({ title: "Alert ditandai selesai" });
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-4 border-red-400 border-t-transparent rounded-full" /></div>;

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-600" />
            Alert Kekurangan Stok
            {alerts.length > 0 && (
              <Badge className="bg-red-100 text-red-700 animate-pulse">{alerts.length} Alert Aktif</Badge>
            )}
          </CardTitle>
          <Button size="sm" variant="outline" onClick={runCheck} disabled={checking} className="h-7 text-xs">
            <RefreshCw className={`w-3 h-3 mr-1 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Memeriksa..." : "Periksa Sekarang"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Deteksi otomatis bahan pangan yang stoknya tidak mencukupi kebutuhan SPPG minggu ini
        </p>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
            <p className="text-sm font-medium text-green-600">Semua stok mencukupi kebutuhan SPPG</p>
            <p className="text-xs mt-1">Klik "Periksa Sekarang" untuk memperbarui analisis</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-xl border ${alert.alert_type === "shortage" ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTriangle className={`w-4 h-4 ${alert.alert_type === "shortage" ? "text-red-600" : "text-orange-600"}`} />
                    <span className="font-bold text-sm">{alert.product_name}</span>
                    <Badge variant="outline" className={`text-xs ${alert.alert_type === "shortage" ? "bg-red-100 text-red-700 border-red-200" : "bg-orange-100 text-orange-700 border-orange-200"}`}>
                      {alert.alert_type === "shortage" ? "Stok Kurang!" : "Berpotensi Habis"}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-white">{alert.week_label}</Badge>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-green-700 hover:bg-green-100" onClick={() => resolveAlert(alert.id)}>Selesai</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-muted-foreground hover:bg-gray-100" onClick={() => dismissAlert(alert.id)}>Abaikan</Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-muted-foreground">Dibutuhkan</p>
                    <p className="font-bold text-red-700">{formatRp(alert.total_needed)} {alert.unit}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-muted-foreground">Stok Ada</p>
                    <p className="font-bold text-blue-700">{formatRp(alert.stock_available)} {alert.unit}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/70">
                    <p className="text-muted-foreground">Kekurangan</p>
                    <p className="font-bold text-red-800">{formatRp(alert.shortage)} {alert.unit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Users className="w-3 h-3" />
                  <span>{alert.sppg_count} SPPG membutuhkan bahan ini:</span>
                </div>
                {Array.isArray(alert.affected_sppg) && (
                  <div className="flex flex-wrap gap-1">
                    {alert.affected_sppg.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-white">
                        {s.sppg_name} ({s.qty_needed} {alert.unit})
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-xs text-amber-700 font-medium">
                    ⚠️ Saran: Hubungi SPPG di atas untuk mengganti menu yang menggunakan <strong>{alert.product_name}</strong> dengan alternatif yang tersedia.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}