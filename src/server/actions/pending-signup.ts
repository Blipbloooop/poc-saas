"use server";

import { z } from "zod";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { slugify } from "@/lib/utils";
import { resolveActiveOrganizationId } from "@/lib/organization";
import type { ActiviteBTP, Effectif } from "@prisma/client";

const pendingDataSchema = z.object({
  entreprise: z.object({
    nom: z.string().min(1),
    activite: z.string(),
    activitePrecision: z.string().optional(),
    effectif: z.string().optional(),
  }),
  infosLegales: z.object({
    siret: z.string().optional(),
    siren: z.string().optional(),
    adresse: z.string().optional(),
    codePostal: z.string().optional(),
    ville: z.string().optional(),
    tva: z.string().optional(),
  }),
  telephone: z.string().optional(),
});

const createPendingSignupSchema = z.object({
  email: z.string().email(),
  data: pendingDataSchema,
});

export type PendingSignupInput = z.infer<typeof createPendingSignupSchema>;

// Étape "Compte admin" du wizard : l'utilisateur n'a pas encore de session
// (l'email doit d'abord être confirmé), donc on met de côté les infos
// entreprise/légales saisies avant, le temps qu'il clique le lien reçu par mail.
export async function createPendingSignup(input: PendingSignupInput) {
  const parsed = createPendingSignupSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0].message };

  await db.pendingSignup.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    create: { email: parsed.data.email.toLowerCase(), data: parsed.data.data },
    update: { data: parsed.data.data },
  });

  return { success: true as const };
}

// Appelée depuis StepConfirmation juste après validation du code à 6 chiffres
// (la session est déjà ouverte par autoSignInAfterVerification) : crée
// l'organisation + le CompanyProfile à partir des infos mises de côté, puis
// nettoie la ligne temporaire.
//
// Écrit directement en base (plutôt que via auth.api.createOrganization /
// setActiveOrganization) : en production, ces appels échouaient de façon
// systématique juste après une vérification OTP fraîche — cause exacte non
// confirmée (probablement liée à la ré-résolution de session côté
// Server Action), mais l'écriture directe reproduit exactement ce que fait
// le plugin organization et évite complètement ce chemin de code.
export async function finishPendingSignup() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false as const, error: "Non authentifié" };

    // Idempotent : si l'organisation existe déjà (double soumission), on se
    // contente de nettoyer sans recréer quoi que ce soit.
    const existingOrganizationId = await resolveActiveOrganizationId(session);
    if (existingOrganizationId) {
      await db.pendingSignup.deleteMany({ where: { email: session.user.email.toLowerCase() } });
      return { success: true as const };
    }

    const pending = await db.pendingSignup.findUnique({
      where: { email: session.user.email.toLowerCase() },
    });
    if (!pending) return { success: false as const, error: "Aucune inscription en attente" };

    const parsed = pendingDataSchema.safeParse(pending.data);
    if (!parsed.success) return { success: false as const, error: "Données d'inscription invalides" };
    const { entreprise, infosLegales, telephone } = parsed.data;

    await db.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          id: randomUUID(),
          name: entreprise.nom,
          slug: `${slugify(entreprise.nom)}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date(),
        },
      });

      await tx.member.create({
        data: {
          id: randomUUID(),
          organizationId: organization.id,
          userId: session.user.id,
          role: "admin",
          createdAt: new Date(),
        },
      });

      await tx.companyProfile.create({
        data: {
          organizationId: organization.id,
          activite: (entreprise.activite || "AUTRE") as ActiviteBTP,
          activitePrecision: entreprise.activitePrecision || null,
          effectif: (entreprise.effectif || null) as Effectif | null,
          siren: infosLegales.siren || null,
          siret: infosLegales.siret || null,
          adresse: infosLegales.adresse || null,
          codePostal: infosLegales.codePostal || null,
          ville: infosLegales.ville || null,
          tvaIntracommunautaire: infosLegales.tva || null,
        },
      });

      if (telephone) {
        await tx.user.update({ where: { id: session.user.id }, data: { phone: telephone } });
      }

      await tx.session.updateMany({
        where: { userId: session.user.id },
        data: { activeOrganizationId: organization.id },
      });

      await tx.pendingSignup.delete({ where: { id: pending.id } });
    });

    return { success: true as const };
  } catch (error) {
    console.error("[finishPendingSignup] Échec de la finalisation d'inscription :", error);
    return { success: false as const, error: "Une erreur est survenue lors de la configuration de votre espace" };
  }
}
