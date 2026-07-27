import { Loader2 } from "lucide-react";

/**
 * Прелоадер под next/image: кладётся слоем под картинку в блоке превью,
 * чтобы область загрузки не выглядела пустым/битым блоком. Загрузившееся
 * непрозрачное изображение перекрывает спиннер, JS не нужен.
 */
export function PreviewSpinner() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <Loader2 size={100} className="animate-spin text-zinc-300" />
    </div>
  );
}
