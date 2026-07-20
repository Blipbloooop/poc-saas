"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { DocumentCategorie } from "@prisma/client";
import { z } from "zod";
import { resolveActiveOrganizationId } from "@/lib/organization";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");
  return session;
}

async function requireOrganizationId() {
  const session = await requireSession();
  const organizationId = await resolveActiveOrganizationId(session);
  if (!organizationId) throw new Error("Aucune organisation active");
  return organizationId;
}

export async function getDocumentsByChantierId(chantierId: string) {
  const organizationId = await requireOrganizationId();
  return db.document.findMany({
    where: { chantierId, chantier: { organizationId } },
    include: { uploadedBy: { select: { id: true, name: true } }, intervention: { select: { id: true, titre: true } } },
    orderBy: { createdAt: "desc" },
  });
}

const schema = z.object({
  nom: z.string().min(1),
  categorie: z.nativeEnum(DocumentCategorie).default(DocumentCategorie.AUTRE),
  url: z.string(),
  taille: z.number().optional(),
  mimeType: z.string().optional(),
  memo: z.string().optional(),
  chantierId: z.string().optional(),
  interventionId: z.string().optional(),
});

export async function createDocument(input: z.infer<typeof schema>) {
  const session = await requireSession();

  // Un document peut être rattaché à un chantier, à une intervention (donc
  // indirectement à un chantier), ou à aucun des deux (GED libre — pas encore
  // scopée par organisation, cf. limitation connue sur le modèle Document).
  if (input.chantierId) {
    const organizationId = await resolveActiveOrganizationId(session);
    if (!organizationId) throw new Error("Aucune organisation active");
    const chantier = await db.chantier.findFirst({ where: { id: input.chantierId, organizationId } });
    if (!chantier) throw new Error("Chantier introuvable");
  } else if (input.interventionId) {
    const organizationId = await resolveActiveOrganizationId(session);
    if (!organizationId) throw new Error("Aucune organisation active");
    const intervention = await db.intervention.findFirst({
      where: { id: input.interventionId, chantier: { organizationId } },
    });
    if (!intervention) throw new Error("Intervention introuvable");
  }

  const doc = await db.document.create({
    data: { ...input, uploadedById: session.user.id },
    include: { uploadedBy: { select: { id: true, name: true } } },
  });

  if (input.chantierId) revalidatePath(`/chantiers/${input.chantierId}`);
  return { success: true as const, data: doc };
}

export async function deleteDocument(id: string, chantierId?: string) {
  const organizationId = await requireOrganizationId();

  const doc = await db.document.findUnique({
    where: { id },
    include: {
      chantier: { select: { organizationId: true } },
      intervention: { include: { chantier: { select: { organizationId: true } } } },
    },
  });
  if (!doc) throw new Error("Document introuvable");

  const docOrganizationId = doc.chantier?.organizationId ?? doc.intervention?.chantier.organizationId ?? null;
  if (docOrganizationId && docOrganizationId !== organizationId) throw new Error("Document introuvable");

  await db.document.delete({ where: { id } });
  if (chantierId) revalidatePath(`/chantiers/${chantierId}`);
  return { success: true as const };
}
