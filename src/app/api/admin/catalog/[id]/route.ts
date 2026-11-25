import { NextRequest, NextResponse } from "next/server";
import { getAllSeries } from "@/lib/catalog";
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const catalog = await readCatalog();
    const filtered = catalog.filter((item) => item.id !== id);
    if (filtered.length === catalog.length) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }
    await writeCatalog(filtered);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "فشل الحذف" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const catalog = await readCatalog();
    const idx = catalog.findIndex((item) => item.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }
    catalog[idx] = { ...catalog[idx], ...body };
    await writeCatalog(catalog);
    return NextResponse.json(catalog[idx]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const catalog = await readCatalog();
  const item = catalog.find((i) => i.id === id);
  if (!item) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json(item);
}