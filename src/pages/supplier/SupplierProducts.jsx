import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Crown, Star, Lock, AlertTriangle, Clock, RefreshCw, ImagePlus, X } from "lucide-react";
import { differenceInDays, format, addDays } from "date-fns";
import { id } from "date-fns/locale";
import { computeMarkedUpPrice, PLATFORM_MARKUP_RATE } from "@/lib/pricing";

const MAX_SLOTS_PER_ROW = 5;
const BASE_ROW_PRICE = 15000;
const PRICE_DECREMENT = 2000;
const MOCK_FILLED_SLOTS = { row_1: 3, row_2: 1, row_3: 0 };

// Masa berlaku otomatis berdasarkan kategori bahan (hari)
const VALIDITY_BY_CATEGORY = {
  sayuran: 3,
  buah: 5,
  daging: 2,
  ikan: 2,
  susu: 3,
  telur: 14,
  bumbu: 30,
  beras: 90,
  minyak: 180,
  tepung: 180,
  lainnya: 7,
};

// Fallback berdasarkan perishable_level jika kategori tidak ditemukan
const DEFAULT_VALIDITY = { cepat_busuk: 3, sedang: 14, tahan_lama: 90 };

function getValidityDays(category, perishable) {
  return VALIDITY_BY_CATEGORY[category] || DEFAULT_VALIDITY[perishable] || 7;
}

function getRowPrice(rowNumber) {
  return Math.max(BASE_ROW_PRICE - (rowNumber - 1) * PRICE_DECREMENT, 1000);
}

function getAvailableRows(maxRows = 5) {
  const rows = [];
  for (let i = 1; i <= maxRows; i++) {
    const filled = MOCK_FILLED_SLOTS[`row_${i}`] || 0;
    rows.push({ row: i, price: getRowPrice(i), filled, available: MAX_SLOTS_PER_ROW - filled, full: filled >= MAX_SLOTS_PER_ROW });
  }
  return rows;
}

const formatRp = (n) => `Rp ${Number(n).toLocaleString("id-ID")}`;

// Hitung status kedaluwarsa
function getExpiryInfo(product) {
  if (!product.expired_date) return null;
  const today = new Date();
  const expiry = new Date(product.expired_date);
  const daysLeft = differenceInDays(expiry, today);
  return { daysLeft, expiry };
}

const perishableLabels = { cepat_busuk: "Cepat Busuk", sedang: "Sedang", tahan_lama: "Tahan Lama" };
const perishableColors = { cepat_busuk: "bg-red-50 text-red-700", sedang: "bg-yellow-50 text-yellow-700", tahan_lama: "bg-green-50 text-green-700" };
const statusLabels = { active: "Aktif", inactive: "Nonaktif", out_of_stock: "Habis", expired: "Kedaluwarsa" };
const statusColors = { active: "bg-green-50 text-green-700", inactive: "bg-muted text-muted-foreground", out_of_stock: "bg-red-50 text-red-700", expired: "bg-red-100 text-red-800" };

function ExpiryBadge({ product }) {
  const info = getExpiryInfo(product);
  if (!info) return <span className="text-xs text-muted-foreground">-</span>;
  const { daysLeft } = info;
  if (daysLeft < 0) return (
    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 text-xs flex items-center gap-1 w-fit">
      <AlertTriangle className="w-3 h-3" /> Kedaluwarsa
    </Badge>
  );
  if (daysLeft <= 2) return (
    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-xs flex items-center gap-1 w-fit">
      <AlertTriangle className="w-3 h-3" /> {daysLeft}h lagi
    </Badge>
  );
  if (daysLeft <= 7) return (
    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs flex items-center gap-1 w-fit">
      <Clock className="w-3 h-3" /> {daysLeft}h lagi
    </Badge>
  );
  return (
    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs flex items-center gap-1 w-fit">
      <Clock className="w-3 h-3" /> {daysLeft}h lagi
    </Badge>
  );
}

const BLANK_FORM = { name: "", category: "", perishable: "", base_price: "", stock: "", unit: "", promoteRow: "", image_url: "" };

export default function SupplierProducts() {
  const { user } = useUserProfile();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [renewingId, setRenewingId] = useState(null);
  const [newForm, setNewForm] = useState(BLANK_FORM);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const promoteRows = getAvailableRows();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewForm(f => ({ ...f, image_url: file_url }));
    setUploadingImage(false);
  };

  const handlePerishableChange = (v) => {
    setNewForm(f => ({ ...f, perishable: v }));
  };

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Product.filter({ supplier_id: user.email }, "-created_date").then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, [user?.email]);

  // Produk hampir kedaluwarsa (≤ 2 hari)
  const nearExpiry = products.filter(p => {
    const info = getExpiryInfo(p);
    return info && info.daysLeft >= 0 && info.daysLeft <= 2;
  });

  const handleSave = async () => {
    if (!newForm.name) return;
    setSaving(true);
    const rowNum = newForm.promoteRow ? Number(newForm.promoteRow) : null;
    const rowPrice = rowNum ? getRowPrice(rowNum) : 0;
    const validityDays = getValidityDays(newForm.category, newForm.perishable);
    const expiredDate = format(addDays(new Date(), validityDays), "yyyy-MM-dd");

    const basePrice = Number(newForm.base_price) || 0;
    const productData = {
      name: newForm.name,
      category: newForm.category || "lainnya",
      base_price: basePrice,
      price: computeMarkedUpPrice(basePrice),
      unit: newForm.unit || "kg",
      stock: Number(newForm.stock) || 0,
      perishable_level: newForm.perishable || "sedang",
      validity_days: validityDays,
      expired_date: expiredDate,
      status: "active",
      supplier_id: user?.email || "",
      supplier_name: user?.organization_name || user?.full_name || "",
      description: rowNum ? `[PROMOSI: Baris ${rowNum}]` : "",
      image_url: newForm.image_url || "",
    };
    const saved = await base44.entities.Product.create(productData);
    setProducts(prev => [{ ...saved, promoteRow: rowNum }, ...prev]);
    toast({
      title: rowNum ? `Produk dipromosikan di Baris ${rowNum}!` : "Produk berhasil ditambahkan",
      description: rowNum ? `Biaya promosi ${formatRp(rowPrice)}/hari.` : expiredDate ? `Berlaku hingga ${format(new Date(expiredDate), "d MMM yyyy", { locale: id })}` : "",
      duration: 2000,
    });
    setOpen(false);
    setSaving(false);
    setNewForm(BLANK_FORM);
  };

  const handleRenew = async (product) => {
    setRenewingId(product.id);
    const validityDays = getValidityDays(product.category, product.perishable_level);
    const newExpiry = format(addDays(new Date(), validityDays), "yyyy-MM-dd");
    await base44.entities.Product.update(product.id, { expired_date: newExpiry, status: "active" });
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, expired_date: newExpiry, status: "active" } : p));
    toast({
      title: "Produk diperbarui",
      description: `Masa berlaku diperpanjang hingga ${format(new Date(newExpiry), "d MMM yyyy", { locale: id })}`,
      duration: 2000,
    });
    setRenewingId(null);
  };

  const handleEditOpen = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      category: product.category || "",
      perishable: product.perishable_level || "",
      base_price: String(product.base_price ?? product.price ?? ""),
      stock: String(product.stock || ""),
      unit: product.unit || "",
      promoteRow: "",
      image_url: product.image_url || "",
    });
    setEditOpen(true);
  };

  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingEditImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditForm(f => ({ ...f, image_url: file_url }));
    setUploadingEditImage(false);
  };

  const handleEditSave = async () => {
    if (!editingProduct || !editForm.name) return;
    setSaving(true);
    const validityDays = getValidityDays(editForm.category, editForm.perishable);
    const expiredDate = format(addDays(new Date(), validityDays), "yyyy-MM-dd");
    const basePrice = Number(editForm.base_price) || 0;
    const productData = {
      name: editForm.name,
      category: editForm.category || "lainnya",
      base_price: basePrice,
      price: computeMarkedUpPrice(basePrice),
      unit: editForm.unit || "kg",
      stock: Number(editForm.stock) || 0,
      perishable_level: editForm.perishable || "sedang",
      validity_days: validityDays,
      expired_date: expiredDate,
      image_url: editForm.image_url || "",
    };
    const updated = await base44.entities.Product.update(editingProduct.id, productData);
    setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p));
    toast({ title: "Produk berhasil diperbarui", duration: 2000 });
    setEditOpen(false);
    setEditingProduct(null);
    setSaving(false);
  };

  const handleDelete = async (product) => {
    await base44.entities.Product.delete(product.id);
    setProducts(prev => prev.filter(p => p.id !== product.id));
    toast({ title: "Produk dihapus", duration: 2000 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Produk</h2>
          <p className="text-muted-foreground">Kelola produk bahan pangan Anda</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"><Plus className="w-4 h-4 mr-1" /> Tambah Produk</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Tambah Produk Baru</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              {/* FOTO PRODUK */}
              <div className="space-y-1">
                <Label>Foto Produk</Label>
                <div className="flex items-center gap-3">
                  {newForm.image_url ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                      <img src={newForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewForm(f => ({ ...f, image_url: "" }))}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      {uploadingImage ? (
                        <span className="text-xs text-muted-foreground">Upload...</span>
                      ) : (
                        <>
                          <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs text-muted-foreground">Pilih foto</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground">Format: JPG, PNG. Maks 5MB.</p>
                </div>
              </div>
              <div className="space-y-1"><Label>Nama Produk</Label><Input placeholder="Nama produk" value={newForm.name} onChange={e=>setNewForm({...newForm,name:e.target.value})}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Kategori</Label>
                  <Select value={newForm.category} onValueChange={v=>setNewForm({...newForm,category:v})}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sayuran">Sayuran</SelectItem><SelectItem value="buah">Buah</SelectItem>
                      <SelectItem value="daging">Daging</SelectItem><SelectItem value="ikan">Ikan</SelectItem>
                      <SelectItem value="beras">Beras</SelectItem><SelectItem value="telur">Telur</SelectItem>
                      <SelectItem value="bumbu">Bumbu</SelectItem><SelectItem value="susu">Susu</SelectItem>
                      <SelectItem value="minyak">Minyak</SelectItem><SelectItem value="tepung">Tepung</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Tingkat Kerentanan</Label>
                  <Select value={newForm.perishable} onValueChange={handlePerishableChange}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cepat_busuk">Cepat Busuk</SelectItem><SelectItem value="sedang">Sedang</SelectItem><SelectItem value="tahan_lama">Tahan Lama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label>Harga Asli (Rp)</Label><Input type="number" placeholder="0" value={newForm.base_price} onChange={e=>setNewForm({...newForm,base_price:e.target.value})}/>{newForm.base_price ? <p className="text-xs text-green-600">Harga jual ke pembeli: <strong>Rp {computeMarkedUpPrice(Number(newForm.base_price)).toLocaleString("id-ID")}</strong> <span className="text-muted-foreground">(termasuk mark-up {PLATFORM_MARKUP_RATE * 100}%)</span></p> : null}</div>
                <div className="space-y-1"><Label>Stok</Label><Input type="number" placeholder="0" value={newForm.stock} onChange={e=>setNewForm({...newForm,stock:e.target.value})}/></div>
                <div className="space-y-1"><Label>Satuan</Label>
                  <Select value={newForm.unit} onValueChange={v=>setNewForm({...newForm,unit:v})}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kg</SelectItem><SelectItem value="gram">Gram</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem><SelectItem value="pcs">Pcs</SelectItem><SelectItem value="ikat">Ikat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* MASA BERLAKU OTOMATIS */}
              {newForm.category && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-orange-700">
                      Masa berlaku otomatis: <span className="font-bold">{getValidityDays(newForm.category, newForm.perishable)} hari</span>
                    </p>
                    <p className="text-xs text-orange-600">
                      Kedaluwarsa: {format(addDays(new Date(), getValidityDays(newForm.category, newForm.perishable)), "d MMM yyyy", { locale: id })}
                    </p>
                  </div>
                </div>
              )}

              {/* PROMOSI BERBAYAR */}
              <div className="space-y-2 border-t pt-3">
                <Label className="flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-yellow-500"/>Promosi Produk <span className="text-xs text-muted-foreground font-normal">(opsional)</span></Label>
                <p className="text-xs text-muted-foreground">Pilih baris tampil produk Anda — harga per hari, maks. 5 supplier per baris</p>
                <div className="grid grid-cols-1 gap-2">
                  <div onClick={()=>setNewForm({...newForm,promoteRow:""})} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${newForm.promoteRow===""?"border-gray-400 bg-gray-50":"border-gray-200 hover:border-gray-300"}`}>
                    <p className="text-sm font-medium">Tidak promosi (gratis)</p>
                    <p className="text-xs text-muted-foreground">Produk tampil sesuai urutan standar</p>
                  </div>
                  {promoteRows.map(row => (
                    <div key={row.row}
                      onClick={()=>{ if (!row.full) setNewForm({...newForm, promoteRow: String(row.row)}); }}
                      className={`p-3 rounded-lg border-2 transition-all
                        ${row.full ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                        : newForm.promoteRow===String(row.row) ? "border-blue-500 bg-blue-50 cursor-pointer"
                        : "border-gray-200 hover:border-blue-200 cursor-pointer"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {row.full ? <Lock className="w-4 h-4 text-gray-400"/> : <Star className="w-4 h-4 text-yellow-500"/>}
                          <span className="font-semibold text-sm">Baris {row.row}</span>
                          {row.row === 1 && <Badge className="text-xs bg-yellow-400 text-yellow-900">Teratas</Badge>}
                          {row.full && <Badge variant="outline" className="text-xs text-red-600 border-red-300">Penuh</Badge>}
                        </div>
                        <span className="font-bold text-blue-700">{formatRp(row.price)}<span className="font-normal text-xs text-muted-foreground">/hari</span></span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-muted-foreground ml-6">Slot tersisa: {row.available}/{MAX_SLOTS_PER_ROW}</p>
                        <div className="flex gap-0.5">
                          {Array.from({length: MAX_SLOTS_PER_ROW}).map((_, i) => (
                            <div key={i} className={`w-4 h-2 rounded-sm ${i < row.filled ? "bg-blue-400" : "bg-gray-200"}`}/>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white" disabled={saving}>
                {saving ? "Menyimpan..." : newForm.promoteRow ? `Simpan & Bayar ${formatRp(getRowPrice(Number(newForm.promoteRow)))}/hari` : "Simpan Produk"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog Edit Produk */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Produk</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Foto Produk</Label>
              <div className="flex items-center gap-3">
                {editForm.image_url ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={editForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setEditForm(f => ({ ...f, image_url: "" }))} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    {uploadingEditImage ? <span className="text-xs text-muted-foreground">Upload...</span> : <><ImagePlus className="w-6 h-6 text-gray-400 mb-1" /><span className="text-xs text-muted-foreground">Pilih foto</span></>}
                    <input type="file" accept="image/*" className="hidden" onChange={handleEditImageUpload} disabled={uploadingEditImage} />
                  </label>
                )}
                <p className="text-xs text-muted-foreground">Format: JPG, PNG. Maks 5MB.</p>
              </div>
            </div>
            <div className="space-y-1"><Label>Nama Produk</Label><Input placeholder="Nama produk" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Kategori</Label>
                <Select value={editForm.category} onValueChange={v => setEditForm({ ...editForm, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sayuran">Sayuran</SelectItem><SelectItem value="buah">Buah</SelectItem>
                    <SelectItem value="daging">Daging</SelectItem><SelectItem value="ikan">Ikan</SelectItem>
                    <SelectItem value="beras">Beras</SelectItem><SelectItem value="telur">Telur</SelectItem>
                    <SelectItem value="bumbu">Bumbu</SelectItem><SelectItem value="susu">Susu</SelectItem>
                    <SelectItem value="minyak">Minyak</SelectItem><SelectItem value="tepung">Tepung</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Tingkat Kerentanan</Label>
                <Select value={editForm.perishable} onValueChange={v => setEditForm({ ...editForm, perishable: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cepat_busuk">Cepat Busuk</SelectItem><SelectItem value="sedang">Sedang</SelectItem><SelectItem value="tahan_lama">Tahan Lama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><Label>Harga Asli (Rp)</Label><Input type="number" placeholder="0" value={editForm.base_price} onChange={e => setEditForm({ ...editForm, base_price: e.target.value })} />{editForm.base_price ? <p className="text-xs text-green-600">Harga jual ke pembeli: <strong>Rp {computeMarkedUpPrice(Number(editForm.base_price)).toLocaleString("id-ID")}</strong> <span className="text-muted-foreground">(termasuk mark-up {PLATFORM_MARKUP_RATE * 100}%)</span></p> : null}</div>
              <div className="space-y-1"><Label>Stok</Label><Input type="number" placeholder="0" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} /></div>
              <div className="space-y-1"><Label>Satuan</Label>
                <Select value={editForm.unit} onValueChange={v => setEditForm({ ...editForm, unit: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kg</SelectItem><SelectItem value="gram">Gram</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem><SelectItem value="pcs">Pcs</SelectItem><SelectItem value="ikat">Ikat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editForm.category && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-orange-700">Masa berlaku otomatis: <span className="font-bold">{getValidityDays(editForm.category, editForm.perishable)} hari</span></p>
                  <p className="text-xs text-orange-600">Kedaluwarsa: {format(addDays(new Date(), getValidityDays(editForm.category, editForm.perishable)), "d MMM yyyy", { locale: id })}</p>
                </div>
              </div>
            )}
            <Button onClick={handleEditSave} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Banner peringatan produk hampir kedaluwarsa */}
      {nearExpiry.length > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-orange-800 text-sm">Produk hampir kedaluwarsa!</p>
            <p className="text-xs text-orange-700 mt-0.5">
              {nearExpiry.map(p => p.name).join(", ")} — segera upload ulang atau perpanjang masa berlaku.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Kerentanan</TableHead>
                <TableHead>Masa Berlaku</TableHead>
                <TableHead>Promosi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">Memuat...</TableCell></TableRow>
              ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">Belum ada produk. Tambah produk pertama Anda!</TableCell></TableRow>
              ) : products.map((p) => {
                const info = getExpiryInfo(p);
                const isExpiredOrNear = info && info.daysLeft <= 2;
                return (
                  <TableRow key={p.id} className={isExpiredOrNear ? "bg-orange-50/50" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-md object-cover shrink-0 border" />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-gray-100 border flex items-center justify-center shrink-0">
                            <ImagePlus className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          {p.promoteRow && <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0"/>}
                          {p.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{p.category}</TableCell>
                    <TableCell><p className="font-medium">Rp {Number(p.price).toLocaleString("id-ID")}/{p.unit}</p><p className="text-[10px] text-muted-foreground">Asli: Rp {Number(p.base_price ?? p.price).toLocaleString("id-ID")}</p></TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell><Badge variant="outline" className={perishableColors[p.perishable_level]}>{perishableLabels[p.perishable_level]}</Badge></TableCell>
                    <TableCell><ExpiryBadge product={p} /></TableCell>
                    <TableCell>
                      {p.promoteRow ? (
                        <Badge className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-300">
                          <Star className="w-3 h-3 mr-1 inline"/>Baris {p.promoteRow}
                        </Badge>
                      ) : <span className="text-xs text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell><Badge variant="outline" className={statusColors[p.status]}>{statusLabels[p.status] || p.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {info && info.daysLeft <= 2 && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-orange-600 border-orange-300 hover:bg-orange-50"
                            title="Perpanjang masa berlaku"
                            disabled={renewingId === p.id}
                            onClick={() => handleRenew(p)}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${renewingId === p.id ? "animate-spin" : ""}`} />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditOpen(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}