import { db } from "@/lib/db";
import { sendVerificationLinkEmail } from "@/lib/email-service";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SignJWT } from "jose";

const schema = z.object({ email: z.string().email() });

const RESEND_COOLDOWN_SECONDS = 60;
const TOKEN_EXPIRY = "24h";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Email invalide" }, { status: 400 });

  const { email } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  // Réponse générique pour éviter l'énumération d'emails
  if (!user) return NextResponse.json({ success: true });

  if (user.emailVerified) {
    return NextResponse.json({ error: "Cet email est déjà vérifié" }, { status: 400 });
  }

  const recentToken = await db.verification.findFirst({
    where: {
      identifier: email,
      createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000) },
    },
  });

  if (recentToken) {
    return NextResponse.json({ error: "Veuillez attendre avant de renvoyer un email" }, { status: 429 });
  }

  if (!process.env.BETTER_AUTH_SECRET) throw new Error("BETTER_AUTH_SECRET manquant");

  const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET);
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret);

  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseURL}/api/auth/verify-email?token=${token}&callbackURL=/email-verified`;

  await sendVerificationLinkEmail({ email, url: verificationUrl, userName: user.name ?? undefined });

  return NextResponse.json({ success: true });
}
