"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

const GENRES = ["أكشن", "دراما", "رومانسي", "إثارة", "كوميديا", "فانتازيا", "تاريخي", "رعب", "غموض"];
const ORIGINS = ["صيني", "كوري", "ياباني", "تايلاندي", "عربي", "هندي", "تركي", "أمريكي"];

export default function CreateSeriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    synopsis: "",
    kind: "series" as "series" | "movie",
    genres: [] as string[],
    audio: "مترجم" as "مترجم" | "مدبلج",
    origin: "صيني" as string,
    year: new Date().getFullYear(),
    episodeCount: 30,
    views: 0,
    status: "مكتمل" as "مكتمل" | "مستمر",
    featured: false,
    poster: "",
    backdrop: "",
    _embedUrl: "",
    _sourceUrl: "",
  });

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[\u064B-\u065F]/g, "")
      .replace(/[\s\-_]+/g, "-")
      .replace(/[^\w\-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Generate slug if empty
      if (!form.slug && form.title) {
        setForm({ ...form, slug: slugify(form.title) });
      }

      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: form.slug,
          addedAt: new Date().toISOString().split("T")[0],
          episodes: form.kind === "movie"
            ? [{ number: 1, title: "الفيلم", duration: "95:00", videoUrl: "" }]
            : Array.from({ length: form.episodeCount }, (_, i) => ({
                number: i + 1,
                title: `الحلقة ${i + 1}`,
                duration: "02:00",
                videoUrl: "",
              })),
        }),
      });

      if (res.ok) {
        setToast({ type: "success", message: "تم إنشاء المسلسل بنجاح" });
        setTimeout(() => router.push("/admin"), 1500);
      } else {
        const err = await res.json();
        setToast({ type: "error", message: err.error || "فشل الإنشاء" });
      }
    } catch (e) {
      setToast({ type: "error", message: "خطأ في الاتصال" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-sm text-[#a3a3a3] hover:text-white">← الكتالوج</Link>
        <h1 className="font-display text-3xl font-black">إضافة مسلسل جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-6 space-y-4">
          <h2 className="font-bold text-lg">معلومات أساسية</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">العنوان *</label>
              <Input
                value={form.title}
                onChange={(e) => { setForm({ ...form, title: e.target.value }); if (!form.slug) setForm({ ...form, slug: slugify(e.target.value) }); }}
                placeholder="عنوان المسلسل"
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">المعرف (Slug)</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                placeholder="يولد تلقائياً من العنوان"
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 font-mono text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#a3a3a3] mb-1">القصة / الوصف</label>
            <textarea
              value={form.synopsis}
              onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
              rows={4}
              className="w-full h-28 rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder-[#a3a3a3] focus:border-primary focus:outline-none resize-none"
              placeholder="وصف موجز للمسلسل..."
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
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as "series" | "movie" })}
                className="w-full h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 text-white"
              >
                <option value="series">مسلسل</option>
                <option value="movie">فيلم</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">نوع الصوت</label>
              <select
                value={form.audio}
                onChange={(e) => setForm({ ...form, audio: e.target.value as "مترجم" | "مدبلج" })}
                className="w-full h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 text-white"
              >
                <option value="مترجم">مترجم</option>
                <option value="مدبلج">مدبلج</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">المنشأ</label>
              <select
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                className="w-full h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 text-white"
              >
                {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">السنة</label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) || new Date().getFullYear() })}
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
                value={form.episodeCount}
                onChange={(e) => setForm({ ...form, episodeCount: Math.max(1, Number(e.target.value) || 1) })}
                min={1}
                max={200}
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">الحالة</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "مكتمل" | "مستمر" })}
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
          <h2 className="font-bold text-lg">التصنيفات (اختر واحدة أو أكثر)</h2>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <label key={g} className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-colors",
                form.genres.includes(g)
                  ? "bg-primary/20 text-primary border border-primary"
                  : "bg-[#1a1a1a] text-[#a3a3a3] border border-[#2a2a2a] hover:border-primary/50"
              )}>
                <input
                  type="checkbox"
                  checked={form.genres.includes(g)}
                  onChange={(e) => setForm({
                    ...form,
                    genres: e.target.checked
                      ? [...form.genres, g]
                      : form.genres.filter(x => x !== g)
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
                value={form.poster}
                onChange={(e) => setForm({ ...form, poster: e.target.value })}
                placeholder="https://example.com/poster.jpg"
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">خلفية (Backdrop URL)</label>
              <Input
                value={form.backdrop}
                onChange={(e) => setForm({ ...form, backdrop: e.target.value })}
                placeholder="https://example.com/backdrop.jpg"
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">Embed URL (vidaraa.cc)</label>
              <Input
                value={form._embedUrl}
                onChange={(e) => setForm({ ...form, _embedUrl: e.target.value })}
                placeholder="https://vidaraa.cc/e/xxxxxx"
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">Source URL</label>
              <Input
                value={form._sourceUrl}
                onChange={(e) => setForm({ ...form, _sourceUrl: e.target.value })}
                placeholder="رابط الصفحة الأصلية"
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="size-5 accent-primary"
            />
            <span className="font-bold">مسلسل مميز (يظهر في الرئيسية)</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button type="button" onClick={() => window.history.back()} className={buttonVariants({ variant: "outline", className: "h-11 px-6" })}>
            إلغاء
          </button>
          <button type="submit" disabled={loading} className={buttonVariants({ className: "h-11 px-8" })}>
            {loading ? <Loader2 className="size-5 animate-spin" /> : <>إنشاء المسلسل <CheckCircle className="size-5 ms-2" /></>}
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