import os
import re
import json

json_path = r"G:\WORK\picing\frontend\smart-mbg-local\src\data\mister_mbg_official_garut.json"
with open(json_path, encoding="utf-8") as f:
    data = json.load(f)

print(f"Total Dapur: {len(data['dapur'])}")

def clean_sppg_entry(d):
    raw_name = d["name"]
    kecamatan = d.get("kecamatan", "Garut Kota")
    sppg_id = d["id"].replace("sppg_", "")
    
    # Ambil teks setelah "SPPG #X -"
    match = re.search(r"SPPG #\d+ -\s*(.*)", raw_name, re.IGNORECASE)
    content = match.group(1).strip() if match else raw_name
    
    # Pola umum: SPPG [GARUT] [KECAMATAN] [DESA/UNIT] [Kecamatan ...] [PJ ...]
    # Hapus awalan "SPPG Garut", "SPPG", "GARUT"
    cleaned = re.sub(r"^(?:SPPG\s+GARUT|SPPG|GARUT)\s+", "", content, flags=re.IGNORECASE).strip()
    
    # Hapus nama kecamatan jika ada di depan
    cleaned = re.sub(r"^" + re.escape(kecamatan) + r"\s+", "", cleaned, flags=re.IGNORECASE).strip()
    
    # Pisahkan sebelum kata "Kecamatan", "Kec.", atau sebelum nama sekolah/posyandu/nama orang
    parts = re.split(r"\s+Kecamatan\s+|\s+Kec\.\s+", cleaned, flags=re.IGNORECASE)
    desa_unit = parts[0].strip()
    
    # Jika di dalam desa_unit masih ada "Kecamatan" atau tanda kurung sasaran
    desa_unit = re.sub(r"\([^)]*\)", "", desa_unit).strip()
    
    # Jika desa_unit kosong, ambil dari kecamatan
    if not desa_unit or len(desa_unit) < 2:
        desa_unit = f"Unit {sppg_id}"

    # Batasi nama unit maksimal 4 kata pertama agar tidak memasukkan nama penanggung jawab
    words = desa_unit.split()
    if len(words) > 4:
        desa_unit = " ".join(words[:3])

    clean_title = f"SPPG #{int(sppg_id):03d} {desa_unit.title()}"
    subtitle = f"Kecamatan {kecamatan}"
    
    return {
        "clean_title": clean_title,
        "desa_unit": desa_unit.title(),
        "subtitle": subtitle,
        "original_raw": raw_name[:60] + "..."
    }

samples = [clean_sppg_entry(d) for d in data["dapur"][:20]]
print("\nSAMPEL PEMBERSIHAN NAMA (20 PERTAMA):")
for s in samples:
    print(f"[{s['clean_title']}] | {s['subtitle']} <-- (Raw: {s['original_raw']})")
