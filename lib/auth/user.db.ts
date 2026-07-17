import { getMysqlClient } from "@/lib/mysql";

export type User = {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<string> {
  const db = getMysqlClient();
  if (!db) throw new Error("Database not available");

  await db.query(
    "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
    [data.email.toLowerCase(), data.password, data.name || null]
  );

  const rows = await db.query<User[]>(
    "SELECT id FROM users WHERE email = ?",
    [data.email.toLowerCase()]
  );
  const user = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  if (!user) throw new Error("Failed to create user");
  return user.id;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = getMysqlClient();
  if (!db) return null;

  const rows = await db.query<User[]>("SELECT * FROM users WHERE email = ?", [
    email.toLowerCase(),
  ]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const db = getMysqlClient();
  if (!db) return null;

  const rows = await db.query<User[]>("SELECT * FROM users WHERE id = ?", [
    id,
  ]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function updateUserPassword(
  id: string,
  passwordHash: string
): Promise<void> {
  const db = getMysqlClient();
  if (!db) throw new Error("Database not available");

  await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
    passwordHash,
    id,
  ]);
}
