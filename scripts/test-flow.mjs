// Test alur: seed -> register -> OTP -> login -> me() -> redirect role -> entity CRUD -> logout.
// Menjalankan adapter & seed asli aplikasi (bukan tiruan), dengan shim localStorage + window.
// Jalankan:  node --experimental-loader ./scripts/alias-loader.mjs scripts/test-flow.mjs
//
// Cara menjalankan via npm (PowerShell diblokir, gunakan cmd):
//   cmd /c "node --experimental-loader ./scripts/alias-loader.mjs scripts/test-flow.mjs"

import { pathToFileURL } from "node:url";

let pass = 0;
let fail = 0;
const results = [];

function assert(name, cond, extra = "") {
  if (cond) {
    pass++;
    results.push(`PASS  ${name}`);
  } else {
    fail++;
    results.push(`FAIL  ${name} ${extra}`);
  }
}

function storageMock() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(String(k)) ? String(store.get(String(k))) : null),
    setItem: (k, v) => store.set(String(k), String(v)),
    removeItem: (k) => store.delete(String(k)),
    clear: () => store.clear(),
  };
}

globalThis.localStorage = storageMock();
const eventListeners = {};
globalThis.window = {
  location: { href: "http://localhost:5173/" },
  history: { replaceState() {}, pushState() {} },
  addEventListener(ev, fn) {
    if (!eventListeners[ev]) eventListeners[ev] = [];
    eventListeners[ev].push(fn);
  },
  removeEventListener(ev, fn) {
    if (eventListeners[ev]) eventListeners[ev] = eventListeners[ev].filter((f) => f !== fn);
  },
  dispatchEvent(ev) {
    if (eventListeners[ev?.type]) {
      eventListeners[ev.type].forEach((fn) => fn(ev));
    }
  },
};

globalThis.CustomEvent = class {
  constructor(type, init) {
    this.type = type;
    this.detail = init?.detail;
  }
};

const { ensureSeed } = await import("@/lib/seed");
const { base44 } = await import("@/api/base44Client");
const { getDashboardPath, logoutUser } = await import("@/lib/rolePaths");

// ---------- 1. SEED ----------
const seedUsers = JSON.parse(globalThis.localStorage.getItem("smb_collection_users") || "[]");
assert("Seed: akun demo tersedia (>=4)", seedUsers.length >= 4, `(actual ${seedUsers.length})`);

const products = await base44.entities.Product.list();
assert("Seed: Product terisi (>=15)", products.length >= 15, `(actual ${products.length})`);

// ---------- 2. REGISTER ----------
const NEW_EMAIL = "flowtest@demo.local";
const NEW_PASS = "Pass1234!";

let regOk = true;
try {
  await base44.auth.register({ email: NEW_EMAIL, password: NEW_PASS });
} catch (e) {
  regOk = false;
}
assert("Register: user baru berhasil", regOk);

let dupBlocked = false;
try {
  await base44.auth.register({ email: NEW_EMAIL, password: NEW_PASS });
} catch (e) {
  dupBlocked = true;
}
assert("Register: email ganda ditolak", dupBlocked);

// ---------- 3. OTP ----------
let otpOk = true;
try {
  await base44.auth.verifyOtp({ email: NEW_EMAIL, otpCode: "000000" });
} catch (e) {
  otpOk = false;
}
assert("OTP: verifikasi kode diterima (simulasi)", otpOk);

// ---------- 4. LOGIN (password salah dulu) ----------
let wrongLogin = false;
try {
  await base44.auth.loginViaEmailPassword(NEW_EMAIL, "salah");
} catch (e) {
  wrongLogin = true;
}
assert("Login: password salah ditolak", wrongLogin);

// ---------- 5. LOGIN (berhasil) ----------
let loginUser = null;
try {
  loginUser = await base44.auth.loginViaEmailPassword(NEW_EMAIL, NEW_PASS);
} catch (e) {
  loginUser = null;
}
assert("Login: email+password benar berhasil", !!loginUser);
assert("Login: sesi tersimpan (smart_mbg_user)", !!globalThis.localStorage.getItem("smart_mbg_user"));

const me = await base44.auth.me();
assert("me(): mengembalikan user yang login", me?.email === NEW_EMAIL);
assert("me(): role default penerima", me?.role === "penerima", `(actual ${me?.role})`);

// ---------- 6. REDIRECT SETELAH LOGIN (logika Portal.handleLogin) ----------
// Aturan: setiap role -> dashboard masing-masing (dibedakan per role).
// '/ ' (root) adalah portal publik, tanpa login.
const loginRedirect = (role, intended) => intended ?? getDashboardPath(role);

const expected = {
  mitra: "/mitra/dashboard",
  supplier: "/supplier/dashboard",
  logistik: "/logistik/dashboard",
  penerima: "/marketplace",
  admin: "/admin/dashboard",
};
let allRedirectOk = true;
for (const [role, path] of Object.entries(expected)) {
  const got = loginRedirect(role, null);
  if (got !== path) allRedirectOk = false;
  results.push(`${got === path ? "PASS" : "FAIL"}  Redirect ${role} -> ${got} (harap ${path})`);
  if (got === path) pass++;
  else fail++;
}
assert("Redirect: semua role -> dashboard masing-masing (dibedakan)", allRedirectOk);
assert("Redirect: smartmbg_intended diprioritaskan", loginRedirect("mitra", "/mitra/products") === "/mitra/products");

// Simulasi login akun demo (Portal menulis smartmbg_role lalu navigate)
const demoAccounts = {
  mitra: ["mitra@demo.local", "demo1234", "/mitra/dashboard"],
  supplier: ["supplier@demo.local", "demo1234", "/supplier/dashboard"],
  logistik: ["logistik@demo.local", "demo1234", "/logistik/dashboard"],
  penerima: ["adhiramaharani@gmail.com", "SmartMBG2026!", "/marketplace"],
  admin: ["admin@demo.local", "demo1234", "/admin/dashboard"],
};
for (const [role, [email, pw, dash]] of Object.entries(demoAccounts)) {
  let ok = false;
  try {
    const u = await base44.auth.loginViaEmailPassword(email, pw);
    globalThis.localStorage.setItem("smartmbg_role", role);
    const target = loginRedirect(role, null);
    ok = u?.email === email && target === dash;
  } catch {
    ok = false;
  }
  results.push(`${ok ? "PASS" : "FAIL"}  Login akun demo ${role} -> ${loginRedirect(role, null)}`);
  if (ok) pass++;
  else fail++;
}

// ---------- 7. ENTITY CRUD ----------
const newItem = await base44.entities.CartItem.create({ user_email: "flowtest@demo.local", product_id: "beras", quantity: 2 });
assert("Entity: create CartItem punya id", !!newItem?.id);

const filtered = await base44.entities.CartItem.filter({ user_email: "flowtest@demo.local" });
assert("Entity: filter berdasarkan query", filtered.length === 1);

const updated = await base44.entities.CartItem.update(newItem.id, { quantity: 5 });
assert("Entity: update mengubah quantity", updated.quantity === 5);

await base44.entities.CartItem.delete(newItem.id);
const afterDelete = await base44.entities.CartItem.filter({ user_email: "flowtest@demo.local" });
assert("Entity: delete menghapus item", afterDelete.length === 0);

// ---------- 8. SUBSCRIBE (real-time sederhana) ----------
let eventSeen = null;
const unsub = base44.entities.StockAlert.subscribe((ev) => (eventSeen = ev));
const alert = await base44.entities.StockAlert.create({ message: "tes notif" });
await new Promise((r) => setTimeout(r, 20));
assert("Subscribe: menerima event create", eventSeen?.type === "create" && eventSeen?.id === alert.id);
unsub();
await base44.entities.StockAlert.delete(alert.id);

// ---------- 9. LOGOUT ----------
let logoutThrew = false;
try {
  logoutUser("/portal");
} catch (e) {
  logoutThrew = true;
}
assert("Logout: tidak error & tidak redirect ke hosted", !logoutThrew);
assert("Logout: redirect ke /portal (fix bug)", globalThis.window.location.href === "/portal", `(actual ${globalThis.window.location.href})`);
try {
  await base44.auth.me();
  logoutThrew = true;
} catch {
  logoutThrew = false;
}
assert("Logout: sesi hilang (me() -> 401)", !logoutThrew);

// ---------- RANGKUMAN ----------
console.log("\n===== HASIL TEST =====");
results.forEach((r) => console.log(r));
console.log(`\nTOTAL: ${pass} PASS, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
