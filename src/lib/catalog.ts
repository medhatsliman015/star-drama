import rawCatalog from "@/data/catalog.json";

/**
 * Catalog access. Pages read this module only — swap `src/data/catalog.json`
 * for real titles and the UI follows.
 *
 * الوصول للكتالوج. الصفحات تقرأ هذا الملف فقط؛ استبدل data/catalog.json
 * بالأعمال الحقيقية وستتحدث الواجهة.
 */

export const GENRES = [
  "أكشن",
  "دراما",
  "رومانسي",
  "إثارة",
  "كوميديا",
  "فانتازيا",
  "تاريخي",
  "رعب",
  "غموض",
] as const;

export type AudioMode = "مترجم" | "مدبلج";
export type Kind = "series" | "movie";
export type Status = "مكتمل" | "مستمر";

export type EpisodeDraft = {
  number: number;
  title?: string;
  duration?: string;
  /** Direct mp4/webm URL you have rights to. Leave "" until the file is ready. */
  videoUrl?: string;
};

export type Series = {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  kind: Kind;
  genres: string[];
  audio: AudioMode;
  origin: string;
  year: number;
  episodeCount: number;
  views: number;
  addedAt: string;
  featured: boolean;
  status: Status;
  poster: string;
  backdrop: string;
  episodes?: EpisodeDraft[];
};

export type Episode = {
  number: number;
  title: string;
  duration: string;
  videoUrl: string;
};

export type CatalogQuery = {
  q?: string;
  genre?: string;
  audio?: string;
  sort?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function parseSeries(value: unknown): Series | null {
  const row = asRecord(value);
  if (!row) return null;

  const slug = asString(row.slug);
  const title = asString(row.title);
  if (!slug || !title) return null;

  const kind: Kind = row.kind === "movie" ? "movie" : "series";
  const audio: AudioMode = row.audio === "مدبلج" ? "مدبلج" : "مترجم";
  const status: Status = row.status === "مستمر" ? "مستمر" : "مكتمل";
  const genres = Array.isArray(row.genres)
    ? row.genres.filter((genre): genre is string => typeof genre === "string" && genre.trim() !== "")
    : [];

  const episodes = Array.isArray(row.episodes)
    ? row.episodes.flatMap((episode) => {
        const item = asRecord(episode);
        if (!item || typeof item.number !== "number") return [];
        const draft: EpisodeDraft = {
          number: item.number,
          title: asString(item.title) || undefined,
          duration: asString(item.duration) || undefined,
          videoUrl: asString(item.videoUrl),
        };
        return [draft];
      })
    : undefined;

  return {
    id: asString(row.id, slug),
    slug,
    title,
    synopsis: asString(row.synopsis),
    kind,
    genres,
    audio,
    origin: asString(row.origin, "صيني"),
    year: typeof row.year === "number" ? row.year : new Date().getFullYear(),
    episodeCount: typeof row.episodeCount === "number" ? row.episodeCount : kind === "movie" ? 1 : 1,
    views: typeof row.views === "number" ? row.views : 0,
    addedAt: asString(row.addedAt, "2026-01-01"),
    featured: row.featured === true,
    status,
    poster: asString(row.poster),
    backdrop: asString(row.backdrop),
    episodes,
  };
}

const seriesList: Series[] = (Array.isArray(rawCatalog) ? rawCatalog : [])
  .map(parseSeries)
  .filter((item): item is Series => item !== null)
  .sort((a, b) => b.addedAt.localeCompare(a.addedAt));

export function getAllSeries(): Series[] {
  return seriesList;
}

export function getSeries(slug: string): Series | undefined {
  return seriesList.find((item) => item.slug === slug);
}

export function getFeatured(): Series[] {
  const featured = seriesList.filter((item) => item.featured);
  return featured.length > 0 ? featured : seriesList.slice(0, 5);
}

/** Build the full episode list from episodeCount, then apply optional overrides. */
export function getEpisodes(series: Series): Episode[] {
  const overrides = new Map((series.episodes ?? []).map((episode) => [episode.number, episode]));
  const count =
    series.kind === "movie"
      ? 1
      : Math.max(series.episodeCount || 0, overrides.size || 0, 1);

  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const extra = overrides.get(number);
    return {
      number,
      title: extra?.title || (series.kind === "movie" ? "الفيلم" : `الحلقة ${number}`),
      duration: extra?.duration || (series.kind === "movie" ? "95:00" : "02:00"),
      videoUrl: extra?.videoUrl ?? "",
    };
  });
}

export function episodeBadge(series: Pick<Series, "kind" | "episodeCount">): string {
  if (series.kind === "movie") return "فيلم";
  return `في ${series.episodeCount} حلقة`;
}

export function formatViews(views: number): string {
  if (views >= 1_000_000) {
    const value = (views / 1_000_000).toFixed(views >= 10_000_000 ? 0 : 1);
    return `${value} مليون مشاهدة`;
  }
  if (views >= 1_000) {
    return `${Math.round(views / 1_000)} ألف مشاهدة`;
  }
  return `${views.toLocaleString("ar-EG")} مشاهدة`;
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ");
}

export function queryCatalog({ q, genre, audio, sort }: CatalogQuery): Series[] {
  let items = [...seriesList];
  const query = q ? normalize(q) : "";

  if (query) {
    items = items.filter((item) => {
      const haystack = normalize(
        [item.title, item.synopsis, item.origin, item.audio, ...item.genres].join(" "),
      );
      return haystack.includes(query);
    });
  }

  if (genre && genre !== "الكل") {
    items = items.filter((item) => item.genres.includes(genre));
  }

  if (audio === "مترجم" || audio === "مدبلج") {
    items = items.filter((item) => item.audio === audio);
  }

  if (sort === "views") {
    items.sort((a, b) => b.views - a.views);
  } else {
    items.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  }

  return items;
}

export function getGenreCounts(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of seriesList) {
    for (const genre of item.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }

  const known = GENRES.filter((genre) => counts.has(genre));
  const extra = [...counts.keys()].filter(
    (genre) => !GENRES.includes(genre as (typeof GENRES)[number]),
  );

  return [...known, ...extra].map((name) => ({ name, count: counts.get(name) ?? 0 }));
}

export function getRelated(series: Series, limit = 4): Series[] {
  const sameGenre = seriesList.filter(
    (item) => item.slug !== series.slug && item.genres.some((genre) => series.genres.includes(genre)),
  );
  const rest = seriesList.filter(
    (item) => item.slug !== series.slug && !sameGenre.includes(item),
  );
  return [...sameGenre, ...rest].slice(0, limit);
}

export function isPlayableUrl(url: string): boolean {
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}
