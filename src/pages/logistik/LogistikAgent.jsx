import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Truck, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function LogistikAgent() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initConversation = async () => {
    setLoading(true);
    const convs = await base44.agents.listConversations({ agent_name: "logistik_agent" });
    let conv;
    if (convs.length > 0) {
      conv = await base44.agents.getConversation(convs[0].id);
    } else {
      conv = await base44.agents.createConversation({
        agent_name: "logistik_agent",
        metadata: { name: "Asisten Logistik" },
      });
    }
    setConversation(conv);
    setMessages(conv.messages || []);
    setLoading(false);

    base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
    });
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    await base44.agents.addMessage(conversation, { role: "user", content: text });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2"><Bot className="w-6 h-6 text-primary" /> Asisten AI Logistik</h2>
        <p className="text-muted-foreground text-sm">Tanyakan tentang pesanan, rute pengiriman, atau status operasional</p>
      </div>

      <Card className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <Truck className="w-4 h-4 text-primary" />
            AI Asisten Logistik SMART MBG
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "55vh" }}>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Bot className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Halo! Saya asisten AI logistik Anda.</p>
              <p className="text-xs text-muted-foreground">Tanya tentang pesanan, rute, atau status pengiriman.</p>
            </div>
          ) : messages.filter(m => m.role !== "system").map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
              {msg.role !== "user" && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 border text-foreground"
              }`}>
                {msg.role === "user" ? (
                  <p>{msg.content}</p>
                ) : (
                  <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted/60 border rounded-2xl px-4 py-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>
        <div className="p-4 border-t flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan tentang pengiriman..."
            disabled={sending || loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={sending || loading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}