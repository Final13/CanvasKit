"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Smile } from "lucide-react";

type InfoTab = "get" | "tips";

interface FaqLink {
  href: string;
  label: string;
  emoji?: string;
}

interface FaqItem {
  q: string;
  a: string;
  link?: FaqLink;
}

// FAQ на вкладке «Советы» — как на evyt, но формулировки под наш редактор
// (без автоудаления сохранок и без выбора цвета QR — такого функционала нет)
const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Как сохранить дизайн?",
    a: "Вы всегда можете сохранить дизайн и продолжить его редактирование в любое время. В верхней панели конструктора вам достаточно нажать на иконку сохранения и задать имя файлу.",
    link: { href: "/my-account/saved", label: "Смотреть сохранки", emoji: "💾" },
  },
  {
    q: "Как добавить QR-код?",
    a: "В верхней панели конструктора вам достаточно нажать на иконку QR-кода, после добавить ссылку или текст. Созданный QR-код можно легко перемещать по шаблону, изменить его положение и размер.",
  },
  {
    q: "Как конвертировать приглашение?",
    a: "Если вам нужен формат PDF вместо PNG, то вы можете конвертировать купленное приглашение на нашем сайте через специальный конвертер после оформления заказа. Воспользуйтесь ссылкой ниже:",
    link: { href: "/my-account/convert", label: "PNG в PDF" },
  },
];

function TabButton({
  active,
  onClick,
  emoji,
  label,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2 text-[13px] font-bold uppercase tracking-wider transition ${
        active
          ? "border-zinc-900 text-zinc-900"
          : "border-transparent text-zinc-500 hover:text-zinc-800"
      }`}
    >
      <span className={active ? undefined : "opacity-40"}>{emoji}</span>
      {label}
    </button>
  );
}

export function TemplateInfoTabs({ title }: { title: string }) {
  const [tab, setTab] = useState<InfoTab>("get");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <TabButton
          active={tab === "get"}
          onClick={() => setTab("get")}
          emoji="📝"
          label="Что вы получите"
        />
        <TabButton
          active={tab === "tips"}
          onClick={() => setTab("tips")}
          emoji="🔥"
          label="Советы"
        />
      </div>

      {tab === "get" ? (
        <div className="mt-7">
          <ul className="space-y-1.5 text-[15px] text-zinc-800">
            <li>
              <span className="font-semibold">Приглашение:</span> А5 (14,8 х 21
              см)
            </li>
            <li>
              <span className="font-semibold">Формат:</span> электронный (PNG)
            </li>
          </ul>
          <p className="mt-5 text-[15px] text-zinc-800">
            Конвертация в PDF доступна в личном кабинете после оформления
            заказа.
          </p>
          <div className="mt-6 h-1 w-16 rounded-full bg-lime-300" />
          <h2 className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900">
            Описание
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-zinc-600">
            «{title}» — готовый шаблон приглашения, который можно
            персонализировать онлайн за пару минут. Укажите детали
            мероприятия, настройте текст и фото в редакторе — готовый файл
            будет доступен для скачивания сразу после оплаты. Созданное
            приглашение можно сразу отправить гостям.
          </p>
        </div>
      ) : (
        <div className="mt-7">
          <h2 className="flex items-center gap-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-900">
            <Smile size={34} strokeWidth={1.4} className="shrink-0" />
            Вопросы и ответы
          </h2>
          <p className="mt-3.5 text-[15px] leading-relaxed text-zinc-700">
            Мы собрали наиболее популярные вопросы наших пользователей, чтобы
            вы могли быстрее разобраться во всех тонкостях создания
            приглашения.
          </p>

          <div className="mt-7 border-t border-zinc-300">
            {FAQ_ITEMS.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={item.q} className="border-b border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className={`flex w-full items-center gap-3 px-4 py-4 text-left text-[15px] transition ${
                      open
                        ? "bg-zinc-100 font-semibold text-zinc-900"
                        : "text-zinc-800 hover:bg-zinc-50"
                    }`}
                  >
                    <ChevronDown
                      size={20}
                      strokeWidth={open ? 2.5 : 2}
                      className={`shrink-0 transition-transform ${
                        open ? "rotate-180 text-zinc-900" : "text-zinc-400"
                      }`}
                    />
                    {item.q}
                  </button>
                  {open && (
                    <div className="pt-10 pr-4 pb-9 pl-12">
                      <p className="text-[15px] leading-relaxed text-zinc-700">
                        {item.a}
                      </p>
                      {item.link && (
                        <Link
                          href={item.link.href}
                          className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime-200 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-lime-900 transition hover:bg-lime-300"
                        >
                          {item.link.emoji && <span>{item.link.emoji}</span>}
                          {item.link.label}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
