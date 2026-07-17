import { getMysqlClient } from "@/lib/mysql";

export interface SavedDesign {
  id: string;
  user_id: string;
  template_slug: string;
  name: string;
  preview: string | null;
  config_json: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function createSavedDesign(data: {
  userId: string;
  templateSlug: string;
  name: string;
  preview?: string | null;
  configJson: string;
}): Promise<string> {
  const db = getMysqlClient();
  if (!db) throw new Error("Database not available");

  await db.query(
    `INSERT INTO saved_designs (user_id, template_slug, name, preview, config_json)
     VALUES (?, ?, ?, ?, ?)`,
    [data.userId, data.templateSlug, data.name, data.preview ?? null, data.configJson]
  );

  const rows = await db.query<{ id: string }[]>(
    "SELECT id FROM saved_designs WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
    [data.userId]
  );
  const design = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  if (!design) throw new Error("Failed to create saved design");
  return design.id;
}

export async function getSavedDesignsByUserId(
  userId: string
): Promise<SavedDesign[]> {
  const db = getMysqlClient();
  if (!db) return [];

  const rows = await db.query<SavedDesign[]>(
    "SELECT * FROM saved_designs WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return Array.isArray(rows) ? rows : [];
}
