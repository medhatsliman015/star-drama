"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { isPlayableUrl, type Episode } from "@/lib/catalog";

/**
 * Reusable HTML5 player. Drop a direct video URL into catalog.json and the
 * same component plays it on the series page and the watch page.
 */
export function VideoPlayer({
  slug,
  title,
  poster,
  episodes,
  episodeNumber,
  syncUrl = false,
}: {
  slug: string;
  title: string;
  poster: string;
  episodes: Episode[];
  episodeNumber: number;
  syncUrl?: boolean;
}) {
  const [current, setCurrent] = useState(episodeNumber);

  useEffect(() => {
    setCurrent(episodeNumber);
  }, [episodeNumber]);

  const episode = episodes.find((item) => item.number === current) ?? episodes[0];
  const index = episodes.findIndex((item) => item.number === episode?.number);
  const src = episode && isPlayableUrl(episode.videoUrl) ? episode.videoUrl : "";

  function select(number: number) {
    setCurrent(number);
    if (syncUrl) {
      window.history.replaceState(null, "", `/watch/${slug}?ep=${number}`);
    }
  }

  if (!episode) return null;

  return (
    <section aria-label={`مشغّل ${title}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-primary">يشاهد الآن</p>
          <h2 className="text-lg font-extrabold sm:text-xl">
            {title}
            <span className="ms-2 text-sm font-semibold text-[#a3a3a3]">
              {episode.title} · {episode.duration}
            </span>
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full px-3"
            disabled={index <= 0}
            onClick={() => select(episodes[index - 1].number)}
          >
            <ChevronRight className="size-4" />
            السابقة
          </Button>
          <Button
            type="button"
            className="h-10 rounded-full px-3"
            disabled={index < 0 || index >= episodes.length - 1}
            onClick={() => select(episodes[index + 1].number)}
          >
            التالية
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#292a31] bg-black shadow-2xl">
        <video
          key={`${slug}-${episode.number}-${src}`}
          className={`h-full w-full bg-black ${src ? "object-contain" : "object-cover"}`}
          controls={Boolean(src)}
          playsInline
          poster={poster}
          preload="metadata"
          src={src || undefined}
        >
          المتصفح لا يدعم تشغيل الفيديو.
        </video>
        {!src ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 p-4 text-center">
            <div
              className="grid size-14 shrink-0 place-items-center rounded-full bg-primary shadow-[0_0_0_8px_rgba(229,9,20,0.18)]"
              aria-hidden
            >
              <Play className="ms-0.5 size-7 fill-white" />
            </div>
            <p className="text-sm font-extrabold sm:text-lg">لا يوجد مصدر لهذه الحلقة بعد</p>
            <p className="max-w-md text-xs leading-5 text-white/80 sm:text-sm">
              أضف رابط mp4 في حقل videoUrl داخل ملف البيانات.
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-xl border border-[#1a1a1a] bg-[#121212] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-extrabold">
            <span className="block h-4 w-1 rounded-full bg-primary" />
            الحلقات
            <span className="text-sm font-semibold text-[#a3a3a3]">{episodes.length}</span>
          </h3>
          {!syncUrl ? (
            <Link href={`/watch/${slug}?ep=${episode.number}`} className="text-sm font-bold text-primary">
              فتح صفحة المشاهدة
            </Link>
          ) : null}
        </div>
        <div className="grid max-h-[380px] grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {episodes.map((item) => {
            const active = item.number === episode.number;
            return (
              <button
                key={item.number}
                type="button"
                onClick={() => select(item.number)}
                aria-current={active ? "true" : undefined}
                title={item.title}
                className={cn(
                  "min-h-11 rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] text-sm font-bold text-[#e5e5e5] transition hover:-translate-y-0.5 hover:border-primary/50",
                  active && "border-primary bg-primary text-white shadow-[0_4px_12px_rgba(229,9,20,0.35)]",
                )}
              >
                {item.number}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
