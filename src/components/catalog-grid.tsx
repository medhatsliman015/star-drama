import type { Series } from "@/lib/catalog";
import { PosterCard } from "@/components/poster-card";
import { AdSlot } from "@/components/ad-slot";

/** Responsive poster grid with one in-grid ad slot after the fourth card. */
export function CatalogGrid({ items }: { items: Series[] }) {
  const cards = items.map((item, index) => (
    <PosterCard key={item.id} series={item} priority={index < 4} />
  ));
  const adAt = Math.min(4, cards.length);
  const withAd = [...cards.slice(0, adAt), <AdSlot key="in-grid-ad" slot="in-grid" />, ...cards.slice(adAt)];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {withAd}
    </div>
  );
}
