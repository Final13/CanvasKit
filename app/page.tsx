import { loadCatalog } from "@/lib/templates";
import { TemplateEditorPage } from "@/components/TemplateEditorPage";

export default async function Home() {
  const catalog = await loadCatalog();

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="text-xl font-normal text-zinc-900 sm:text-2xl md:text-3xl">
          Конструктор приглашений
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Выберите шаблон, отредактируйте текст и фото, скачайте PNG
        </p>
      </div>
      <TemplateEditorPage catalog={catalog} />
    </main>
  );
}
