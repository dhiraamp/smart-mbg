import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:26px;height:26px;background:#059669;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

const DEFAULT_CENTER = { lat: -7.2275, lng: 107.9028 };

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) });
    },
  });
  return null;
}

export default function MapPicker({ value, onChange }) {
  const center = value || DEFAULT_CENTER;

  return (
    <div className="h-44 rounded-xl overflow-hidden border border-gray-200 relative">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ClickHandler onPick={onChange} />
        {value && <Marker position={value} icon={pinIcon} />}
      </MapContainer>
      <span className="absolute bottom-2 left-2 z-[500] text-[10px] font-medium text-emerald-700 bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow-sm pointer-events-none">
        {value ? `Pin: ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : "Klik peta untuk pin lokasi"}
      </span>
    </div>
  );
}
