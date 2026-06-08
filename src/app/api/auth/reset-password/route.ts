import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes, scrypt } from "crypto";

// Reproduit l'algo de hachage de Better Auth (scrypt, N=16384, r=16, p=1, dkLen=64)
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await new Promise<Buffer>((resolve, reject) => {
    scrypt(
      Buffer.from(password.normalize("NFKC")),
      salt,
      64,
      { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
      (err, derivedKey) => (err ? reject(err) : resolve(derivedKey as Buffer)),
    );
  });
  return `${salt}:${key.toString("hex")}`;
}

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { email, otp, newPassword } = parsed.data;

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

  // Consommer l'OTP (usage unique)
  await db.verification.delete({ where: { id: verification.id } });

  const account = await db.account.findFirst({
    where: { user: { email }, providerId: "credential" },
  });

  if (!account) {
    return NextResponse.json({ error: "Aucun compte avec mot de passe associé à cet email" }, { status: 404 });
  }

  const hashed = await hashPassword(newPassword);
  await db.account.update({ where: { id: account.id }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}
