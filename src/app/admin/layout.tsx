import Link from "next/link";

export const metadata = {
  title: "Star-Drama Admin",
  description: "إدارة الكتالوج ومصادر الفيديو",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-[#1a1a1a] bg-[#0f0f0f] sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-display text-xl font-black">
            <span className="text-primary">★</span> Star-Drama Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-[#a3a3a3] hover:text-white">الكتالوج</Link>
            <Link href="/admin/scraper" className="text-[#a3a3a3] hover:text-white">السكرابر</Link>
            <Link href="/admin/sources" className="text-[#a3a3a3] hover:text-white">مصادر الفيديو</Link>
            <Link href="/" className="text-[#a3a3a3] hover:text-white" target="_blank">الموقع</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}