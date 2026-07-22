import Link from "next/link";
import Script from "next/script";
import { PaymentMethodBadges } from "./PaymentMethods";

const links = [
  { label: "Условия использования", href: "/terms" },
  { label: "Политика конфиденциальности", href: "/privacy" },
  { label: "Согласие на обработку данных", href: "/data-consent" },
  { label: "Cookies", href: "/cookies" },
  { label: "Политика обработки персональных данных", href: "/privacy" },
  { label: "Контакты", href: "/contacts" },
];

const categoryLinks = [
  { label: "Приглашения детям", href: "/category/kids" },
  { label: "День рождения женщины", href: "/category/woman" },
  { label: "День рождения мужчины", href: "/category/man" },
  { label: "Юбилей", href: "/category/anniversary" },
  { label: "Приглашения по возрасту", href: "/category/anniversary" },
];

export function Footer() {
  return (
    <footer className="bg-violet-400 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center justify-between gap-6 rounded-2xl bg-white/10 p-6 sm:flex-row">
          <div>
            <h3 className="text-lg font-semibold">У вас есть вопрос?</h3>
            <p className="mt-1 text-sm text-white/80">
              Мы собрали ответы на популярные вопросы и всегда рады помочь.
            </p>
          </div>
          <Link
            href="/contacts"
            className="rounded-full bg-lime-200 px-6 py-2.5 text-sm font-semibold text-lime-900 transition hover:bg-lime-300"
          >
            Написать нам
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium uppercase tracking-wide">
          {categoryLinks.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="text-white/90 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 border-t border-white/20 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white/80">
              {links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="rounded bg-white/10 px-2 py-1 text-xs font-bold">
                ЮКАССА
              </span>
              <PaymentMethodBadges dark />
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-white/70">
            Все права защищены {new Date().getFullYear()} © Event Space (Evspc.com)
          </p>
        </div>
      </div>

      {/* Yandex.Metrika counter */}
      <Script
        id="yandex-metrika"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=110908888', 'ym');

            ym(110908888, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
          `,
        }}
      />
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://mc.yandex.ru/watch/110908888"
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
      {/* /Yandex.Metrika counter */}
    </footer>
  );
}
