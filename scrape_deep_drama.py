#!/usr/bin/env python3
"""
Deep-Drama Scraper → Star-Drama catalog.json generator

Scrapes series from deep-drama.com via label pages, matches with video sitemaps for embed URLs.
Outputs catalog.json matching star-drama's schema.

Usage:
    python scrape_deep_drama.py              # Full scrape (all series)
    python scrape_deep_drama.py --limit 10   # Test with first 10
    python scrape_deep_drama.py --resume     # Resume from checkpoint
"""

import json
import re
import time
import argparse
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any, Set
from urllib.parse import urljoin, urlparse, unquote, quote

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ─── CONFIG ──────────────────────────────────────────────────────────────
BASE_URL = "https://www.deep-drama.com"
SITEMAP_INDEX = f"{BASE_URL}/wp-sitemap.xml"
OUTPUT_PATH = Path(__file__).parent / "src" / "data" / "catalog.json"
CHECKPOINT_PATH = Path(__file__).parent / "scrape_checkpoint.json"

# Label pages to crawl for series URLs (properly URL-encoded)
LABEL_PAGES = [
    f"{BASE_URL}/search/label/{quote('مسلسل')}",
    f"{BASE_URL}/search/label/{quote('فيلم')}",
    f"{BASE_URL}/search/label/{quote('مسلسل مدبلج')}",
    f"{BASE_URL}/search/label/{quote('مسلسل مترجم')}",
    f"{BASE_URL}/search/label/{quote('صيني')}",
    f"{BASE_URL}/search/label/{quote('مسلسل أكشن')}",
    f"{BASE_URL}/search/label/{quote('مسلسل رومانسي')}",
    f"{BASE_URL}/search/label/{quote('مسلسل دراما')}",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ar,en-US;q=0.9,en;q=0.8",
}

REQUEST_DELAY = 1.0
TIMEOUT = 30
MAX_RETRIES = 3

STAR_GENRES = [
    "أكشن", "دراما", "رومانسي", "إثارة", "كوميديا",
    "فانتازيا", "تاريخي", "رعب", "غموض"
]

# ─── SESSION WITH RETRIES ────────────────────────────────────────────────
def build_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=MAX_RETRIES,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS"],
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    session.headers.update(HEADERS)
    return session

SESSION = build_session()

# ─── UTILITIES ───────────────────────────────────────────────────────────
def slugify_ar(text: str) -> str:
    """Generate URL-safe slug from Arabic text."""
    text = re.sub(r'[\u064B-\u065F]', '', text)
    text = re.sub(r'[\s\-\_\.]+', '-', text.strip())
    text = re.sub(r'[^\w\-]', '', text, flags=re.UNICODE)
    text = re.sub(r'-+', '-', text).strip('-')
    return text.lower() or hashlib.md5(text.encode()).hexdigest()[:8]

def make_unique_slug(base: str, existing: set) -> str:
    slug = base
    counter = 1
    while slug in existing:
        counter += 1
        slug = f"{base}-{counter}"
    existing.add(slug)
    return slug

def clean_text(text: str) -> str:
    return re.sub(r'\s+', ' ', text.strip())

def safe_print(msg: str):
    """Print safely on Windows console."""
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'ignore').decode())

def extract_json_ld(soup: BeautifulSoup) -> Optional[dict]:
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            return json.loads(script.string)
        except (json.JSONDecodeError, TypeError):
            continue
    return None

# ─── VIDEO SITEMAP PARSING ───────────────────────────────────────────────
def fetch_sitemap_index() -> List[str]:
    resp = SESSION.get(SITEMAP_INDEX, timeout=TIMEOUT)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.content, "xml")
    return [loc.text for loc in soup.find_all("loc")]

def fetch_video_sitemap(sitemap_url: str) -> List[Dict[str, Any]]:
    resp = SESSION.get(sitemap_url, timeout=TIMEOUT)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.content, "xml")
    entries = []
    for url_elem in soup.find_all("url"):
        loc = url_elem.find("loc")
        if not loc:
            continue
        entry = {"url": loc.text}
        video = url_elem.find("video:video")
        if video:
            entry["video_title"] = video.find("video:title").text if video.find("video:title") else ""
            entry["video_desc"] = video.find("video:description").text if video.find("video:description") else ""
            entry["video_thumb"] = video.find("video:thumbnail_loc").text if video.find("video:thumbnail_loc") else ""
            entry["video_player"] = video.find("video:player_loc").text if video.find("video:player_loc") else ""
            entry["video_pub_date"] = video.find("video:publication_date").text if video.find("video:publication_date") else ""
        entries.append(entry)
    return entries

def build_video_lookup() -> Dict[str, Dict]:
    """Build lookup: series slug (from URL) -> video data (first match)."""
    safe_print("[*] Fetching sitemap index...")
    sitemaps = fetch_sitemap_index()
    video_sitemaps = [s for s in sitemaps if "video-sitemap" in s]
    safe_print(f"[*] Found {len(video_sitemaps)} video sitemaps")

    video_lookup = {}
    for sm in video_sitemaps:
        safe_print(f"[*] Parsing video sitemap...")
        entries = fetch_video_sitemap(sm)
        for entry in entries:
            url = entry["url"]
            # Extract series identifier from URL path
            # e.g., /زوجي-يدفنني-حية/ -> slug
            path = urlparse(url).path.strip("/")
            if path:
                # Use the first path segment as series key
                key = path.split("/")[0]
                if key not in video_lookup:
                    video_lookup[key] = entry
        time.sleep(REQUEST_DELAY)

    safe_print(f"[*] Built video lookup with {len(video_lookup)} entries")
    return video_lookup

# ─── VIDEO SITEMAP AS PRIMARY SOURCE ──────────────────────────────────────
def get_all_series_from_video_sitemaps() -> List[Dict]:
    """Get all series entries from video sitemaps (primary source)."""
    safe_print("[*] Fetching sitemap index...")
    sitemaps = fetch_sitemap_index()
    video_sitemaps = [s for s in sitemaps if "video-sitemap" in s]
    safe_print(f"[*] Found {len(video_sitemaps)} video sitemaps")

    all_entries = []
    for sm in video_sitemaps:
        safe_print(f"[*] Parsing video sitemap...")
        entries = fetch_video_sitemap(sm)
        all_entries.extend(entries)
        time.sleep(REQUEST_DELAY)

    safe_print(f"[*] Total video entries: {len(all_entries)}")
    
    # Deduplicate by URL
    seen = set()
    unique = []
    for entry in all_entries:
        url = entry["url"]
        if url not in seen:
            seen.add(url)
            unique.append(entry)
    
    safe_print(f"[*] Unique series URLs from video sitemaps: {len(unique)}")
    return unique

# ─── SERIES PAGE SCRAPING ────────────────────────────────────────────────
def scrape_series_page(url: str, video_lookup: Dict) -> Optional[Dict[str, Any]]:
    """Extract all metadata from a series page."""
    try:
        resp = SESSION.get(url, timeout=TIMEOUT)
        resp.raise_for_status()
    except Exception as e:
        safe_print(f"[!] Failed to fetch series page: {e}")
        return None

    soup = BeautifulSoup(resp.content, "html.parser")

    # Try JSON-LD first
    json_ld = extract_json_ld(soup)
    video_data = {}
    if json_ld and isinstance(json_ld, dict):
        if json_ld.get("@type") == "VideoObject":
            video_data = json_ld
        elif isinstance(json_ld.get("@graph"), list):
            for item in json_ld["@graph"]:
                if item.get("@type") == "VideoObject":
                    video_data = item
                    break

    # Title - clean "مشاهدة مسلسل" prefix
    title = video_data.get("name", "").strip()
    if not title:
        h1 = soup.find("h1")
        if h1:
            title = clean_text(h1.get_text())
        else:
            og_title = soup.find("meta", property="og:title")
            if og_title:
                title = clean_text(og_title.get("content", ""))

    if not title:
        safe_print(f"[!] No title found")
        return None

    # Clean title: remove "مشاهدة مسلسل", "مسلسل", "فيلم" prefixes
    title = re.sub(r'^(مشاهدة\s+)?(مسلسل|فيلم)\s+', '', title)
    title = re.sub(r'\s+(مترجم|مدبلج)\s*(للعربية)?\s*$', '', title)

    # Synopsis
    synopsis = video_data.get("description", "").strip()
    if not synopsis:
        meta_desc = soup.find("meta", property="og:description") or soup.find("meta", attrs={"name": "description"})
        if meta_desc:
            synopsis = clean_text(meta_desc.get("content", ""))

    # Poster
    poster = video_data.get("thumbnailUrl", "").strip() or video_data.get("thumbnail_loc", "").strip()
    if not poster:
        og_image = soup.find("meta", property="og:image")
        if og_image:
            poster = og_image.get("content", "")

    # Embed URL
    embed_url = video_data.get("embedUrl", "").strip() or video_data.get("player_loc", "").strip()

    # Publication date / Year
    year = datetime.now().year
    pub_date = video_data.get("uploadDate", "")
    if pub_date:
        try:
            year = int(pub_date[:4])
        except:
            pass

    def extract_label_key(label: str) -> str:
        """Extract genre/audio/kind/origin from label like 'مسلسل أكشن' -> 'أكشن'"""
        # Normalize whitespace (handle non-breaking spaces)
        label = label.replace('\u00a0', ' ').replace('\xa0', ' ')
        # Remove prefixes
        for prefix in ["مسلسل ", "فيلم ", "أفلام ", "مسلسلات "]:
            if label.startswith(prefix):
                label = label[len(prefix):]
                break
        return label.strip()

    # Labels from page - ONLY from series-specific tags (xr-tags class)
    genres = []
    audio = "مترجم"
    origin = "صيني"
    kind = "series"
    found_labels = []
    has_dubbed_label = False
    has_subbed_label = False

    # Find the xr-tags container (series-specific metadata)
    tags_container = soup.find(class_="xr-tags")
    if tags_container:
        tag_links = tags_container.find_all("a", href=True)
    else:
        tag_links = []

    for link in tag_links:
        href = link["href"]
        text = clean_text(link.get_text())
        if "/search/label/" in href:
            label = unquote(href.split("/search/label/")[-1])
            found_labels.append(label)
            label_key = extract_label_key(label)
            
            if label_key in STAR_GENRES and label_key not in genres:
                genres.append(label_key)
            if "مدبلج" in label:
                has_dubbed_label = True
            elif "مترجم" in label:
                has_subbed_label = True
            if "فيلم" in label and "مسلسل" not in label:
                kind = "movie"
            if "صيني" in label or "صين" in label:
                origin = "صيني"
            elif "كوري" in label or "كورية" in label:
                origin = "كوري"
            elif "عربي" in label or "عربية" in label:
                origin = "عربي"
            elif "ياباني" in label or "يابان" in label:
                origin = "ياباني"
            elif "تايلاندي" in label or "تايلاند" in label:
                origin = "تايلاندي"

    # Determine audio: prioritize مدبلج if both present
    if has_dubbed_label:
        audio = "مدبلج"
    elif has_subbed_label:
        audio = "مترجم"

    # Fallback: check page title/synopsis for audio indicators
    title_lower = title.lower() if 'title' in locals() else ""
    synopsis_lower = synopsis.lower() if synopsis else ""
    if "مدبلج" in title_lower or "مدبلج" in synopsis_lower:
        audio = "مدبلج"
    elif "مترجم" in title_lower or "مترجم" in synopsis_lower:
        audio = "مترجم"

    # Extract genres from page text (description area)
    page_text = soup.get_text()
    for g in STAR_GENRES:
        if g in page_text and g not in genres:
            genres.append(g)

    # Kind fallback from page text
    if "فيلم" in page_text and "مسلسل" not in page_text:
        kind = "movie"
    # If episode count > 1, it's a series
    ep_match = re.search(r'(\d+)\s*حلقة', page_text)
    if ep_match and int(ep_match.group(1)) > 1:
        kind = "series"

    # Episode count
    episode_count = 1 if kind == "movie" else 0
    if ep_match:
        episode_count = int(ep_match.group(1))
    else:
        ep_match = re.search(r'في\s+(\d+)\s*حلقة', synopsis)
        if ep_match:
            episode_count = int(ep_match.group(1))
        elif kind == "series" and episode_count == 0:
            episode_count = 30

    # Status
    status = "مستمر" if "مستمر" in page_text or "جاري" in page_text else "مكتمل"

    # Views
    views = 0
    view_match = re.search(r'(\d[\d,]*)\s*(مشاهدة|مشاهدات|views)', page_text, re.IGNORECASE)
    if view_match:
        try:
            views = int(view_match.group(1).replace(",", ""))
        except:
            pass

    # Build slug from URL path
    path_slug = urlparse(url).path.strip("/")
    base_slug = slugify_ar(title) if not path_slug else path_slug

    return {
        "title": title,
        "synopsis": synopsis or f"مسلسل {title} - {episode_count} حلقة {audio}",
        "kind": kind,
        "genres": genres if genres else ["دراما"],
        "audio": audio,
        "origin": origin,
        "year": year,
        "episodeCount": episode_count,
        "views": views,
        "status": status,
        "poster": poster,
        "backdrop": poster,
        "embedUrl": embed_url,
        "sourceUrl": url,
        "baseSlug": base_slug,
    }

# ─── CATALOG BUILDING ────────────────────────────────────────────────────
def build_catalog(series_data: List[Dict]) -> List[Dict]:
    used_slugs = set()
    catalog = []

    for i, s in enumerate(series_data):
        slug = make_unique_slug(s["baseSlug"], used_slugs)
        id_ = slug

        episodes = []
        if s["kind"] == "movie":
            episodes.append({
                "number": 1,
                "title": "الفيلم",
                "duration": "95:00",
                "videoUrl": ""
            })
        else:
            for ep_num in range(1, s["episodeCount"] + 1):
                episodes.append({
                    "number": ep_num,
                    "title": f"الحلقة {ep_num}",
                    "duration": "02:00",
                    "videoUrl": ""
                })

        entry = {
            "id": id_,
            "slug": slug,
            "title": s["title"],
            "synopsis": s["synopsis"],
            "kind": s["kind"],
            "genres": s["genres"],
            "audio": s["audio"],
            "origin": s["origin"],
            "year": s["year"],
            "episodeCount": s["episodeCount"],
            "views": s["views"],
            "addedAt": datetime.now().strftime("%Y-%m-%d"),
            "featured": i < 6,
            "status": s["status"],
            "poster": s["poster"] or f"https://picsum.photos/seed/star-{slug}/600/900",
            "backdrop": s["backdrop"] or f"https://picsum.photos/seed/star-{slug}-wide/1600/900",
            "episodes": episodes,
            "_embedUrl": s["embedUrl"],
            "_sourceUrl": s["sourceUrl"],
        }
        catalog.append(entry)

    return catalog

# ─── CHECKPOINTING ───────────────────────────────────────────────────────
def save_checkpoint(data: List[Dict], processed_urls: List[str]):
    checkpoint = {
        "timestamp": datetime.now().isoformat(),
        "data": data,
        "processed_urls": processed_urls,
    }
    CHECKPOINT_PATH.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2), encoding="utf-8")
    safe_print(f"[*] Checkpoint saved ({len(data)} series)")

def load_checkpoint() -> Optional[Dict]:
    if CHECKPOINT_PATH.exists():
        try:
            return json.loads(CHECKPOINT_PATH.read_text(encoding="utf-8"))
        except:
            pass
    return None

# ─── MAIN ────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Scrape deep-drama video sitemaps → star-drama catalog")
    parser.add_argument("--limit", type=int, help="Limit number of series to scrape")
    parser.add_argument("--resume", action="store_true", help="Resume from checkpoint")
    parser.add_argument("--output", type=str, help="Output JSON path")
    args = parser.parse_args()

    output_path = Path(args.output) if args.output else OUTPUT_PATH

    scraped_data = []
    processed_urls = set()

    if args.resume:
        cp = load_checkpoint()
        if cp:
            scraped_data = cp.get("data", [])
            processed_urls = set(cp.get("processed_urls", []))
            safe_print(f"[*] Resumed: {len(scraped_data)} series already scraped")

    # Get all series from video sitemaps (primary source with title, desc, thumb, embed, date)
    all_entries = get_all_series_from_video_sitemaps()

    if args.limit:
        all_entries = all_entries[:args.limit]
        safe_print(f"[*] Limited to first {args.limit} series")

    # Scrape each series page for additional metadata (genres, audio, origin, episode count)
    for i, entry in enumerate(all_entries):
        url = entry["url"]
        if url in processed_urls:
            continue

        safe_print(f"[{i+1}/{len(all_entries)}] Scraping...")
        data = scrape_series_page(url, {})  # video data already in entry
        if data:
            # Merge video sitemap data (prefer sitemap for title/desc/thumb/embed/date)
            if entry.get("video_title"):
                data["title"] = entry["video_title"]
            if entry.get("video_desc"):
                data["synopsis"] = entry["video_desc"]
            if entry.get("video_thumb"):
                data["poster"] = entry["video_thumb"]
                data["backdrop"] = entry["video_thumb"]
            if entry.get("video_player"):
                data["embedUrl"] = entry["video_player"]
            if entry.get("video_pub_date"):
                try:
                    data["year"] = int(entry["video_pub_date"][:4])
                except:
                    pass

            # Clean title after merge: remove "مشاهدة مسلسل", "مسلسل", "فيلم" prefixes
            data["title"] = re.sub(r'^(مشاهدة\s+)?(مسلسل|فيلم)\s+', '', data["title"])
            data["title"] = re.sub(r'\s+(مترجم|مدبلج)\s*(للعربية)?\s*$', '', data["title"])

            scraped_data.append(data)
            processed_urls.add(url)

        if (i + 1) % 10 == 0:
            save_checkpoint(scraped_data, list(processed_urls))

        time.sleep(REQUEST_DELAY)

    save_checkpoint(scraped_data, list(processed_urls))

    safe_print(f"[*] Building catalog from {len(scraped_data)} series...")
    catalog = build_catalog(scraped_data)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    safe_print(f"[OK] Catalog written to {output_path} ({len(catalog)} entries)")

    movies = sum(1 for c in catalog if c["kind"] == "movie")
    series = sum(1 for c in catalog if c["kind"] == "series")
    dubbed = sum(1 for c in catalog if c["audio"] == "مدبلج")
    subbed = sum(1 for c in catalog if c["audio"] == "مترجم")
    safe_print(f"\nSummary:")
    safe_print(f"  Total: {len(catalog)}")
    safe_print(f"  Series: {series}, Movies: {movies}")
    safe_print(f"  Dubbed: {dubbed}, Subbed: {subbed}")
    safe_print(f"  Featured: {sum(1 for c in catalog if c['featured'])}")

if __name__ == "__main__":
    main()