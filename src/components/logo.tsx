import Link from "next/link";
import { cn } from "cn";
import { siteConfig } from "@/lib/site";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden="true"
      className={cn("size-9 shrink-0", className)}
    >
      <rect width="36" height="36" rx="10" fill="#120406" />
      <path d="M8 11.5 24.5 18 8 24.5V11.5Z" fill="#e50914" />
      <path d="M15 18 24.5 13.2v9.6L15 18Z" fill="#fff" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 font-display text-[1.65rem] leading-none font-black tracking-tight text-primary",
        className,
      )}
    >
      <LogoMark />
      <span>
        {siteConfig.nameLead}
        <span className="ms-1 text-white">{siteConfig.nameTail}</span>
      </span>
    </Link>
  );
}
