import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, color = "blue", onClick }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    red: "bg-red-50 text-red-600 border-red-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };
  const iconBg = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`p-5 transition-shadow border ${onClick ? "hover:shadow-md cursor-pointer hover:border-primary/40" : "hover:shadow-md"}`} onClick={onClick}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend !== undefined && (
              <p className={`text-xs mt-2 flex items-center gap-1 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% {trendLabel || "dari bulan lalu"}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${iconBg[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}