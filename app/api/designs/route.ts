import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession, setSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { createUser, findUserByEmail } from "@/lib/auth/user.db";
import { createSavedDesign } from "@/lib/designs/design.db";
import { sendWelcomeEmail } from "@/lib/email";

interface SaveDesignDto {
  templateSlug?: string;
  name?: string;
  preview?: string;
  configJson?: string;
  email?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SaveDesignDto = await req.json();
    const { templateSlug, name, preview, configJson, email } = body;

    if (!templateSlug || !configJson) {
      return NextResponse.json(
        { error: "templateSlug and configJson are required" },
        { status: 400 }
      );
    }

    const session = await getSession();
    let userId = session.userId;
    let isNewUser = false;
    let generatedPassword: string | undefined;

    if (!userId) {
      if (!email) {
        return NextResponse.json(
          { error: "Email is required", code: "EMAIL_REQUIRED" },
          { status: 400 }
        );
      }

      const existing = await findUserByEmail(email);
      if (existing) {
        return NextResponse.json(
          {
            error: "Email already registered",
            code: "EMAIL_REGISTERED",
            message:
              "Этот email уже зарегистрирован. Войдите в аккаунт, чтобы сохранить дизайн.",
          },
          { status: 409 }
        );
      }

      generatedPassword = crypto.randomBytes(12).toString("hex");
      const hashed = await hashPassword(generatedPassword);
      userId = await createUser({ email, password: hashed });
      isNewUser = true;
      await setSession({ id: userId, email });
    }

    const designId = await createSavedDesign({
      userId,
      templateSlug,
      name: name?.trim() || templateSlug,
      preview: preview ?? null,
      configJson,
    });

    if (isNewUser && email && generatedPassword) {
      try {
        const origin =
          process.env.NEXT_PUBLIC_APP_URL ||
          req.headers.get("origin") ||
          req.nextUrl.origin;
        await sendWelcomeEmail({
          to: email,
          login: email,
          password: generatedPassword,
          siteUrl: origin,
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
    }

    return NextResponse.json({ success: true, designId, isNewUser });
  } catch (error) {
    console.error("Save design error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
