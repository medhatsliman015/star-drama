"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

const GENRES = ["أكشن", "دراما", "رومانسي", "إثارة", "كوميديا", "فانتازيا", "تاريخي", "رعب", "غموض"];
const ORIGINS = ["صيني", "كوري", "ياباني", "تايلاندي", "عربي", "هندي", "تركي", "أمريكي"];

type Series = {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  kind: "series" | "movie";
  genres: string[];
  audio: "مترجم" | "مدبلج";
  origin: string;
  year: number;
  episodeCount: number;
  views: number;
  addedAt: string;
  featured: boolean;
  status: "مكتمل" | "مستمر";
  poster: string;
  backdrop: string;
  episodes?: { number: number; title?: string; duration?: string; videoUrl?: string }[];
  _embedUrl?: string;
  _sourceUrl?: string;
  videoSources?: { m3u8: string[]; mp4: string[]; other: string[] };
  videoUrl?: string;
};

export default function EditSeriesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchSeries();
  }, [id]);

  async function fetchSeries() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/catalog/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSeries(data);
      } else {
        router.push("/admin");
      }
    } catch (e) {
      console.error(e);
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!series) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/catalog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(series),
      });
      if (res.ok) {
        setToast({ type: "success", message: "تم الحفظ بنجاح" });
      } else {
        setToast({ type: "error", message: "فشل الحفظ" });
      }
    } catch {
      setToast({ type: "error", message: "خطأ في الاتصال" });
    } finally {
      setSaving(false);
    }
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[\u064B-\u065F]/g, "")
      .replace(/[\s\-_]+/g, "-")
      .replace(/[^\w\-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  const GENRES = ["أكشن", "دراما", "رومانسي", "إثارة", "كوميديا", "فانتازيا", "تاريخي", "رعب", "غموض"];
  const ORIGINS = ["صيني", "كوري", "ياباني", "تايلاندي", "عربي", "هندي", "تركي", "أمريكي"];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  }
  if (!series) {
    return <div className="text-center py-16 text-[#a3a3a3]">المسلسل غير موجود</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-sm text-[#a3a3a3] hover:text-white">← الكتالوج</Link>
        <h1 className="font-display text-3xl font-black">تعديل: {series.title}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-6 space-y-4">
          <h2 className="font-bold text-lg">معلومات أساسية</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">العنوان *</label>
              <Input
                value={series.title}
                onChange={(e) => setSeries({ ...series, title: e.target.value })}
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">المعرف (Slug)</label>
              <Input
                value={series.slug}
                onChange={(e) => setSeries({ ...series, slug: e.target.value })}
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 font-mono text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#a3a3a3] mb-1">القصة / الوصف</label>
            <textarea
              value={series.synopsis}
              onChange={(e) => setSeries({ ...series, synopsis: e.target.value })}
              rows={4}
              className="w-full h-28 rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-[#a3a3a3] focus:border-primary focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Classification */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-6 space-y-4">
          <h2 className="font-bold text-lg">التصنيف</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">النوع</label>
              <select
                value={series.kind}
                onChange={(e) => setSeries({ ...series, kind: e.target.value as "series" | "movie" })}
                className="w-full h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 text-white"
              >
                <option value="series">مسلسل</option>
                <option value="movie">فيلم</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">نوع الصوت</label>
              <select
                value={series.audio}
                onChange={(e) => setSeries({ ...series, audio: e.target.value as "مترجم" | "مدبلج" })}
                className="w-full h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 text-white"
              >
                <option value="مترجم">مترجم</option>
                <option value="مدبلج">مدبلج</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">المنشأ</label>
              <select
                value={series.origin}
                onChange={(e) => setSeries({ ...series, origin: e.target.value })}
                className="w-full h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 text-white"
              >
                {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">السنة</label>
              <Input
                type="number"
                value={series.year}
                onChange={(e) => setSeries({ ...series, year: Number(e.target.value) || new Date().getFullYear() })}
                min={1990}
                max={new Date().getFullYear() + 2}
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">عدد الحلقات</label>
              <Input
                type="number"
                value={series.episodeCount}
                onChange={(e) => setSeries({ ...series, episodeCount: Math.max(1, Number(e.target.value) || 1) })}
                min={1}
                max={200}
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">الحالة</label>
              <select
                value={series.status}
                onChange={(e) => setSeries({ ...series, status: e.target.value as "مكتمل" | "مستمر" })}
                className="w-full h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 text-white"
              >
                <option value="مكتمل">مكتمل</option>
                <option value="مستمر">مستمر</option>
              </select>
            </div>
          </div>
        </div>

        {/* Genres */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-6 space-y-4">
          <h2 className="font-bold text-lg">التصنيفات</h2>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <label key={g} className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-colors",
                series.genres.includes(g)
                  ? "bg-primary/20 text-primary border border-primary"
                  : "bg-[#1a1a1a] text-[#a3a3a3] border border-[#2a2a2a] hover:border-primary/50"
              )}>
                <input
                  type="checkbox"
                  checked={series.genres.includes(g)}
                  onChange={(e) => setSeries({
                    ...series,
                    genres: e.target.checked
                      ? [...series.genres, g]
                      : series.genres.filter(x => x !== g)
                  })}
                  className="size-4 accent-primary"
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* Images & Embed */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-6 space-y-4">
          <h2 className="font-bold text-lg">الصور و الروابط</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">بوستر (Poster URL)</label>
              <Input
                value={series.poster}
                onChange={(e) => setSeries({ ...series, poster: e.target.value })}
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">خلفية (Backdrop URL)</label>
              <Input
                value={series.backdrop}
                onChange={(e) => setSeries({ ...series, backdrop: e.target.value })}
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">Embed URL (vidaraa.cc)</label>
              <Input
                value={series._embedUrl || ""}
                onChange={(e) => setSeries({ ...series, _embedUrl: e.target.value })}
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">Source URL</label>
              <Input
                value={series._sourceUrl || ""}
                onChange={(e) => setSeries({ ...series, _sourceUrl: e.target.value })}
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
              />
            </div>
          </div>
        </div>

        {/* Video Sources */}
        {series.videoSources && (
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-6 space-y-4">
            <h2 className="font-bold text-lg">مصادر الفيديو المستخرجة</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {(["m3u8", "mp4", "other"] as const).map((type) => {
                const urls = series.videoSources?.[type] || [];
                if (urls.length === 0) return null;
                return (
                  <div key={type} className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-3 space-y-2">
                    <h4 className="font-bold text-sm uppercase">{type}</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {urls.map((url, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <code className="flex-1 text-[#a3a3a3] truncate">{url}</code>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">فتح</a>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Options */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-6 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={series.featured}
              onChange={(e) => setSeries({ ...series, featured: e.target.checked })}
              className="size-5 accent-primary"
            />
            <span className="font-bold">مسلسل مميز (يظهر في الرئيسية)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={series.views > 0}
              onChange={() => {}}
              disabled
              className="size-5 opacity-50"
            />
            <span className="font-bold">مشاهدات: {series.views.toLocaleString("ar-EG")}</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className={buttonVariants({ variant: "outline", className: "h-11 px-6" })}>
            إلغاء
          </button>
          <button type="submit" disabled={saving} className={buttonVariants({ className: "h-11 px-8" })}>
            {saving ? <Loader2 className="size-5 animate-spin" /> : <>حفظ التغييرات <CheckCircle className="size-5 ms-2" /></>}
          </button>
        </div>
      </form>

      {/* Toast */}
      {toast && (
        <div className={cn("fixed bottom-4 left-4 z-50 px-4 py-3 rounded-xl text-sm font-bold animate-slide-up", toast.type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white")}>
          {toast.message}
        </div>
      )}
    </div>
  );
}