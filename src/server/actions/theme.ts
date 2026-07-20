"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { resolveActiveOrganizationId } from "@/lib/organization";
import { DEFAULT_THEME_PRIMARY, DEFAULT_THEME_SECONDARY } from "@/lib/constants/theme";

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide");

export interface OrganizationTheme {
  primary: string;
  secondary: string;
}

export async function getOrganizationTheme(): Promise<OrganizationTheme> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { primary: DEFAULT_THEME_PRIMARY, secondary: DEFAULT_THEME_SECONDARY };

  const organizationId = await resolveActiveOrganizationId(session);
  if (!organizationId) return { primary: DEFAULT_THEME_PRIMARY, secondary: DEFAULT_THEME_SECONDARY };

  const profile = await db.companyProfile.findUnique({ where: { organizationId } });

  return {
    primary: profile?.brandColor ?? DEFAULT_THEME_PRIMARY,
    secondary: profile?.themeSecondaryColor ?? DEFAULT_THEME_SECONDARY,
  };
}

export async function updateOrganizationTheme(
  primary: string,
  secondary: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };

  const parsedPrimary = hexColor.safeParse(primary);
  const parsedSecondary = hexColor.safeParse(secondary);
  if (!parsedPrimary.success || !parsedSecondary.success) {
    return { success: false, error: "Couleur invalide" };
  }

  const organizationId = await resolveActiveOrganizationId(session);
  if (!organizationId) return { success: false, error: "Aucune organisation active" };

  await db.companyProfile.upsert({
    where: { organizationId },
    create: { organizationId, brandColor: parsedPrimary.data, themeSecondaryColor: parsedSecondary.data },
    update: { brandColor: parsedPrimary.data, themeSecondaryColor: parsedSecondary.data },
  });

  return { success: true };
}
