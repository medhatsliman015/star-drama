import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ ok: false, error: "Invalid URL" });
    }

    // Test with HEAD request first (faster)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      clearTimeout(timeout);

      const contentType = res.headers.get("content-type") || "";
      const contentLength = res.headers.get("content-length");
      const isVideo = contentType.includes("video") || contentType.includes("mpegurl") || contentType.includes("octet-stream");
      const isM3U8 = url.includes(".m3u8") || contentType.includes("mpegurl");

      return NextResponse.json({
        ok: res.ok,
        status: res.status,
        contentType,
        contentLength: contentLength ? Number(contentLength) : null,
        isVideo,
        isM3U8,
      });
    } catch (e) {
      clearTimeout(timeout);
      return NextResponse.json({ ok: false, error: "Request failed" });
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid request" });
  }
}