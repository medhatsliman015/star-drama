import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "cn";
import { episodeBadge, type Series } from "@/lib/catalog";
import { PosterImage } from "@/components/poster-image";

export function PosterCard({
  series,
  layout = "grid",
  priority = false,
}: {
  series: Series;
  layout?: "grid" | "row";
  priority?: boolean;
}) {
  return (
    <Link
      href={`/series/${series.slug}`}
      className={cn(
        "poster-card group flex flex-col overflow-hidden rounded-[14px] border border-white/8 bg-gradient-to-b from-[#151515] to-[#101010] shadow-[0_8px_22px_rgba(0,0,0,0.22)] transition duration-300 hover:border-primary/50 hover:shadow-[0_14px_32px_rgba(0,0,0,0.45)] focus-visible:ring-2 focus-visible:ring-primary [@media(hover:hover)]:hover:-translate-y-1",
        layout === "row" && "w-[140px] shrink-0 snap-start sm:w-[168px] lg:w-[200px]",
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-[#111]">
        <PosterImage src={series.poster} alt="" priority={priority} className="transition duration-500 [@media(hover:hover)]:group-hover:scale-105" />
        <span className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute top-2 start-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold text-white shadow-md sm:text-[11px]">
          {episodeBadge(series)}
        </span>
        <span className="absolute bottom-2 start-2 z-10 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
          {series.audio}
        </span>
        <span className="poster-play absolute top-1/2 left-1/2 z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary/90 text-white opacity-0 shadow-lg transition duration-300 group-hover:opacity-100">
          <Play className="size-5 fill-white" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-2.5 py-2.5 sm:px-3">
        <h3 className="line-clamp-2 min-h-[2.6em] text-[13px] leading-snug font-bold text-[#f1f1f1] group-hover:text-primary sm:text-sm">
          {series.title}
        </h3>
        <p className="mt-auto flex items-center justify-between border-t border-white/6 pt-1.5 text-[11px] text-[#909090]">
          <span>{series.genres[0]}</span>
          <span>{series.year}</span>
        </p>
      </div>
    </Link>
  );
}
