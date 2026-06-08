import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

// Vérifie l'OTP sans le consommer — la consommation se fait lors du reset final
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { email, otp } = parsed.data;

  const verification = await db.verification.findFirst({
    where: {
      identifier: `forget-password-otp-${email}`,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  const storedOtp = verification?.value.split(":")[0];
  if (!verification || storedOtp !== otp) {
    return NextResponse.json({ error: "Code invalide ou expiré" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
