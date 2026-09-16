import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

const typeColors = {
  new_order: "bg-blue-50 border-blue-200",
  order_update: "bg-green-50 border-green-200",
  stock_alert: "bg-red-50 border-red-200",
  info: "bg-gray-50 border-gray-200",
};

const typeIcons = {
  new_order: "🛒",
  order_update: "📦",
  stock_alert: "⚠️",
  job_application: "🧑‍💼",
  complaint: "🗣️",
  info: "ℹ️",
};

const roleDefaultLink = {
  supplier: "/supplier/orders",
  mitra: "/mitra/orders",
  logistik: "/logistik/dashboard",
  admin: "/admin/dashboard",
  penerima: "/warga/pesanan",
};

export default function NotificationBell({ userRole, userEmail, variant = "dark" }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const light = variant === "light";

  const unread = notifications.filter(
    (n) => !n.read_by?.includes(userEmail)
  );

  useEffect(() => {
    if (!userRole) return;

    const load = async () => {
      const all = await base44.entities.Notification.list("-created_date", 30);
      const mine = all.filter((n) => n.target_roles?.includes(userRole));
      setNotifications(mine);
    };

    load();

    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.type === "create") {
        const n = event.data;
        if (n?.target_roles?.includes(userRole)) {
          setNotifications((prev) => [n, ...prev].slice(0, 30));
        }
      }
    });

    return () => unsub();
  }, [userRole]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    const unreadNots = notifications.filter((n) => !n.read_by?.includes(userEmail));
    await Promise.all(
      unreadNots.map((n) =>
        base44.entities.Notification.update(n.id, {
          read_by: [...(n.read_by || []), userEmail],
        })
      )
    );
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read_by: n.read_by?.includes(userEmail) ? n.read_by : [...(n.read_by || []), userEmail],
      }))
    );
  };

  const openNotification = async (n) => {
    setOpen(false);
    if (!n.read_by?.includes(userEmail)) {
      try {
        await base44.entities.Notification.update(n.id, {
          read_by: [...(n.read_by || []), userEmail],
        });
        setNotifications((prev) =>
          prev.map((x) =>
            x.id === n.id ? { ...x, read_by: [...(x.read_by || []), userEmail] } : x
          )
        );
      } catch {
        /* noop */
      }
    }
    navigate(n.link || roleDefaultLink[userRole] || "/");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative p-2 rounded-xl transition-colors ${light ? "hover:bg-gray-100" : "hover:bg-white/10"}`}
      >
        <Bell className={`w-5 h-5 ${light ? "text-gray-600" : "text-white"}`} />
        {unread.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-border z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">Notifikasi</span>
              {unread.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Tidak ada notifikasi
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = n.read_by?.includes(userEmail);
                  return (
                    <button
                      key={n.id}
                      onClick={() => openNotification(n)}
                      className={`w-full text-left px-4 py-3 flex gap-3 transition-colors cursor-pointer hover:bg-gray-50 ${isRead ? "opacity-60" : "bg-blue-50/40"}`}
                    >
                      <span className="text-lg mt-0.5">{typeIcons[n.type] || "🔔"}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold truncate">{n.title}</span>
                        <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</span>
                        <span className="block text-[10px] text-muted-foreground mt-1">
                          {new Date(n.created_date).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </span>
                      {!isRead && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}