// Penyimpanan sementara (simulasi backend) untuk alamat & pesanan Warga.
// Data disimpan per-user (keyed by email) di localStorage.
// Catatan: tidak ada entity "Address"/"Order Warga" di skema Base44 saat ini.
// Jika entity tersebut dibuat di dashboard, ganti fungsi ini dengan base44.entities.*.

const addrKey = (email) => `warga_addresses_${email}`;
const orderKey = (email) => `warga_orders_${email}`;

export function getAddresses(email) {
  if (!email) return [];
  try { return JSON.parse(localStorage.getItem(addrKey(email)) || "[]"); } catch { return []; }
}

export function saveAddresses(email, list) {
  if (!email) return;
  localStorage.setItem(addrKey(email), JSON.stringify(list));
}

export function addAddress(email, addr) {
  const list = getAddresses(email);
  const isFirst = list.length === 0;
  const item = {
    id: `addr-${Date.now()}`,
    label: addr.label || "Lainnya",
    recipient_name: addr.recipient_name || "",
    phone: addr.phone || "",
    full_address: addr.full_address || "",
    village: addr.village || "",
    district: addr.district || "",
    regency: addr.regency || "Kabupaten Garut",
    postal_code: addr.postal_code || "",
    notes: addr.notes || "",
    lat: addr.lat ?? null,
    lng: addr.lng ?? null,
    is_primary: isFirst || !!addr.is_primary,
  };
  const updated = isFirst
    ? [item]
    : item.is_primary
      ? list.map(a => ({ ...a, is_primary: false })).concat(item)
      : [...list, item];
  saveAddresses(email, updated);
  return item;
}

export function updateAddress(email, id, patch) {
  let list = getAddresses(email).map(a => a.id === id ? { ...a, ...patch } : a);
  if (patch.is_primary) {
    list = list.map(a => ({ ...a, is_primary: a.id === id }));
  }
  saveAddresses(email, list);
  return list;
}

export function removeAddress(email, id) {
  let list = getAddresses(email).filter(a => a.id !== id);
  if (list.length && !list.some(a => a.is_primary)) {
    list[0].is_primary = true;
  }
  saveAddresses(email, list);
  return list;
}

export function setPrimaryAddress(email, id) {
  const list = getAddresses(email).map(a => ({ ...a, is_primary: a.id === id }));
  saveAddresses(email, list);
  return list;
}

export function getPrimaryAddress(email) {
  const list = getAddresses(email);
  return list.find(a => a.is_primary) || list[0] || null;
}

export function getOrders(email) {
  if (!email) return [];
  try { return JSON.parse(localStorage.getItem(orderKey(email)) || "[]"); } catch { return []; }
}

export function saveOrder(email, order) {
  if (!email) return;
  const list = getOrders(email);
  localStorage.setItem(orderKey(email), JSON.stringify([order, ...list]));
}

// Pemetaan status Order (base44) ke label yang ditampilkan ke warga
export const REMOTE_STATUS_LABEL = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Diproses",
  processing: "Diproses",
  shipping: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
};

export function updateOrder(email, orderId, patch) {
  const list = getOrders(email).map(o => o.id === orderId ? { ...o, ...patch } : o);
  localStorage.setItem(orderKey(email), JSON.stringify(list));
  return list;
}

// Ubah Order dari rantai pasok (base44) menjadi bentuk tampilan warga,
// agar pesanan yang dibuat via checkout tetap muncul di "Pesanan Saya"
// meskipun tidak tersimpan di daftar lokal.
export function remoteToWargaOrder(r) {
  const deliveryFee = Number(r.delivery_fee || 0);
  const total = Number(r.total ?? r.total_amount ?? 0);
  const subtotal = Number(r.subtotal ?? (total > deliveryFee ? total - deliveryFee : total));

  // Ambil tracking array dari remote jika ada
  let trackingList = [];
  if (Array.isArray(r.tracking) && r.tracking.length > 0) {
    trackingList = r.tracking.map((t) => ({
      label: t.label || t.status || t.note || "Pesanan diproses",
      time: t.time || (t.at ? new Date(t.at).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"),
      done: true,
      status: t.status || t.label,
      note: t.note || "",
    }));
  }

  // Parse alamat
  let addressObj = {};
  if (r.mitra_address) {
    addressObj = {
      full_address: r.mitra_address,
      regency: r.delivery_area || "Kabupaten Garut",
      recipient_name: r.mitra_name || "",
    };
  } else if (r.address && typeof r.address === "object") {
    addressObj = r.address;
  }

  return {
    id: r.id,
    order_number: r.order_number,
    email: r.customer_email || r.mitra_email || r.mitra_id || "",
    customer_name: r.mitra_name || "Warga",
    supplier_name: r.supplier_name || "Supplier Utama",
    driver: r.driver || null,
    items: r.items || [],
    subtotal,
    delivery_fee: deliveryFee,
    grand_total: total,
    payment_method: r.payment_method || "-",
    status: REMOTE_STATUS_LABEL[r.status] || r.status || "Menunggu Konfirmasi",
    remote_status: r.status,
    remote_id: r.id,
    created_at: r.created_date
      ? new Date(r.created_date).toLocaleString("id-ID", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",
    created_iso: r.created_date || "",
    address: addressObj,
    tracking: trackingList,
    remote: true,
  };
}

// Sinkronisasi otomatis pesanan lokal yang belum tersimpan di Supabase Cloud
export async function syncLocalWargaOrders(email, base44) {
  if (!email || !base44?.entities?.Order) return;
  try {
    const local = getOrders(email);
    if (!local || local.length === 0) return;

    const remote = await base44.entities.Order.filter({ customer_email: email });
    const remoteNumbers = new Set((remote || []).map((r) => r.order_number));

    for (const l of local) {
      if (l.order_number && !remoteNumbers.has(l.order_number)) {
        try {
          await base44.entities.Order.create({
            order_number: l.order_number,
            status: l.remote_status || "pending",
            customer_role: "penerima",
            customer_email: email,
            mitra_id: email,
            mitra_name: l.address?.recipient_name || email.split("@")[0] || "Warga",
            supplier_name: l.items?.[0]?.supplier_name || "Supplier Utama",
            supplier_id: l.items?.[0]?.supplier_id || "supplier@demo.local",
            total: l.grand_total || l.subtotal || 0,
            subtotal: l.subtotal || 0,
            delivery_fee: l.delivery_fee || 0,
            payment_method: l.payment_method || "COD",
            items: l.items || [],
            tracking: l.tracking || [
              {
                status: "Menunggu Konfirmasi",
                label: "Pesanan dibuat",
                at: l.created_iso || new Date().toISOString(),
                done: true,
              },
            ],
            created_date: l.created_iso || new Date().toISOString(),
          });
        } catch (e) {
          console.warn("Auto-sync pesanan lokal warga gagal untuk", l.order_number, e);
        }
      }
    }
  } catch (err) {
    console.warn("Gagal menjalankan syncLocalWargaOrders:", err);
  }
}
