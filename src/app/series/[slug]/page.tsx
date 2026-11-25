import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { AdSlot } from "@/components/ad-slot";
import { PosterImage } from "@/components/poster-image";
import { PosterCard } from "@/components/poster-card";
import { VideoPlayer } from "@/components/video-player";
import {
  episodeBadge,
  formatDate,
  formatViews,
  getAllSeries,
  getEpisodes,
  getRelated,
  getSeries,
} from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  // Only pre-generate first 100 series at build time
  // Rest will be generated on-demand via ISR fallback
  return getAllSeries().slice(0, 100).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = getSeries(slug);
  if (!series) return { title: "غير موجود" };
  return { title: series.title, description: series.synopsis };
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;
  const series = getSeries(slug);
  if (!series) notFound();

  const episodes = getEpisodes(series);
  const related = getRelated(series);

  const facts = [
    ["النوع", series.kind === "movie" ? "فيلم" : "مسلسل قصير"],
    ["الصوت", series.audio],
    ["الأصل", series.origin],
    ["السنة", String(series.year)],
    ["الحلقات", episodeBadge(series)],
    ["الحالة", series.status],
    ["المشاهدات", formatViews(series.views)],
    ["أُضيف", formatDate(series.addedAt)],
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6">
      <Breadcrumb
        items={[
          { href: "/", label: "الرئيسية" },
          { href: "/browse", label: "المسلسلات" },
          { label: series.title },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <VideoPlayer
            slug={series.slug}
            title={series.title}
            poster={series.backdrop || series.poster}
            episodes={episodes}
            episodeNumber={1}
          />
          <div className="mt-4">
            <AdSlot slot="below-player" />
          </div>

          <h1 className="mt-6 font-display text-3xl font-black sm:text-4xl">{series.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {series.genres.map((genre) => (
              <Link key={genre} href={`/browse?genre=${encodeURIComponent(genre)}`}>
                <Badge variant="secondary" className="h-auto rounded-full px-3 py-1 text-sm">
                  {genre}
                </Badge>
              </Link>
            ))}
            <Badge className="h-auto rounded-full px-3 py-1 text-sm">{series.audio}</Badge>
          </div>
          <p className="mt-5 text-base leading-8 text-[#ddd]">{series.synopsis}</p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="relative hidden aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 lg:block">
            <PosterImage src={series.poster} alt={series.title} priority />
          </div>
          <dl className="rounded-2xl border border-[#1a1a1a] bg-[#121212] p-4">
            {facts.map(([label, value]) => (
              <div key={label} className="flex gap-3 border-b border-[#2a2a2a] py-2.5 text-sm last:border-b-0">
                <dt className="w-24 shrink-0 font-bold text-[#a3a3a3]">{label}</dt>
                <dd className="text-[#e5e5e5]">{value}</dd>
              </div>
            ))}
          </dl>
          <AdSlot slot="sidebar" />
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold">
            <span className="block h-5 w-1 rounded-full bg-primary" />
            أعمال مشابهة
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {related.map((item) => (
              <PosterCard key={item.id} series={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
