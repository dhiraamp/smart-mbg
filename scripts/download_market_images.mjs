import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, "../public/images");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Daftar seluruh komoditas/produk pasar dengan link HD Unsplash murni makanan/bahan pangan (TANPA FOTO ORANG)
const MARKET_IMAGES = [
  {
    id: "kentang",
    filename: "kentang.jpg",
    name: "Kentang Granola",
    url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "telur",
    filename: "telur.jpg",
    name: "Telur Ayam Negeri",
    url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "cabai-merah",
    filename: "cabai-merah.jpg",
    name: "Cabai Merah Keriting",
    url: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "cabai-rawit",
    filename: "cabai-rawit.jpg",
    name: "Cabai Rawit Merah",
    url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "bawang-merah",
    filename: "bawang-merah.jpg",
    name: "Bawang Merah",
    url: "https://images.unsplash.com/photo-1508747703725-719777637510?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "bawang-putih",
    filename: "bawang-putih.jpg",
    name: "Bawang Putih Kating",
    url: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "beras",
    filename: "beras.jpg",
    name: "Beras Premium Setra Ramos",
    url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "minyak",
    filename: "minyak-goreng.jpg",
    name: "Minyak Goreng",
    url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "gula",
    filename: "gula-pasir.jpg",
    name: "Gula Pasir Putih",
    url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "tepung",
    filename: "tepung-terigu.jpg",
    name: "Tepung Terigu",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "tomat",
    filename: "tomat.jpg",
    name: "Tomat Merah",
    url: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "wortel",
    filename: "wortel.jpg",
    name: "Wortel",
    url: "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "bayam",
    filename: "bayam.jpg",
    name: "Bayam Hijau",
    url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "kangkung",
    filename: "kangkung.jpg",
    name: "Kangkung",
    url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "tahu",
    filename: "tahu.jpg",
    name: "Tahu Putih",
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "tempe",
    filename: "tempe.jpg",
    name: "Tempe Kedelai",
    url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "ikan-nila",
    filename: "ikan-nila.jpg",
    name: "Ikan Nila Segar",
    url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "ayam",
    filename: "ayam-potong.jpg",
    name: "Ayam Potong",
    url: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "daging-sapi",
    filename: "daging-sapi.jpg",
    name: "Daging Sapi Segar",
    url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "jagung",
    filename: "jagung.jpg",
    name: "Jagung Manis",
    url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "roti",
    filename: "roti.jpg",
    name: "Roti",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "susu",
    filename: "susu.jpg",
    name: "Susu Segar",
    url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "pisang",
    filename: "pisang.jpg",
    name: "Pisang Cavendish",
    url: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "pepaya",
    filename: "pepaya.jpg",
    name: "Pepaya California",
    url: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "jeruk",
    filename: "jeruk.jpg",
    name: "Jeruk Siam",
    url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "ikan-lele",
    filename: "ikan-lele.jpg",
    name: "Ikan Lele Segar",
    url: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "garam",
    filename: "garam.jpg",
    name: "Garam Dapur",
    url: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&q=90&auto=format&fit=crop",
  },
  {
    id: "daging-kambing",
    filename: "daging-kambing.jpg",
    name: "Daging Kambing",
    url: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=1200&q=90&auto=format&fit=crop",
  },
];

async function downloadImage(item) {
  const filePath = path.join(targetDir, item.filename);
  console.log(`⬇️ Mengunduh [${item.name}] -> public/images/${item.filename}...`);

  try {
    const res = await fetch(item.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartMBG/1.0",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(filePath, buffer);
    const sizeKb = (buffer.length / 1024).toFixed(1);
    console.log(`✅ Sukses: ${item.filename} (${sizeKb} KB - HD Ready)`);
    return { success: true, item, sizeKb };
  } catch (err) {
    console.error(`❌ Gagal mengunduh ${item.filename}:`, err.message);
    return { success: false, item, error: err.message };
  }
}

async function runAll() {
  console.log(`🚀 Memulai pengunduhan ${MARKET_IMAGES.length} gambar komoditas HD untuk Market Smart MBG...`);
  console.log(`📁 Folder Tujuan: ${targetDir}\n`);

  let successCount = 0;
  for (const item of MARKET_IMAGES) {
    const res = await downloadImage(item);
    if (res.success) successCount++;
  }

  console.log(`\n🎉 Selesai! ${successCount} dari ${MARKET_IMAGES.length} gambar HD berhasil diunduh ke folder public/images/.`);
}

runAll().catch(console.error);
