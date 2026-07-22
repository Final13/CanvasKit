import type { Metadata } from "next";
import { loadCatalog, getTemplatesByCategory } from "@/lib/templates";
import { HeroSection } from "@/components/HeroSection";
import { CategorySection } from "@/components/CategorySection";
import { AgeSection } from "@/components/AgeSection";
import { SeoTextSection } from "@/components/SeoTextSection";
import { SupportCtaSection } from "@/components/SupportCtaSection";

export const metadata: Metadata = {
  title: "Event Space — конструктор приглашений",
  description:
    "Создавайте персонализированные приглашения на день рождения, юбилей и другие праздники онлайн. Быстро, просто, с мгновенным скачиванием.",
};

export default async function Home() {
  const catalog = await loadCatalog();

  // Разнообразная выборка для карусели: по 4 самых популярных шаблона
  // из каждой аудитории, без дублей (один шаблон может входить в несколько
  // категорий); вся выдача — по убыванию популярности (seedViews с evyt)
  const seen = new Set<string>();
  const carouselItems = ["girl", "boy", "woman", "man", "womans", "mans"]
    .flatMap((slug) =>
      getTemplatesByCategory(catalog, slug)
        .filter((t) => t.preview)
        .sort((a, b) => (b.seedViews ?? 0) - (a.seedViews ?? 0))
        .slice(0, 4)
    )
    .filter((t) => {
      if (seen.has(t.slug)) return false;
      seen.add(t.slug);
      return true;
    })
    .sort((a, b) => (b.seedViews ?? 0) - (a.seedViews ?? 0))
    .map((t) => ({ slug: t.slug, title: t.title, preview: t.preview! }));

  return (
    <>
      <HeroSection items={carouselItems} />
      <CategorySection
        title="Приглашения детям"
        tabs={[
          { label: "Девочке", slug: "girl" },
          { label: "Мальчику", slug: "boy" },
        ]}
        catalog={catalog}
        seeAllHref="/category/kids"
      />
      <CategorySection
        title="Приглашения взрослым"
        tabs={[
          { label: "Женщине", slug: "woman" },
          { label: "Мужчине", slug: "man" },
        ]}
        catalog={catalog}
        seeAllHref="/category/birthday"
      />
      <AgeSection />
      <CategorySection
        title="Популярные темы"
        tabs={[
          { label: "Гендер-пати", slug: "gender-party" },
          { label: "Концерт", slug: "concert" },
          { label: "В стиле 90-х", slug: "90s-style" },
          { label: "Девичник", slug: "bachelorette" },
        ]}
        catalog={catalog}
        seeAllHref="/category/invitations"
      />
      <SeoTextSection />
      <SupportCtaSection />
    </>
  );
}
