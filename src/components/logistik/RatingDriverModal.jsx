import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RatingDriverModal({ order, mitraProfile, open, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSaving(true);
    await base44.entities.DriverRating.create({
      order_id: order.id,
      order_number: order.order_number,
      logistic_id: order.logistic_id,
      logistic_name: order.logistic_id,
      mitra_id: mitraProfile?.user_email || "",
      mitra_name: mitraProfile?.organization_name || mitraProfile?.full_name || "Mitra",
      rating,
      comment,
    });
    setSaving(false);
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" /> Rating Driver
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-3 text-sm">
            <p className="font-semibold">{order?.order_number}</p>
            <p className="text-muted-foreground text-xs">{order?.mitra_name} · {order?.delivery_area}</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2 text-center">Beri bintang untuk driver</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      s <= (hovered || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-yellow-600 mt-1">
                {["", "Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"][rating]}
              </p>
            )}
          </div>

          <Textarea
            placeholder="Tulis komentar (opsional)..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
          />

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
            <Button
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled={rating === 0 || saving}
              onClick={handleSubmit}
            >
              {saving ? "Menyimpan..." : "Kirim Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}