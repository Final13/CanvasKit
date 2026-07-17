import { NextRequest, NextResponse } from "next/server";
import { loadCatalog } from "@/lib/templates";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) {
    return NextResponse.json({ total: 0, results: [] });
  }

  const catalog = await loadCatalog();
  const matches = catalog.templates.filter((t) =>
    t.title.toLowerCase().includes(q)
  );

  return NextResponse.json({
    total: matches.length,
    results: matches.slice(0, 8).map((t) => ({
      slug: t.slug,
      title: t.title,
      preview: t.preview,
    })),
  });
}
