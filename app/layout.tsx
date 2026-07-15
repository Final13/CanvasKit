import type { Metadata } from "next";
import { Montserrat, Marck_Script } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

const marckScript = Marck_Script({
  variable: "--font-marck",
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Конструктор приглашений",
  description: "Редактор приглашений на праздники, мероприятия и торжества",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
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
      <body className="min-h-full flex flex-col bg-zinc-100 font-sans">
        {children}
      </body>
    </html>
  );
}
