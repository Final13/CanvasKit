import fs from "fs/promises";
import path from "path";
import mysql from "mysql2/promise";

async function main() {
  const host = process.env.MYSQL_HOST;
  const database = process.env.MYSQL_DATABASE;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const port = Number(process.env.MYSQL_PORT || "3306");

  if (!host || !database || !user || !password) {
    console.error("Missing MySQL env variables");
    process.exit(1);
  }

  const schemaPath = path.join(process.cwd(), "sql", "schema.sql");
  const sql = await fs.readFile(schemaPath, "utf-8");

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
  });

  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 0 &&
        !s.toLowerCase().startsWith("create database") &&
        !s.toLowerCase().startsWith("use ")
    );

  for (const statement of statements) {
    await connection.execute(statement);
  }

  await connection.end();
  console.log("Schema applied successfully");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
