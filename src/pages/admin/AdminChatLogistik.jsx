import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ChatPanel from "@/components/shared/ChatPanel";
import { Badge } from "@/components/ui/badge";
import { Truck, ChevronRight } from "lucide-react";

export default function AdminChatLogistik() {
  const [logistiks, setLogistiks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.UserProfile.filter({ role: "logistik" }).then((data) => {
      setLogistiks(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Chat Logistik</h2>
        <p className="text-muted-foreground">Komunikasi dengan armada logistik</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daftar Logistik */}
        <div className="md:col-span-1 border rounded-xl overflow-hidden bg-card shadow-sm">
          <div className="px-4 py-3 border-b bg-muted/40 flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Daftar Logistik</span>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : logistiks.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Belum ada logistik terdaftar</p>
          ) : (
            <div className="divide-y">
              {logistiks.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelected(l)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 hover:bg-muted/50 transition-colors ${
                    selected?.id === l.id ? "bg-primary/5 border-l-4 border-primary" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{l.organization_name || l.full_name || l.user_email}</p>
                    <p className="text-xs text-muted-foreground truncate">{l.user_email}</p>
                    {l.area && <Badge variant="outline" className="text-[10px] mt-1">{l.area}</Badge>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Panel Chat */}
        <div className="md:col-span-2">
          {selected ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Chat dengan: <span className="font-semibold text-foreground">{selected.organization_name || selected.full_name || selected.user_email}</span>
              </p>
              <ChatPanel
                key={selected.id}
                title={selected.organization_name || selected.full_name || selected.user_email}
                senderRole="admin"
                receiverRole="logistik"
                channelId={`admin-logistik-${selected.user_email}`}
              />
            </div>
          ) : (
            <div className="h-[500px] flex items-center justify-center border rounded-xl bg-muted/20">
              <div className="text-center text-muted-foreground">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Pilih logistik untuk memulai chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}