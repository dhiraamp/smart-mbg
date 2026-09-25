import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Konfigurasi Optimal TanStack Query v5 — Smart MBG Garut
 * 
 * Fitur:
 * 1. Stale Time 5 Menit: Navigasi antar modul (Mitra, Supplier, Logistik, Admin) berjalan instan tanpa jitter/loading ulang
 * 2. Garbage Collection Time (gcTime) 30 Menit: Memori cache awet saat user multitasking
 * 3. Smart Network Reconnect: Otomatis sinkronisasi ulang saat jaringan pulih
 * 4. Factory Standarisasi Query Keys untuk konsistensi invalidasi cache
 */

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 menit data dianggap segar (fresh)
      gcTime: 1000 * 60 * 30,    // 30 menit disimpan di memori
      refetchOnWindowFocus: false, // Hindari reload saat ganti window
      refetchOnReconnect: true,   // Refetch otomatis saat internet kembali online
      retry: (failureCount, error) => {
        // Jangan retry untuk error 404 atau 401
        if (error?.status === 404 || error?.status === 401) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Factory Query Keys Terpusat
 */
export const QUERY_KEYS = {
  products: (filter = 'all') => ['products', filter],
  productDetail: (id) => ['product', id],
  sppgList: (kecamatan = 'all') => ['sppg_list', kecamatan],
  sppgDetail: (id) => ['sppg_detail', id],
  orders: (role, userEmail) => ['orders', role, userEmail || 'all'],
  orderDetail: (id) => ['order_detail', id],
  bapoktingPrices: () => ['bapokting_prices'],
  syncStatus: () => ['mister_mbg_sync_status'],
  warehouseStock: (category = 'all') => ['warehouse_stock', category],
  userProfile: (email) => ['user_profile', email],
  ratings: (role, targetId) => ['ratings', role, targetId],
};

/**
 * Helper untuk invalidasi cache entitas setelah mutasi / pembaruan data
 */
export const invalidateEntityQueries = (entityKey) => {
  return queryClientInstance.invalidateQueries({
    queryKey: Array.isArray(entityKey) ? entityKey : [entityKey],
  });
};

/**
 * Hook Terpadu: Mengambil Katalog Produk Marketplace MBG dengan Caching
 */
export function useProductsQuery(filter = 'all', options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.products(filter),
    queryFn: async () => {
      const data = await base44.entities.Product.list("-created_date", 100);
      const activeOnly = data.filter((p) => p.status === "active");
      return activeOnly.length > 0 ? activeOnly : data;
    },
    ...options,
  });
}

/**
 * Hook Terpadu: Mengambil 624 Dapur SPPG Garut Terintegrasi Mister MBG
 */
export function useSppgQuery(kecamatan = 'all', options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.sppgList(kecamatan),
    queryFn: async () => {
      try {
        const response = await fetch('/src/data/mister_mbg_live_synced.json');
        if (!response.ok) throw new Error('File sync tidak ditemukan');
        const json = await response.json();
        const list = json.data?.mitra || [];
        if (kecamatan !== 'all') {
          return list.filter((s) => s.kecamatan?.toLowerCase() === kecamatan.toLowerCase());
        }
        return list;
      } catch (e) {
        // Fallback jika fetch lokal gagal
        return [];
      }
    },
    staleTime: 1000 * 60 * 15, // SPPG statis segar selama 15 menit
    ...options,
  });
}

/**
 * Hook Terpadu: Memeriksa Status Live Sync Portal Mister MBG Disperindag Garut
 */
export function useMisterMbgStatusQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.syncStatus(),
    queryFn: async () => {
      try {
        const response = await fetch('/src/data/mister_mbg_sync_status.json');
        if (!response.ok) {
          return {
            status: 'cached_fallback',
            is_online: false,
            total_sppg: 624,
            total_commodities: 24,
            last_synced_at: new Date().toISOString(),
          };
        }
        return await response.json();
      } catch (err) {
        return {
          status: 'cached_fallback',
          is_online: false,
          total_sppg: 624,
          total_commodities: 24,
          last_synced_at: new Date().toISOString(),
        };
      }
    },
    refetchInterval: 1000 * 60 * 2, // Auto-poll status setiap 2 menit
    ...options,
  });
}

/**
 * Hook Terpadu: Mengambil Pesanan Berdasarkan Role & Caching
 */
export function useOrdersQuery(role = 'all', userEmail = '', options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.orders(role, userEmail),
    queryFn: async () => {
      const allOrders = await base44.entities.Order.list("-created_date", 150);
      if (!userEmail) return allOrders;
      return allOrders.filter((o) => {
        if (role === 'mitra') return o.created_by === userEmail || o.mitra_id === userEmail;
        if (role === 'supplier') return o.supplier_id === userEmail;
        if (role === 'logistik') return o.logistic_id === userEmail;
        return true;
      });
    },
    staleTime: 1000 * 30, // Pesanan segar selama 30 detik
    ...options,
  });
}

/**
 * Prefetch Helper untuk Master Data di awal booting aplikasi
 */
export async function prefetchMasterData() {
  try {
    await Promise.all([
      queryClientInstance.prefetchQuery({
        queryKey: QUERY_KEYS.products('all'),
        queryFn: () => base44.entities.Product.list("-created_date", 50),
      }),
      queryClientInstance.prefetchQuery({
        queryKey: QUERY_KEYS.syncStatus(),
        queryFn: async () => {
          const res = await fetch('/src/data/mister_mbg_sync_status.json');
          return res.ok ? await res.json() : null;
        },
      }),
    ]);
  } catch (e) {
    // Non-blocking prefetch failure
  }
}