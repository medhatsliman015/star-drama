"use client";

import { useState } from "react";
import { Loader2, Play, CheckCircle, XCircle, Trash2, Download, RefreshCw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type ScrapeJob = {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  message: string;
  seriesId?: string;
  seriesTitle?: string;
  sources?: { m3u8: string[]; mp4: string[] };
  error?: string;
};

const JOBS_KEY = "scrape_jobs";

function getJobs(): ScrapeJob[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveJobs(jobs: ScrapeJob[]) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

export default function ScraperDashboard() {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [embedUrl, setEmbedUrl] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [runningCount, setRunningCount] = useState(0);

  // Load jobs on mount
  useState(() => {
    const loaded = getJobs();
    setJobs(loaded);
    setRunningCount(loaded.filter(j => j.status === "running").length);
  });

  const addJob = (embedUrl: string, seriesId: string) => {
    const newJob: ScrapeJob = {
      id: crypto.randomUUID(),
      status: "pending",
      progress: 0,
      message: "في الانتظار...",
      seriesId,
      embedUrl,
    };
    const updated = [newJob, ...jobs];
    setJobs(updated);
    saveJobs(updated);
  };

  const runJob = async (job: ScrapeJob) => {
    // Update to running
    setJobs(jobs.map(j => j.id === job.id ? { ...j, status: "running", progress: 10, message: "جاري الاتصال..." } : j));
    saveJobs(jobs.map(j => j.id === job.id ? { ...j, status: "running", progress: 10, message: "جاري الاتصال..." } : j));

    try {
      setJobs(jobs.map(j => j.id === job.id ? { ...j, progress: 30, message: "جاري تحميل الصفحة..." } : j));

      const res = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.seriesId, embedUrl: job.embedUrl }),
      });

      const data = await res.json();

      if (data.ok) {
        setJobs(jobs.map(j => j.id === job.id ? {
          ...j,
          status: "completed",
          progress: 100,
          message: `تم استخراج ${data.sources.m3u8?.length || 0} m3u8، ${data.sources.mp4?.length || 0} mp4`,
          sources: data.sources,
          seriesTitle: data.series?.title,
        } : j));
      } else {
        setJobs(jobs.map(j => j.id === job.id ? {
          ...j,
          status: "failed",
          progress: 100,
          message: data.error || "فشل الاستخراج",
          error: data.error,
        } : j));
      }
    } catch (e) {
      setJobs(jobs.map(j => j.id === job.id ? {
        ...j,
        status: "failed",
        progress: 100,
        message: "خطأ في الاتصال",
        error: String(e),
      } : j));
    } finally {
      saveJobs(jobs.map(j => j.id === job.id ? j : j));
      setJobs([...jobs]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!embedUrl.trim() || !seriesId.trim()) return;
    addJob(embedUrl.trim(), seriesId.trim());
    setEmbedUrl("");
    setSeriesId("");
  };

  const pendingJobs = jobs.filter(j => j.status === "pending" || j.status === "running");
  const completedJobs = jobs.filter(j => j.status === "completed");
  const failedJobs = jobs.filter(j => j.status === "failed");

  // Auto-run pending jobs
  useState(() => {
    if (pendingJobs.length > 0 && runningCount < 2) {
      const nextJob = pendingJobs.find(j => j.status === "pending");
      if (nextJob) runJob(nextJob);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black">سكرابر مصادر الفيديو</h1>
          <p className="text-sm text-[#a3a3a3]">استخراج روابط m3u8/mp4 من vidaraa.cc وتحديث الكتالوج تلقائياً</p>
        </div>
        <button onClick={() => { setJobs([]); saveJobs([]); }} className={buttonVariants({ variant: "outline", className: "h-11 px-4" })}>
          <Trash2 className="size-4 ms-2" /> مسح السجل
        </button>
      </div>

      {/* Add Job Form */}
      <div className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-4 space-y-4">
        <h2 className="font-bold text-lg">إضافة مهمة استخراج جديدة</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">Series ID (من الكتالوج)</label>
              <Input
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                placeholder="مثال: al-bard-alladhi-asqat-al-khain"
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#a3a3a3] mb-1">Embed URL (vidaraa.cc)</label>
              <Input
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="https://vidaraa.cc/e/xxxxxx"
                className="h-11 rounded-full border-[#2a2a2a] bg-[#0a0a0a] px-4"
                required
              />
            </div>
          </div>
          <button type="submit" className={buttonVariants({ className: "w-full sm:w-auto h-11 px-6" })}>
            <Play className="size-4 ms-2" /> إضافة وبدء الاستخراج
          </button>
        </form>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#121212] px-6 py-16 text-center text-[#a3a3a3]">
            لا توجد مهام استخراج. أضف مهمة جديدة أعلاه.
          </div>
        )}

        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-xl border border-[#1a1a1a] bg-[#121212] p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    job.status === "pending" && "bg-yellow-400 animate-pulse",
                    job.status === "running" && "bg-blue-400 animate-pulse",
                    job.status === "completed" && "bg-green-400",
                    job.status === "failed" && "bg-red-400"
                  )} />
                  <div>
                    <p className="font-bold">{job.seriesTitle || job.seriesId}</p>
                    <p className="text-xs text-[#a3a3a3]">{job.seriesId}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold",
                  job.status === "pending" && "bg-yellow-500/20 text-yellow-400",
                  job.status === "running" && "bg-blue-500/20 text-blue-400",
                  job.status === "completed" && "bg-green-500/20 text-green-400",
                  job.status === "failed" && "bg-red-500/20 text-red-400"
                )}>
                  {job.status === "pending" && "في الانتظار"}
                  {job.status === "running" && `جاري... ${job.progress}%`}
                  {job.status === "completed" && "مكتمل"}
                  {job.status === "failed" && "فشل"}
                </span>
              </div>

              <div className="text-sm text-[#a3a3a3]">{job.message}</div>

              {job.status === "running" && (
                <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${job.progress}%` }} />
                </div>
              )}

              {job.status === "completed" && job.sources && (
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                    <CheckCircle className="size-3 inline ms-1" /> m3u8: {job.sources.m3u8?.length || 0}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                    mp4: {job.sources.mp4?.length || 0}
                  </span>
                </div>
              )}

              {job.status === "failed" && job.error && (
                <p className="text-sm text-red-400">{job.error}</p>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1a1a1a]">
                {job.status === "running" && (
                  <button disabled className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 px-3" })}>
                    <Loader2 className="size-3.5 animate-spin ms-1" /> جاري...
                  </button>
                )}
                {job.status === "completed" && job.seriesId && (
                  <a href={`/admin/sources/${job.seriesId}`} className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 px-3" })}>
                    <ExternalLink className="size-3.5 ms-1" /> إدارة المصادر
                  </a>
                )}
                <button
                  onClick={() => setJobs(jobs.filter(j => j.id !== job.id))}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 px-3 text-red-400" })}
                >
                  <Trash2 className="size-3.5 ms-1" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>

        {(completedJobs.length > 0 || failedJobs.length > 0) && (
          <div className="pt-4 border-t border-[#1a1a1a]">
            <h3 className="font-bold mb-3">الملخص</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                <CheckCircle className="size-3.5 inline ms-1" /> مكتملة: {completedJobs.length}
              </span>
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                <XCircle className="size-3.5 inline ms-1" /> فاشلة: {failedJobs.length}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                <Loader2 className="size-3.5 inline ms-1" /> قيد التشغيل: {jobs.filter(j => j.status === "running").length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}