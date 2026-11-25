"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { episodeBadge, type Series } from "@/lib/catalog";
import { PosterImage } from "@/components/poster-image";
import { cn } from "cn";

export function HeroSlider({ items }: { items: Series[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const current = items[index];

  useEffect(() => {
    if (paused || count < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % count);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  if (!current) return null;

  function go(next: number) {
    setIndex((next + count) % count);
  }

  return (
    <section
      className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black"
      aria-roledescription="carousel"
      aria-label="أعمال مميزة"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative min-h-[440px] sm:min-h-[500px] md:min-h-[540px]">
        <PosterImage
          key={current.backdrop || current.poster}
          src={current.backdrop || current.poster}
          alt=""
          priority
          className="scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/80 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

        <div className="relative z-10 flex h-full min-h-[440px] flex-col justify-end gap-6 p-5 pb-12 sm:min-h-[500px] sm:p-8 sm:pb-14 md:min-h-[540px] md:flex-row md:items-end md:justify-between md:px-16 md:pb-16">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold text-primary">مميز الآن</p>
            <h1 className="font-display text-3xl leading-tight font-black sm:text-5xl">
              {current.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold sm:text-sm">
              <span className="rounded-full bg-primary px-3 py-1">{episodeBadge(current)}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{current.audio}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{current.origin}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{current.year}</span>
            </div>
            <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              {current.synopsis}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/watch/${current.slug}?ep=1`}
                className={buttonVariants({
                  className: "h-11 rounded-full px-5 text-base font-bold",
                })}
              >
                <Play className="size-4 fill-white" />
                شاهد الآن
              </Link>
              <Link
                href={`/series/${current.slug}`}
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "h-11 rounded-full border-white/20 bg-white/10 px-5 text-base font-bold text-white hover:bg-white hover:text-black",
                })}
              >
                التفاصيل
              </Link>
            </div>
          </div>

          <Link
            href={`/series/${current.slug}`}
            className="relative hidden aspect-[2/3] w-40 overflow-hidden rounded-xl border border-white/15 shadow-2xl md:block lg:w-48"
          >
            <PosterImage src={current.poster} alt={current.title} priority />
          </Link>
        </div>
      </div>

      <p className="sr-only">
        الشريحة {index + 1} من {count}
      </p>

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="الشريحة السابقة"
            onClick={() => go(index - 1)}
            className="absolute top-1/2 start-3 z-20 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white hover:bg-primary md:grid"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            type="button"
            aria-label="الشريحة التالية"
            onClick={() => go(index + 1)}
            className="absolute top-1/2 end-3 z-20 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white hover:bg-primary md:grid"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {items.map((item, dot) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.title}
                aria-current={dot === index}
                onClick={() => go(dot)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  dot === index ? "w-7 bg-primary" : "w-2.5 bg-white/50",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
