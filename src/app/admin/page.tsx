"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Edit, Trash2, Play, ExternalLink, Filter, Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type Series = {
  id: string;
  slug: string;
  title: string;
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

type PaginatedResponse = {
  items: Series[];
  total: number;
  totalPages: number;
};

const AUDIO_BADGES = { مترجم: "bg-blue-500/20 text-blue-400", مدبلج: "bg-purple-500/20 text-purple-400" };
const STATUS_BADGES = { مكتمل: "bg-green-500/20 text-green-400", مستمر: "bg-yellow-500/20 text-yellow-400" };
const KIND_BADGES = { series: "bg-indigo-500/20 text-indigo-400", movie: "bg-red-500/20 text-red-400" };

export default function AdminDashboard() {
  const [data, setData] = useState<PaginatedResponse>({ items: [], total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [audioFilter, setAudioFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const limit = 20;

  async function fetchData(p = page) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(limit));
      if (search) params.set("q", search);
      if (genreFilter) params.set("genre", genreFilter);
      if (audioFilter) params.set("audio", audioFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/catalog?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: "فشل تحميل البيانات" });
    } finally {
      setLoading(false);
    }
  }

  async function deleteSeries(id: string) {
    if (!confirm("حذف هذا المسلسل؟")) return;
    try {
      const res = await fetch(`/api/admin/catalog/${id}`, { method: "DELETE" });
      if (res.ok) {
        setToast({ type: "success", message: "تم الحذف" });
        fetchData(page);
      } else {
        setToast({ type: "error", message: "فشل الحذف" });
      }
    } catch {
      setToast({ type: "error", message: "خطأ في الاتصال" });
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    try {
      await fetch(`/api/admin/catalog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current }),
      });
      fetchData(page);
    } catch {
      setToast({ type: "error", message: "فشل التحديث" });
    }
  }

  const genres = [
    "أكشن", "دراما", "رومانسي", "إثارة", "كوميديا", "فانتازيا", "تاريخي", "رعب", "غموض"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black">إدارة الكتالوج</h1>
          <p className="text-sm text-[#a3a3a3]">{data.total.toLocaleString("ar-EG")} مسلسل</p>
        </div>
        <Link href="/admin/create" className={buttonVariants({ className: "h-11 px-6" })}>
          <Plus className="size-4 ms-2" /> إضافة مسلسل
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#a3a3a3]" />
            <Input
              placeholder="ابحث بالعنوان، القصة، النوع..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              onKeyDown={(e) => e.key === "Enter" && fetchData(1)}
              className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] ps-10"
            />
          </div>
          <select
            value={genreFilter}
            onChange={(e) => { setGenreFilter(e.target.value); setPage(1); fetchData(1); }}
            className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 text-sm text-white w-full sm:w-48"
          >
            <option value="">كل التصنيفات</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={audioFilter}
            onChange={(e) => { setAudioFilter(e.target.value); setPage(1); fetchData(1); }}
            className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 text-sm text-white w-full sm:w-40"
          >
            <option value="">كل أنواع الصوت</option>
            <option value="مترجم">مترجم</option>
            <option value="مدبلج">مدبلج</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); fetchData(1); }}
            className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 text-sm text-white w-full sm:w-40"
          >
            <option value="">كل الحالات</option>
            <option value="مكتمل">مكتمل</option>
            <option value="مستمر">مستمر</option>
          </select>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
          <span className="text-sm text-[#a3a3a3]">صفحة {page} من {data.totalPages || 1}</span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchData(page - 1)}
              disabled={page <= 1 || loading}
              className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}
            >
              السابق
            </button>
            <button
              onClick={() => fetchData(page + 1)}
              disabled={page >= data.totalPages || loading}
              className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}
            >
              التالي
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : data.items.length === 0 ? (
          <div className="px-6 py-16 text-center text-[#a3a3a3]">لا توجد نتائج</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-right text-sm font-bold text-[#a3a3a3]">
                  <th className="p-4 w-20">بوستر</th>
                  <th className="p-4">العنوان</th>
                  <th className="p-4 hidden md:table-cell">النوع</th>
                  <th className="p-4 hidden lg:table-cell">التصنيفات</th>
                  <th className="p-4 hidden lg:table-cell">الصوت</th>
                  <th className="p-4 hidden md:table-cell">الحالة</th>
                  <th className="p-4 hidden md:table-cell">الحلقات</th>
                  <th className="p-4 hidden lg:table-cell">المميز</th>
                  <th className="p-4 hidden lg:table-cell">مصدر</th>
                  <th className="p-4 w-48">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b border-[#1a1a1a] hover:bg-[#181818] transition-colors">
                    <td className="p-4">
                      <img src={item.poster} alt={item.title} className="h-16 w-auto rounded object-cover" loading="lazy" />
                    </td>
                    <td className="p-4 max-w-xs">
                      <Link href={`/series/${item.slug}`} target="_blank" className="font-bold text-white hover:text-primary truncate block">
                        {item.title}
                      </Link>
                      <span className={cn("ml-2 inline-flex h-5 items-center rounded-full px-2 text-xs font-bold", KIND_BADGES[item.kind])}>
                        {item.kind === "series" ? "مسلسل" : "فيلم"}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell text-[#a3a3a3]">{item.origin} · {item.year}</td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {item.genres.map((g) => (
                          <span key={g} className="inline-flex h-5 items-center rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-2 text-xs text-[#a3a3a3]">{g}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-xs font-bold", AUDIO_BADGES[item.audio])}>
                        {item.audio}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-xs font-bold", STATUS_BADGES[item.status])}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell text-[#a3a3a3]">
                      {item.kind === "movie" ? "فيلم" : `${item.episodeCount} حلقة`}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <button
                        onClick={() => toggleFeatured(item.id, item.featured)}
                        className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors", item.featured ? "bg-yellow-500/20 text-yellow-400" : "bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#2a2a2a]")}
                        title={item.featured ? "إزالة من المميز" : "جعل مميز"}
                      >
                        <span className={cn("size-4", item.featured ? "text-yellow-400" : "text-[#a3a3a3]")}>★</span>
                      </button>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        {item._embedUrl && (
                          <a href={item._embedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                            <ExternalLink className="size-3" /> vidaraa
                          </a>
                        )}
                        {item.videoSources?.m3u8?.length && (
                          <span className="inline-flex h-5 items-center rounded-full bg-green-500/20 text-green-400 px-2 text-xs font-bold">
                            <CheckCircle className="size-3 ms-1" /> m3u8
                          </span>
                        )}
                        {!item._embedUrl && !item.videoSources?.m3u8?.length && (
                          <span className="inline-flex h-5 items-center rounded-full bg-red-500/20 text-red-400 px-2 text-xs font-bold">
                            <XCircle className="size-3 ms-1" /> لا يوجد
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/edit/${item.id}`} className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 px-3" })}>
                          <Edit className="size-3.5 ms-1" /> تعديل
                        </Link>
                        <Link href={`/series/${item.slug}`} target="_blank" className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 px-3" })}>
                          <Play className="size-3.5 ms-1" /> معاينة
                        </Link>
                        <Link href={`/admin/sources/${item.id}`} className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 px-3" })}>
                          <ExternalLink className="size-3.5 ms-1" /> مصادر
                        </Link>
                        {deletingId === item.id ? (
                          <>
                            <button onClick={() => { setDeletingId(null); }} className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 px-3 text-gray-400" })}>لا</button>
                            <button onClick={() => deleteSeries(item.id)} className={buttonVariants({ size: "sm", className: "h-9 px-3 bg-red-500/20 text-red-400 hover:bg-red-500/30" })}>نعم</button>
                          </>
                        ) : (
                          <button onClick={() => setDeletingId(item.id)} className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 px-3 text-red-400 hover:bg-red-500/10" })}>
                            <Trash2 className="size-3.5 ms-1" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination (bottom) */}
      <div className="flex items-center justify-between pt-4">
        <span className="text-sm text-[#a3a3a3]">إجمالي {data.total} مسلسل</span>
        <div className="flex gap-2">
          <button onClick={() => fetchData(page - 1)} disabled={page <= 1 || loading} className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}>السابق</button>
          <button onClick={() => fetchData(page + 1)} disabled={page >= data.totalPages || loading} className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}>التالي</button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={cn("fixed bottom-4 left-4 z-50 px-4 py-3 rounded-xl text-sm font-bold animate-slide-up", toast.type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white")}>
          {toast.message}
        </div>
      )}
    </div>
  );
}