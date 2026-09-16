import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, AlertTriangle, Pencil, Trash2, Package, TrendingDown, BarChart2, Store } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

const perishableLabels = { cepat_busuk: "Cepat Busuk", sedang: "Sedang", tahan_lama: "Tahan Lama" };
const perishableColors = { cepat_busuk: "bg-red-50 text-red-700", sedang: "bg-yellow-50 text-yellow-700", tahan_lama: "bg-green-50 text-green-700" };
const categories = ["beras", "telur", "daging", "ikan", "sayuran", "buah", "minyak", "bumbu", "susu", "tepung", "lainnya"];
const units = ["kg", "gram", "liter", "pcs", "ikat", "bungkus"];
const perishables = ["cepat_busuk", "sedang", "tahan_lama"];
const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const EMPTY_FORM = { product_name: "", supplier_name: "", category: "beras", stock: "", unit: "kg", min_stock: "", price: "", perishable: "sedang", notes: "" };

export default function AdminStock() {
  const [stockList, setStockList] = useState([]);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStock();
    fetchSupplierProducts();
    const unsub = base44.entities.WarehouseStock.subscribe((event) => {
      if (event.type === "create") setStockList(prev => [event.data, ...prev]);
      else if (event.type === "update") setStockList(prev => prev.map(s => s.id === event.id ? event.data : s));
      else if (event.type === "delete") setStockList(prev => prev.filter(s => s.id !== event.id));
    });
    const unsubProducts = base44.entities.Product.subscribe((event) => {
      if (event.type === "create") setSupplierProducts(prev => [event.data, ...prev]);
      else if (event.type === "update") setSupplierProducts(prev => prev.map(p => p.id === event.id ? event.data : p));
      else if (event.type === "delete") setSupplierProducts(prev => prev.filter(p => p.id !== event.id));
    });
    return () => { unsub(); unsubProducts(); };
  }, []);

  const fetchStock = async () => {
    setLoading(true);
    const data = await base44.entities.WarehouseStock.list("-created_date", 100);
    setStockList(data);
    setLoading(false);
  };

  const fetchSupplierProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await base44.entities.Product.list("-created_date", 200);
      setSupplierProducts(data);
    } catch (e) {
      setSupplierProducts([]);
    }
    setLoadingProducts(false);
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowDialog(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ ...EMPTY_FORM, ...item });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.product_name || !form.stock || !form.unit) {
      toast({ title: "Nama produk, stok, dan satuan wajib diisi", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      stock: Number(form.stock),
      min_stock: Number(form.min_stock) || 0,
      price: Number(form.price) || 0,
    };
    if (editItem) {
      await base44.entities.WarehouseStock.update(editItem.id, payload);
      toast({ title: "Stok berhasil diperbarui" });
    } else {
      await base44.entities.WarehouseStock.create(payload);
      toast({ title: "Produk stok berhasil ditambahkan" });
    }
    setSaving(false);
    setShowDialog(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus stok "${name}"?`)) return;
    await base44.entities.WarehouseStock.delete(id);
    toast({ title: "Stok dihapus" });
  };

  const filtered = stockList.filter(s =>
    s.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.supplier_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = supplierProducts.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.supplier_name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const lowStockCount = stockList.filter(s => s.stock < (s.min_stock || 0)).length;
  const totalValue = stockList.reduce((acc, s) => acc + (s.stock || 0) * (s.price || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Stok Gudang</h2>
          <p className="text-muted-foreground">Kelola inventaris bahan pangan secara real-time</p>
        </div>

      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-blue-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50"><Package className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Produk</p>
              <p className="text-xl font-bold">{stockList.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={lowStockCount > 0 ? "border-red-200" : "border-green-100"}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${lowStockCount > 0 ? "bg-red-50" : "bg-green-50"}`}>
              <TrendingDown className={`w-5 h-5 ${lowStockCount > 0 ? "text-red-600" : "text-green-600"}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stok Kritis</p>
              <p className={`text-xl font-bold ${lowStockCount > 0 ? "text-red-600" : "text-green-600"}`}>{lowStockCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50"><BarChart2 className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Nilai Total Stok</p>
              <p className="text-xl font-bold">{formatRp(totalValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="warehouse" className="w-full">
        <TabsList>
          <TabsTrigger value="warehouse" className="gap-1.5"><Package className="w-4 h-4" /> Stok Gudang</TabsTrigger>
          <TabsTrigger value="supplier" className="gap-1.5"><Store className="w-4 h-4" /> Produk Supplier</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouse" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari produk atau supplier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-16"><div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{stockList.length === 0 ? "Belum ada data stok. Klik \"Tambah Produk\" untuk mulai." : "Tidak ditemukan"}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead>Pemasok</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead>Min. Stok</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Ketahanan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s) => {
                      const isLow = s.stock < (s.min_stock || 0);
                      return (
                        <TableRow key={s.id} className={isLow ? "bg-red-50/50" : ""}>
                          <TableCell className="font-medium">{s.product_name}</TableCell>
                          <TableCell>{s.supplier_name || "-"}</TableCell>
                          <TableCell className="capitalize">{s.category}</TableCell>
                          <TableCell className={isLow ? "text-red-600 font-bold" : ""}>{s.stock} {s.unit}</TableCell>
                          <TableCell>{s.min_stock || 0} {s.unit}</TableCell>
                          <TableCell>{s.price ? formatRp(s.price) + `/${s.unit}` : "-"}</TableCell>
                          <TableCell>
                            {s.perishable ? (
                              <Badge variant="outline" className={perishableColors[s.perishable]}>{perishableLabels[s.perishable]}</Badge>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            {isLow ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Kritis
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aman</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(s)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(s.id, s.product_name)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplier" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari produk supplier..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="pl-9" />
          </div>

          <Card>
            <CardContent className="p-0">
              {loadingProducts ? (
                <div className="flex justify-center py-16"><div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" /></div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Store className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{supplierProducts.length === 0 ? "Belum ada produk dari supplier." : "Tidak ditemukan"}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead>Harga Supplier</TableHead>
                      <TableHead>Harga Jual</TableHead>
                      <TableHead>Ketahanan</TableHead>
                      <TableHead>Kedaluwarsa</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.supplier_name || "-"}</TableCell>
                        <TableCell className="capitalize">{p.category}</TableCell>
                        <TableCell>{p.stock ?? 0} {p.unit}</TableCell>
                        <TableCell>{p.base_price ? formatRp(p.base_price) : "-"}</TableCell>
                        <TableCell>{p.price ? formatRp(p.price) : "-"}</TableCell>
                        <TableCell>
                          {p.perishable_level ? (
                            <Badge variant="outline" className={perishableColors[p.perishable_level]}>{perishableLabels[p.perishable_level]}</Badge>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-xs">{p.expired_date || "-"}</TableCell>
                        <TableCell>
                          {p.status === "expired" ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Kedaluwarsa</Badge>
                          ) : p.status === "out_of_stock" ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Habis</Badge>
                          ) : p.status === "inactive" ? (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Nonaktif</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aktif</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Tambah/Edit */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Stok Produk" : "Tambah Stok Produk"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Nama Produk <span className="text-destructive">*</span></Label>
                <Input value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))} placeholder="cth. Beras Premium" />
              </div>
              <div className="space-y-1">
                <Label>Nama Supplier</Label>
                <Input value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} placeholder="cth. CV Binar" />
              </div>
              <div className="space-y-1">
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Stok <span className="text-destructive">*</span></Label>
                <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label>Satuan <span className="text-destructive">*</span></Label>
                <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Minimum Stok Aman</Label>
                <Input type="number" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label>Harga / Satuan (Rp)</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Tingkat Ketahanan</Label>
                <Select value={form.perishable} onValueChange={v => setForm(f => ({ ...f, perishable: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{perishables.map(p => <SelectItem key={p} value={p}>{perishableLabels[p]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Catatan</Label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Catatan opsional..." />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>Batal</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : editItem ? "Perbarui" : "Simpan"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}