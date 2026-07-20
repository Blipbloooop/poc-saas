"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { InterventionStatus } from "@prisma/client";
import { resolveActiveOrganizationId } from "@/lib/organization";

async function requireOrganizationId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");
  const organizationId = await resolveActiveOrganizationId(session);
  if (!organizationId) throw new Error("Aucune organisation active");
  return organizationId;
}

export type InterventionFull = Awaited<ReturnType<typeof getInterventionsByChantierId>>[number];

export async function getInterventionsByChantierId(chantierId: string) {
  const organizationId = await requireOrganizationId();
  return db.intervention.findMany({
    where: { chantierId, chantier: { organizationId } },
    include: {
      user: { select: { id: true, name: true } },
      documents: { include: { uploadedBy: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

const schema = z.object({
  titre: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(InterventionStatus).default(InterventionStatus.PLANIFIEE),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  memo: z.string().optional(),
  userId: z.string().optional(),
});

export type CreateInterventionInput = z.infer<typeof schema>;

export async function createIntervention(chantierId: string, input: CreateInterventionInput) {
  const organizationId = await requireOrganizationId();

  const chantier = await db.chantier.findFirst({ where: { id: chantierId, organizationId } });
  if (!chantier) throw new Error("Chantier introuvable");

  const data = schema.parse(input);

  const intervention = await db.intervention.create({
    data: {
      chantierId,
      titre: data.titre,
      description: data.description,
      status: data.status,
      memo: data.memo,
      userId: data.userId || null,
      dateDebut: data.dateDebut ? new Date(data.dateDebut) : null,
      dateFin: data.dateFin ? new Date(data.dateFin) : null,
    },
    include: {
      user: { select: { id: true, name: true } },
      documents: { include: { uploadedBy: { select: { id: true, name: true } } } },
    },
  });

  revalidatePath(`/chantiers/${chantierId}`);
  return { success: true as const, data: intervention };
}

export async function updateInterventionStatus(id: string, status: InterventionStatus) {
  const organizationId = await requireOrganizationId();
  const existing = await db.intervention.findFirst({ where: { id, chantier: { organizationId } } });
  if (!existing) throw new Error("Intervention introuvable");

  const i = await db.intervention.update({ where: { id }, data: { status } });
  revalidatePath(`/chantiers/${i.chantierId}`);
  return { success: true as const };
}

export async function deleteIntervention(id: string) {
  const organizationId = await requireOrganizationId();
  const i = await db.intervention.findFirst({ where: { id, chantier: { organizationId } } });
  if (!i) throw new Error("Intervention introuvable");

  await db.intervention.delete({ where: { id } });
  revalidatePath(`/chantiers/${i.chantierId}`);
  return { success: true as const };
}
