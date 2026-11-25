import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

const CATALOG_PATH = path.join(process.cwd(), "src", "data", "catalog.json");

interface Series {
  id: string;
  slug: string;
  title: string;
  [key: string]: unknown;
}

async function readCatalog(): Promise<Series[]> {
  const data = await fs.readFile(CATALOG_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeCatalog(data: Series[]) {
  await fs.writeFile(CATALOG_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const q = searchParams.get("q")?.trim() || "";
  const genre = searchParams.get("genre") || "";
  const audio = searchParams.get("audio") || "";
  const status = searchParams.get("status") || "";

  // Import queryCatalog dynamically
  const { queryCatalog } = await import("@/lib/catalog");
  const result = queryCatalog({ q, genre, audio, sort: "new", page, limit });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "العنوان والمعرف مطلوبان" }, { status: 400 });
    }

    const catalog = await readCatalog();

    // Check for duplicate slug/id
    if (catalog.some(item => item.id === body.id || item.slug === body.slug)) {
      return NextResponse.json({ error: "المعرف أو المعرف المختصر مستخدم بالفعل" }, { status: 400 });
    }

    // Generate episodes if not provided
    const episodes = body.episodes || (
      body.kind === "movie"
        ? [{ number: 1, title: "الفيلم", duration: "95:00", videoUrl: "" }]
        : Array.from({ length: body.episodeCount || 30 }, (_, i) => ({
            number: i + 1,
            title: `الحلقة ${i + 1}`,
            duration: "02:00",
            videoUrl: "",
          }))
    );

    const newSeries = {
      id: body.id || body.slug,
      slug: body.slug,
      title: body.title,
      synopsis: body.synopsis || "",
      kind: body.kind || "series",
      genres: body.genres || [],
      audio: body.audio || "مترجم",
      origin: body.origin || "صيني",
      year: body.year || new Date().getFullYear(),
      episodeCount: body.episodeCount || (body.kind === "movie" ? 1 : 30),
      views: body.views || 0,
      addedAt: body.addedAt || new Date().toISOString().split("T")[0],
      featured: body.featured || false,
      status: body.status || "مكتمل",
      poster: body.poster || "",
      backdrop: body.backdrop || "",
      episodes,
      _embedUrl: body._embedUrl || "",
      _sourceUrl: body._sourceUrl || "",
    };

    catalog.unshift(newSeries); // Add to beginning
    await writeCatalog(catalog);

    return NextResponse.json(newSeries, { status: 201 });
  } catch (e) {
    console.error("Create error:", e);
    return NextResponse.json({ error: "فشل الإنشاء" }, { status: 500 });
  }
}