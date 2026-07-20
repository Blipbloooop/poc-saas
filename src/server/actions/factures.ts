"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FactureStatus } from "@prisma/client";
import { resolveActiveOrganizationId } from "@/lib/organization";

async function requireOrganizationId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");
  const organizationId = await resolveActiveOrganizationId(session);
  if (!organizationId) throw new Error("Aucune organisation active");
  return organizationId;
}

export type FactureFull = Awaited<ReturnType<typeof getFactureById>>;

export async function getFacturesByChantierId(chantierId: string) {
  const organizationId = await requireOrganizationId();
  return db.facture.findMany({
    where: { chantierId, chantier: { organizationId } },
    include: { lignes: { orderBy: { ordre: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFactureById(id: string) {
  const organizationId = await requireOrganizationId();
  return db.facture.findFirst({
    where: { id, chantier: { organizationId } },
    include: {
      lignes: { orderBy: { ordre: "asc" } },
      chantier: { select: { id: true, reference: true, nom: true } },
      devis: { select: { numero: true } },
    },
  });
}

// Créer une facture depuis un devis signé (copie les lignes)
export async function createFactureFromDevis(devisId: string) {
  const organizationId = await requireOrganizationId();

  const devis = await db.devis.findFirst({
    where: { id: devisId, chantier: { organizationId } },
    include: { lignes: true },
  });
  if (!devis) throw new Error("Devis introuvable");

  const year = new Date().getFullYear();
  const count = await db.facture.count({
    where: { numero: { startsWith: `FAC-${year}-` }, chantier: { organizationId } },
  });
  const numero = `FAC-${year}-${String(count + 1).padStart(3, "0")}`;

  const echeanceDate = new Date();
  echeanceDate.setDate(echeanceDate.getDate() + 30);

  const facture = await db.facture.create({
    data: {
      numero,
      chantierId: devis.chantierId,
      devisId: devis.id,
      clientNom: devis.clientNom,
      clientEmail: devis.clientEmail,
      clientAdresse: devis.clientAdresse,
      totalHT: devis.totalHT,
      totalTVA: devis.totalTVA,
      totalTTC: devis.totalTTC,
      echeanceDate,
      lignes: {
        create: devis.lignes.map((l) => ({
          ordre: l.ordre, label: l.label, description: l.description,
          quantite: l.quantite, unite: l.unite,
          prixUnitaire: l.prixUnitaire, tva: l.tva, totalHT: l.totalHT,
        })),
      },
    },
    include: { lignes: { orderBy: { ordre: "asc" } } },
  });

  revalidatePath(`/chantiers/${devis.chantierId}`);
  return { success: true as const, data: facture };
}

export async function createFactureBlank(chantierId: string) {
  const organizationId = await requireOrganizationId();

  const chantier = await db.chantier.findFirst({ where: { id: chantierId, organizationId } });
  if (!chantier) throw new Error("Chantier introuvable");

  const year = new Date().getFullYear();
  const count = await db.facture.count({
    where: { numero: { startsWith: `FAC-${year}-` }, chantier: { organizationId } },
  });
  const numero = `FAC-${year}-${String(count + 1).padStart(3, "0")}`;

  const facture = await db.facture.create({
    data: { numero, chantierId },
    include: { lignes: true },
  });

  revalidatePath(`/chantiers/${chantierId}`);
  return { success: true as const, data: facture };
}

const ligneSchema = z.object({
  ordre: z.number(), label: z.string(), description: z.string().optional(),
  quantite: z.number().min(0), unite: z.string(),
  prixUnitaire: z.number().min(0), tva: z.number().min(0).max(100), totalHT: z.number(),
});

const saveFactureSchema = z.object({
  clientNom: z.string(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientAdresse: z.string().optional(),
  echeanceDate: z.string().optional(),
  notes: z.string().optional(),
  lignes: z.array(ligneSchema),
});

export type SaveFactureInput = z.infer<typeof saveFactureSchema>;

export async function saveFacture(id: string, input: SaveFactureInput) {
  const organizationId = await requireOrganizationId();
  const existing = await db.facture.findFirst({ where: { id, chantier: { organizationId } } });
  if (!existing) throw new Error("Facture introuvable");

  const data = saveFactureSchema.parse(input);

  const totalHT = data.lignes.reduce((s, l) => s + l.totalHT, 0);
  const totalTVA = data.lignes.reduce((s, l) => s + l.totalHT * (l.tva / 100), 0);
  const totalTTC = totalHT + totalTVA;

  await db.$transaction([
    db.ligneFacture.deleteMany({ where: { factureId: id } }),
    db.facture.update({
      where: { id },
      data: {
        clientNom: data.clientNom,
        clientEmail: data.clientEmail || null,
        clientAdresse: data.clientAdresse,
        echeanceDate: data.echeanceDate ? new Date(data.echeanceDate) : null,
        notes: data.notes,
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

  const facture = await db.facture.findUniqueOrThrow({
    where: { id },
    include: { lignes: { orderBy: { ordre: "asc" } }, chantier: { select: { id: true, reference: true, nom: true } } },
  });

  revalidatePath(`/chantiers/${facture.chantierId}`);
  return { success: true as const, data: facture };
}

export async function updateFactureStatus(id: string, status: FactureStatus) {
  const organizationId = await requireOrganizationId();
  const existing = await db.facture.findFirst({ where: { id, chantier: { organizationId } } });
  if (!existing) throw new Error("Facture introuvable");

  const f = await db.facture.update({
    where: { id },
    data: {
      status,
      sentAt: status === FactureStatus.ENVOYEE ? new Date() : undefined,
      paidAt: status === FactureStatus.PAYEE ? new Date() : undefined,
    },
  });
  revalidatePath(`/chantiers/${f.chantierId}`);
  return { success: true as const };
}
