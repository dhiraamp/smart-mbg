import React from "react";
import DigitalServicesHub from "@/components/shared/DigitalServicesHub";

export default function LogistikDigitalServices() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Layanan Digital</h2>
        <p className="text-muted-foreground">Akses layanan digital dan pembiayaan untuk kebutuhan Anda</p>
      </div>
      <DigitalServicesHub />
    </div>
  );
}