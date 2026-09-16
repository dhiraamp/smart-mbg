import os
import pypdf

dir_path = r"G:\WORK\picing\frontend\smart-mbg-local\src\data\mister mbg"
files = sorted([f for f in os.listdir(dir_path) if f.endswith(".pdf")])

for f_name in files:
    full_path = os.path.join(dir_path, f_name)
    reader = pypdf.PdfReader(full_path)
    print(f"\n=======================================================")
    print(f"FILE: {f_name} ({len(reader.pages)} Halaman)")
    print(f"=======================================================")
    for p_idx in range(min(3, len(reader.pages))):
        text = reader.pages[p_idx].extract_text() or ""
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        print(f"--- Halaman {p_idx + 1} (Total {len(lines)} baris) ---")
        print("\n".join(lines[:15]))
