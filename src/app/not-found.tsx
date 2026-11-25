import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-black text-primary">404</p>
      <h1 className="mt-3 text-2xl font-extrabold">هذه الصفحة غير موجودة</h1>
      <p className="mt-2 text-sm text-[#a3a3a3]">ربما تغيّر رابط العمل أو كُتب العنوان بشكل مختلف.</p>
      <Link href="/" className={buttonVariants({ className: "mt-6 h-11 rounded-full px-6" })}>
        العودة إلى الرئيسية
      </Link>
    </div>
  );
}
