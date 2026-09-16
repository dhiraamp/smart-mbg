import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ChatPanel({ title = "Chat Admin", receiverRole = "admin", senderRole = "admin", channelId = null }) {
  const channel = channelId || `admin-${receiverRole}`;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    // Load initial messages for this channel
    base44.entities.ChatMessage.filter({ channel }, "-created_date", 50).then((msgs) => {
      setMessages((msgs || []).reverse());
    });

    // Subscribe to real-time updates
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.channel === channel) {
        if (event.type === "create") {
          setMessages(prev => [...prev, event.data]);
        }
      }
    });
    return () => unsub();
  }, [channel]);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await base44.entities.ChatMessage.create({
      sender_role: senderRole,
      receiver_role: receiverRole,
      message: text,
      channel,
      read: false,
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">Belum ada pesan. Mulai percakapan...</p>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender_role === senderRole;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"
                  }`}>
                    {!isMe && <p className="text-[10px] font-semibold mb-0.5 opacity-70 capitalize">{msg.sender_role}</p>}
                    <p>{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {formatTime(msg.created_date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="p-3 border-t flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan..."
            onKeyDown={(e) => e.key === "Enter" && send()} className="flex-1" />
          <Button size="icon" onClick={send} className="bg-primary hover:bg-primary/90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}