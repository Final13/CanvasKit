import { getMysqlClient } from "@/lib/mysql";

/**
 * Счётчик популярности шаблона: +1 просмотр.
 * Без настроенной БД (MYSQL_*) — тихий no-op.
 */
export async function incrementTemplateView(slug: string): Promise<boolean> {
  const db = getMysqlClient();
  if (!db) return false;

  await db.query(
    `INSERT INTO template_popularity (template_slug, views) VALUES (?, 1)
     ON DUPLICATE KEY UPDATE views = views + 1`,
    [slug]
  );
  return true;
}

/**
 * Просмотры для набора шаблонов (для сортировки «По популярности»).
 * Без БД возвращает пустую Map — вызывающий код использует фолбэк.
 */
export async function getTemplateViews(
  slugs: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (slugs.length === 0) return map;

  const db = getMysqlClient();
  if (!db) return map;

  const placeholders = slugs.map(() => "?").join(", ");
  const rows = await db.query<{ template_slug: string; views: number }[]>(
    `SELECT template_slug, views FROM template_popularity
     WHERE template_slug IN (${placeholders})`,
    slugs
  );

  if (Array.isArray(rows)) {
    for (const row of rows) {
      map.set(row.template_slug, Number(row.views));
    }
  }
  return map;
}
