import os
import sys

dir_path = r"G:\WORK\picing\frontend\smart-mbg-local\src\data\mister mbg"
files = [os.path.join(dir_path, f) for f in os.listdir(dir_path) if f.endswith(".pdf")]
print(f"Ditemukan {len(files)} file PDF:")
for f in files:
    print(f" - {os.path.basename(f)} ({os.path.getsize(f)} bytes)")

try:
    import pypdf
    print("pypdf tersedia!")
except ImportError:
    try:
        import PyPDF2 as pypdf
        print("PyPDF2 tersedia!")
    except ImportError:
        print("Mencoba install pypdf...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
        import pypdf

for f in files:
    print(f"\n==========================================")
    print(f"MEMBACA: {os.path.basename(f)}")
    print(f"==========================================")
    try:
        reader = pypdf.PdfReader(f)
        print(f"Jumlah halaman: {len(reader.pages)}")
        for idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            print(f"--- Halaman {idx + 1} ({len(text)} karakter) ---")
            print(text[:1500])
            if len(text) > 1500:
                print(f"... [dan {len(text) - 1500} karakter lainnya]")
    except Exception as e:
        print(f"Error membaca {f}: {e}")
