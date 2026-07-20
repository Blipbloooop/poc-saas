import { randomBytes, scrypt } from "crypto";

// Reproduit l'algo de hachage de Better Auth (scrypt, N=16384, r=16, p=1, dkLen=64)
// pour permettre de créer/mettre à jour un mot de passe en dehors du flow
// authClient (reset password par OTP, création de compte collaborateur).
export async function hashPassword(password: string): Promise<string> {
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
