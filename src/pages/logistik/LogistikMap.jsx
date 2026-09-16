import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const AREA_COORDS = {
  "Garut Kota":     { lat: -7.2275, lng: 107.9028 },
  "Tarogong Kidul": { lat: -7.2450, lng: 107.8856 },
  "Tarogong Kaler": { lat: -7.2200, lng: 107.8700 },
  "Leles":          { lat: -7.1858, lng: 107.8833 },
  "Bayongbong":     { lat: -7.2856, lng: 107.9167 },
  "Cibatu":         { lat: -7.1667, lng: 107.9500 },
  "Karangpawitan":  { lat: -7.2083, lng: 107.9333 },
  "Samarang":       { lat: -7.1750, lng: 107.8667 },
  "Pasirwangi":     { lat: -7.3000, lng: 107.8500 },
};

const statusConfig = {
  pending:    { label: "Menunggu", color: "bg-yellow-50 text-yellow-700" },
  confirmed:  { label: "Dikonfirmasi", color: "bg-blue-50 text-blue-700" },
  processing: { label: "Diproses", color: "bg-indigo-50 text-indigo-700" },
  shipping:   { label: "Dikirim", color: "bg-purple-50 text-purple-700" },
  delivered:  { label: "Terkirim", color: "bg-green-50 text-green-700" },
};

export default function LogistikMap() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Order.list("-created_date", 100).then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  // Hitung area stats dari order real
  const areaStats = {};
  orders.forEach(o => {
    const area = o.delivery_area || "Garut Kota";
    if (!areaStats[area]) areaStats[area] = { count: 0, total: 0, orders: [] };
    areaStats[area].count++;
    areaStats[area].total += o.total_amount || 0;
    areaStats[area].orders.push(o);
  });

  // Gabungkan dengan koordinat
  const mapPoints = Object.entries(areaStats).map(([area, stats]) => {
    const coords = AREA_COORDS[area] || { lat: -7.2275, lng: 107.9028 };
    return { area, ...stats, ...coords };
  });

  // Fallback jika tidak ada order
  const displayPoints = mapPoints.length > 0 ? mapPoints : Object.entries(AREA_COORDS).map(([area, coords]) => ({
    area, count: 0, total: 0, orders: [], ...coords
  }));

  const totalOrders = orders.length;
  const totalShipping = orders.filter(o => o.status === "shipping").length;
  const totalDelivered = orders.filter(o => o.status === "delivered").length;

  const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Peta Sebaran Pengiriman</h2>
        <p className="text-muted-foreground">Distribusi pesanan real-time ke seluruh wilayah Kabupaten Garut</p>
      </div>

      {/* Stat ringkas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center border-blue-200 bg-blue-50">
          <p className="text-xs text-blue-600 font-semibold">Total Pesanan</p>
          <p className="text-2xl font-bold text-blue-800">{totalOrders}</p>
        </Card>
        <Card className="p-4 text-center border-purple-200 bg-purple-50">
          <p className="text-xs text-purple-600 font-semibold">Sedang Dikirim</p>
          <p className="text-2xl font-bold text-purple-800">{totalShipping}</p>
        </Card>
        <Card className="p-4 text-center border-green-200 bg-green-50">
          <p className="text-xs text-green-600 font-semibold">Terkirim</p>
          <p className="text-2xl font-bold text-green-800">{totalDelivered}</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Peta Interaktif Area Pengiriman
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[450px]">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-muted/30">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <MapContainer center={[-7.2275, 107.9028]} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {displayPoints.map((pt, i) => (
                  <React.Fragment key={i}>
                    {pt.count > 0 && (
                      <Circle
                        center={[pt.lat, pt.lng]}
                        radius={pt.count * 200}
                        pathOptions={{ color: "#3b82f6", fillColor: "#93c5fd", fillOpacity: 0.3, weight: 1 }}
                      />
                    )}
                    <Marker position={[pt.lat, pt.lng]}>
                      <Popup minWidth={200}>
                        <div className="space-y-1.5 p-1">
                          <p className="font-bold text-sm">Kec. {pt.area}</p>
                          <p className="text-sm"><Package className="inline w-3 h-3 mr-1" />{pt.count} pesanan</p>
                          {pt.count > 0 && (
                            <>
                              <p className="text-xs text-gray-500">Total nilai: {formatRp(pt.total)}</p>
                              <div className="space-y-1 max-h-28 overflow-y-auto">
                                {pt.orders.slice(0, 5).map((o, j) => (
                                  <div key={j} className="flex justify-between text-xs border-t pt-1">
                                    <span className="font-medium">{o.order_number}</span>
                                    <span className={`px-1 rounded text-xs ${statusConfig[o.status]?.color}`}>
                                      {statusConfig[o.status]?.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                ))}
              </MapContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Area breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {displayPoints.sort((a, b) => b.count - a.count).map((pt, i) => (
          <Card key={i} className="p-3 text-center hover:shadow-md transition-shadow">
            <MapPin className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="font-semibold text-xs truncate">Kec. {pt.area}</p>
            <p className="text-2xl font-bold text-primary">{pt.count}</p>
            <p className="text-[10px] text-muted-foreground">pesanan</p>
            {pt.count > 0 && <p className="text-[10px] text-muted-foreground">{formatRp(pt.total)}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}