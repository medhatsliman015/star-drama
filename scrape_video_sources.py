#!/usr/bin/env python3
"""
Scrape actual video sources (m3u8/mp4) from vidaraa.cc embed pages using Playwright.

Usage:
    python scrape_video_sources.py              # Scrape all series with embedUrl
    python scrape_video_sources.py --limit 10   # Test with first 10
    python scrape_video_sources.py --series "slug"  # Scrape specific series
"""

import json
import asyncio
import re
import argparse
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from typing import List, Dict, Optional

# ─── CONFIG ──────────────────────────────────────────────────────────────
CATALOG_PATH = Path(__file__).parent / "src" / "data" / "catalog.json"
OUTPUT_PATH = CATALOG_PATH  # overwrite in place

# ─── HELPERS ─────────────────────────────────────────────────────────────
def load_catalog() -> List[Dict]:
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_catalog(data: List[Dict]):
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"[OK] Saved catalog: {OUTPUT_PATH}")

# ─── PLAYWRIGHT SCRAPER ──────────────────────────────────────────────────
async def extract_video_sources(embed_url: str, page) -> Dict[str, List[str]]:
    """
    Navigate to vidaraa.cc embed page and intercept network requests
    to find actual video sources (m3u8, mp4, etc.)
    """
    sources = {"m3u8": [], "mp4": [], "other": []}
    seen_urls = set()

    # Listen for network responses
    async def handle_response(response):
        try:
            url = response.url
            content_type = response.headers.get("content-type", "")

            # Look for video manifests/segments
            if any(ext in url for ext in [".m3u8", ".mp4", ".m4s", ".ts", ".webm"]):
                if url not in seen_urls:
                    seen_urls.add(url)
                    if ".m3u8" in url:
                        sources["m3u8"].append(url)
                    elif ".mp4" in url or ".m4s" in url:
                        sources["mp4"].append(url)
                    else:
                        sources["other"].append(url)

            # Also check response body for m3u8 URLs (some players load playlist via JS)
            if "video" in content_type or "application/vnd.apple.mpegurl" in content_type:
                if url not in seen_urls:
                    seen_urls.add(url)
                    sources["m3u8"].append(url)

        except Exception:
            pass

    page.on("response", handle_response)

    try:
        print(f"  Loading: {embed_url}")
        await page.goto(embed_url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(3000)  # Wait for player to initialize

        # Try to click play if needed
        try:
            play_btn = page.locator('button:has-text("Play"), .play-btn, [aria-label*="play" i], .vjs-big-play-button')
            if await play_btn.count() > 0:
                await play_btn.first.click()
                await page.wait_for_timeout(2000)
        except Exception:
            pass

        # Wait for network to settle
        await page.wait_for_load_state("networkidle", timeout=10000)

    except Exception as e:
        print(f"  Error loading {embed_url}: {e}")

    # Deduplicate
    for k in sources:
        sources[k] = list(dict.fromkeys(sources[k]))

    return sources

async def scrape_series_videos(series_list: List[Dict], limit: Optional[int] = None) -> List[Dict]:
    """Scrape video sources for series that have embedUrl."""
    from playwright.async_api import async_playwright

    # Filter series with embedUrl
    series_with_embed = [s for s in series_list if s.get("_embedUrl")]
    if limit:
        series_with_embed = series_with_embed[:limit]

    print(f"[*] Found {len(series_with_embed)} series with embedUrl to scrape")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = await context.new_page()

        updated = 0
        for i, series in enumerate(series_with_embed):
            embed_url = series.get("_embedUrl", "")
            if not embed_url:
                continue

            print(f"[{i+1}/{len(series_with_embed)}] {series['title']}...")
            sources = await extract_video_sources(embed_url, page)

            # Update series with found sources
            series["videoSources"] = sources

            # If m3u8 found, use first as primary videoUrl for episode 1
            if sources["m3u8"]:
                series["videoUrl"] = sources["m3u8"][0]
                # Also update first episode
                if series.get("episodes"):
                    series["episodes"][0]["videoUrl"] = sources["m3u8"][0]
                updated += 1
                print(f"  ✓ Found {len(sources['m3u8'])} m3u8, {len(sources['mp4'])} mp4")
            else:
                print(f"  ✗ No video sources found")

        await browser.close()

    print(f"\n[*] Updated {updated} series with video sources")
    return series_list

# ─── MAIN ────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Scrape video sources from vidaraa.cc embeds")
    parser.add_argument("--limit", type=int, help="Limit number of series to scrape")
    parser.add_argument("--series", type=str, help="Scrape specific series by slug")
    args = parser.parse_args()

    catalog = load_catalog()

    if args.series:
        catalog = [s for s in catalog if s["slug"] == args.series]
        if not catalog:
            print(f"[!] Series not found: {args.series}")
            return

    # Run async scraper
    updated_catalog = asyncio.run(scrape_series_videos(catalog, args.limit))

    # Merge back into full catalog if limited
    if args.limit or args.series:
        # Create lookup of updated series
        updated_map = {s["slug"]: s for s in updated_catalog}
        full_catalog = load_catalog()
        for i, s in enumerate(full_catalog):
            if s["slug"] in updated_map:
                full_catalog[i] = updated_map[s["slug"]]
        save_catalog(full_catalog)
    else:
        save_catalog(updated_catalog)

if __name__ == "__main__":
    main()