import type { Metadata } from "next";
import { Montserrat, Marck_Script } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { CartProvider } from "@/components/CartProvider";
import { FavoritesProvider } from "@/components/FavoritesProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const marckScript = Marck_Script({
  variable: "--font-marck",
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  // Используется только в редакторе (канва), на первом экране не нужен —
  // иначе браузер ругается на preload без использования.
  preload: false,
});

export const metadata: Metadata = {
  title: "Event Space — конструктор приглашений",
  description:
    "Создавайте и скачивайте персонализированные приглашения на праздники, дни рождения и юбилеи за пару минут",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  // Фавикон лежит в public/ как физический файл: на проде nginx отдаёт
  // статику напрямую с диска и не проксирует .svg в Next, поэтому
  // app/icon.svg (виртуальный роут) на проде отдавал 404.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  verification: {
    google: "K9V4vijcNbhSHK8ummHa1QBm2WsT3_JKcGzh46yIu-8",
    yandex: "376d5c9b14aa9951",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${montserrat.variable} ${marckScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 font-sans">
        <CartProvider>
          <FavoritesProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieBanner />
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
