import fs from "fs";

function run() {
  if (fs.existsSync("scripts/sample_ringkasan_komoditi.html")) {
    const html = fs.readFileSync("scripts/sample_ringkasan_komoditi.html", "utf-8");
    const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)];
    console.log("=== RINGKASAN KOMODITI ===");
    console.log("Total tabel:", tables.length);
    tables.slice(0, 3).forEach((t, i) => {
      const clean = t[0].replace(/<[^>]+>/g, " | ").replace(/\s+/g, " ");
      console.log(`Tabel ${i + 1}:`, clean.slice(0, 200));
    });
  }

  if (fs.existsSync("scripts/sample_bapokting.html")) {
    const html = fs.readFileSync("scripts/sample_bapokting.html", "utf-8");
    console.log("\n=== BAPOKTING ===");
    console.log("HTML length:", html.length);
    // Cari judul halaman
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    console.log("Title:", titleMatch ? titleMatch[1].trim() : "None");
    const hMatches = [...html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)].map(m => m[1].replace(/<[^>]+>/g, "").trim());
    console.log("Headings:", hMatches.slice(0, 8));
  }
}

run();
