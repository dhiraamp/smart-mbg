import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Package, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

const QUICK_TAGS = [
  "Tepat waktu", "Terlambat", "Bahan segar", "Kualitas buruk",
  "Kemasan baik", "Kemasan rusak", "Ramah", "Kurang responsif",
  "Sesuai pesanan", "Tidak sesuai"
];

function StarRating({ value, onChange, label, icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium flex items-center gap-1.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
        {label}
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            />
          </button>
        ))}
        <span className="text-sm text-muted-foreground ml-2 self-center">
          {value === 0 ? "Belum dinilai" : ["", "Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"][value]}
        </span>
      </div>
    </div>
  );
}

export default function RatingSupplierModal({ open, order, sppgProfile, onClose, onSuccess }) {
  const [ratingKetepatan, setRatingKetepatan] = useState(0);
  const [ratingKualitas, setRatingKualitas] = useState(0);
  const [review, setReview] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (ratingKetepatan === 0 || ratingKualitas === 0) {
      toast({ title: "Lengkapi penilaian", description: "Mohon berikan rating ketepatan dan kualitas terlebih dahulu.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const overall = Math.round(((ratingKetepatan + ratingKualitas) / 2) * 10) / 10;
    await base44.entities.SupplierRating.create({
      order_id: order?.id || "",
      po_number: order?.order_number || order?.po_number || "",
      sppg_id: sppgProfile?.user_email || sppgProfile?.email || "",
      sppg_name: sppgProfile?.organization_name || sppgProfile?.full_name || "SPPG",
      supplier_id: order?.supplier_id || order?.supplier_name || "",
      supplier_name: order?.supplier_name || "-",
      rating_ketepatan: ratingKetepatan,
      rating_kualitas: ratingKualitas,
      rating_overall: overall,
      review,
      tags: selectedTags,
    });
    toast({ title: "Ulasan berhasil dikirim!", description: `Rating ${overall}/5 untuk ${order?.supplier_name || "supplier"} sudah tersimpan.` });
    setLoading(false);
    onSuccess?.();
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Beri Penilaian Supplier
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Pesanan <b>{order?.order_number || order?.po_number}</b> dari <b>{order?.supplier_name || "-"}</b>
          </p>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Star Ratings */}
          <StarRating
            value={ratingKetepatan}
            onChange={setRatingKetepatan}
            label="Ketepatan Waktu Pengiriman"
            icon={Clock}
          />
          <StarRating
            value={ratingKualitas}
            onChange={setRatingKualitas}
            label="Kualitas Bahan Pangan"
            icon={Package}
          />

          {/* Quick Tags */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Tag Penilaian Cepat</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}>
                  <Badge
                    variant="outline"
                    className={`cursor-pointer text-xs transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    {tag}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Review */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Ulasan (opsional)</p>
            <Textarea
              placeholder="Ceritakan pengalaman Anda menerima bahan dari supplier ini..."
              value={review}
              onChange={e => setReview(e.target.value)}
              className="h-24 resize-none"
            />
          </div>

          {/* Rating Preview */}
          {(ratingKetepatan > 0 || ratingKualitas > 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm flex items-center justify-between">
              <span className="text-yellow-700">Rating keseluruhan:</span>
              <span className="font-bold text-yellow-700 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {ratingKetepatan > 0 && ratingKualitas > 0
                  ? (((ratingKetepatan + ratingKualitas) / 2).toFixed(1))
                  : (ratingKetepatan || ratingKualitas)}
                /5
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Star className="w-4 h-4 mr-1" />Kirim Ulasan</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}