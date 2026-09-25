import { z } from "zod";

/**
 * Validasi Skema Data & Type Safety Terpadu — Smart MBG Garut
 * Menggunakan Zod v3 untuk menjamin integritas data transaksi, logistik, dan nutrisi SPPG.
 */

// 1. Skema Item Pesanan Bahan Pangan
export const orderItemSchema = z.object({
  product_id: z.string().min(1, "ID produk wajib diisi"),
  product_name: z.string().min(2, "Nama produk wajib diisi"),
  supplier_name: z.string().optional().default(""),
  price: z.number().min(0, "Harga produk tidak boleh negatif"),
  unit: z.string().min(1, "Satuan wajib diisi (kg, liter, ikat, dll.)"),
  quantity: z.number().min(1, "Kuantitas minimal 1"),
});

// 2. Skema Pesanan Transaksi Lengkap (Order)
export const orderSchema = z.object({
  order_number: z.string().optional(),
  mitra_id: z.string().min(1, "ID Dapur SPPG wajib diisi"),
  mitra_name: z.string().min(2, "Nama Mitra Dapur wajib diisi"),
  supplier_id: z.string().optional(),
  delivery_area: z.string().min(2, "Area pengiriman di Garut wajib ditentukan"),
  items: z.array(orderItemSchema).min(1, "Pesanan harus memuat minimal 1 item"),
  total_amount: z.number().min(0, "Total nilai transaksi tidak boleh negatif"),
  status: z
    .enum(["pending", "confirmed", "processing", "shipping", "delivered", "cancelled"])
    .default("pending"),
  payment_method: z.enum(["bank_transfer", "va", "tempo", "cash"]).default("bank_transfer"),
  notes: z.string().optional().default(""),
  created_date: z.string().optional(),
});

// 3. Skema Surat Jalan & Manifest Pengiriman MBG
export const deliveryManifestSchema = z.object({
  doc_number: z.string().min(5, "Nomor surat jalan tidak valid"),
  origin_hub_id: z.string().min(1, "Dapur SPPG asal wajib ditentukan"),
  origin_hub_name: z.string().min(2, "Nama Dapur SPPG asal wajib diisi"),
  destination_school_id: z.string().min(1, "Sekolah sasaran wajib ditentukan"),
  destination_school_name: z.string().min(2, "Nama sekolah sasaran wajib diisi"),
  driver_name: z.string().min(2, "Nama supir/kurir pengantar wajib diisi"),
  vehicle_plate: z.string().regex(/^[A-Z]{1,2}\s?[0-9]{1,4}\s?[A-Z]{1,3}$/i, "Format plat nomor kendaraan tidak valid (contoh: Z 8812 GA)"),
  portions: z.number().int().min(1, "Jumlah porsi makanan minimal 1"),
  box_count: z.number().int().min(1, "Jumlah thermal box minimal 1"),
  food_menu: z.string().min(5, "Rincian menu makan bergizi wajib diisi"),
  temperature_celsius: z
    .number()
    .min(0, "Suhu tidak boleh di bawah 0°C")
    .max(100, "Suhu tidak boleh melampaui 100°C"),
  departure_time: z.string().min(3, "Jam keberangkatan wajib diisi"),
  target_lunch_time: z.string().min(3, "Jadwal jam makan siang wajib diisi"),
  haccp_verified: z.boolean().default(true),
});

// 4. Skema Formulasi Nutrisi & Menu Harian BGN
export const nutritionItemSchema = z.object({
  commodity_id: z.string().min(1, "ID komoditas bahan wajib dipilih"),
  name: z.string().min(2, "Nama bahan pangan wajib ada"),
  grams: z.number().min(5, "Takaran minimal 5 gram per porsi").max(500, "Takaran maksimal 500 gram per porsi"),
});

export const nutritionPlanSchema = z.object({
  menu_name: z.string().min(3, "Nama menu makanan bergizi minimal 3 karakter"),
  target_group: z.enum(["paud", "sd_rendah", "sd_tinggi", "smp_sma", "ibu_hamil"]),
  ingredients: z.array(nutritionItemSchema).min(2, "Menu minimal harus mengandung 2 komponen bahan pangan"),
  total_calories: z.number().min(200, "Kalori porsi terlalu rendah untuk makan siang"),
  total_protein: z.number().min(10, "Kandungan protein minimal 10 gram"),
  cost_per_portion: z.number().min(0, "Estimasi biaya tidak valid"),
});

// 5. Skema Profil Dapur SPPG (Integrasi Mister MBG)
export const sppgProfileSchema = z.object({
  code: z.string().min(3, "Kode SPPG tidak valid"),
  name: z.string().min(3, "Nama yayasan/dapur SPPG wajib diisi"),
  penanggung_jawab: z.string().min(2, "Nama penanggung jawab wajib diisi"),
  phone: z.string().min(9, "Nomor kontak minimal 9 digit"),
  address: z.string().min(5, "Alamat operasional dapur wajib diisi"),
  kecamatan: z.string().min(2, "Nama kecamatan wajib ditentukan"),
  kapasitas_porsi: z.number().int().min(100, "Kapasitas harian minimal 100 porsi"),
  total_sekolah: z.number().int().min(0).default(0),
});

/**
 * Helper Validasi Data Aman (Safe Parse)
 * @param {z.ZodSchema} schema - Skema Zod
 * @param {unknown} data - Data yang hendak divalidasi
 * @returns {{ success: boolean, data?: any, errors?: string[] }}
 */
export function validateData(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: [],
    };
  }

  // Format pesan error ramah pengguna dalam Bahasa Indonesia
  const formattedErrors = result.error.errors.map((err) => {
    const fieldPath = err.path.join(".");
    return fieldPath ? `[${fieldPath}] ${err.message}` : err.message;
  });

  return {
    success: false,
    data: null,
    errors: formattedErrors,
  };
}
