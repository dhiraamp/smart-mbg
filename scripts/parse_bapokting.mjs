import fs from "fs";

function parseBapokting() {
  const html = fs.readFileSync("scripts/sample_bapokting.html", "utf-8");
  
  // Pola kartu di portal Disperindag:
  // <h3 ...>Nama Komoditi</h3> ... <h4>Rp 15.000 / Kg</h4>
  const cardRegex = /<div[^>]*class=["'][^"']*panel[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  const cards = [...html.matchAll(cardRegex)];

  console.log("Panel matches:", cards.length);

  const results = [];
  // Ekstraksi umum: cari teks nama dan harga Rp
  const rawBlocks = html.split(/<div class=["']col-md-3[^"']*["']/gi);
  for (let i = 1; i < rawBlocks.length; i++) {
    const block = rawBlocks[i];
    const text = block.replace(/<[^>]+>/g, "\n").split("\n").map(s => s.trim()).filter(Boolean);
    const rpLine = text.find(t => t.startsWith("Rp"));
    if (rpLine && text.length >= 2) {
      const name = text[0] !== "Rp" ? text[0] : text[1];
      results.push({
        nama_komoditas: name,
        harga: rpLine,
      });
    }
  }

  console.log("Komoditas terekstrak:", results.length);
  results.slice(0, 10).forEach(r => console.log("-", r.nama_komoditas, ":", r.harga));
}

parseBapokting();
