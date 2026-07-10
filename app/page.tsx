import { Editor } from "@/components/Editor";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          Конструктор приглашений
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          А5 (14,8 × 21 см) · редактируйте текст и фото · скачайте PNG
        </p>
      </div>
      <Editor />
    </main>
  );
}
