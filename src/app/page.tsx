import Link from "next/link";
import { HeroSlider } from "@/components/hero-slider";
import { MediaRow } from "@/components/media-row";
import { CatalogGrid } from "@/components/catalog-grid";
import { SectionHeader } from "@/components/section-header";
import {
  getAllSeries,
  getFeatured,
  getGenreCounts,
  queryCatalog,
} from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  const featured = getFeatured();
  const latest = getAllSeries();
  const translated = queryCatalog({ audio: "مترجم" }).items;
  const dubbed = queryCatalog({ audio: "مدبلج" }).items;
  const popular = queryCatalog({ sort: "views" }).items.slice(0, 12);
  const genres = getGenreCounts();

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-8 md:px-6">
      <HeroSlider items={featured} />

      <MediaRow title="الأكثر مشاهدة" href="/browse?sort=views" items={popular} />

      <section className="mt-10">
        <SectionHeader title="الأحدث" href="/browse" />
        <CatalogGrid items={latest} />
      </section>

      <MediaRow title="مترجم" href="/browse?audio=مترجم" items={translated} />
      <MediaRow title="مدبلج" href="/browse?audio=مدبلج" items={dubbed} />

      <section className="mt-12">
        <SectionHeader title="تصنيفات" href="/browse" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {genres.map((genre) => (
            <Link
              key={genre.name}
              href={`/browse?genre=${encodeURIComponent(genre.name)}`}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#121212] p-4 transition hover:border-primary/60"
            >
              <span className="absolute inset-0 bg-gradient-to-l from-primary/25 to-transparent" />
              <span className="relative block text-lg font-black">{genre.name}</span>
              <span className="relative mt-1 block text-xs text-[#a3a3a3]">
                {genre.count} {genre.count === 1 ? "عمل" : "أعمال"}
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-[#8d8d8d]">
          {siteConfig.name} — {siteConfig.tagline}
        </p>
      </section>
    </div>
  );
}
