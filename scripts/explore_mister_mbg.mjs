import fs from "fs";

async function checkEndpoints() {
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

  const endpoints = [
    { name: "daftar_sppg", url: "https://mistermbg.disperindag.garutkab.go.id/laporan_mbg/daftar_sppg" },
    { name: "bapokting", url: "https://mistermbg.disperindag.garutkab.go.id/Bapokting" },
    { name: "ringkasan_komoditi", url: "https://mistermbg.disperindag.garutkab.go.id/laporan_mbg/ringkasan_komoditi" },
    { name: "rantai_pasok", url: "https://mistermbg.disperindag.garutkab.go.id/rantai_pasok/riwayat" },
  ];

  for (const ep of endpoints) {
    const res = await fetch(ep.url, {
      headers: {
        Cookie: cookie,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    const text = await res.text();
    console.log(`Endpoint [${ep.name}]: Status ${res.status}, Length: ${text.length}`);
    fs.writeFileSync(`scripts/sample_${ep.name}.html`, text, "utf-8");

    // Cari apakah ada tabel HTML atau data JSON
    const tableMatches = text.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
    console.log(`  -> Jumlah tag <table>: ${tableMatches ? tableMatches.length : 0}`);
  }
}

checkEndpoints().catch(console.error);
