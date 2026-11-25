import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { PosterCard } from "@/components/poster-card";
import { VideoPlayer } from "@/components/video-player";
import { getAllSeries, getEpisodes, getRelated, getSeries } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ep?: string }>;
};

export function generateStaticParams() {
  return getAllSeries().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { ep } = await searchParams;
  const series = getSeries(slug);
  if (!series) return { title: "غير موجود" };
  const number = Number(ep) || 1;
  return {
    title: `${series.title} — الحلقة ${number}`,
    description: series.synopsis,
  };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { ep } = await searchParams;
  const series = getSeries(slug);
  if (!series) notFound();

  const episodes = getEpisodes(series);
  const requested = Number(ep);
  const episodeNumber = episodes.some((item) => item.number === requested) ? requested : 1;
  const related = getRelated(series, 3);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6">
      <Link
        href={`/series/${series.slug}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-[#e5e5e5] hover:text-primary"
      >
        <ChevronRight className="size-4" />
        العودة إلى {series.title}
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <VideoPlayer
            slug={series.slug}
            title={series.title}
            poster={series.backdrop || series.poster}
            episodes={episodes}
            episodeNumber={episodeNumber}
            syncUrl
          />
          <div className="mt-4">
            <AdSlot slot="below-player" />
          </div>
          <p className="mt-5 text-sm leading-7 text-[#cfcfcf]">{series.synopsis}</p>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24">
          <AdSlot slot="sidebar" />
          <div>
            <h2 className="mb-3 font-extrabold">قد يعجبك أيضاً</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {related.map((item) => (
                <PosterCard key={item.id} series={item} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
