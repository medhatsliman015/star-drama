"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Series } from "@/lib/catalog";
import { PosterCard } from "@/components/poster-card";
import { SectionHeader } from "@/components/section-header";

export function MediaRow({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: Series[];
}) {
  const scroller = useRef<HTMLDivElement>(null);

  function scrollByDir(direction: 1 | -1) {
    const node = scroller.current;
    if (!node) return;
    const amount = Math.max(node.clientWidth * 0.75, 280);
    // In RTL, positive scrollLeft moves toward the start. "Next" follows reading order.
    const delta = document.dir === "rtl" ? -direction * amount : direction * amount;
    node.scrollBy({ left: delta, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <SectionHeader title={title} href={href} />
      <div className="relative">
        <div
          ref={scroller}
          className="scrollbar-none flex snap-x gap-3 overflow-x-auto scroll-smooth pb-3 sm:gap-4"
        >
          {items.map((item) => (
            <PosterCard key={item.id} series={item} layout="row" />
          ))}
        </div>
        <button
          type="button"
          aria-label="السابق"
          onClick={() => scrollByDir(-1)}
          className="absolute top-1/3 start-1 hidden size-10 place-items-center rounded-full border border-white/10 bg-black/70 text-white md:grid"
        >
          <ChevronRight className="size-5" />
        </button>
        <button
          type="button"
          aria-label="التالي"
          onClick={() => scrollByDir(1)}
          className="absolute top-1/3 end-1 hidden size-10 place-items-center rounded-full border border-white/10 bg-black/70 text-white md:grid"
        >
          <ChevronLeft className="size-5" />
        </button>
      </div>
    </section>
  );
}
