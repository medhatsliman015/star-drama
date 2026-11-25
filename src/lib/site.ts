/**
 * Site identity. Change the name here and it updates the header, footer, and titles.
 * هوية المنصة: غيّر الاسم من هذا الملف ليظهر في كل الصفحات.
 */
export const siteConfig = {
  name: "ستار دراما",
  nameLead: "ستار",
  nameTail: "دراما",
  tagline: "مسلسلات قصيرة ومشاهدة متصلة",
  description:
    "تصفّح المسلسلات القصيرة والأفلام بالعربية، مترجمة ومدبلجة، مع صفحات حلقات جاهزة لإضافة مصادر العرض لاحقاً.",
  contactEmail: "owner@example.com",
};

export const mainNav = [
  { href: "/", label: "الرئيسية" },
  { href: "/browse", label: "كل المسلسلات" },
  { href: "/browse?audio=مترجم", label: "مترجم" },
  { href: "/browse?audio=مدبلج", label: "مدبلج" },
  { href: "/browse?sort=views", label: "الأكثر مشاهدة" },
];

export const infoNav = [
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "اتصل بنا" },
  { href: "/privacy", label: "سياسة الخصوصية" },
];
