import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { hashPassword } from "@/lib/auth/password";
import { findUserByEmail, updateUserPassword } from "@/lib/auth/user.db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Укажите email" }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (user) {
      const newPassword = crypto.randomBytes(12).toString("hex");
      const hashed = await hashPassword(newPassword);
      await updateUserPassword(user.id, hashed);

      try {
        const origin =
          process.env.NEXT_PUBLIC_APP_URL ||
          req.headers.get("origin") ||
          req.nextUrl.origin;
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          login: user.email,
          password: newPassword,
          siteUrl: origin,
        });
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
      }
    }

    // Отвечаем одинаково независимо от наличия аккаунта,
    // чтобы по ответу нельзя было перебрать зарегистрированные email.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
