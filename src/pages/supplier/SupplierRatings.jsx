import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Package, TrendingUp, MessageSquare, ThumbsUp } from "lucide-react";

function StarDisplay({ value, size = "sm" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`${size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5"} ${s <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
}

function RatingBar({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right">{value?.toFixed(1) || "-"}</span>
    </div>
  );
}

export default function SupplierRatings() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SupplierRating.list("-created_date", 100)
      .then(data => { setRatings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (!ratings.length) return null;
    const avgKetepatan = ratings.reduce((s, r) => s + (r.rating_ketepatan || 0), 0) / ratings.length;
    const avgKualitas = ratings.reduce((s, r) => s + (r.rating_kualitas || 0), 0) / ratings.length;
    const avgOverall = ratings.reduce((s, r) => s + (r.rating_overall || 0), 0) / ratings.length;
    const fiveStars = ratings.filter(r => Math.round(r.rating_overall) === 5).length;
    const tagCount = {};
    ratings.forEach(r => (r.tags || []).forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return { avgKetepatan, avgKualitas, avgOverall, fiveStars, topTags };
  }, [ratings]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin w-7 h-7 border-4 border-yellow-400 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Rating & Ulasan</h2>
        <p className="text-muted-foreground">Penilaian dari SPPG terhadap layanan Anda</p>
      </div>

      {ratings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Star className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Belum ada ulasan masuk</p>
            <p className="text-sm">Ulasan dari SPPG akan muncul di sini setelah pesanan selesai</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-5 text-center">
                <div className="text-4xl font-bold text-yellow-600">{stats.avgOverall.toFixed(1)}</div>
                <StarDisplay value={stats.avgOverall} size="lg" />
                <p className="text-xs text-muted-foreground mt-1">Rating Keseluruhan</p>
                <p className="text-sm font-medium mt-1">{ratings.length} ulasan</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 space-y-3">
                <RatingBar label="Ketepatan Waktu" value={stats.avgKetepatan} />
                <RatingBar label="Kualitas Bahan" value={stats.avgKualitas} />
                <div className="pt-1 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ThumbsUp className="w-3.5 h-3.5 text-green-500" />
                    <span><b className="text-foreground">{stats.fiveStars}</b> ulasan bintang 5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  Tag Terbanyak
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {stats.topTags.map(([tag, count]) => (
                    <Badge key={tag} variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                      {tag} · {count}×
                    </Badge>
                  ))}
                  {stats.topTags.length === 0 && <p className="text-xs text-muted-foreground">Belum ada tag</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual Reviews */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Semua Ulasan ({ratings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ratings.map((r, i) => (
                  <div key={r.id || i} className="p-4 rounded-xl border bg-muted/20 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-sm">{r.sppg_name || "SPPG"}</p>
                        <p className="text-xs text-muted-foreground">
                          PO: {r.po_number || "-"} · {r.created_date ? new Date(r.created_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StarDisplay value={r.rating_overall || 0} />
                        <span className="text-sm font-bold">{r.rating_overall?.toFixed(1) || "-"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background rounded-lg p-2.5 border">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" /> Ketepatan Waktu
                        </p>
                        <div className="flex items-center gap-1.5">
                          <StarDisplay value={r.rating_ketepatan || 0} />
                          <span className="text-xs font-bold">{r.rating_ketepatan}/5</span>
                        </div>
                      </div>
                      <div className="bg-background rounded-lg p-2.5 border">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <Package className="w-3 h-3" /> Kualitas Bahan
                        </p>
                        <div className="flex items-center gap-1.5">
                          <StarDisplay value={r.rating_kualitas || 0} />
                          <span className="text-xs font-bold">{r.rating_kualitas}/5</span>
                        </div>
                      </div>
                    </div>

                    {(r.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {r.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}

                    {r.review && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                        <p className="text-sm text-blue-900 italic">"{r.review}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}