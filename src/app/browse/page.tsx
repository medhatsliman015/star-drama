import type { Metadata } from "next";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { CatalogGrid } from "@/components/catalog-grid";
import { AdSlot } from "@/components/ad-slot";
import { GENRES, queryCatalog } from "@/lib/catalog";
import { cn } from "cn";

type SearchParams = {
  q?: string;
  genre?: string;
  audio?: string;
  sort?: string;
  page?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const bits = ["تصفح"];
  if (params.genre) bits.push(params.genre);
  if (params.audio) bits.push(params.audio);
  if (params.q) bits.push(`بحث: ${params.q}`);
  return {
    title: bits.join(" · "),
    description: "صفِّ المسلسلات القصيرة حسب التصنيف ونوع الصوت، أو ابحث بالعنوان.",
  };
}

function browseHref(current: SearchParams, patch: Partial<SearchParams>) {
  const next = { ...current, ...patch };
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value) query.set(key, value);
  }
  const value = query.toString();
  return value ? `/browse?${value}` : "/browse";
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 items-center rounded-full border px-3 text-sm font-bold",
        active
          ? "border-primary bg-primary text-white"
          : "border-[#2a2a2a] bg-[#121212] text-[#e5e5e5] hover:border-primary/50",
      )}
      aria-current={active ? "true" : undefined}
    >
      {children}
    </Link>
  );
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const genre = params.genre ?? "";
  const audio = params.audio ?? "";
  const sort = params.sort === "views" ? "views" : "new";
  const page = Math.max(1, Number(params.page) || 1);
  const limit = 50;
  const current = { q, genre, audio, sort: sort === "views" ? "views" : "", page: String(page) };
  const { items, total, totalPages } = queryCatalog({ q, genre, audio, sort, page, limit });

  const title = q
    ? `نتائج البحث عن «${q}»`
    : genre
      ? genre
      : audio
        ? `أعمال ${audio}`
        : sort === "views"
          ? "الأكثر مشاهدة"
          : "كل المسلسلات";

  return (
    <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-6 md:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <h1 className="font-display text-3xl font-black sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-[#a3a3a3]">
          {items.length === 0
            ? "لا توجد نتائج"
            : `${items.length.toLocaleString("en-US")} ${items.length === 1 ? "عمل" : "أعمال"}`}
        </p>

        <form action="/browse" method="get" className="mt-5 flex flex-col gap-2 sm:flex-row" role="search">
          {genre ? <input type="hidden" name="genre" value={genre} /> : null}
          {audio ? <input type="hidden" name="audio" value={audio} /> : null}
          {sort === "views" ? <input type="hidden" name="sort" value="views" /> : null}
          <div className="relative flex-1">
            <label htmlFor="browse-search" className="sr-only">
              بحث
            </label>
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#a3a3a3]" />
            <Input
              id="browse-search"
              name="q"
              defaultValue={q}
              placeholder="ابحث بالعنوان أو التصنيف أو القصة"
              className="h-11 rounded-full border-[#2a2a2a] bg-[#121212] ps-10"
            />
          </div>
          <button
            type="submit"
            className={buttonVariants({ className: "h-11 rounded-full px-6 font-bold" })}
          >
            بحث
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          <Chip href={browseHref(current, { audio: "" })} active={!audio}>
            الكل
          </Chip>
          <Chip href={browseHref(current, { audio: "مترجم" })} active={audio === "مترجم"}>
            مترجم
          </Chip>
          <Chip href={browseHref(current, { audio: "مدبلج" })} active={audio === "مدبلج"}>
            مدبلج
          </Chip>
          <span className="mx-1 hidden h-9 w-px bg-[#2a2a2a] sm:block" />
          <Chip href={browseHref(current, { sort: "" })} active={sort !== "views"}>
            الأحدث
          </Chip>
          <Chip href={browseHref(current, { sort: "views" })} active={sort === "views"}>
            الأكثر مشاهدة
          </Chip>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <Chip href={browseHref(current, { genre: "" })} active={!genre}>
            كل التصنيفات
          </Chip>
          {GENRES.map((name) => (
            <Chip
              key={name}
              href={browseHref(current, { genre: name })}
              active={genre === name}
            >
              {name}
            </Chip>
          ))}
        </div>

        <div className="mt-6">
          {items.length > 0 ? (
            <CatalogGrid items={items} />
          ) : (
            <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#121212] px-6 py-16 text-center">
              <p className="text-xl font-extrabold">لا توجد أعمال تطابق هذا البحث</p>
              <p className="mt-2 text-sm text-[#a3a3a3]">جرّب عنواناً أقصر أو أزل التصنيف.</p>
              <Link
                href="/browse"
                className={buttonVariants({ className: "mt-5 h-11 rounded-full px-5" })}
              >
                عرض كل الأعمال
              </Link>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-2" aria-label="صفحات">
              {page > 1 && (
                <Link
                  href={browseHref(current, { page: String(page - 1) })}
                  className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}
                >
                  <ChevronRight className="size-4" />
                  السابق
                </Link>
              )}
              <span className="px-4 text-sm font-bold text-[#e5e5e5]">
                صفحة {page} من {totalPages} — {total.toLocaleString("ar-EG")} عمل
              </span>
              {page < totalPages && (
                <Link
                  href={browseHref(current, { page: String(page + 1) })}
                  className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}
                >
                  التالي
                  <ChevronLeft className="size-4" />
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <AdSlot slot="sidebar" />
        <div className="mt-4 rounded-2xl border border-[#1a1a1a] bg-[#121212] p-4 text-sm leading-7 text-[#cfcfcf]">
          <h2 className="mb-2 font-extrabold text-white">كيف تضيف عملاً؟</h2>
          <p>
            افتح <span className="font-mono text-xs">src/data/catalog.json</span> وأضف عنصراً
            جديداً. سيظهر هنا وفي الصفوف في الصفحة الرئيسية.
          </p>
        </div>
      </aside>
    </div>
  );
}
