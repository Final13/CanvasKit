import { loadCatalog } from "@/lib/templates";
import { HeroSection } from "@/components/HeroSection";
import { StepsSection } from "@/components/StepsSection";
import { CategorySection } from "@/components/CategorySection";
import { AgeSection } from "@/components/AgeSection";
import { SeoTextSection } from "@/components/SeoTextSection";
import { SupportCtaSection } from "@/components/SupportCtaSection";

export default async function Home() {
  const catalog = await loadCatalog();

  const heroPreviews = catalog.templates
    .filter((t) => t.preview)
    .slice(0, 3)
    .map((t) => t.preview!);

  return (
    <>
      <HeroSection previews={heroPreviews} />
      <StepsSection />
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
