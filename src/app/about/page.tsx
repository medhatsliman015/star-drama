import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "من نحن",
  description: `تعرّف على ${siteConfig.name} وكيف تُجهَّز مكتبة المسلسلات القصيرة.`,
};

export default function AboutPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl font-black">من نحن</h1>
      <div className="mt-6 space-y-4 text-base leading-8 text-[#ddd]">
        <p>
          {siteConfig.name} واجهة عربية لعرض المسلسلات القصيرة والأفلام. الصفحة الرئيسية تجمع
          الأعمال المميزة، الأحدث، المترجم، المدبلج، والأكثر مشاهدة، ثم تفتح كل بطاقة على صفحة
          تفاصيل وحلقات.
        </p>
        <p>
          المكتبة المعروضة الآن بيانات تجريبية: عناوين وملخصات وملصقات بديلة، من دون أي ملف فيديو.
          عندما تجهز أعمالك، تعدّل ملفاً واحداً هو{" "}
          <span className="font-mono text-sm">src/data/catalog.json</span> فيظهر العنوان والملصق
          وعدد الحلقات في كل الصفحات.
        </p>
        <p>
          المشغّل عنصر HTML5 فارغ. ضع رابط ملف تملك حق عرضه في الحقل{" "}
          <span className="font-mono text-sm">videoUrl</span> لحلقة واحدة أو لكل الحلقات، وسيعمل
          التشغيل واختيار الحلقة من دون تعديل الواجهة.
        </p>
        <p>
          مساحات الإعلان مرسومة وواضحة: شريط علوي، بطاقة داخل الشبكة، عمود جانبي، ومساحة تحت
          المشغّل. هي فارغة عمداً حتى تلصق كود الشبكة الإعلانية لاحقاً.
        </p>
      </div>
    </article>
  );
}
