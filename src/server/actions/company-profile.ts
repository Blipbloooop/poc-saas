"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { resolveActiveOrganizationId } from "@/lib/organization";

const companyProfileSchema = z.object({
  organizationId: z.string().min(1),
  activite: z
    .enum([
      "PLOMBERIE",
      "ELECTRICITE",
      "MENUISERIE",
      "MACONNERIE",
      "PEINTURE",
      "CHAUFFAGE_CLIMATISATION",
      "COUVERTURE",
      "MULTI_SERVICES",
      "AUTRE",
    ])
    .optional(),
  activitePrecision: z.string().optional(),
  effectif: z.enum(["SOLO", "DE_2_A_5", "DE_6_A_10", "DE_11_A_20", "PLUS_DE_20"]).optional(),
  siren: z.string().optional(),
  siret: z.string().optional(),
  adresse: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  tvaIntracommunautaire: z.string().optional(),
  mentionsLegales: z.string().optional(),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function createCompanyProfile(
  input: CompanyProfileInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };

  const parsed = companyProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const { organizationId, ...profileData } = parsed.data;

  const membership = await db.member.findFirst({
    where: { organizationId, userId: session.user.id },
  });
  if (!membership) return { success: false, error: "Vous n'appartenez pas à cette organisation" };

  const profile = await db.companyProfile.upsert({
    where: { organizationId },
    create: { organizationId, ...profileData },
    update: profileData,
  });

  return { success: true, data: { id: profile.id } };
}

export const updateCompanyProfile = createCompanyProfile;

export async function getMyCompanyProfile() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const organizationId = await resolveActiveOrganizationId(session);
  if (!organizationId) return null;

  const [profile, organization] = await Promise.all([
    db.companyProfile.findUnique({ where: { organizationId } }),
    db.organization.findUnique({ where: { id: organizationId }, select: { name: true, logo: true } }),
  ]);

  return {
    organizationId,
    organizationName: organization?.name ?? "",
    organizationLogo: organization?.logo ?? null,
    profile,
  };
}

export async function markOnboardingCompleted(): Promise<ActionResult<{ id: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };

  const organizationId = await resolveActiveOrganizationId(session);
  if (!organizationId) return { success: false, error: "Aucune organisation active" };

  const profile = await db.companyProfile.upsert({
    where: { organizationId },
    create: { organizationId, onboardingCompletedAt: new Date() },
    update: { onboardingCompletedAt: new Date() },
  });

  return { success: true, data: { id: profile.id } };
}

export async function updateOrganizationLogo(logoUrl: string): Promise<ActionResult<{ logo: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };

  const organizationId = await resolveActiveOrganizationId(session);
  if (!organizationId) return { success: false, error: "Aucune organisation active" };

  const membership = await db.member.findFirst({ where: { organizationId, userId: session.user.id } });
  if (!membership) return { success: false, error: "Vous n'appartenez pas à cette organisation" };

  const organization = await db.organization.update({
    where: { id: organizationId },
    data: { logo: logoUrl },
  });

  return { success: true, data: { logo: organization.logo ?? "" } };
}
