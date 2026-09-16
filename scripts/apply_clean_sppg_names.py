import os
import re
import json

json_path = r"G:\WORK\picing\frontend\smart-mbg-local\src\data\mister_mbg_official_garut.json"
with open(json_path, encoding="utf-8") as f:
    data = json.load(f)

def clean_sppg_entry(d):
    raw_name = d.get("name") or d.get("clean_title") or ""
    kecamatan = d.get("kecamatan", "Garut Kota")
    sppg_id = d["id"].replace("sppg_", "")
    
    # Ambil teks setelah "SPPG #X -"
    match = re.search(r"SPPG #\d+ -\s*(.*)", raw_name, re.IGNORECASE)
    content = match.group(1).strip() if match else raw_name
    
    # Hapus awalan "SPPG Garut", "SPPG", "GARUT"
    cleaned = re.sub(r"^(?:SPPG\s+GARUT|SPPG|GARUT)\s+", "", content, flags=re.IGNORECASE).strip()
    
    # Hapus nama kecamatan jika ada di paling depan
    cleaned = re.sub(r"^" + re.escape(kecamatan) + r"\s+", "", cleaned, flags=re.IGNORECASE).strip()
    
    # Pisahkan sebelum kata "Kecamatan", "Kec.", atau sebelum " - " (yang memisahkan nama PJ)
    parts = re.split(r"\s+Kecamatan\s+|\s+Kec\.\s+", cleaned, flags=re.IGNORECASE)
    desa_unit = parts[0].strip()
    
    pj_raw = ""
    if " - " in desa_unit:
        subparts = desa_unit.split(" - ", 1)
        desa_unit = subparts[0].strip()
        pj_raw = subparts[1].strip()
    elif len(parts) > 1:
        pj_raw = parts[1].strip()

    # Bersihkan desa_unit dari angka NIK atau tanda kurung
    desa_unit = re.sub(r"\([^)]*\)", "", desa_unit).strip()
    desa_unit = re.sub(r"\d{10,}", "", desa_unit).strip() # buang NIK panjang jika ada
    desa_unit = re.sub(r"\s*-\s*$", "", desa_unit).strip() # buang trailing dash

    # Bersihkan nama penanggung jawab
    pj_clean = re.sub(r"\d{10,}", "", pj_raw).strip()
    # buang nama sekolah jika ada di pj_clean
    if "(" in pj_clean:
        pj_clean = pj_clean.split("(")[0].strip()
    if len(pj_clean.split()) > 4:
        pj_clean = " ".join(pj_clean.split()[:3])

    if not desa_unit or len(desa_unit) < 2:
        desa_unit = f"Unit {sppg_id}"

    # Pastikan bersih dan rapi
    desa_unit = desa_unit.title()
    clean_title = f"SPPG #{int(sppg_id):03d} {desa_unit}"

    return {
        "id": d["id"],
        "code": f"SPPG-{int(sppg_id):03d}",
        "name": clean_title,
        "clean_title": clean_title,
        "desa_unit": desa_unit,
        "kecamatan": kecamatan,
        "penanggung_jawab": pj_clean.title() if pj_clean else "Pengelola SPPG",
        "yayasan": d.get("yayasan", "Yayasan MBG Mitra Garut"),
        "kapasitas": d.get("kapasitas", 2500),
        "lat": d["lat"],
        "lng": d["lng"],
        "status": "Aktif",
        "jumlah_sasaran": d.get("jumlah_sasaran", len(d.get("sasaran", []))),
        "sasaran": d.get("sasaran", []),
    }

cleaned_dapur = [clean_sppg_entry(d) for d in data["dapur"]]

print("PEMBERSIHAN SELESAI. 25 SAMPEL PERTAMA:")
for c in cleaned_dapur[:25]:
    print(f"* {c['clean_title']} | Kec. {c['kecamatan']} | PJ: {c['penanggung_jawab']} | Kapasitas: {c['kapasitas']} porsi")

# Tulis balik ke mister_mbg_official_garut.json dan misterMbgOfficialGarut.js
data["dapur"] = cleaned_dapur

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

js_path = r"G:\WORK\picing\frontend\smart-mbg-local\src\data\misterMbgOfficialGarut.js"
with open(js_path, "w", encoding="utf-8") as f:
    f.write("// Data Resmi MISTER MBG Disperindag Garut (Dibersihkan Rapi)\n")
    f.write("export const officialMbgData = " + json.dumps(data, ensure_ascii=False) + ";\n")
    f.write("export default officialMbgData;\n")

print(f"\nBerhasil memperbarui data bersih ke JSON dan JS module!")
