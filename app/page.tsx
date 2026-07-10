import { Editor } from "@/components/Editor";
import { Features } from "@/components/Features";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="text-xl font-normal text-zinc-900 sm:text-2xl md:text-3xl">
          Приглашение на юбилей с золотыми воздушными шарами и цифрами
        </h1>
        <nav className="mt-2 text-sm text-zinc-500">
          <span className="cursor-pointer hover:text-zinc-700">Приглашения</span>
          <span className="mx-2 text-zinc-300">/</span>
          <span className="cursor-pointer hover:text-zinc-700">Юбилей</span>
          <span className="mx-2 text-zinc-300">/</span>
          <span className="text-zinc-700">Юбилей женщины</span>
        </nav>
      </div>
      <Editor />
      <Features />
    </main>
  );
}
