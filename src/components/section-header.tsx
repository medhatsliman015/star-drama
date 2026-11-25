import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function SectionHeader({
  title,
  href,
  action = "عرض الكل",
}: {
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 border-b border-[#1a1a1a] pb-3">
      <h2 className="flex items-center gap-2.5 text-lg font-extrabold sm:gap-3 sm:text-2xl">
        <span className="block h-6 w-1.5 rounded-full bg-primary shadow-[0_0_16px_rgba(229,9,20,0.55)] sm:h-7" />
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 rounded-full border border-[#2a2a2a] bg-[#121212] px-3 py-1.5 text-xs font-semibold text-[#e5e5e5] transition hover:border-primary hover:bg-primary hover:text-white sm:px-4 sm:text-sm"
        >
          {action}
          <ChevronLeft className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
