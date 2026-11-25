import { cn } from "cn";

/**
 * Empty ad placeholders. Each slot renders a real HTML comment so the owner
 * can find it in the page source and paste AdSense (or another network) inside
 * the marked element.
 *
 * مساحات إعلانية فارغة. كل مساحة تطبع التعليق AD SLOT في مصدر الصفحة.
 */
export type AdSlotName = "leaderboard-top" | "in-grid" | "sidebar" | "below-player";

const labels: Record<AdSlotName, string> = {
  "leaderboard-top": "إعلان علوي",
  "in-grid": "إعلان داخل الشبكة",
  sidebar: "إعلان جانبي",
  "below-player": "إعلان أسفل المشغّل",
};

export function AdSlot({
  slot,
  className,
}: {
  slot: AdSlotName;
  className?: string;
}) {
  return (
    <aside
      className={cn("ad-slot", `ad-slot--${slot}`, className)}
      data-ad-slot={slot}
      aria-label={labels[slot]}
    >
      <p className="ad-slot__label">{labels[slot]}</p>
      <div
        className="ad-slot__code"
        dangerouslySetInnerHTML={{ __html: "<!-- AD SLOT -->" }}
      />
    </aside>
  );
}
