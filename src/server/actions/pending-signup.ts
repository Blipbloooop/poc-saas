"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { slugify } from "@/lib/utils";
import { resolveActiveOrganizationId } from "@/lib/organization";
import { createCompanyProfile, type CompanyProfileInput } from "./company-profile";
import { updateOwnPhone } from "./users";

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
export async function finishPendingSignup() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false as const, error: "Non authentifié" };

  // Idempotent : si l'organisation existe déjà (double clic sur le lien), on
  // se contente de nettoyer sans recréer quoi que ce soit.
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

  const org = await auth.api.createOrganization({
    headers: await headers(),
    body: {
      name: entreprise.nom,
      slug: `${slugify(entreprise.nom)}-${Math.random().toString(36).slice(2, 7)}`,
    },
  });
  if (!org) return { success: false as const, error: "Impossible de créer l'entreprise" };

  const profileResult = await createCompanyProfile({
    organizationId: org.id,
    activite: (entreprise.activite || "AUTRE") as CompanyProfileInput["activite"],
    activitePrecision: entreprise.activitePrecision || undefined,
    effectif: entreprise.effectif as CompanyProfileInput["effectif"],
    siren: infosLegales.siren || undefined,
    siret: infosLegales.siret || undefined,
    adresse: infosLegales.adresse || undefined,
    codePostal: infosLegales.codePostal || undefined,
    ville: infosLegales.ville || undefined,
    tvaIntracommunautaire: infosLegales.tva || undefined,
  });
  if (!profileResult.success) return { success: false as const, error: profileResult.error };

  if (telephone) await updateOwnPhone(telephone);

  await auth.api.setActiveOrganization({ headers: await headers(), body: { organizationId: org.id } });

  await db.pendingSignup.delete({ where: { id: pending.id } });

  return { success: true as const };
}
