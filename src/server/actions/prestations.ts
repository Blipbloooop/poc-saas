"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { resolveActiveOrganizationId } from "@/lib/organization";

async function requireOrganizationId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");
  const organizationId = await resolveActiveOrganizationId(session);
  if (!organizationId) throw new Error("Aucune organisation active");
  return organizationId;
}

export async function getPrestations() {
  const organizationId = await requireOrganizationId();
  return db.prestation.findMany({ where: { organizationId }, orderBy: { label: "asc" } });
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
  const organizationId = await requireOrganizationId();
  const data = schema.parse(input);
  const p = await db.prestation.create({ data: { ...data, organizationId } });
  revalidatePath("/parametres");
  return { success: true as const, data: p };
}

export async function updatePrestation(id: string, input: z.infer<typeof schema>) {
  const organizationId = await requireOrganizationId();
  const existing = await db.prestation.findFirst({ where: { id, organizationId } });
  if (!existing) throw new Error("Prestation introuvable");

  const data = schema.parse(input);
  const p = await db.prestation.update({ where: { id }, data });
  revalidatePath("/parametres");
  return { success: true as const, data: p };
}

export async function deletePrestation(id: string) {
  const organizationId = await requireOrganizationId();
  const existing = await db.prestation.findFirst({ where: { id, organizationId } });
  if (!existing) throw new Error("Prestation introuvable");

  await db.prestation.delete({ where: { id } });
  revalidatePath("/parametres");
  return { success: true as const };
}
