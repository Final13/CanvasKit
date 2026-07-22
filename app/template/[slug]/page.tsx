import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import type { TemplateData } from "@/lib/templates";
import { loadCatalog } from "@/lib/templates";
import { getSession } from "@/lib/auth/session";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Editor } from "@/components/Editor";
import { TemplateViewTracker } from "@/components/TemplateViewTracker";

interface TemplatePageProps {
  params: Promise<{ slug: string }>;
}

async function loadTemplate(slug: string): Promise<TemplateData | null> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "templates",
      slug,
      "template.json"
    );
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: TemplatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = await loadTemplate(slug);

  if (!template) {
    return {
      title: "Шаблон не найден — Event Space",
    };
  }

  return {
    title: `${template.metadata.title} — Event Space`,
    description: `Редактор приглашения «${template.metadata.title}». Настройте текст, фото и QR-код, скачайте готовый файл после оплаты.`,
  };
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { slug } = await params;
  const [catalog, template] = await Promise.all([
    loadCatalog(),
    loadTemplate(slug),
  ]);

  if (!template) {
    notFound();
  }

  const activeCategorySlug = template.metadata.categorySlugs.find(
    (s) => s !== "invitations"
  ) ?? "invitations";

  const session = await getSession();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <TemplateViewTracker slug={slug} />
      <Breadcrumbs
        catalog={catalog}
        activeCategorySlug={activeCategorySlug}
        variant="compact"
        linkLast
      />
      <h1 className="mt-4 text-center text-xl font-semibold text-zinc-900 sm:text-2xl">
        {template.metadata.title}
      </h1>
      <div className="mt-6 flex justify-center">
        <Editor template={template} isAuthenticated={Boolean(session.userId)} />
      </div>
    </div>
  );
}
