import { NextRequest, NextResponse } from "next/server";
import { loadCatalog } from "@/lib/templates";
import { incrementTemplateView } from "@/lib/popularity/popularity.db";

export async function POST(req: NextRequest) {
  let slug: unknown;
  try {
    const body = await req.json();
    slug = body?.slug;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (typeof slug !== "string" || slug.length === 0 || slug.length > 255) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const catalog = await loadCatalog();
  if (!catalog.templates.some((t) => t.slug === slug)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  await incrementTemplateView(slug);
  return NextResponse.json({ ok: true });
}
