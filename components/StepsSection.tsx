import { Images, Pencil, FileDown } from "lucide-react";

const steps = [
  {
    icon: Images,
    title: "Выберите шаблон",
    description:
      "Большая коллекция красивых дизайнов. Наши приглашения понравятся вашим гостям!",
  },
  {
    icon: Pencil,
    title: "Персонализируйте",
    description:
      "Добавьте текст, фото, QR-код и многое другое. Создать приглашение может каждый!",
  },
  {
    icon: FileDown,
    title: "Скачайте",
    description:
      "Получите готовое к печати приглашение моментально после оформления заказа!",
  },
];

export function StepsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 text-zinc-800">
              <Icon size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
