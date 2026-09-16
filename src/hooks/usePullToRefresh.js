import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Native-style pull-to-refresh hook.
 * Returns { isRefreshing, pullDistance, containerRef }
 * Calls `onRefresh` when user pulls down past threshold.
 */
export function usePullToRefresh(onRefresh, { threshold = 72 } = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const pulling = useRef(false);

  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPullDistance(0);
    try { await onRefresh(); } finally { setIsRefreshing(false); }
  }, [onRefresh]);

  useEffect(() => {
    const el = containerRef.current || window;

    const onTouchStart = (e) => {
      // Only pull when already scrolled to top
      const scrollTop = containerRef.current
        ? containerRef.current.scrollTop
        : window.scrollY;
      if (scrollTop > 0) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    };

    const onTouchMove = (e) => {
      if (!pulling.current || isRefreshing) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0) { setPullDistance(0); return; }
      // Rubber-band dampening
      setPullDistance(Math.min(delta * 0.45, threshold * 1.5));
    };

    const onTouchEnd = () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (pullDistance >= threshold) {
        triggerRefresh();
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isRefreshing, pullDistance, threshold, triggerRefresh]);

  return { isRefreshing, pullDistance, containerRef };
}