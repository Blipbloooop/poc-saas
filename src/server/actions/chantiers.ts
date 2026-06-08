"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ChantierStatus } from "@prisma/client";

export type ChantierWithResponsable = Awaited<ReturnType<typeof getChantiers>>[number];

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");
  return session;
}

export async function getChantierById(id: string) {
  await requireSession();
  return db.chantier.findFirst({
    where: { id, deletedAt: null },
    include: { responsable: { select: { id: true, name: true } } },
  });
}

export async function getChantiers() {
  await requireSession();

  return db.chantier.findMany({
    where: { deletedAt: null },
    include: { responsable: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

const createChantierSchema = z.object({
  nom: z.string().min(2, "Minimum 2 caractères"),
  description: z.string().optional(),
  status: z.nativeEnum(ChantierStatus).default(ChantierStatus.PROSPECT),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  codePostal: z.string().optional(),
  budget: z.number().positive().optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  responsableId: z.string().optional(),
});

export type CreateChantierInput = z.infer<typeof createChantierSchema>;

export async function createChantier(input: CreateChantierInput) {
  await requireSession();

  const parsed = createChantierSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const { dateDebut, dateFin, ...rest } = parsed.data;

  // Génère une référence unique : CH-YYYY-NNN
  const year = new Date().getFullYear();
  const count = await db.chantier.count({ where: { reference: { startsWith: `CH-${year}-` } } });
  const reference = `CH-${year}-${String(count + 1).padStart(3, "0")}`;

  const chantier = await db.chantier.create({
    data: {
      ...rest,
      reference,
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
    },
    include: { responsable: { select: { id: true, name: true } } },
  });

  revalidatePath("/chantiers");
  revalidatePath("/dashboard");

  return { success: true as const, data: chantier };
}

export async function deleteChantier(id: string) {
  await requireSession();

  await db.chantier.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/chantiers");
  revalidatePath("/dashboard");

  return { success: true as const };
}
