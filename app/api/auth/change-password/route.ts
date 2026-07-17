import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { findUserById, updateUserPassword } from "@/lib/auth/user.db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Заполните все поля" },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { error: "Новый пароль должен быть не короче 6 символов" },
        { status: 400 }
      );
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    const isValid = await verifyPassword(oldPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Текущий пароль указан неверно" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(newPassword);
    await updateUserPassword(user.id, hashed);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
