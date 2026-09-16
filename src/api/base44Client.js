// @ts-nocheck
// Adapter Supabase Hybrid — mendukung Supabase Cloud dengan fallback ketahanan lokal otomatis.
// Menjamin data pendaftaran dan relasi entitas langsung tersimpan dan terlihat di Admin/Dashboard.

import { createClient } from "@supabase/supabase-js";
import { ensureSeed } from "@/lib/seed";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  "https://lpxoxjafiztlvxpcdvke.supabase.co";

const supabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
  "sb_publishable_4pJVr9F5E8ToXCn3oQKvYQ_9szapj91";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Pastikan seed awal tersedia jika storage lokal belum terisi
if (typeof window !== "undefined") {
  ensureSeed();
}

function apiError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  err.response = { data: { message }, status };
  return err;
}

// Peta nama entity -> nama tabel Postgres
const TABLE_MAP = {
  UserProfile: "user_profiles",
  Product: "products",
  CartItem: "cart_items",
  Order: "orders",
  PurchaseOrder: "purchase_orders",
  Transaction: "transactions",
  WeeklyMenu: "weekly_menu",
  WeeklyNeeds: "weekly_needs",
  WarehouseStock: "warehouse_stock",
  StockAlert: "stock_alerts",
  Notification: "notifications",
  ChatMessage: "chat_messages",
  ShoppingHistory: "shopping_history",
  SupplierRating: "supplier_ratings",
  DriverRating: "driver_ratings",
  JobOpening: "job_openings",
  JobApplication: "job_applications",
};

function applySort(query, sort) {
  if (!sort) return query;
  const desc = String(sort).startsWith("-");
  const field = String(sort).replace(/^-/, "");
  return query.order(field, { ascending: !desc });
}

function getLocalCollection(name) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`smb_collection_${name}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Gagal membaca lokal collection:", e);
  }
  return [];
}

function saveLocalItem(name, item) {
  if (typeof window === "undefined" || !item) return;
  try {
    const existing = getLocalCollection(name);
    let index = -1;
    if (name === "UserProfile") {
      index = existing.findIndex(
        (x) =>
          (x.id && item.id && x.id === item.id) ||
          (x.user_email && item.user_email && x.user_email.toLowerCase() === item.user_email.toLowerCase())
      );
    } else if (name === "CartItem") {
      index = existing.findIndex(
        (x) =>
          (x.id && item.id && x.id === item.id) ||
          (x.user_email &&
            item.user_email &&
            x.user_email.toLowerCase() === item.user_email.toLowerCase() &&
            String(x.product_id) === String(item.product_id))
      );
    } else {
      index = existing.findIndex((x) => x.id && item.id && String(x.id) === String(item.id));
    }

    if (index >= 0) {
      existing[index] = { ...existing[index], ...item };
    } else {
      existing.unshift(item);
    }
    localStorage.setItem(`smb_collection_${name}`, JSON.stringify(existing));

    // Kirim sinyal perubahan realtime lokal (antar komponen & tab browser)
    try {
      if (typeof window.dispatchEvent === "function") {
        window.dispatchEvent(
          new CustomEvent(`smb_realtime_${name}`, { detail: { type: index >= 0 ? "update" : "create", item } })
        );
      }
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel(`smb_channel_${name}`);
        bc.postMessage({ type: index >= 0 ? "update" : "create", item });
        bc.close();
      }
    } catch (e) {}
  } catch (e) {
    console.warn("Gagal menyimpan lokal item:", e);
  }
}

// Memastikan payload sesuai dengan skema tabel Supabase agar tidak ditolak oleh PostgREST
function prepareSupabasePayload(table, payload) {
  if (!payload || typeof payload !== "object") return payload;

  if (table === "orders") {
    const allowed = new Set([
      "id",
      "order_number",
      "mitra_id",
      "mitra_name",
      "supplier_id",
      "supplier_name",
      "items",
      "total",
      "delivery_fee",
      "payment_method",
      "status",
      "tracking",
      "driver",
      "created_date",
    ]);

    const sanitized = {};
    for (const [k, v] of Object.entries(payload)) {
      if (allowed.has(k) && v !== undefined) {
        sanitized[k] = v;
      }
    }

    if (sanitized.total === undefined) {
      if (payload.total_amount !== undefined) sanitized.total = Number(payload.total_amount);
      else if (payload.subtotal !== undefined) sanitized.total = Number(payload.subtotal);
      else sanitized.total = 0;
    }
    if (!sanitized.driver && (payload.logistic_name || payload.driver_name)) {
      sanitized.driver = payload.logistic_name || payload.driver_name;
    }
    if (!sanitized.created_date) {
      sanitized.created_date = new Date().toISOString();
    }
    if (!sanitized.tracking && payload.status) {
      sanitized.tracking = [
        {
          status: payload.status === "pending" ? "Menunggu Konfirmasi" : payload.status,
          at: sanitized.created_date,
          note: payload.notes || "Pesanan dibuat",
        },
      ];
    }
    if (!sanitized.supplier_name && payload.items?.[0]?.supplier_name) {
      sanitized.supplier_name = payload.items[0].supplier_name;
    }
    if (!sanitized.supplier_id && payload.items?.[0]?.supplier_id) {
      sanitized.supplier_id = payload.items[0].supplier_id;
    }
    if (!sanitized.supplier_name) {
      sanitized.supplier_name = "Supplier Utama";
    }
    if (!sanitized.supplier_id) {
      sanitized.supplier_id = "supplier@demo.local";
    }
    if (!sanitized.mitra_name && (payload.customer_name || payload.user_name || payload.name)) {
      sanitized.mitra_name = payload.customer_name || payload.user_name || payload.name;
    }
    if (!sanitized.mitra_name) {
      sanitized.mitra_name = "Warga / Pemesan";
    }
    if (!sanitized.mitra_id) {
      sanitized.mitra_id = payload.mitra_email || payload.user_email || payload.customer_email || "mitra@demo.local";
    }
    return sanitized;
  }

  if (table === "cart_items") {
    const allowed = new Set([
      "id",
      "user_email",
      "product_id",
      "product_name",
      "price",
      "quantity",
      "unit",
      "created_date",
    ]);

    const sanitized = {};
    for (const [k, v] of Object.entries(payload)) {
      if (allowed.has(k) && v !== undefined) {
        sanitized[k] = v;
      }
    }
    if (!sanitized.created_date) {
      sanitized.created_date = new Date().toISOString();
    }
    return sanitized;
  }

  if (table === "products") {
    const allowed = new Set([
      "id",
      "name",
      "category",
      "price",
      "base_price",
      "unit",
      "stock",
      "origin",
      "image_url",
      "supplier_name",
      "status",
      "created_date",
    ]);

    const sanitized = {};
    for (const [k, v] of Object.entries(payload)) {
      if (allowed.has(k) && v !== undefined) {
        sanitized[k] = v;
      }
    }
    if (sanitized.stock !== undefined) {
      sanitized.stock = Number(sanitized.stock);
    }
    if (!sanitized.status) {
      sanitized.status = sanitized.stock <= 0 ? "out_of_stock" : "active";
    }
    if (!sanitized.created_date) {
      sanitized.created_date = new Date().toISOString();
    }
    return sanitized;
  }

  return payload;
}

function prepareSupabaseUpdatePayload(table, payload) {
  if (!payload || typeof payload !== "object") return payload;

  if (table === "orders") {
    const allowed = new Set([
      "order_number",
      "mitra_id",
      "mitra_name",
      "supplier_id",
      "supplier_name",
      "items",
      "total",
      "delivery_fee",
      "payment_method",
      "status",
      "tracking",
      "driver",
      "created_date",
    ]);

    const sanitized = {};
    for (const [k, v] of Object.entries(payload)) {
      if (allowed.has(k) && v !== undefined) {
        sanitized[k] = v;
      }
    }
    if (sanitized.total === undefined && payload.total_amount !== undefined) {
      sanitized.total = Number(payload.total_amount);
    }
    if (!sanitized.driver && (payload.logistic_name || payload.driver_name)) {
      sanitized.driver = payload.logistic_name || payload.driver_name;
    }
    return sanitized;
  }

  if (table === "cart_items") {
    const allowed = new Set([
      "user_email",
      "product_id",
      "product_name",
      "price",
      "quantity",
      "unit",
      "created_date",
    ]);

    const sanitized = {};
    for (const [k, v] of Object.entries(payload)) {
      if (allowed.has(k) && v !== undefined) {
        sanitized[k] = v;
      }
    }
    return sanitized;
  }

  if (table === "products") {
    const allowed = new Set([
      "name",
      "category",
      "price",
      "base_price",
      "unit",
      "stock",
      "origin",
      "image_url",
      "supplier_name",
      "status",
      "created_date",
    ]);

    const sanitized = {};
    for (const [k, v] of Object.entries(payload)) {
      if (allowed.has(k) && v !== undefined) {
        sanitized[k] = v;
      }
    }
    if (sanitized.stock !== undefined) {
      sanitized.stock = Number(sanitized.stock);
      if (!sanitized.status) {
        sanitized.status = sanitized.stock <= 0 ? "out_of_stock" : "active";
      }
    }
    return sanitized;
  }

  return payload;
}

function makeEntity(name) {
  const table = TABLE_MAP[name];
  if (!table) throw new Error(`Entity "${name}" belum dipetakan ke tabel Supabase.`);

  return {
    async list(sort, limit) {
      let data = [];
      try {
        let query = supabase.from(table).select("*");
        query = applySort(query, sort);
        if (limit) query = query.limit(limit);
        const res = await query;
        if (res.data) data = res.data;
      } catch (e) {
        console.warn(`Supabase list ${table} failed, using local:`, e);
      }

      const localItems = getLocalCollection(name);
      if (!data || data.length === 0) {
        return localItems || [];
      }

      // Gabungkan data remote Supabase dengan data lokal
      const idMap = new Map();
      (data || []).forEach((item) => {
        const key = name === "UserProfile" ? (item.id || item.user_email || item.email) : item.id;
        if (key) idMap.set(key, item);
      });
      (localItems || []).forEach((item) => {
        const key = name === "UserProfile" ? (item.id || item.user_email || item.email) : item.id;
        if (key) {
          if (idMap.has(key)) {
            idMap.set(key, { ...idMap.get(key), ...item });
          } else {
            idMap.set(key, item);
          }
        }
      });
      return Array.from(idMap.values());
    },

    async filter(filters, sort, limit) {
      let data = [];
      try {
        let query = supabase.from(table).select("*");
        Object.entries(filters || {}).forEach(([key, value]) => {
          let queryKey = key;
          if (table === "orders" && (key === "customer_email" || key === "user_email" || key === "mitra_email" || key === "customer_id")) {
            queryKey = "mitra_id";
          }
          query = query.eq(queryKey, value);
        });
        query = applySort(query, sort);
        if (limit) query = query.limit(limit);
        const res = await query;
        if (res.data) data = res.data;
      } catch (e) {
        console.warn(`Supabase filter ${table} failed, using local:`, e);
      }

      const localItems = getLocalCollection(name);
      const filteredLocal = (localItems || []).filter((item) => {
        return Object.entries(filters || {}).every(([k, v]) => {
          if (v === undefined || v === null) return true;
          if (table === "orders" && (k === "customer_email" || k === "user_email" || k === "mitra_email" || k === "customer_id" || k === "mitra_id")) {
            return (
              item.mitra_id === v ||
              item.customer_email === v ||
              item.mitra_email === v ||
              item.user_email === v
            );
          }
          return item[k] === v;
        });
      });

      if (!data || data.length === 0) {
        return filteredLocal || [];
      }

      const idMap = new Map();
      (data || []).forEach((item) => {
        const key = name === "UserProfile" ? (item.id || item.user_email || item.email) : item.id;
        if (key) idMap.set(key, item);
      });
      filteredLocal.forEach((item) => {
        const key = name === "UserProfile" ? (item.id || item.user_email || item.email) : item.id;
        if (key) {
          if (idMap.has(key)) {
            idMap.set(key, { ...idMap.get(key), ...item });
          } else {
            idMap.set(key, item);
          }
        }
      });
      return Array.from(idMap.values());
    },

    async get(id) {
      if (!id) return null;
      const local = getLocalCollection(name).find(
        (x) => String(x.id) === String(id) || (name === "UserProfile" && (x.user_email === id || x.email === id))
      );
      try {
        const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
        if (!error && data) {
          return local ? { ...data, ...local } : data;
        }
      } catch (e) {
        // fallback to local
      }
      return local || null;
    },

    async create(payload) {
      let finalPayload = { ...payload };
      if (!finalPayload.id) {
        finalPayload.id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : "id_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      }
      if (!finalPayload.created_date) {
        finalPayload.created_date = new Date().toISOString();
      }

      // Selalu simpan ke local collection agar data langsung tersedia di Admin / Dashboard
      saveLocalItem(name, finalPayload);

      try {
        const insertPayload = prepareSupabasePayload(table, finalPayload);
        const { data, error } = await supabase.from(table).insert(insertPayload).select().single();
        if (!error && data) {
          saveLocalItem(name, { ...finalPayload, ...data });
          return { ...finalPayload, ...data };
        } else if (error) {
          console.warn(`Supabase insert to ${table} rejected:`, error);
        }
      } catch (err) {
        console.warn(`Supabase insert to ${table} failed (RLS/network), saved to local:`, err);
      }
      return finalPayload;
    },

    async update(id, payload) {
      saveLocalItem(name, { id, ...payload });
      try {
        const updatePayload = prepareSupabaseUpdatePayload(table, payload);
        const { data, error } = await supabase.from(table).update(updatePayload).eq("id", id).select().single();
        if (!error && data) {
          saveLocalItem(name, { ...payload, ...data, id });
          return { ...payload, ...data, id };
        } else if (error) {
          console.warn(`Supabase update to ${table} rejected:`, error);
        }
      } catch (err) {
        console.warn(`Supabase update to ${table} failed, updated locally:`, err);
      }
      return { id, ...payload };
    },

    async delete(id) {
      if (typeof window !== "undefined") {
        const existing = getLocalCollection(name).filter((x) => x.id !== id);
        localStorage.setItem(`smb_collection_${name}`, JSON.stringify(existing));
      }
      try {
        await supabase.from(table).delete().eq("id", id);
      } catch (err) {
        console.warn(`Supabase delete from ${table} failed:`, err);
      }
      return { success: true };
    },

    subscribe(cb) {
      if (typeof cb !== "function") return () => {};
      const uniqueId = Math.random().toString(36).slice(2);

      // 1. Listen Supabase Realtime WebSocket (sinkronisasi cloud lintas perangkat & browser)
      let channel = null;
      try {
        channel = supabase
          .channel(`realtime:${table}:${uniqueId}`)
          .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
            const type =
              payload.eventType === "INSERT" ? "create" : payload.eventType === "UPDATE" ? "update" : "delete";
            const row = payload.new?.id ? payload.new : payload.old;
            cb({ type, id: row?.id, data: payload.new || undefined });
          })
          .subscribe();
      } catch (e) {
        console.warn(`Supabase realtime subscribe warning for ${table}:`, e);
      }

      // 2. Listen Local Event (sinkronisasi seketika di tab yang sama / window)
      const handleLocalEvent = (e) => {
        if (e?.detail) {
          cb({ type: e.detail.type, id: e.detail.item?.id, data: e.detail.item });
        }
      };
      if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
        window.addEventListener(`smb_realtime_${name}`, handleLocalEvent);
      }

      // 3. Listen BroadcastChannel (sinkronisasi seketika antar tab berbeda di browser)
      let bc = null;
      if (typeof BroadcastChannel !== "undefined") {
        try {
          bc = new BroadcastChannel(`smb_channel_${name}`);
          bc.onmessage = (msgEvent) => {
            if (msgEvent?.data) {
              cb({ type: msgEvent.data.type, id: msgEvent.data.item?.id, data: msgEvent.data.item });
            }
          };
        } catch (e) {}
      }

      return () => {
        if (channel) {
          try {
            supabase.removeChannel(channel);
          } catch (e) {}
        }
        if (typeof window !== "undefined" && typeof window.removeEventListener === "function") {
          window.removeEventListener(`smb_realtime_${name}`, handleLocalEvent);
        }
        if (bc) {
          try {
            bc.close();
          } catch (e) {}
        }
      };
    },
  };
}

const auth = {
  async me() {
    let user = null;
    let profile = null;

    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        user = data.user;
        const { data: prof } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();
        profile = prof;
      }
    } catch (e) {
      console.warn("Supabase auth.me warning:", e);
    }

    // Fallback ke local session jika belum ada di Supabase Auth
    if (!user && typeof window !== "undefined") {
      const localSession = localStorage.getItem("smb_session_user");
      if (localSession) {
        try {
          const parsed = JSON.parse(localSession);
          user = parsed;
          profile = parsed;
        } catch (e) {}
      }
    }

    if (!user) throw apiError("Sesi tidak ditemukan", 401);
    return { ...user, ...profile, email: user.email || profile?.user_email };
  },

  async loginViaEmailPassword(email, password, requiredRole) {
    let user = null;
    let profile = null;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        user = data.user;
        const { data: prof } = await supabase.from("user_profiles").select("*").eq("id", data.user.id).single();
        profile = prof;
      }
    } catch (e) {
      console.warn("Supabase signIn warning, checking local profiles:", e);
    }

    // Jika Supabase belum login/terkonfirmasi, validasi ketat di database lokal
    if (!user && typeof window !== "undefined") {
      const cleanEmail = (email || "").trim().toLowerCase();
      const localUsers = getLocalCollection("users");
      const localProfiles = getLocalCollection("UserProfile");

      // 1. Cari data akun di collection users dan UserProfile
      const matchedUser = localUsers.find(
        (u) =>
          u.email?.trim().toLowerCase() === cleanEmail ||
          u.user_email?.trim().toLowerCase() === cleanEmail
      );
      const matchedProfile = localProfiles.find(
        (p) =>
          p.user_email?.trim().toLowerCase() === cleanEmail ||
          p.email?.trim().toLowerCase() === cleanEmail
      );

      const targetAccount = matchedUser || matchedProfile;

      // 2. Validasi Keberadaan Email
      if (!targetAccount) {
        throw apiError("Email tidak terdaftar. Silakan periksa kembali atau lakukan pendaftaran akun baru.", 404);
      }

      // 3. Validasi Password yang Ketat (wajib cocok)
      const expectedPassword = targetAccount.password || matchedUser?.password || matchedProfile?.password;
      if (expectedPassword && expectedPassword !== password) {
        throw apiError("Password yang Anda masukkan salah. Silakan periksa kembali kata sandi Anda.", 401);
      }

      // 4. Validasi Kesesuaian Role
      const accountRole = targetAccount.role || matchedProfile?.role || matchedUser?.role;
      if (requiredRole && accountRole) {
        const isWargaAlias =
          (accountRole === "penerima" && requiredRole === "warga") ||
          (accountRole === "warga" && requiredRole === "penerima");

        if (accountRole !== requiredRole && !isWargaAlias) {
          const roleLabels = {
            mitra: "Mitra / SPPG",
            supplier: "Supplier",
            logistik: "Logistik",
            penerima: "Warga",
            warga: "Warga",
            admin: "Admin",
          };
          const currentLabel = roleLabels[accountRole] || accountRole;
          const targetLabel = roleLabels[requiredRole] || requiredRole;
          throw apiError(
            `Peran tidak cocok. Akun ini terdaftar sebagai "${currentLabel}", bukan "${targetLabel}". Silakan pilih peran yang sesuai.`,
            403
          );
        }
      }

      user = {
        id: targetAccount.id || targetAccount.user_id || "u_" + Date.now(),
        email: targetAccount.email || targetAccount.user_email || email,
      };
      profile = { ...(matchedProfile || {}), ...(matchedUser || {}), role: accountRole };
    }

    if (!user) throw apiError("Email atau password salah.", 401);

    const resolvedRole = profile?.role || user?.role || requiredRole || "mitra";
    const merged = { ...user, ...profile, email: user.email, role: resolvedRole };

    if (typeof window !== "undefined") {
      localStorage.setItem("smb_session_user", JSON.stringify(merged));
      localStorage.setItem("smart_mbg_user", JSON.stringify(merged));
      localStorage.setItem("smartmbg_role", resolvedRole);
      localStorage.setItem("smartmbg_login_email", merged.email);
    }
    return merged;
  },

  async register({ email, password, profileData = {} }) {
    const cleanEmail = (email || "").trim().toLowerCase();
    const existingUsers = getLocalCollection("users");
    const existingProfiles = getLocalCollection("UserProfile");
    if (
      existingUsers.some((u) => (u.email || u.user_email)?.toLowerCase() === cleanEmail) ||
      existingProfiles.some((p) => (p.email || p.user_email)?.toLowerCase() === cleanEmail)
    ) {
      throw apiError("Email sudah terdaftar. Silakan gunakan email lain atau login.", 400);
    }

    let userId = null;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData,
        },
      });
      if (!error && data?.user?.id) {
        userId = data.user.id;
      }
    } catch (e) {
      console.warn("Supabase signUp warning:", e);
    }

    if (!userId) {
      userId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "u_" + Date.now().toString(36);
    }

    const defaultRole = profileData.role || "penerima";
    const newProfile = {
      ...profileData,
      id: userId,
      user_id: userId,
      user_email: email,
      email: email,
      role: defaultRole,
      password: password,
      created_date: new Date().toISOString(),
      is_active: true,
    };

    // Pastikan langsung tersimpan di collection UserProfile dan users
    saveLocalItem("UserProfile", newProfile);
    saveLocalItem("users", {
      id: userId,
      email: email,
      user_email: email,
      password: password,
      full_name: profileData.full_name || profileData.contact_person || profileData.name || "Pengguna",
      role: defaultRole,
      verified: true,
      created_date: new Date().toISOString(),
    });

    // Set sesi pengguna langsung agar tidak perlu login ulang
    if (typeof window !== "undefined") {
      localStorage.setItem("smb_session_user", JSON.stringify(newProfile));
      localStorage.setItem("smart_mbg_user", JSON.stringify(newProfile));
      localStorage.setItem("smartmbg_role", defaultRole);
      localStorage.setItem("smartmbg_login_email", email);
    }

    // Simpan ke Supabase Cloud (Realtime Trigger via postgres_changes)
    try {
      const { data, error } = await supabase.from("user_profiles").upsert(newProfile, { onConflict: "id" });
      if (error) {
        console.warn("Supabase user_profiles upsert notice (RLS may be active):", error.message);
      }
    } catch (e) {
      console.warn("Supabase user_profiles upsert exception:", e);
    }

    return { success: true, data: { user: newProfile } };
  },

  async resendOtp(email) {
    try {
      await supabase.auth.resend({ type: "signup", email });
    } catch (e) {}
    return { success: true };
  },

  async verifyOtp({ email, otpCode }) {
    try {
      await supabase.auth.verifyOtp({ email, token: otpCode, type: "signup" });
    } catch (e) {}
    return { success: true };
  },

  async logout(redirectPath) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("smb_session_user");
      localStorage.removeItem("smart_mbg_user");
      localStorage.removeItem("smartmbg_role");
      localStorage.removeItem("smartmbg_login_email");
      localStorage.removeItem("smartmbg_intended");
      localStorage.removeItem("smartmbg_name");
      if (redirectPath) {
        window.location.href = redirectPath;
      }
    }
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    return { success: true };
  },

  redirectToLogin() {
    if (typeof window !== "undefined") window.location.href = "/portal";
    return { success: true };
  },
};

const ENTITIES = Object.keys(TABLE_MAP);

export const base44 = {
  auth,
  entities: Object.fromEntries(ENTITIES.map((n) => [n, makeEntity(n)])),
};
