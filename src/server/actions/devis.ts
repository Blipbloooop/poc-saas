"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DevisStatus } from "@prisma/client";
import { randomUUID } from "crypto";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");
  return session;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type DevisWithLignes = Awaited<ReturnType<typeof getDevis>>;
export type DevisFull = Awaited<ReturnType<typeof getDevisById>>;

// ─── Lecture ──────────────────────────────────────────────────────────────────

export async function getDevisByChantierId(chantierId: string) {
  await requireSession();
  return db.devis.findMany({
    where: { chantierId },
    include: { lignes: { orderBy: { ordre: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDevisById(id: string) {
  await requireSession();
  return db.devis.findUnique({
    where: { id },
    include: {
      lignes: { orderBy: { ordre: "asc" } },
      chantier: { select: { id: true, reference: true, nom: true, adresse: true, ville: true } },
    },
  });
}

async function getDevis(id: string) {
  return db.devis.findUniqueOrThrow({
    where: { id },
    include: { lignes: { orderBy: { ordre: "asc" } } },
  });
}

// ─── Création ─────────────────────────────────────────────────────────────────

export async function createDevis(chantierId: string, clientNom?: string) {
  await requireSession();

  const year = new Date().getFullYear();
  const count = await db.devis.count({ where: { numero: { startsWith: `DEV-${year}-` } } });
  const numero = `DEV-${year}-${String(count + 1).padStart(3, "0")}`;

  const devis = await db.devis.create({
    data: { numero, chantierId, clientNom: clientNom ?? "" },
    include: { lignes: true },
  });

  revalidatePath(`/chantiers/${chantierId}`);
  return { success: true as const, data: devis };
}

// ─── Sauvegarde complète ──────────────────────────────────────────────────────

const ligneSchema = z.object({
  id: z.string().optional(),
  ordre: z.number(),
  label: z.string(),
  description: z.string().optional(),
  quantite: z.number().min(0),
  unite: z.string(),
  prixUnitaire: z.number().min(0),
  tva: z.number().min(0).max(100),
  totalHT: z.number(),
});

const saveDevisSchema = z.object({
  clientNom: z.string(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientAdresse: z.string().optional(),
  validiteJours: z.number().int().min(1),
  tvaDefault: z.number().min(0).max(100),
  notes: z.string().optional(),
  mentionsLegales: z.string().optional(),
  lignes: z.array(ligneSchema),
});

export type SaveDevisInput = z.infer<typeof saveDevisSchema>;

export async function saveDevis(id: string, input: SaveDevisInput) {
  await requireSession();
  const data = saveDevisSchema.parse(input);

  // Calcul des totaux
  const totalHT = data.lignes.reduce((s, l) => s + l.totalHT, 0);
  const totalTVA = data.lignes.reduce((s, l) => s + l.totalHT * (l.tva / 100), 0);
  const totalTTC = totalHT + totalTVA;

  // Supprime les anciennes lignes et recrée
  await db.$transaction([
    db.ligneDevis.deleteMany({ where: { devisId: id } }),
    db.devis.update({
      where: { id },
      data: {
        clientNom: data.clientNom,
        clientEmail: data.clientEmail || null,
        clientAdresse: data.clientAdresse,
        validiteJours: data.validiteJours,
        tvaDefault: data.tvaDefault,
        notes: data.notes,
        mentionsLegales: data.mentionsLegales,
        totalHT, totalTVA, totalTTC,
        lignes: {
          create: data.lignes.map((l) => ({
            ordre: l.ordre, label: l.label, description: l.description,
            quantite: l.quantite, unite: l.unite,
            prixUnitaire: l.prixUnitaire, tva: l.tva, totalHT: l.totalHT,
          })),
        },
      },
    }),
  ]);

  const devis = await db.devis.findUniqueOrThrow({
    where: { id },
    include: { lignes: { orderBy: { ordre: "asc" } }, chantier: { select: { id: true, reference: true, nom: true } } },
  });

  revalidatePath(`/chantiers/${devis.chantierId}`);
  revalidatePath(`/chantiers/${devis.chantierId}/devis/${id}`);
  return { success: true as const, data: devis };
}

// ─── Envoi pour signature ─────────────────────────────────────────────────────

export async function sendDevisForSignature(id: string) {
  await requireSession();

  const token = randomUUID();
  const devis = await db.devis.update({
    where: { id },
    data: { status: DevisStatus.ENVOYE, signatureToken: token, sentAt: new Date() },
    include: { chantier: { select: { id: true } } },
  });

  revalidatePath(`/chantiers/${devis.chantier.id}`);
  return {
    success: true as const,
    token,
    signatureUrl: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/signature/${token}`,
  };
}

// ─── Signature (appelé depuis page publique) ──────────────────────────────────

export async function signDevis(token: string) {
  const devis = await db.devis.findUnique({ where: { signatureToken: token } });
  if (!devis) return { success: false as const, error: "Lien invalide" };
  if (devis.status === DevisStatus.SIGNE) return { success: true as const, alreadySigned: true };

  await db.devis.update({
    where: { id: devis.id },
    data: { status: DevisStatus.SIGNE, signedAt: new Date() },
  });

  return { success: true as const, alreadySigned: false };
}

export async function getDevisByToken(token: string) {
  return db.devis.findUnique({
    where: { signatureToken: token },
    include: {
      lignes: { orderBy: { ordre: "asc" } },
      chantier: { select: { nom: true, adresse: true, ville: true } },
    },
  });
}

export async function deleteDevis(id: string) {
  await requireSession();
  const devis = await db.devis.findUniqueOrThrow({ where: { id } });
  await db.devis.delete({ where: { id } });
  revalidatePath(`/chantiers/${devis.chantierId}`);
  return { success: true as const };
}
