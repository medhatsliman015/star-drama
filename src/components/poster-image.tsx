"use client";

import { useState } from "react";
import { cn } from "cn";

/** Portrait/backdrop image with a gradient fallback if the placeholder host fails. */
export function PosterImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "absolute inset-0 flex items-end bg-gradient-to-t from-black via-red-950/70 to-zinc-800 p-3",
          className,
        )}
      >
        <span className="line-clamp-3 text-sm font-bold text-white">{alt}</span>
      </div>
    );
  }

  return (
    // Plain img keeps picsum seeds easy to swap and avoids the image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
