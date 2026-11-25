"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search } from "lucide-react";
import { cn } from "cn";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { infoNav, mainNav } from "@/lib/site";
import { GENRES } from "@/lib/catalog";

function SearchForm({ id, className }: { id: string; className?: string }) {
  return (
    <form action="/browse" method="get" className={cn("relative", className)} role="search">
      <label htmlFor={id} className="sr-only">
        بحث في المسلسلات
      </label>
      <Input
        id={id}
        name="q"
        placeholder="ابحث عن مسلسل أو فيلم"
        className="h-10 rounded-full border-[#2a2a2a] bg-[#121212] ps-4 pe-11 text-sm"
      />
      <button
        type="submit"
        aria-label="بحث"
        className="absolute end-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-[#a3a3a3] hover:text-white"
      >
        <Search className="size-4" />
      </button>
    </form>
  );
}

export function Header() {
  const pathname = usePathname();
  const [genresOpen, setGenresOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#050505]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 md:h-[70px] md:px-6">
        <Logo className="text-xl sm:text-[1.65rem]" />

        <nav className="ms-2 hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          {mainNav.slice(0, 2).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-semibold text-[#e5e5e5] hover:bg-[#1f1f1f]",
                pathname === item.href && "bg-[#1f1f1f] text-white",
              )}
            >
              {item.label}
            </Link>
          ))}

          <div
            className="relative"
            onMouseEnter={() => setGenresOpen(true)}
            onMouseLeave={() => setGenresOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold text-[#e5e5e5] hover:bg-[#1f1f1f]"
              aria-expanded={genresOpen}
              onClick={() => setGenresOpen((open) => !open)}
            >
              الأقسام
              <ChevronDown className="size-4" />
            </button>
            {genresOpen ? (
              <div className="absolute start-0 top-full z-50 w-52 pt-2">
                <div className="rounded-xl border border-[#1a1a1a] bg-[#121212] p-2 shadow-2xl">
                  {GENRES.map((genre) => (
                    <Link
                      key={genre}
                      href={`/browse?genre=${encodeURIComponent(genre)}`}
                      className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#e5e5e5] hover:bg-primary/10 hover:text-white"
                      onClick={() => setGenresOpen(false)}
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {mainNav.slice(2).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-[#e5e5e5] hover:bg-[#1f1f1f]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <SearchForm id="header-search" className="hidden w-56 md:block xl:w-72" />
          <button
            type="button"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "md:hidden",
            })}
            aria-label="فتح البحث"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
          >
            <Search className="size-5" />
          </button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              aria-label="القائمة"
              className={buttonVariants({
                variant: "ghost",
                size: "icon",
                className: "bg-[#262626] lg:hidden",
              })}
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100%,320px)] bg-[#0a0a0a] p-0">
              <SheetHeader className="border-b border-[#1a1a1a] p-5">
                <SheetTitle className="text-lg font-black">القائمة</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 overflow-y-auto p-4" aria-label="قائمة الجوال">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl bg-[#121212] px-4 py-3 font-semibold text-[#e5e5e5] hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
                <p className="mt-3 px-2 text-sm font-bold text-primary">الأقسام</p>
                {GENRES.map((genre) => (
                  <Link
                    key={genre}
                    href={`/browse?genre=${encodeURIComponent(genre)}`}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-[#e5e5e5]"
                  >
                    {genre}
                  </Link>
                ))}
                <div className="mt-3 border-t border-[#1a1a1a] pt-3">
                  {infoNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-4 py-2 text-sm text-[#a3a3a3]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-[#1a1a1a] px-4 py-3 md:hidden">
          <SearchForm id="header-search-mobile" />
        </div>
      ) : null}
    </header>
  );
}
