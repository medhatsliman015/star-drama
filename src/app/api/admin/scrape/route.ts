import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

const CATALOG_PATH = path.join(process.cwd(), "src", "data", "catalog.json");

interface Series {
  id: string;
  slug: string;
  title: string;
  episodes?: { number: number; title?: string; duration?: string; videoUrl?: string }[];
  videoUrl?: string;
  videoSources?: { m3u8: string[]; mp4: string[]; other: string[] };
  [key: string]: unknown;
}

async function readCatalog(): Promise<Series[]> {
  const data = await fs.readFile(CATALOG_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeCatalog(data: Series[]) {
  await fs.writeFile(CATALOG_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// Simple m3u8 extraction from vidaraa.cc using regex on page HTML
async function extractFromVidaraa(embedUrl: string) {
  try {
    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // Look for m3u8 URLs in the HTML (common patterns)
    const m3u8Matches = html.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/g) || [];
    const mp4Matches = html.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/g) || [];

    // Also look for video sources in script tags
    const sourceMatches = html.match(/(?:source|src|file)["\s:=]+(["'])(https?:\/\/[^"'\s]+\.(?:m3u8|mp4|m4s))["']/gi) || [];

    const extractedFromSource = sourceMatches
      .map(m => m.match(/https?:\/\/[^"'\s]+/)?.[0])
      .filter((v): v is string => Boolean(v));

    const sources = {
      m3u8: [...new Set([...m3u8Matches, ...extractedFromSource])],
      mp4: [...new Set([...mp4Matches])],
      other: [],
    };

    return sources;
  } catch (e) {
    console.error("Extract error:", e);
    return { m3u8: [], mp4: [], other: [] };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, embedUrl } = await req.json();
    if (!id || !embedUrl) {
      return NextResponse.json({ ok: false, error: "Missing id or embedUrl" });
    }

    const catalog = await readCatalog();
    const idx = catalog.findIndex((item) => item.id === id);
    if (idx === -1) {
      return NextResponse.json({ ok: false, error: "Series not found" });
    }

    const sources = await extractFromVidaraa(embedUrl);

    // Update catalog
    catalog[idx] = {
      ...catalog[idx],
      videoSources: sources,
      videoUrl: sources.m3u8[0] || sources.mp4[0] || catalog[idx].videoUrl,
    };

    // Also update first episode videoUrl
    if (catalog[idx].episodes && catalog[idx].episodes.length > 0 && sources.m3u8[0]) {
      catalog[idx].episodes[0] = {
        ...catalog[idx].episodes[0],
        videoUrl: sources.m3u8[0],
      };
    }

    await writeCatalog(catalog);

    return NextResponse.json({
      ok: true,
      series: catalog[idx],
      sources,
    });
  } catch (e) {
    console.error("Scrape error:", e);
    return NextResponse.json({ ok: false, error: "Scrape failed" });
  }
}