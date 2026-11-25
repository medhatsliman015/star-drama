# ستار دراما

واجهة عربية (من اليمين إلى اليسار) لكتالوج مسلسلات قصيرة وأفلام، بثيم داكن قريب من مواقع الدراما القصيرة: خلفية سوداء، لون تمييز أحمر، ملصقات طولية، وشارة عدد الحلقات مثل «في 74 حلقة».

البيانات الحالية **نماذج**. لا يوجد فيديو محفوظ، ومساحات الإعلان فارغة حتى تلصق كود الشبكة الإعلانية.

## English

An Arabic (RTL) short-drama catalog. Dark theme, portrait posters, episode badges, a reusable HTML5 player, and empty ad slots. Sample titles live in one JSON file. No video files are shipped.

## التشغيل محلياً / Run locally

```bash
npm install
npm run dev
```

يفتح على [http://127.0.0.1:43123](http://127.0.0.1:43123).

Production:

```bash
npm run build
npm start
```

## إضافة عمل / Add a title

عدّل `src/data/catalog.json`. كل عنصر يظهر في الرئيسية والتصفح وصفحة التفاصيل تلقائياً.

Edit `src/data/catalog.json`. One object is one title.

```json
{
  "id": "my-show",
  "slug": "my-show",
  "title": "اسم المسلسل",
  "synopsis": "ملخص بلا حرق للأحداث.",
  "kind": "series",
  "genres": ["دراما", "رومانسي"],
  "audio": "مترجم",
  "origin": "صيني",
  "year": 2026,
  "episodeCount": 40,
  "views": 1000,
  "addedAt": "2026-11-25",
  "featured": false,
  "status": "مستمر",
  "poster": "https://example.com/poster.jpg",
  "backdrop": "https://example.com/backdrop.jpg",
  "episodes": [
    { "number": 1, "title": "الحلقة 1", "duration": "02:00", "videoUrl": "" }
  ]
}
```

| الحقل | المعنى |
| --- | --- |
| `slug` | رابط الصفحة: `/series/my-show` و `/watch/my-show` |
| `kind` | `series` أو `movie` |
| `audio` | `مترجم` أو `مدبلج` |
| `episodeCount` | عدد الحلقات. تُبنى قائمة الحلقات منه |
| `episodes` | اختياري. يعدّل عنوان حلقة أو يضع `videoUrl` فقط للأرقام المذكورة |
| `featured` | `true` يضع العمل في السلايدر |
| `poster` / `backdrop` | رابط صورة 2:3 وصورة عريضة. النماذج تستخدم `picsum.photos` |

`videoUrl` يبقى `""` حتى يتوفر ملف mp4 أو webm **تملك حق عرضه**. مثال:

```json
{ "number": 1, "title": "الحلقة 1", "duration": "02:10", "videoUrl": "https://cdn.example.com/ep1.mp4" }
```

الحلقات التي لا تُذكر في `episodes` تُولَّد بعنوان «الحلقة N» ومن دون مصدر.

اسم المنصة والبريد في `src/lib/site.ts`.

## مساحات الإعلان / Ad slots

كل مساحة عنصر فارغ وفيه التعليق `<!-- AD SLOT -->` في مصدر الصفحة، مع السمة `data-ad-slot`. الصق كود AdSense أو أي شبكة **داخل** `div.ad-slot__code` مكان التعليق.

| `data-ad-slot` | المكان | الملف |
| --- | --- | --- |
| `leaderboard-top` | تحت الترويسة في كل الصفحات | `src/app/layout.tsx` |
| `in-grid` | داخل شبكة الملصقات بعد البطاقة الرابعة | `src/components/catalog-grid.tsx` |
| `sidebar` | العمود الجانبي في التصفح والتفاصيل والمشاهدة | صفحات `browse` و `series` و `watch` |
| `below-player` | تحت المشغّل | صفحات المسلسل والمشاهدة |

المكوّن: `src/components/ad-slot.tsx`.

قبل تفعيل الإعلانات حدّث `src/app/privacy/page.tsx` باسم الجهة المشغّلة وسياسة ملفات تعريف الارتباط.

## الصفحات

- `/` الرئيسية: سلايدر، الأكثر مشاهدة، الأحدث، مترجم، مدبلج، تصنيفات
- `/browse` بحث وتصفية بالتصنيف ونوع الصوت
- `/series/[slug]` التفاصيل والمشغّل والحلقات
- `/watch/[slug]?ep=1` صفحة المشاهدة نفسها مع تحديث رقم الحلقة في الرابط
- `/about` `/contact` `/privacy`

## النشر / Deploy

المشروع Next.js App Router. على Vercel أو Origin اربط المستودع وإعدادات البناء الافتراضية:

- Install: `npm install`
- Build: `npm run build`
- Output: الافتراضي (ليس تصديرًا ثابتًا منفصلًا)

لا تحتاج متغيرات بيئة للنسخة الحالية. الصور البديلة تُطلب من المتصفح مباشرة من `picsum.photos`.

## Tech

Next.js 15, React 19, Tailwind CSS 4, shadcn/ui. الخطوط: Cairo و Tajawal عبر `next/font`.
