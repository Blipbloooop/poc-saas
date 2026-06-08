"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");
  return session;
}

export async function getPrestations() {
  await requireSession();
  return db.prestation.findMany({ orderBy: { label: "asc" } });
}

export type PrestationRow = Awaited<ReturnType<typeof getPrestations>>[number];

const schema = z.object({
  label: z.string().min(1),
  description: z.string().optional(),
  prix: z.number().min(0),
  unite: z.string().default("forfait"),
  tva: z.number().min(0).max(100).default(20),
});

export async function createPrestation(input: z.infer<typeof schema>) {
  await requireSession();
  const data = schema.parse(input);
  const p = await db.prestation.create({ data });
  revalidatePath("/parametres");
  return { success: true as const, data: p };
}

export async function updatePrestation(id: string, input: z.infer<typeof schema>) {
  await requireSession();
  const data = schema.parse(input);
  const p = await db.prestation.update({ where: { id }, data });
  revalidatePath("/parametres");
  return { success: true as const, data: p };
}

export async function deletePrestation(id: string) {
  await requireSession();
  await db.prestation.delete({ where: { id } });
  revalidatePath("/parametres");
  return { success: true as const };
}
