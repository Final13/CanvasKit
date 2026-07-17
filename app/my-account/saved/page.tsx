import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/user.db";
import { getSavedDesignsByUserId } from "@/lib/designs/design.db";
import { getPurchasedTemplateSlugs } from "@/lib/orders/order.db";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { SavedDesigns } from "@/components/account/SavedDesigns";

export const metadata: Metadata = {
  title: "Сохранённые дизайны — Event Space",
  description: "Ваши сохранённые шаблоны приглашений.",
};

export default async function SavedDesignsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/my-account?redirect=/my-account/saved");

  const [user, designs, purchasedSlugs] = await Promise.all([
    findUserById(session.userId),
    getSavedDesignsByUserId(session.userId),
    getPurchasedTemplateSlugs(session.userId),
  ]);

  if (!user) {
    await session.destroy();
    redirect("/my-account");
  }

  const serializedDesigns = designs.map((design) => ({
    id: design.id,
    templateSlug: design.template_slug,
    name: design.name,
    preview: design.preview,
    configJson: design.config_json,
    createdAt: design.created_at
      ? new Date(design.created_at).toISOString()
      : null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-center text-2xl font-semibold text-zinc-900">
        Сохранённые дизайны
      </h1>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <AccountSidebar name={user.name} email={user.email} />
        </div>
        <div className="lg:col-span-8">
          <SavedDesigns
            designs={serializedDesigns}
            purchasedSlugs={purchasedSlugs}
          />
        </div>
      </div>
    </div>
  );
}
