import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: `كيف يتعامل ${siteConfig.name} مع بيانات التصفح والإعلانات.`,
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl font-black">سياسة الخصوصية</h1>
      <p className="mt-3 text-sm text-[#a3a3a3]">نموذج يمكن تعديله قبل ربط أي شبكة إعلانات.</p>
      <div className="mt-6 space-y-4 text-base leading-8 text-[#ddd]">
        <p>
          هذه النسخة لا تنشئ حسابات ولا تجمع نماذج اتصال على خادم. البحث والتصفية يتمان داخل
          المتصفح عبر عنوان الصفحة، ولا يُحفظ سجل مشاهدة.
        </p>
        <p>
          مساحات الإعلان فارغة حالياً. عند لصق كود AdSense أو شبكة أخرى قد تضع تلك الشبكة ملفات
          تعريف ارتباط لقياس الظهور والنقرات. حدّث هذه الصفحة باسم الجهة المشغّلة، وأنواع
          الإعلانات، وطريقة رفض التتبع، قبل نشر الموقع للعامة.
        </p>
        <p>
          الملصقات الحالية تُطلب من خدمة صور بديلة (picsum.photos) لأغراض الشكل فقط. استبدلها
          بروابط صورك عند إضافة الأعمال الحقيقية.
        </p>
        <p>
          للاستفسار حول هذه السياسة راسل{" "}
          <a className="font-bold text-primary" href={`mailto:${siteConfig.contactEmail}`}>
            {siteConfig.contactEmail}
          </a>
          . غيّر العنوان من ملف <span className="font-mono text-sm">src/lib/site.ts</span>.
        </p>
      </div>
    </article>
  );
}
