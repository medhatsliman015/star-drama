import type { Metadata } from "next";
import { ContactForm } from "@/app/contact/contact-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description: `راسل فريق ${siteConfig.name}.`,
};

export default function ContactPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <h1 className="font-display text-4xl font-black">اتصل بنا</h1>
      <p className="mt-4 text-base leading-8 text-[#ddd]">
        للنسخة التجريبية استخدم البريد {siteConfig.contactEmail}. النموذج يتحقق من الحقول محلياً
        ولا يرسل البيانات إلى خادم.
      </p>
      <ContactForm />
    </article>
  );
}
