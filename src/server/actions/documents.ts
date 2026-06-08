"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { DocumentCategorie } from "@prisma/client";
import { z } from "zod";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");
  return session;
}

export async function getDocumentsByChantierId(chantierId: string) {
  await requireSession();
  return db.document.findMany({
    where: { chantierId },
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

  const doc = await db.document.create({
    data: { ...input, uploadedById: session.user.id },
    include: { uploadedBy: { select: { id: true, name: true } } },
  });

  if (input.chantierId) revalidatePath(`/chantiers/${input.chantierId}`);
  return { success: true as const, data: doc };
}

export async function deleteDocument(id: string, chantierId?: string) {
  await requireSession();
  await db.document.delete({ where: { id } });
  if (chantierId) revalidatePath(`/chantiers/${chantierId}`);
  return { success: true as const };
}
