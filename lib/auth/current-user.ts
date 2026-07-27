import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/user.db";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
}

// Для серверных компонентов (RSC): только чтение. session.destroy() здесь
// нельзя вызывать — в RSC cookie нельзя модифицировать (только в Server
// Actions и Route Handlers); протухшую сессию чистит /api/auth/me.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session = await getSession();
    if (!session.userId) return null;

    const user = await findUserById(session.userId);
    if (!user) return null;

    return { id: user.id, email: user.email, name: user.name };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
