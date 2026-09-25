import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Printer,
  Download,
  FileText,
  ShieldCheck,
  Truck,
  Copy,
  Eye,
  FileCheck,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

// Daftar Sekolah Sasaran Default MBG Garut
const DEFAULT_SCHOOLS = [
  {
    id: "SCH-01",
    name: "SDN 1 Paminggir",
    address: "Jl. Pasundan No. 45, Garut Kota",
    pic: "Bpk. Dedi Supriyadi, M.Pd (Kepsek)",
    phone: "0813-2234-9901",
    portions: 380,
    lunchTime: "11:30 WIB",
  },
  {
    id: "SCH-02",
    name: "SMPN 1 Garut",
    address: "Jl. Ahmad Yani No. 120, Garut Kota",
    pic: "Ibu Dra. Hj. Entin Kartini (Kepsek)",
    phone: "0812-9988-7766",
    portions: 520,
    lunchTime: "11:45 WIB",
  },
  {
    id: "SCH-03",
    name: "SDN 2 Jayawaras",
    address: "Jl. Raya Samarang No. 22, Tarogong Kidul",
    pic: "Bpk. Rahmat Fauzi, S.Pd",
    phone: "0877-4455-6611",
    portions: 310,
    lunchTime: "11:30 WIB",
  },
  {
    id: "SCH-04",
    name: "SMKN 1 Garut",
    address: "Jl. Cimanuk No. 309A, Tarogong Kidul",
    pic: "Bpk. H. Dadang Hermansyah",
    phone: "0811-2009-881",
    portions: 650,
    lunchTime: "12:00 WIB",
  },
];

// Dapur SPPG Garut
const DEFAULT_HUBS = [
  {
    id: "HUB-01",
    name: "Dapur Sentral SPPG Garut Kota",
    address: "Jl. Pramuka No. 14, Garut Kota",
    manager: "Ibu Hj. Nining Marlina",
    contact: "0812-2345-6789",
  },
  {
    id: "HUB-02",
    name: "SPPG Berkah Tarogong Kidul",
    address: "Jl. Pembangunan No. 88, Tarogong Kidul",
    manager: "Bpk. H. Cecep Gunawan",
    contact: "0813-8877-1122",
  },
];

export default function MbgDocumentGenerator({ defaultDocType = "surat_jalan" }) {
  const [docType, setDocType] = useState(defaultDocType); // "surat_jalan" | "bast" | "rekap"
  const [isExporting, setIsExporting] = useState(false);

  // Form State Dokumen
  const [docNumber, setDocNumber] = useState(`SJ-MBG-GRT/${new Date().getFullYear()}/09/23-0104`);
  const [selectedHub, setSelectedHub] = useState(DEFAULT_HUBS[0]);
  const [selectedSchool, setSelectedSchool] = useState(DEFAULT_SCHOOLS[0]);
  const [driverName, setDriverName] = useState("Kang Asep Sunandar");
  const [vehiclePlate, setVehiclePlate] = useState("Z 8812 GA");
  const [portions, setPortions] = useState(DEFAULT_SCHOOLS[0].portions);
  const [foodMenu, setFoodMenu] = useState(
    "Nasi Pulen Garut, Ayam Goreng Lengkuas, Tempe Bacem, Sayur Bening Bayam Wortel, Buah Jeruk Garut, Susu Segar Pasteur"
  );
  const [departureTime, setDepartureTime] = useState("10:45 WIB");
  const [haccpTemp, setHaccpTemp] = useState("64.5°C");
  const [boxCount, setBoxCount] = useState(19); // 19 thermal container box @ 20 porsi

  // Update data saat ganti sekolah sasaran
  const handleSchoolChange = (schoolId) => {
    const sc = DEFAULT_SCHOOLS.find((s) => s.id === schoolId);
    if (sc) {
      setSelectedSchool(sc);
      setPortions(sc.portions);
      setBoxCount(Math.ceil(sc.portions / 20));
    }
  };

  // 1. Ekspor Dokumen ke Format PDF (jsPDF)
  const handleExportPdf = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const marginX = 15;
      let currentY = 18;

      // Header KOP Surat Resmi
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text("BADAN GIZI NASIONAL (BGN) REPUBLIK INDONESIA", marginX, currentY);
      currentY += 5;
      doc.setFontSize(10);
      doc.text("SATUAN PELAYANAN PROGRAM GIZI (SPPG) KABUPATEN GARUT", marginX, currentY);
      currentY += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Sekretariat Bersama Disperindag Garut • Jl. Pramuka No. 14, Garut Kota • Email: mbg@garutkab.go.id",
        marginX,
        currentY
      );
      currentY += 4;

      // Garis Kop Surat
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.6);
      doc.line(marginX, currentY, 195, currentY);
      doc.setLineWidth(0.2);
      doc.line(marginX, currentY + 1, 195, currentY + 1);
      currentY += 8;

      if (docType === "surat_jalan") {
        // Judul Dokumen
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text("SURAT JALAN PENGIRIMAN MAKAN BERGIZI GRATIS (MBG)", marginX, currentY);
        currentY += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Nomor Dokumen: ${docNumber}`, marginX, currentY);
        currentY += 8;

        // Info Pengiriman (2 Kolom)
        doc.setFillColor(241, 245, 249);
        doc.rect(marginX, currentY, 180, 26, "F");
        doc.setDrawColor(203, 213, 225);
        doc.rect(marginX, currentY, 180, 26, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("DAPUR PENGIRIM (SPPG):", marginX + 3, currentY + 5);
        doc.text("SEKOLAH PENERIMA (DESTINASI):", marginX + 93, currentY + 5);

        doc.setFont("helvetica", "normal");
        doc.text(`Nama: ${selectedHub.name}`, marginX + 3, currentY + 10);
        doc.text(`Alamat: ${selectedHub.address}`, marginX + 3, currentY + 14);
        doc.text(`PJ Dapur: ${selectedHub.manager} (${selectedHub.contact})`, marginX + 3, currentY + 18);
        doc.text(`Jam Berangkat: ${departureTime}`, marginX + 3, currentY + 22);

        doc.text(`Sekolah: ${selectedSchool.name}`, marginX + 93, currentY + 10);
        doc.text(`Alamat: ${selectedSchool.address}`, marginX + 93, currentY + 14);
        doc.text(`PIC Sekolah: ${selectedSchool.pic}`, marginX + 93, currentY + 18);
        doc.text(`Jadwal Makan Siang: ${selectedSchool.lunchTime}`, marginX + 93, currentY + 22);
        currentY += 32;

        // Data Armada & Supir
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("DATA ARMADA & STANDAR KEAMANAN PANGAN (HACCP):", marginX, currentY);
        currentY += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`• Petugas Pengantar (Supir): ${driverName}`, marginX + 2, currentY);
        doc.text(`• Nomor Kendaraan: ${vehiclePlate}`, marginX + 70, currentY);
        doc.text(`• Suhu Makanan Berangkat: ${haccpTemp} (Standar > 60°C)`, marginX + 120, currentY);
        currentY += 8;

        // Tabel Manifest Menu & Porsi
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setFillColor(37, 99, 235);
        doc.rect(marginX, currentY, 180, 7, "F");
        doc.setTextColor(255, 255, 255);
        doc.text("NO", marginX + 3, currentY + 5);
        doc.text("MANIFEST MENU MAKAN BERGIZI", marginX + 15, currentY + 5);
        doc.text("WADAH / BOX", marginX + 120, currentY + 5);
        doc.text("JUMLAH PORSI", marginX + 152, currentY + 5);
        currentY += 7;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text("1", marginX + 4, currentY + 5);
        const splitMenu = doc.splitTextToSize(foodMenu, 95);
        doc.text(splitMenu, marginX + 15, currentY + 5);
        doc.text(`${boxCount} Thermal Box`, marginX + 120, currentY + 5);
        doc.setFont("helvetica", "bold");
        doc.text(`${portions} Porsi`, marginX + 155, currentY + 5);
        currentY += 16;

        // Total
        doc.setDrawColor(203, 213, 225);
        doc.line(marginX, currentY, 195, currentY);
        currentY += 4;
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL MUATAN DISTRIBUSI: ${portions} PORSI SIAP SANTAP`, marginX + 15, currentY);
        currentY += 12;

        // Checklist Verifikasi Serah Terima
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("CHECKLIST VERIFIKASI SAAT TIBA DI SEKOLAH:", marginX, currentY);
        currentY += 5;
        doc.setFont("helvetica", "normal");
        doc.text("[  ] Jumlah thermal box sesuai manifest", marginX + 3, currentY);
        doc.text("[  ] Suhu makanan saat dibuka hangat (> 60°C)", marginX + 65, currentY);
        doc.text("[  ] Sampel uji organoleptik layak santap", marginX + 130, currentY);
        currentY += 18;

        // Tanda Tangan 3 Pihak
        const signY = currentY;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        // Pihak 1: SPPG
        doc.text("Pengirim (Dapur SPPG),", marginX + 5, signY);
        doc.text(selectedHub.manager, marginX + 5, signY + 20);
        doc.setFontSize(7);
        doc.text("PJ Operasional SPPG", marginX + 5, signY + 24);

        // Pihak 2: Driver
        doc.setFontSize(8);
        doc.text("Petugas Ekspedisi / Kurir,", marginX + 68, signY);
        doc.text(driverName, marginX + 68, signY + 20);
        doc.setFontSize(7);
        doc.text("Driver MBG", marginX + 68, signY + 24);

        // Pihak 3: Penerima Sekolah
        doc.setFontSize(8);
        doc.text("Penerima (Sekolah Sasaran),", marginX + 130, signY);
        doc.text(selectedSchool.pic.split("(")[0], marginX + 130, signY + 20);
        doc.setFontSize(7);
        doc.text("Kepala Sekolah / Panitia MBG", marginX + 130, signY + 24);
      } else {
        // Dokumen BAST (Berita Acara Serah Terima)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text("BERITA ACARA SERAH TERIMA (BAST) MAKAN BERGIZI GRATIS", marginX, currentY);
        currentY += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Nomor: BAST-MBG-GRT/${new Date().getFullYear()}/09/23-0104`, marginX, currentY);
        currentY += 8;

        doc.setFontSize(8);
        const introText =
          `Pada hari ini, Rabu tanggal 23 September 2026, telah dilaksanakan serah terima paket Makan Bergizi Gratis (MBG) bertempat di ${selectedSchool.name}, beralamat di ${selectedSchool.address}, antara Dapur Sentral ${selectedHub.name} dan pihak sekolah penerima sasaran.`;
        const splitIntro = doc.splitTextToSize(introText, 180);
        doc.text(splitIntro, marginX, currentY);
        currentY += 14;

        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, currentY, 180, 42, "F");
        doc.setDrawColor(203, 213, 225);
        doc.rect(marginX, currentY, 180, 42, "S");

        doc.setFont("helvetica", "bold");
        doc.text("RINCIAN HASIL PENERIMAAN PAKET MAKANAN:", marginX + 4, currentY + 5);
        doc.setFont("helvetica", "normal");
        doc.text(`1. Total Porsi Diterima : ${portions} Porsi (Lengkap dengan sendok & wadah ramah lingkungan)`, marginX + 4, currentY + 11);
        doc.text(`2. Kondisi Wadah/Box   : ${boxCount} Thermal Box dalam kondisi tersegel baik & bersih`, marginX + 4, currentY + 17);
        doc.text(`3. Menu Makanan        : ${foodMenu.substring(0, 75)}...`, marginX + 4, currentY + 23);
        doc.text(`4. Suhu Makanan Tiba   : ${haccpTemp} (Memenuhi standar hangat dan higienis BGN)`, marginX + 4, currentY + 29);
        doc.text(`5. Uji Sampel Petugas  : Layak Konsumsi, cita rasa sesuai, aroma segar, higienis`, marginX + 4, currentY + 35);
        currentY += 50;

        doc.text(
          "Demikian Berita Acara Serah Terima ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagai bukti pertanggungjawaban pendistribusian program MBG Kabupaten Garut.",
          marginX,
          currentY
        );
        currentY += 15;

        // Tanda Tangan BAST
        const signY = currentY;
        doc.text("Pihak Pertama (Pengantar MBG),", marginX + 15, signY);
        doc.text(driverName, marginX + 15, signY + 22);
        doc.setFontSize(7);
        doc.text("Driver / Petugas Logistik SPPG", marginX + 15, signY + 26);

        doc.setFontSize(8);
        doc.text("Pihak Kedua (Penerima Sekolah),", marginX + 115, signY);
        doc.text(selectedSchool.pic, marginX + 115, signY + 22);
        doc.setFontSize(7);
        doc.text("Kepala Sekolah / Ketua Tim MBG", marginX + 115, signY + 26);
      }

      // Footer Resmi
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "Dokumen ini digenerate secara otomatis melalui Smart MBG Garut Portal terintegrasi Disperindag & BGN.",
        marginX,
        285
      );

      // Simpan file PDF
      const fileName = `${docType === "surat_jalan" ? "Surat_Jalan" : "BAST"}_MBG_${selectedSchool.name.replace(/\s+/g, "_")}.pdf`;
      doc.save(fileName);
      toast.success(`Dokumen ${fileName} berhasil diunduh!`);
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat file PDF. Silakan coba kembali.");
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Cetak Langsung (Print Preview)
  const handlePrint = () => {
    toast.info("Membuka dialog cetak browser...");
    window.print();
  };

  // 3. Salin Format Pesan WhatsApp / Berita Acara
  const handleCopyWaText = () => {
    const text = `*PEMBERITAHUAN DISTRIBUSI SMART MBG GARUT*\n\n` +
      `📄 *No. Surat Jalan:* ${docNumber}\n` +
      `🏭 *Dapur Asal:* ${selectedHub.name}\n` +
      `🏫 *Tujuan:* ${selectedSchool.name} (${selectedSchool.address})\n` +
      `📦 *Jumlah:* ${portions} Porsi (${boxCount} Box Thermal)\n` +
      `🍲 *Menu:* ${foodMenu}\n` +
      `🚚 *Kurir:* ${driverName} (${vehiclePlate})\n` +
      `⏰ *Jam Berangkat:* ${departureTime} (Target Makan: ${selectedSchool.lunchTime})\n` +
      `🌡️ *Suhu Makanan:* ${haccpTemp} (Hangat & Higienis Standar BGN)\n\n` +
      `_Status: Sedang Dalam Perjalanan menuju lokasi sekolah._`;

    navigator.clipboard.writeText(text);
    toast.success("Format teks laporan berhasil disalin ke clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header Generator Dokumen */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileCheck className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Generator Dokumen Resmi MBG</h1>
                <Badge className="bg-primary text-white text-[11px]">Format BGN & Disperindag</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Cetak Surat Jalan, Berita Acara Serah Terima (BAST), dan Manifest Pengiriman Makanan Bergizi
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyWaText}
            className="flex items-center gap-1.5 text-xs"
          >
            <Copy className="w-3.5 h-3.5" /> Salin Teks WA
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Langsung (A4)
          </Button>
          <Button
            size="sm"
            disabled={isExporting}
            onClick={handleExportPdf}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" /> Unduh Dokumen PDF
          </Button>
        </div>
      </div>

      {/* Tabs Pilihan Dokumen */}
      <div className="flex items-center justify-between border-b pb-2">
        <Tabs value={docType} onValueChange={setDocType} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <TabsList>
              <TabsTrigger value="surat_jalan" className="flex items-center gap-1.5 text-xs">
                <Truck className="w-3.5 h-3.5" /> Surat Jalan Distribusi (DO)
              </TabsTrigger>
              <TabsTrigger value="bast" className="flex items-center gap-1.5 text-xs">
                <FileCheck className="w-3.5 h-3.5" /> Berita Acara Serah Terima (BAST)
              </TabsTrigger>
            </TabsList>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Format terverifikasi BGN & Pemkab Garut
            </span>
          </div>
        </Tabs>
      </div>

      {/* Grid: Editor Form (Kiri) vs Preview A4 Resmi (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Form Editor Data Dokumen (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Pengaturan Data Dokumen
              </CardTitle>
              <CardDescription className="text-xs">
                Ubah informasi tujuan sekolah, manifest menu, armada, dan supir pengantar
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nomor Dokumen / Resi:</label>
                <Input
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="h-8 text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Sekolah Sasaran Penerima:</label>
                <select
                  value={selectedSchool.id}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="w-full border rounded-md p-2 bg-background text-xs"
                >
                  {DEFAULT_SCHOOLS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.portions} porsi) — Jam Makan {s.lunchTime}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  PIC: {selectedSchool.pic} • {selectedSchool.address}
                </p>
              </div>

              <div>
                <label className="font-semibold block mb-1">Dapur Pengirim (SPPG):</label>
                <select
                  value={selectedHub.id}
                  onChange={(e) => {
                    const hub = DEFAULT_HUBS.find((h) => h.id === e.target.value);
                    if (hub) setSelectedHub(hub);
                  }}
                  className="w-full border rounded-md p-2 bg-background text-xs"
                >
                  {DEFAULT_HUBS.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Jumlah Porsi MBG:</label>
                  <Input
                    type="number"
                    value={portions}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setPortions(val);
                      setBoxCount(Math.ceil(val / 20));
                    }}
                    className="h-8 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Jumlah Boks Thermal:</label>
                  <Input
                    type="number"
                    value={boxCount}
                    onChange={(e) => setBoxCount(Number(e.target.value) || 0)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Manifest Menu Makanan:</label>
                <textarea
                  rows={3}
                  value={foodMenu}
                  onChange={(e) => setFoodMenu(e.target.value)}
                  className="w-full border rounded-md p-2 bg-background text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Supir / Driver:</label>
                  <Input
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Plat Kendaraan:</label>
                  <Input
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Jam Berangkat Dapur:</label>
                  <Input
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Suhu Makanan (HACCP):</label>
                  <Input
                    value={haccpTemp}
                    onChange={(e) => setHaccpTemp(e.target.value)}
                    className="h-8 text-xs font-bold text-amber-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Live Preview Format Kertas Resmi A4 (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="shadow-lg border-2">
            <CardHeader className="py-2.5 px-4 bg-muted/40 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Pratinjau Cetak Kertas Resmi A4
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-background font-mono">
                Standar BGN & Disperindag Garut
              </Badge>
            </CardHeader>

            <CardContent className="p-6 bg-white text-slate-900 font-sans min-h-[620px] select-text">
              {/* KOP Surat Resmi */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4">
                <div className="text-center space-y-0.5">
                  <p className="font-bold text-xs uppercase tracking-wide text-slate-800">
                    Badan Gizi Nasional (BGN) Republik Indonesia
                  </p>
                  <h2 className="font-black text-sm uppercase tracking-wider text-slate-950">
                    Satuan Pelayanan Program Gizi (SPPG) Kabupaten Garut
                  </h2>
                  <p className="text-[10px] text-slate-600">
                    Dinas Perindustrian, Perdagangan, Energi dan Sumber Daya Mineral Kab. Garut
                  </p>
                  <p className="text-[9px] text-slate-500 italic">
                    Sekretariat: Jl. Pramuka No. 14 Garut • Telp: (0262) 231-890 • Email: mbg@garutkab.go.id
                  </p>
                </div>
              </div>

              {docType === "surat_jalan" ? (
                /* Layout Surat Jalan Pengiriman */
                <div className="space-y-4 text-xs">
                  <div className="text-center mb-3">
                    <h3 className="font-black text-sm tracking-wider uppercase underline underline-offset-4">
                      Surat Jalan Pengiriman Makan Bergizi Gratis (MBG)
                    </h3>
                    <p className="font-mono text-[11px] text-slate-600 mt-1">No: {docNumber}</p>
                  </div>

                  {/* Info 2 Kolom SPPG & Sekolah */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-300 rounded text-[11px]">
                    <div>
                      <p className="font-bold text-slate-800 uppercase border-b pb-0.5 mb-1 text-[10px]">
                        Dapur Pengirim (SPPG):
                      </p>
                      <p className="font-bold text-slate-900">{selectedHub.name}</p>
                      <p className="text-slate-600">{selectedHub.address}</p>
                      <p className="text-slate-600 mt-1">
                        PJ: <strong>{selectedHub.manager}</strong> ({selectedHub.contact})
                      </p>
                      <p className="text-slate-600">Jam Berangkat: <strong>{departureTime}</strong></p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 uppercase border-b pb-0.5 mb-1 text-[10px]">
                        Sekolah Penerima (Destinasi):
                      </p>
                      <p className="font-bold text-emerald-800">{selectedSchool.name}</p>
                      <p className="text-slate-600">{selectedSchool.address}</p>
                      <p className="text-slate-600 mt-1">
                        PIC: <strong>{selectedSchool.pic}</strong>
                      </p>
                      <p className="text-slate-600">
                        Jadwal Makan: <strong className="text-emerald-700">{selectedSchool.lunchTime}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Detail Armada & HACCP */}
                  <div className="flex items-center justify-between p-2 border border-slate-200 rounded text-[11px] bg-amber-50/40">
                    <div>
                      <span className="text-slate-500">Supir Pengantar:</span>{" "}
                      <strong>{driverName}</strong> ({vehiclePlate})
                    </div>
                    <div>
                      <span className="text-slate-500">Suhu Boks Makanan:</span>{" "}
                      <strong className="text-amber-800">{haccpTemp}</strong> (Standar &gt; 60°C)
                    </div>
                  </div>

                  {/* Tabel Manifest Menu */}
                  <div>
                    <table className="w-full border-collapse border border-slate-300 text-[11px]">
                      <thead>
                        <tr className="bg-slate-200 text-slate-800 text-[10px] uppercase">
                          <th className="border border-slate-300 p-1.5 w-8 text-center">No</th>
                          <th className="border border-slate-300 p-1.5 text-left">Deskripsi Menu MBG</th>
                          <th className="border border-slate-300 p-1.5 w-28 text-center">Kemasan / Box</th>
                          <th className="border border-slate-300 p-1.5 w-24 text-right">Jumlah Porsi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 p-2 text-center font-bold">1</td>
                          <td className="border border-slate-300 p-2 leading-relaxed">
                            <p className="font-bold text-slate-900">Paket Lengkap Menu Makan Siang Bergizi</p>
                            <p className="text-slate-600 text-[10px] mt-0.5">{foodMenu}</p>
                          </td>
                          <td className="border border-slate-300 p-2 text-center">
                            {boxCount} Thermal Box
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-black text-slate-900">
                            {portions} Porsi
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={3} className="border border-slate-300 p-2 text-right">
                            TOTAL MUATAN PORSI DISERAHKAN:
                          </td>
                          <td className="border border-slate-300 p-2 text-right text-emerald-800 font-black">
                            {portions} PORSI
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Checklist Serah Terima */}
                  <div className="border border-slate-200 p-2 rounded text-[10px] text-slate-700 space-y-1">
                    <p className="font-bold uppercase tracking-wider text-[9px]">
                      Checklist Petugas Penerima di Sekolah:
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      <label className="flex items-center gap-1.5">
                        <input type="checkbox" defaultChecked className="rounded" /> Jumlah box utuh
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input type="checkbox" defaultChecked className="rounded" /> Suhu makanan hangat
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input type="checkbox" defaultChecked className="rounded" /> Cita rasa layak santap
                      </label>
                    </div>
                  </div>

                  {/* Tanda Tangan 3 Pihak */}
                  <div className="grid grid-cols-3 gap-2 pt-4 text-center text-[10px]">
                    <div>
                      <p className="text-slate-600">Dapur Pengirim (SPPG),</p>
                      <div className="h-14"></div>
                      <p className="font-bold underline">{selectedHub.manager}</p>
                      <p className="text-[9px] text-slate-500">Penanggung Jawab Dapur</p>
                    </div>

                    <div>
                      <p className="text-slate-600">Kurir Pengantar,</p>
                      <div className="h-14"></div>
                      <p className="font-bold underline">{driverName}</p>
                      <p className="text-[9px] text-slate-500">Driver MBG</p>
                    </div>

                    <div>
                      <p className="text-slate-600">Penerima di Sekolah,</p>
                      <div className="h-14"></div>
                      <p className="font-bold underline">{selectedSchool.pic.split("(")[0]}</p>
                      <p className="text-[9px] text-slate-500">Kepala Sekolah / Panitia MBG</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Layout Berita Acara Serah Terima (BAST) */
                <div className="space-y-4 text-xs">
                  <div className="text-center mb-3">
                    <h3 className="font-black text-sm tracking-wider uppercase underline underline-offset-4">
                      Berita Acara Serah Terima (BAST) Makan Bergizi Gratis
                    </h3>
                    <p className="font-mono text-[11px] text-slate-600 mt-1">
                      Nomor: BAST-MBG-GRT/{new Date().getFullYear()}/09/23-0104
                    </p>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-800 text-justify">
                    Pada hari ini, <strong>Rabu, 23 September 2026</strong>, bertempat di{" "}
                    <strong>{selectedSchool.name}</strong>, telah dilaksanakan serah terima paket Makan
                    Bergizi Gratis (MBG) antara Satuan Pelayanan Program Gizi (SPPG) Dapur{" "}
                    <strong>{selectedHub.name}</strong> kepada pihak sekolah sasaran dengan rincian sebagai
                    berikut:
                  </p>

                  <div className="border border-slate-300 p-3 rounded bg-slate-50 space-y-2 text-[11px]">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">1. Total Porsi Diterima:</span>
                      <strong className="text-slate-900">{portions} Porsi Makanan Siap Santap</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">2. Wadah Kemasan / Box:</span>
                      <span>{boxCount} Thermal Container Box (Kondisi Segel Utuh & Higienis)</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">3. Uji Suhu Kedatangan:</span>
                      <strong className="text-amber-700">{haccpTemp} (Memenuhi standar hangat &gt; 60°C)</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">4. Waktu Tiba di Lokasi:</span>
                      <span>11:05 WIB (Sesuai jadwal sebelum jam makan siang {selectedSchool.lunchTime})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">5. Hasil Uji Sampel Petugas:</span>
                      <strong className="text-emerald-700">Layak Konsumsi, Higienis, & Aman untuk Siswa</strong>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-800 text-justify">
                    Demikian Berita Acara Serah Terima ini dibuat dalam rangkap yang sah untuk dipergunakan
                    sebagai bukti pertanggungjawaban fisik dan administrasi dalam pelaksanaan program Makan
                    Bergizi Gratis (MBG) Kabupaten Garut.
                  </p>

                  {/* Tanda Tangan BAST 2 Pihak */}
                  <div className="grid grid-cols-2 gap-6 pt-6 text-center text-[11px]">
                    <div>
                      <p className="text-slate-600">Pihak Pertama (Pengantar MBG),</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline">{driverName}</p>
                      <p className="text-[10px] text-slate-500">Petugas Distribusi SPPG</p>
                    </div>

                    <div>
                      <p className="text-slate-600">Pihak Kedua (Penerima Sekolah),</p>
                      <div className="h-16"></div>
                      <p className="font-bold underline">{selectedSchool.pic}</p>
                      <p className="text-[10px] text-slate-500">Kepala Sekolah / Panitia MBG</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Watermark Garut MBG di bagian bawah */}
              <div className="mt-8 pt-3 border-t border-dashed border-slate-300 text-center text-[9px] text-slate-400">
                Dokumen Resmi Smart MBG • Disperindag & Pemkab Garut • Terhubung Sistem Database Cloud
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
