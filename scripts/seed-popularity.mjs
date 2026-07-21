/**
 * Заливает стартовые значения популярности (seedViews из index.json,
 * восстановленные из порядка «По популярности» на evyt) в таблицу
 * template_popularity. Повторный запуск не затирает накопленные
 * реальные просмотры (GREATEST).
 *
 * Запуск: node --env-file=.env scripts/seed-popularity.mjs
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CHUNK = 200;

async function main() {
  const { MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;
  const port = Number(process.env.MYSQL_PORT || "3306");
  if (!MYSQL_HOST || !MYSQL_DATABASE || !MYSQL_USER || !MYSQL_PASSWORD) {
    console.error("Missing MySQL env variables");
    process.exit(1);
  }

  const index = JSON.parse(
    await fs.readFile(path.join(ROOT, "public/templates/index.json"), "utf-8")
  );
  const rows = index.templates
    .filter((t) => typeof t.seedViews === "number")
    .map((t) => [t.slug, t.seedViews]);
  if (rows.length === 0) {
    console.error("No seedViews in index.json — run scripts/sync-evyt-meta.mjs first");
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: MYSQL_HOST,
    port,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  });

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS template_popularity (
      template_slug VARCHAR(255) PRIMARY KEY,
      views INT UNSIGNED NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const placeholders = chunk.map(() => "(?, ?)").join(", ");
    await connection.query(
      `INSERT INTO template_popularity (template_slug, views) VALUES ${placeholders}
       ON DUPLICATE KEY UPDATE views = GREATEST(views, VALUES(views))`,
      chunk.flat()
    );
  }

  await connection.end();
  console.log(`Seeded popularity for ${rows.length} templates`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
