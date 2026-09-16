import { base44 } from "@/api/base44Client";

// ════════════════════════════════════════════════════════════════════════════
// DATABASE GIZI (per 100 gram)
// Nilai bersumber dari USDA Food Data Central & Daftar Komposisi Bahan Pangan Indonesia
// ════════════════════════════════════════════════════════════════════════════
export const NUTRITION_DB = {
  // ── SEREALIA & PRODUK SEREALIA ──
  "nasi": { cal: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
  "nasi putih": { cal: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
  "nasi merah": { cal: 130, protein: 2.7, carbs: 28, fat: 0.4 },
  "nasi uduk": { cal: 200, protein: 3, carbs: 30, fat: 7 },
  "nasi goreng": { cal: 163, protein: 3, carbs: 25, fat: 5 },
  "nasi kuning": { cal: 200, protein: 3, carbs: 30, fat: 7 },
  "beras": { cal: 360, protein: 7, carbs: 79, fat: 0.7 },
  "beras merah": { cal: 360, protein: 7.5, carbs: 77, fat: 0.9 },
  "ketan": { cal: 340, protein: 6.8, carbs: 75, fat: 0.6 },
  "roti": { cal: 265, protein: 9, carbs: 49, fat: 3.2 },
  "roti tawar": { cal: 265, protein: 9, carbs: 49, fat: 3.2 },
  "roti gandum": { cal: 247, protein: 13, carbs: 41, fat: 3.4 },
  "mie": { cal: 138, protein: 5, carbs: 25, fat: 2.1 },
  "mie kering": { cal: 360, protein: 12, carbs: 70, fat: 2 },
  "bihun": { cal: 110, protein: 1.5, carbs: 25, fat: 0.2 },
  "kwetiau": { cal: 110, protein: 1.5, carbs: 25, fat: 0.2 },
  "spaghetti": { cal: 131, protein: 5, carbs: 25, fat: 1.1 },
  "pasta": { cal: 131, protein: 5, carbs: 25, fat: 1.1 },
  "makaroni": { cal: 131, protein: 5, carbs: 25, fat: 1.1 },
  "tepung terigu": { cal: 364, protein: 10, carbs: 76, fat: 1 },
  "tepung beras": { cal: 366, protein: 6, carbs: 80, fat: 0.6 },
  "tepung tapioka": { cal: 358, protein: 0.2, carbs: 88, fat: 0 },
  "tepung": { cal: 364, protein: 10, carbs: 76, fat: 1 },
  "maizena": { cal: 365, protein: 0.2, carbs: 91, fat: 0.1 },
  "sagu": { cal: 354, protein: 0.2, carbs: 87, fat: 0 },
  "jagung": { cal: 86, protein: 3.2, carbs: 19, fat: 1.2 },
  "jagung manis": { cal: 86, protein: 3.2, carbs: 19, fat: 1.2 },
  "singkong": { cal: 160, protein: 1.4, carbs: 38, fat: 0.3 },
  "ketela": { cal: 160, protein: 1.4, carbs: 38, fat: 0.3 },
  "ubi": { cal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  "ubi jalar": { cal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  "talas": { cal: 142, protein: 0.5, carbs: 34, fat: 0.1 },
  "kentang": { cal: 77, protein: 2, carbs: 17, fat: 0.1 },
  "kentang rebus": { cal: 87, protein: 1.9, carbs: 20, fat: 0.1 },
  "kentang goreng": { cal: 312, protein: 3.4, carbs: 41, fat: 15 },
  "oat": { cal: 389, protein: 17, carbs: 66, fat: 7 },
  "havermut": { cal: 389, protein: 17, carbs: 66, fat: 7 },
  "sereal": { cal: 357, protein: 7, carbs: 84, fat: 0.4 },
  "bubur": { cal: 65, protein: 1.4, carbs: 14, fat: 0.3 },
  "bubur ayam": { cal: 110, protein: 2, carbs: 18, fat: 2 },
  "lontong": { cal: 100, protein: 2.1, carbs: 22, fat: 0.2 },
  "ketupat": { cal: 100, protein: 2.1, carbs: 22, fat: 0.2 },

  // ── KACANG-KACANGAN & PRODUK OLAHANNYA ──
  "tahu": { cal: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  "tempe": { cal: 193, protein: 18.5, carbs: 9.4, fat: 10.9 },
  "tempeh": { cal: 193, protein: 18.5, carbs: 9.4, fat: 10.9 },
  "toge": { cal: 30, protein: 3, carbs: 5.9, fat: 0.2 },
  "kecambah": { cal: 30, protein: 3, carbs: 5.9, fat: 0.2 },
  "oncom": { cal: 145, protein: 14, carbs: 10, fat: 6 },
  "kacang tanah": { cal: 567, protein: 26, carbs: 16, fat: 49 },
  "kacang merah": { cal: 127, protein: 9, carbs: 23, fat: 0.5 },
  "kacang hijau": { cal: 347, protein: 24, carbs: 63, fat: 1.2 },
  "kacang kedelai": { cal: 446, protein: 36, carbs: 30, fat: 20 },
  "kacang almond": { cal: 579, protein: 21, carbs: 22, fat: 50 },
  "kacang mete": { cal: 553, protein: 18, carbs: 30, fat: 44 },
  "kacang polong": { cal: 81, protein: 5.4, carbs: 14, fat: 0.4 },
  "kapri": { cal: 81, protein: 5.4, carbs: 14, fat: 0.4 },
  "edamame": { cal: 121, protein: 12, carbs: 9, fat: 5 },
  "lentil": { cal: 116, protein: 9, carbs: 20, fat: 0.4 },

  // ── SAYURAN ──
  "bayam": { cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  "kangkung": { cal: 19, protein: 2.6, carbs: 3.1, fat: 0.3 },
  "sawi": { cal: 13, protein: 1.5, carbs: 2.2, fat: 0.2 },
  "sawi hijau": { cal: 13, protein: 1.5, carbs: 2.2, fat: 0.2 },
  "sawi putih": { cal: 25, protein: 1.2, carbs: 5.3, fat: 0.2 },
  "kol": { cal: 25, protein: 1.3, carbs: 5.8, fat: 0.1 },
  "kubis": { cal: 25, protein: 1.3, carbs: 5.8, fat: 0.1 },
  "selada": { cal: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  "wortel": { cal: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  "tomat": { cal: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  "terong": { cal: 25, protein: 1, carbs: 5.9, fat: 0.2 },
  "mentimun": { cal: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  "timun": { cal: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  "labu siam": { cal: 19, protein: 0.8, carbs: 4.5, fat: 0.1 },
  "labu": { cal: 26, protein: 1, carbs: 6, fat: 0.1 },
  "brokoli": { cal: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  "kembang kol": { cal: 25, protein: 1.9, carbs: 5, fat: 0.3 },
  "buncis": { cal: 35, protein: 1.8, carbs: 7, fat: 0.1 },
  "rebung": { cal: 27, protein: 2.6, carbs: 5.2, fat: 0.3 },
  "jamur": { cal: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  "jamur tiram": { cal: 28, protein: 2.5, carbs: 4.6, fat: 0.2 },
  "jamur merang": { cal: 27, protein: 3.5, carbs: 3.3, fat: 0.2 },
  "daun bawang": { cal: 32, protein: 1.5, carbs: 7.4, fat: 0.1 },
  "daun seledri": { cal: 16, protein: 0.7, carbs: 3, fat: 0.2 },
  "daun kemangi": { cal: 23, protein: 3.2, carbs: 2.7, fat: 0.6 },
  "daun katuk": { cal: 59, protein: 4.5, carbs: 11, fat: 1 },
  "daun pepaya": { cal: 79, protein: 6, carbs: 13, fat: 0.7 },
  "daun singkong": { cal: 91, protein: 6.3, carbs: 18, fat: 1 },
  "pare": { cal: 20, protein: 1, carbs: 4.3, fat: 0.2 },
  "paprika": { cal: 31, protein: 1, carbs: 6, fat: 0.3 },
  "cabai": { cal: 40, protein: 1.9, carbs: 9, fat: 0.4 },
  "cabai merah": { cal: 40, protein: 1.9, carbs: 9, fat: 0.4 },
  "cabai rawit": { cal: 40, protein: 1.9, carbs: 9, fat: 0.4 },
  "lombok": { cal: 40, protein: 1.9, carbs: 9, fat: 0.4 },
  "sayur": { cal: 25, protein: 2, carbs: 4, fat: 0.3 },
  "sayuran": { cal: 25, protein: 2, carbs: 4, fat: 0.3 },
  "sayur sop": { cal: 40, protein: 1.5, carbs: 7, fat: 0.5 },
  "capcay": { cal: 70, protein: 2, carbs: 10, fat: 2 },

  // ── BUAH-BUAHAN ──
  "apel": { cal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  "pisang": { cal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  "jeruk": { cal: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  "jeruk manis": { cal: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  "mangga": { cal: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  "semangka": { cal: 30, protein: 0.6, carbs: 8, fat: 0.2 },
  "melon": { cal: 34, protein: 0.8, carbs: 8, fat: 0.2 },
  "pepaya": { cal: 43, protein: 0.5, carbs: 11, fat: 0.3 },
  "anggur": { cal: 69, protein: 0.7, carbs: 18, fat: 0.2 },
  "stroberi": { cal: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  "nanas": { cal: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  "jambu": { cal: 68, protein: 2.6, carbs: 14, fat: 1 },
  "pear": { cal: 57, protein: 0.4, carbs: 15, fat: 0.1 },
  "avokad": { cal: 160, protein: 2, carbs: 9, fat: 15 },
  "alpukat": { cal: 160, protein: 2, carbs: 9, fat: 15 },
  "kelapa": { cal: 354, protein: 3.3, carbs: 15, fat: 33 },
  "salak": { cal: 77, protein: 0.4, carbs: 20, fat: 0.4 },
  "rambutan": { cal: 82, protein: 0.7, carbs: 21, fat: 0.2 },
  "durian": { cal: 147, protein: 1.5, carbs: 27, fat: 5.3 },
  "manggis": { cal: 73, protein: 0.4, carbs: 18, fat: 0.6 },
  "markisa": { cal: 97, protein: 2.2, carbs: 23, fat: 0.7 },
  "belimbing": { cal: 31, protein: 1, carbs: 7, fat: 0.3 },
  "sirsak": { cal: 66, protein: 1, carbs: 17, fat: 0.3 },
  "nangka": { cal: 95, protein: 1.7, carbs: 23, fat: 0.6 },
  "kiwi": { cal: 61, protein: 1.1, carbs: 15, fat: 0.5 },
  "lemon": { cal: 29, protein: 1.1, carbs: 9, fat: 0.3 },
  "buah": { cal: 52, protein: 0.3, carbs: 14, fat: 0.2 },

  // ── DAGING & UNGGAS ──
  "ayam": { cal: 165, protein: 31, carbs: 0, fat: 3.6 },
  "ayam broiler": { cal: 165, protein: 31, carbs: 0, fat: 3.6 },
  "ayam kampung": { cal: 125, protein: 22, carbs: 0, fat: 3.3 },
  "ayam goreng": { cal: 320, protein: 26, carbs: 5, fat: 21 },
  "daging ayam": { cal: 165, protein: 31, carbs: 0, fat: 3.6 },
  "dada ayam": { cal: 165, protein: 31, carbs: 0, fat: 3.6 },
  "paha ayam": { cal: 190, protein: 26, carbs: 0, fat: 8.4 },
  "daging sapi": { cal: 250, protein: 26, carbs: 0, fat: 15 },
  "daging": { cal: 250, protein: 26, carbs: 0, fat: 15 },
  "sapi": { cal: 250, protein: 26, carbs: 0, fat: 15 },
  "daging kambing": { cal: 143, protein: 27, carbs: 0, fat: 3 },
  "kambing": { cal: 143, protein: 27, carbs: 0, fat: 3 },
  "domba": { cal: 294, protein: 25, carbs: 0, fat: 21 },
  "hati ayam": { cal: 119, protein: 17, carbs: 0.7, fat: 4.8 },
  "ampela": { cal: 119, protein: 17, carbs: 0.7, fat: 4.8 },
  "ceker": { cal: 215, protein: 19, carbs: 0.2, fat: 15 },
  "kulit ayam": { cal: 212, protein: 9, carbs: 0, fat: 18 },
  "sosis": { cal: 320, protein: 12, carbs: 3, fat: 28 },
  "nugget": { cal: 250, protein: 14, carbs: 15, fat: 15 },
  "nuget": { cal: 250, protein: 14, carbs: 15, fat: 15 },
  "corned beef": { cal: 250, protein: 23, carbs: 2, fat: 15 },
  "burger": { cal: 295, protein: 17, carbs: 24, fat: 14 },

  // ── IKAN & HASIL LAUT ──
  "ikan": { cal: 140, protein: 26, carbs: 0, fat: 3 },
  "ikan lele": { cal: 135, protein: 25, carbs: 0, fat: 3.5 },
  "ikan nila": { cal: 128, protein: 26, carbs: 0, fat: 2.7 },
  "ikan tongkol": { cal: 132, protein: 28, carbs: 0, fat: 1.3 },
  "ikan mas": { cal: 128, protein: 18, carbs: 0, fat: 6 },
  "ikan kembung": { cal: 156, protein: 24, carbs: 0, fat: 6 },
  "ikan patin": { cal: 148, protein: 19, carbs: 0, fat: 8 },
  "ikan tuna": { cal: 132, protein: 28, carbs: 0, fat: 1 },
  "ikan salmon": { cal: 208, protein: 20, carbs: 0, fat: 13 },
  "ikan bandeng": { cal: 148, protein: 20, carbs: 0, fat: 7 },
  "ikan kakap": { cal: 117, protein: 25, carbs: 0, fat: 1.3 },
  "ikan gurame": { cal: 133, protein: 19, carbs: 0, fat: 6 },
  "ikan bawal": { cal: 146, protein: 19, carbs: 0, fat: 7.5 },
  "ikan teri": { cal: 218, protein: 32, carbs: 0, fat: 8 },
  "ikan pindang": { cal: 153, protein: 28, carbs: 0, fat: 4 },
  "ikan asin": { cal: 290, protein: 50, carbs: 0, fat: 10 },
  "udang": { cal: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  "cumi": { cal: 92, protein: 15.5, carbs: 3.1, fat: 1 },
  "cumi-cumi": { cal: 92, protein: 15.5, carbs: 3.1, fat: 1 },
  "sotong": { cal: 92, protein: 15.5, carbs: 3.1, fat: 1 },
  "kepiting": { cal: 97, protein: 19, carbs: 1, fat: 1.5 },
  "kerang": { cal: 86, protein: 14.7, carbs: 4.6, fat: 1.1 },
  "tiram": { cal: 68, protein: 7, carbs: 4.7, fat: 2.3 },
  "lobster": { cal: 89, protein: 19, carbs: 0, fat: 0.9 },
  "rajungan": { cal: 96, protein: 18, carbs: 1, fat: 1.3 },
  "bakso": { cal: 210, protein: 14, carbs: 8, fat: 14 },
  "bakso ikan": { cal: 130, protein: 15, carbs: 5, fat: 5 },
  "ebi": { cal: 282, protein: 65, carbs: 1, fat: 2.5 },
  "teri": { cal: 218, protein: 32, carbs: 0, fat: 8 },

  // ── TELUR ──
  "telur": { cal: 155, protein: 13, carbs: 1.1, fat: 11 },
  "telur ayam": { cal: 155, protein: 13, carbs: 1.1, fat: 11 },
  "telur bebek": { cal: 185, protein: 13.5, carbs: 1.2, fat: 13.8 },
  "telur puyuh": { cal: 158, protein: 13, carbs: 1, fat: 11 },
  "telur rebus": { cal: 155, protein: 13, carbs: 1.1, fat: 11 },
  "telur goreng": { cal: 196, protein: 14, carbs: 0.8, fat: 15 },
  "telur dadar": { cal: 196, protein: 14, carbs: 0.8, fat: 15 },

  // ── SUSU & PRODUK OLAHANNYA ──
  "susu": { cal: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  "susu sapi": { cal: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  "susu skim": { cal: 34, protein: 3.4, carbs: 5, fat: 0.1 },
  "susu kedelai": { cal: 54, protein: 3.3, carbs: 5.4, fat: 2.5 },
  "susu almond": { cal: 17, protein: 0.6, carbs: 0.6, fat: 1.5 },
  "susu kental manis": { cal: 321, protein: 7, carbs: 54, fat: 8 },
  "susu bubuk": { cal: 496, protein: 26, carbs: 38, fat: 26 },
  "susu uht": { cal: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  "keju": { cal: 402, protein: 25, carbs: 1.3, fat: 33 },
  "keju cheddar": { cal: 402, protein: 25, carbs: 1.3, fat: 33 },
  "keju mozarella": { cal: 280, protein: 22, carbs: 2.2, fat: 20 },
  "mentega": { cal: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  "margarin": { cal: 717, protein: 0.2, carbs: 0.7, fat: 80 },
  "yogurt": { cal: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  "es krim": { cal: 207, protein: 3.5, carbs: 24, fat: 11 },

  // ── MINYAK & LEMAK ──
  "minyak goreng": { cal: 884, protein: 0, carbs: 0, fat: 100 },
  "minyak kelapa": { cal: 892, protein: 0, carbs: 0, fat: 100 },
  "minyak sawit": { cal: 884, protein: 0, carbs: 0, fat: 100 },
  "minyak zaitun": { cal: 884, protein: 0, carbs: 0, fat: 100 },
  "minyak wijen": { cal: 884, protein: 0, carbs: 0, fat: 100 },
  "santan": { cal: 230, protein: 2.3, carbs: 6, fat: 24 },
  "ghee": { cal: 900, protein: 0, carbs: 0, fat: 100 },

  // ── GULA & PEMANIS ──
  "gula": { cal: 387, protein: 0, carbs: 100, fat: 0 },
  "gula pasir": { cal: 387, protein: 0, carbs: 100, fat: 0 },
  "gula merah": { cal: 380, protein: 0.5, carbs: 98, fat: 0.1 },
  "gula aren": { cal: 380, protein: 0.5, carbs: 98, fat: 0.1 },
  "madu": { cal: 304, protein: 0.3, carbs: 82, fat: 0 },
  "sirup": { cal: 281, protein: 0, carbs: 70, fat: 0 },
  "coklat": { cal: 546, protein: 4.9, carbs: 61, fat: 31 },
  "cokelat": { cal: 546, protein: 4.9, carbs: 61, fat: 31 },
  "cocoa": { cal: 228, protein: 5.7, carbs: 57.9, fat: 13.7 },

  // ── BUMBU & REMPAH ──
  "bawang putih": { cal: 149, protein: 6.4, carbs: 33, fat: 0.5 },
  "bawang merah": { cal: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  "bawang bombay": { cal: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  "bawang": { cal: 149, protein: 6.4, carbs: 33, fat: 0.5 },
  "jahe": { cal: 80, protein: 1.8, carbs: 18, fat: 0.8 },
  "kunyit": { cal: 354, protein: 8, carbs: 65, fat: 10 },
  "kencur": { cal: 301, protein: 5, carbs: 68, fat: 1 },
  "lengkuas": { cal: 53, protein: 1, carbs: 12.5, fat: 0.5 },
  "serai": { cal: 99, protein: 1.8, carbs: 25, fat: 0.5 },
  "daun jeruk": { cal: 29, protein: 0.7, carbs: 7, fat: 0.2 },
  "daun salam": { cal: 313, protein: 7.6, carbs: 75, fat: 8.4 },
  "asam jawa": { cal: 239, protein: 2.8, carbs: 63, fat: 0.6 },
  "lada": { cal: 255, protein: 10.4, carbs: 64, fat: 3.3 },
  "merica": { cal: 255, protein: 10.4, carbs: 64, fat: 3.3 },
  "kecap": { cal: 53, protein: 8.1, carbs: 4.2, fat: 0.6 },
  "kecap manis": { cal: 53, protein: 8.1, carbs: 4.2, fat: 0.6 },
  "saus": { cal: 112, protein: 1.5, carbs: 25, fat: 0.4 },
  "saus tiram": { cal: 50, protein: 2.3, carbs: 10, fat: 0.3 },
  "tauco": { cal: 118, protein: 8, carbs: 12, fat: 3.5 },
  "terasi": { cal: 193, protein: 30, carbs: 5, fat: 5 },
  "petis": { cal: 158, protein: 10, carbs: 15, fat: 5 },
  "vetesin": { cal: 0, protein: 0, carbs: 0, fat: 0 },

  // ── MAKANAN RINGAN & CAMILAN ──
  "kerupuk": { cal: 490, protein: 5, carbs: 72, fat: 22 },
  "krupuk": { cal: 490, protein: 5, carbs: 72, fat: 22 },
  "emping": { cal: 342, protein: 8, carbs: 75, fat: 1 },
  "rempeyek": { cal: 475, protein: 10, carbs: 55, fat: 24 },
  "biskuit": { cal: 450, protein: 6, carbs: 72, fat: 15 },
  "cracker": { cal: 430, protein: 7, carbs: 70, fat: 14 },
  "donat": { cal: 452, protein: 7, carbs: 51, fat: 25 },
  "kue": { cal: 350, protein: 5, carbs: 55, fat: 12 },
  "bolu": { cal: 297, protein: 5, carbs: 56, fat: 7 },
  "cireng": { cal: 200, protein: 2, carbs: 38, fat: 4 },
  "cilok": { cal: 170, protein: 6, carbs: 30, fat: 3 },
  "siomay": { cal: 160, protein: 10, carbs: 18, fat: 5 },
  "pempek": { cal: 180, protein: 12, carbs: 22, fat: 5 },
  "risol": { cal: 220, protein: 6, carbs: 28, fat: 9 },
  "lumpia": { cal: 190, protein: 7, carbs: 25, fat: 7 },
  "lemper": { cal: 190, protein: 5, carbs: 32, fat: 5 },
  "klepon": { cal: 180, protein: 2, carbs: 40, fat: 2 },
  "onde": { cal: 220, protein: 3, carbs: 44, fat: 4 },
  "getuk": { cal: 150, protein: 1, carbs: 34, fat: 1 },

  // ── MAKANAN SIAP SANTAP ──
  "soto": { cal: 80, protein: 4, carbs: 8, fat: 3 },
  "soto ayam": { cal: 80, protein: 4, carbs: 8, fat: 3 },
  "rawon": { cal: 100, protein: 5, carbs: 10, fat: 4 },
  "gudeg": { cal: 120, protein: 3, carbs: 25, fat: 1 },
  "sayur lodeh": { cal: 60, protein: 2, carbs: 7, fat: 3 },
  "sayur asem": { cal: 50, protein: 1.5, carbs: 8, fat: 1.5 },
  "tumis": { cal: 100, protein: 2, carbs: 8, fat: 6 },
  "pecel": { cal: 25, protein: 2, carbs: 4, fat: 0.3 },
  "gado-gado": { cal: 145, protein: 6, carbs: 12, fat: 8 },
  "karedok": { cal: 145, protein: 6, carbs: 12, fat: 8 },
  "ketoprak": { cal: 145, protein: 6, carbs: 12, fat: 8 },
  "rujak": { cal: 50, protein: 0.5, carbs: 12, fat: 0.2 },
  "asinan": { cal: 50, protein: 1, carbs: 10, fat: 0.5 },
  "sate": { cal: 250, protein: 20, carbs: 5, fat: 16 },
  "sate ayam": { cal: 250, protein: 20, carbs: 5, fat: 16 },
  "sate kambing": { cal: 250, protein: 22, carbs: 5, fat: 15 },
  "gulai": { cal: 200, protein: 12, carbs: 8, fat: 14 },
  "opor": { cal: 200, protein: 12, carbs: 8, fat: 14 },
  "rendang": { cal: 250, protein: 15, carbs: 5, fat: 18 },
  "semur": { cal: 180, protein: 12, carbs: 10, fat: 9 },
  "empal": { cal: 250, protein: 20, carbs: 5, fat: 15 },
  "bistik": { cal: 250, protein: 20, carbs: 5, fat: 15 },
  "pizza": { cal: 266, protein: 11, carbs: 33, fat: 10 },
  "sandwich": { cal: 250, protein: 12, carbs: 30, fat: 9 },
  "hotdog": { cal: 290, protein: 10, carbs: 25, fat: 17 },
  "kebab": { cal: 250, protein: 15, carbs: 25, fat: 10 },
  "fried chicken": { cal: 320, protein: 20, carbs: 10, fat: 22 },
  "ayam crispy": { cal: 320, protein: 20, carbs: 10, fat: 22 },
  "fried rice": { cal: 163, protein: 3, carbs: 25, fat: 5 },
  "mie ayam": { cal: 150, protein: 7, carbs: 20, fat: 5 },
  "mie goreng": { cal: 163, protein: 3, carbs: 25, fat: 5 },
  "bakso kuah": { cal: 210, protein: 14, carbs: 8, fat: 14 },
  "nasi pecel": { cal: 200, protein: 5, carbs: 35, fat: 5 },
  "nasi rames": { cal: 200, protein: 8, carbs: 30, fat: 5 },
  "nasi uduk": { cal: 200, protein: 3, carbs: 30, fat: 7 },
  "nasi campur": { cal: 200, protein: 8, carbs: 30, fat: 5 },
  "nasi padang": { cal: 200, protein: 8, carbs: 30, fat: 5 },
};

// Daftar nama bahan untuk suggestion (datalist)
export const INGREDIENT_SUGGESTIONS = Object.keys(NUTRITION_DB).sort();

// ════════════════════════════════════════════════════════════════════════════
// FUNGSI LOOKUP GIZI
// ════════════════════════════════════════════════════════════════════════════

// Cari di database lokal (direct match atau contains match)
export function getNutritionFromDB(name) {
  if (!name) return null;
  const lower = String(name).toLowerCase().trim();
  if (!lower) return null;

  // Direct match
  if (NUTRITION_DB[lower]) return { ...NUTRITION_DB[lower], source: "db" };

  // Contains match — cari key yang terkandung dalam nama atau sebaliknya
  // Urutkan key dari yang terpanjang agar match paling spesifik
  const keys = Object.keys(NUTRITION_DB).sort((a, b) => b.length - a.length);
  const match = keys.find(k => lower.includes(k) || k.includes(lower));
  if (match) return { ...NUTRITION_DB[match], source: "db" };

  return null;
}

// Cache LLM lookup (module-level, dipakai bersama seluruh komponen)
const llmCache = new Map();

// Lookup gizi via AI untuk bahan yang tidak ada di database
export async function lookupNutritionWithLLM(name) {
  // Cek DB dulu
  const dbResult = getNutritionFromDB(name);
  if (dbResult) return dbResult;

  const key = String(name).toLowerCase().trim();
  if (!key) return null;

  // Cek cache
  if (llmCache.has(key)) return llmCache.get(key);

  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Berikan nilai gizi per 100 gram untuk bahan pangan: "${name}". ` +
        `Kirim dalam format JSON dengan field: cal (kalori dalam kkal), protein (gram), carbs/karbohidrat (gram), fat/lemak (gram). ` +
        `Gunakan data USDA atau Daftar Komposisi Bahan Makanan Indonesia. ` +
        `Berikan angka desimal yang akurat. Jika bahan tersebut adalah makanan olahan siap saji, berikan nilai rata-rata.`,
      response_json_schema: {
        type: "object",
        properties: {
          cal: { type: "number", description: "Kalori per 100g (kkal)" },
          protein: { type: "number", description: "Protein per 100g (gram)" },
          carbs: { type: "number", description: "Karbohidrat per 100g (gram)" },
          fat: { type: "number", description: "Lemak per 100g (gram)" },
        },
        required: ["cal", "protein", "carbs", "fat"],
      },
    });

    const result = {
      cal: Number(res.cal) || 0,
      protein: Number(res.protein) || 0,
      carbs: Number(res.carbs) || 0,
      fat: Number(res.fat) || 0,
      source: "ai",
    };
    llmCache.set(key, result);
    return result;
  } catch (e) {
    // Fallback estimasi generik
    const fallback = { cal: 150, protein: 5, carbs: 20, fat: 5, source: "estimate" };
    llmCache.set(key, fallback);
    return fallback;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PARSING TAKARAN
// ════════════════════════════════════════════════════════════════════════════

// Parse string takaran menjadi gram, contoh: "5 kg" -> 5000, "100 gram" -> 100, "2 butir" -> 120
export function parseAmountToGrams(amountStr) {
  if (!amountStr) return 0;
  const lower = String(amountStr).toLowerCase().trim();

  const matchKg = lower.match(/(\d+(?:[.,]\d+)?)\s*kg\b/);
  const matchGram = lower.match(/(\d+(?:[.,]\d+)?)\s*(gram|gr|g)\b/);
  const matchLiter = lower.match(/(\d+(?:[.,]\d+)?)\s*(liter|l)\b/);
  const matchPcs = lower.match(/(\d+(?:[.,]\d+)?)\s*(pcs|buah|butir|biji|potong|lembar|ikat|bungkus|pack|paket|botol|siung)\b/);

  if (matchKg) return parseFloat(matchKg[1].replace(",", ".")) * 1000;
  if (matchGram) return parseFloat(matchGram[1].replace(",", "."));
  if (matchLiter) return parseFloat(matchLiter[1].replace(",", ".")) * 1000; // 1 liter ≈ 1000g
  if (matchPcs) {
    const qty = parseFloat(matchPcs[1].replace(",", "."));
    // Estimasi berat per pcs berdasarkan jenis bahan
    return qty * 80; // rata-rata 80g per pcs
  }

  // Angka saja tanpa satuan
  const numMatch = lower.match(/(\d+(?:[.,]\d+)?)/);
  if (numMatch) return parseFloat(numMatch[1].replace(",", "."));

  return 0;
}

// Parse teks bahan bebas, contoh: "Nasi 150 gram" -> { nama: "Nasi", gram: 150 }
export function parseIngredientText(text) {
  if (!text || !text.trim()) return null;
  const trimmed = text.trim();

  // Cari nama bahan di database
  const lower = trimmed.toLowerCase();
  const keys = Object.keys(NUTRITION_DB).sort((a, b) => b.length - a.length);
  const dbKey = keys.find(k => lower.includes(k));

  const nama = dbKey || trimmed.replace(/\d+(?:[.,]\d+)?\s*(?:gram|gr|g|kg|liter|l|pcs|buah|butir|biji|potong|lembar|ikat|bungkus|pack|paket|botol|siung)?/gi, "").trim() || trimmed;

  const gram = parseAmountToGrams(trimmed);
  return { nama, gram: gram || 150 }; // default 150g jika tidak ditemukan
}