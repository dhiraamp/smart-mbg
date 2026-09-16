import React from "react";
import { RefreshCw } from "lucide-react";

export default function PullToRefreshIndicator({ pullDistance, isRefreshing, threshold = 72 }) {
  const progress = Math.min(pullDistance / threshold, 1);
  const visible = pullDistance > 4 || isRefreshing;

  if (!visible) return null;

  return (
    <div
      className="fixed top-14 left-0 right-0 z-40 flex justify-center pointer-events-none"
      style={{ transform: `translateY(${isRefreshing ? 12 : pullDistance * 0.5}px)`, transition: isRefreshing ? "transform 0.2s ease" : "none" }}
    >
      <div className="bg-card border border-border rounded-full shadow-lg p-2.5">
        <RefreshCw
          className="w-5 h-5 text-primary"
          style={{
            transform: `rotate(${progress * 360}deg)`,
            transition: isRefreshing ? "none" : "transform 0.05s linear",
            animation: isRefreshing ? "spin 0.6s linear infinite" : "none",
          }}
        />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}