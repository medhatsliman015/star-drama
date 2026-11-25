import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function Breadcrumb({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav
      aria-label="مسار التنقل"
      className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[#1a1a1a] bg-[#121212] px-4 py-3 text-sm text-[#a3a3a3]"
    >
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 ? <ChevronLeft className="size-3.5 text-[#555]" aria-hidden /> : null}
          {item.href ? (
            <Link href={item.href} className="font-semibold text-[#e5e5e5] hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
