import Link from "next/link";
import { Logo } from "@/components/logo";
import { infoNav, siteConfig } from "@/lib/site";
import { GENRES } from "@/lib/catalog";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[#1a1a1a] bg-[#030303]">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 md:px-6 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-7 text-[#bbb]">{siteConfig.description}</p>
          <p className="mt-3 max-w-md text-xs leading-6 text-[#8d8d8d]">
            العناوين والملصقات الحالية نماذج للتجربة. المنصة لا تستضيف ملفات فيديو، ويعرض المشغّل
            الرابط الذي تضيفه أنت في ملف البيانات.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-base font-bold">تصفح</h2>
          <ul className="space-y-2 text-sm text-[#bbb]">
            <li>
              <Link href="/browse" className="hover:text-primary">
                كل المسلسلات
              </Link>
            </li>
            <li>
              <Link href="/browse?audio=مترجم" className="hover:text-primary">
                مترجم
              </Link>
            </li>
            <li>
              <Link href="/browse?audio=مدبلج" className="hover:text-primary">
                مدبلج
              </Link>
            </li>
            <li>
              <Link href="/browse?sort=views" className="hover:text-primary">
                الأكثر مشاهدة
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-base font-bold">تصنيفات</h2>
          <ul className="space-y-2 text-sm text-[#bbb]">
            {GENRES.slice(0, 6).map((genre) => (
              <li key={genre}>
                <Link href={`/browse?genre=${encodeURIComponent(genre)}`} className="hover:text-primary">
                  {genre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-base font-bold">روابط</h2>
          <ul className="space-y-2 text-sm text-[#bbb]">
            {infoNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-[#1a1a1a] px-4 py-5 text-center text-xs leading-6 text-[#8d8d8d]">
        <p>
          © {year} {siteConfig.name}. جميع الحقوق للنصوص والبيانات التي تضيفها أنت.
        </p>
      </div>
    </footer>
  );
}
