import React from "react";
import ChatPanel from "@/components/shared/ChatPanel";

export default function SupplierChat() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Chat Admin</h2>
        <p className="text-muted-foreground">Komunikasi langsung dengan admin SMART MBG</p>
      </div>
      <ChatPanel title="Chat Admin SMART MBG" receiverRole="admin" senderRole="supplier" channelId="admin-supplier" />
    </div>
  );
}