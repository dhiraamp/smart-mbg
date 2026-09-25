import fs from "fs";

async function checkDetailReport() {
  const params = new URLSearchParams();
  params.append("username", "kadisperindag");
  params.append("password", "kadisperindag");
  
  const loginRes = await fetch("https://mistermbg.disperindag.garutkab.go.id/login/index", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
    body: params.toString(),
    redirect: "manual",
  });

  const rawCookie = loginRes.headers.get("set-cookie") || "";
  const cookie = rawCookie.split(";")[0];

  const res = await fetch("https://mistermbg.disperindag.garutkab.go.id/laporan_mbg/index/8", {
    headers: {
      Cookie: cookie,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  const html = await res.text();
  console.log("Detail report status:", res.status, "HTML length:", html.length);
  fs.writeFileSync("scripts/sample_sppg_detail.html", html, "utf-8");

  // Cari tabel di dalamnya
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)];
  console.log("Jumlah tabel detail report:", tables.length);
  tables.forEach((t, i) => {
    console.log(`Tabel ${i + 1}:`, t[0].replace(/<[^>]+>/g, " | ").replace(/\s+/g, " ").slice(0, 200));
  });
}

checkDetailReport().catch(console.error);
