"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/site";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (name.length < 2 || !email.includes("@") || message.length < 8) {
      setError("اكتب اسماً وبريداً صالحاً ورسالة أوضح.");
      setSent(false);
      return;
    }

    setError("");
    setSent(true);
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      <label className="block space-y-2 text-sm font-bold">
        الاسم
        <Input name="name" required className="h-11 rounded-xl border-[#2a2a2a] bg-[#121212]" />
      </label>
      <label className="block space-y-2 text-sm font-bold">
        البريد
        <Input
          name="email"
          type="email"
          required
          className="h-11 rounded-xl border-[#2a2a2a] bg-[#121212]"
          dir="ltr"
        />
      </label>
      <label className="block space-y-2 text-sm font-bold">
        الرسالة
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-xl border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>
      {error ? <p className="text-sm font-semibold text-primary">{error}</p> : null}
      {sent ? (
        <p className="rounded-xl border border-white/10 bg-[#121212] p-4 text-sm leading-7">
          حُفظت الرسالة على هذا الجهاز فقط. هذه النسخة لا ترسل بريداً. راسل{" "}
          {siteConfig.contactEmail} مباشرة، أو اربط النموذج بخدمتك لاحقاً.
        </p>
      ) : null}
      <Button type="submit" className="h-11 rounded-full px-6 font-bold">
        إرسال
      </Button>
    </form>
  );
}
