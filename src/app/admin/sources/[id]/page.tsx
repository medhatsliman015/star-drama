"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Play, CheckCircle, XCircle, ExternalLink, Download, Copy, AlertTriangle, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type VideoSources = {
  m3u8: string[];
  mp4: string[];
  other: string[];
};

type Series = {
  id: string;
  slug: string;
  title: string;
  _embedUrl?: string;
  _sourceUrl?: string;
  videoSources?: VideoSources;
  videoUrl?: string;
  episodes?: { number: number; title?: string; videoUrl?: string }[];
};

export default function SourcesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, "success" | "error" | "testing">>({});
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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveSources() {
    if (!series) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/catalog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoSources: series.videoSources,
          videoUrl: series.videoUrl,
        }),
      });
      if (res.ok) {
        setToast({ type: "success", message: "تم الحفظ" });
      } else {
        setToast({ type: "error", message: "فشل الحفظ" });
      }
    } catch {
      setToast({ type: "error", message: "خطأ في الاتصال" });
    } finally {
      setSaving(false);
    }
  }

  async function testUrl(url: string) {
    setTestResults((prev) => ({ ...prev, [url]: "testing" }));
    try {
      const res = await fetch("/api/admin/test-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [url]: data.ok ? "success" : "error" }));
    } catch {
      setTestResults((prev) => ({ ...prev, [url]: "error" }));
    }
  }

  async function scrapeNow() {
    if (!series?._embedUrl) return;
    setToast({ type: "success", message: "جاري الاستخراج... (قد يستغرق دقيقة)" });
    try {
      const res = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, embedUrl: series._embedUrl }),
      });
      const data = await res.json();
      if (data.ok) {
        setSeries(data.series);
        setToast({ type: "success", message: `تم استخراج ${data.sources.m3u8?.length || 0} m3u8` });
      } else {
        setToast({ type: "error", message: data.error || "فشل الاستخراج" });
      }
    } catch {
      setToast({ type: "error", message: "خطأ في الاتصال" });
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setToast({ type: "success", message: "تم النسخ" });
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  }
  if (!series) {
    return <div className="text-center py-16 text-[#a3a3a3]">المسلسل غير موجود</div>;
  }

  const sources = series.videoSources || { m3u8: [], mp4: [], other: [] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-[#a3a3a3] hover:text-white mb-2 inline-block">← الكتالوج</Link>
          <h1 className="font-display text-3xl font-black">{series.title}</h1>
          <p className="text-sm text-[#a3a3a3">إدارة مصادر الفيديو للحلقات</p>
        </div>
        <div className="flex gap-2">
          {series._embedUrl && (
            <button onClick={scrapeNow} disabled={saving} className={buttonVariants({ className: "h-11 px-6" })}>
              <Loader2 className="size-4 animate-spin ms-2" />
              استخراج من المصدر
            </button>
          )}
          <button onClick={saveSources} disabled={saving} className={buttonVariants({ className: "h-11 px-6" })}>
            {saving ? <Loader2 className="size-4 animate-spin ms-2" /> : <>حفظ التغييرات <CheckCircle className="size-4 ms-2" /></>}
          </button>
        </div>
      </div>

      {/* Embed URL */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-4 space-y-4">
        <h2 className="font-bold text-lg">رابط المصدر الأصلي (vidaraa.cc)</h2>
        <div className="flex gap-2">
          <Input
            value={series._embedUrl || ""}
            onChange={(e) => setSeries({ ...series!, _embedUrl: e.target.value })}
            placeholder="https://vidaraa.cc/e/xxxxxx"
            className="flex-1 h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
          />
          {series._embedUrl && (
            <a href={series._embedUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", className: "h-11 px-4" })}>
              <ExternalLink className="size-4 ms-1" /> فتح
            </a>
          )}
        </div>
        <button onClick={scrapeNow} disabled={!series._embedUrl || saving} className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto h-11" })}>
          <Play className="size-4 ms-2" /> استخراج روابط الفيديو الآن
        </button>
      </div>

      {/* Video Sources Tabs */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] overflow-hidden">
        <div className="border-b border-[#1a1a1a] flex gap-1 p-1">
          {(["m3u8", "mp4", "other"] as const).map((type) => {
            const count = sources[type]?.length || 0;
            return (
              <button
                key={type}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-colors",
                  count > 0 ? "bg-primary/20 text-primary" : "text-[#a3a3a3] hover:bg-[#1a1a1a]"
                )}
              >
                {type.toUpperCase()} <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-[#1a1a1a]">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-6">
          {(["m3u8", "mp4", "other"] as const).map((type) => {
            const urls = sources[type] || [];
            if (urls.length === 0) return null;
            return (
              <div key={type} className="space-y-3">
                <h3 className="font-bold text-lg capitalize">{type.toUpperCase()} Sources</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {urls.map((url, idx) => {
                    const status = testResults[url];
                    const shortUrl = url.length > 60 ? url.slice(0, 60) + "..." : url;
                    return (
                      <div key={`${type}-${idx}`} className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <code className="text-xs text-[#a3a3a3] break-all flex-1">{url}</code>
                          <div className="flex items-center gap-1 shrink-0">
                            {status === "testing" && <Loader2 className="size-4 animate-spin text-primary" />}
                            {status === "success" && <CheckCircle2 className="size-4 text-green-400" />}
                            {status === "error" && <XCircle className="size-4 text-red-400" />}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => testUrl(url)} disabled={status === "testing"} className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 px-3" })}>
                            <Play className="size-3.5 ms-1" /> اختبار
                          </button>
                          <button onClick={() => copyToClipboard(url)} className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 px-3" })}>
                            <Copy className="size-3.5 ms-1" /> نسخ
                          </button>
                          <a href={url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 px-3" })}>
                            <ExternalLink className="size-3.5 ms-1" /> فتح
                          </a>
                          <a href={url} download className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 px-3" })}>
                            <Download className="size-3.5 ms-1" /> تحميل
                          </a>
                        </div>
                        {type === "m3u8" && idx === 0 && !series.videoUrl && (
                          <button
                            onClick={() => setSeries({ ...series!, videoUrl: url })}
                            className={buttonVariants({ size: "sm", className: "w-full h-9 bg-green-500/20 text-green-400 hover:bg-green-500/30" })}
                          >
                            <CheckCircle className="size-3.5 ms-1" /> استخدام كـ videoUrl الأساسي
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Episodes Video URLs */}
      {series.episodes && series.episodes.length > 0 && (
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-4 space-y-4">
          <h2 className="font-bold text-lg">روابط الحلقات (videoUrl لكل حلقة)</h2>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {series.episodes.slice(0, 50).map((ep) => (
              <div key={ep.number} className="flex items-center gap-3 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-3">
                <span className="w-12 shrink-0 font-bold text-[#a3a3a3]">EP {ep.number}</span>
                <Input
                  value={ep.videoUrl || ""}
                  onChange={(e) => {
                    const updated = series.episodes!.map((epi) => epi.number === ep.number ? { ...epi, videoUrl: e.target.value } : epi);
                    setSeries({ ...series!, episodes: updated });
                  }}
                  placeholder="رابط mp4/m3u8 للحلقة"
                  className="flex-1 h-10 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4 text-sm"
                />
                {ep.videoUrl && (
                  <button onClick={() => testUrl(ep.videoUrl!)} disabled={testResults[ep.videoUrl] === "testing"} className={buttonVariants({ variant: "outline", size: "sm", className: "h-10 px-3" })}>
                    <Play className="size-3.5 ms-1" />
                  </button>
                )}
              </div>
            ))}
            {series.episodes.length > 50 && <p className="text-sm text-[#a3a3a3]">... و {series.episodes.length - 50} حلقة أخرى</p>}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={cn("fixed bottom-4 left-4 z-50 px-4 py-3 rounded-xl text-sm font-bold animate-slide-up", toast.type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white")}>
          {toast.message}
        </div>
      )}
    </div>
  );
}