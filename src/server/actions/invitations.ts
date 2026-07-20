"use server";

import { z } from "zod";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hashPassword } from "@/lib/password";
import { resolveActiveOrganizationId } from "@/lib/organization";

export async function getOrganizationInvitations() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");

  const organizationId = await resolveActiveOrganizationId(session);
  if (!organizationId) return [];

  return db.invitation.findMany({
    where: { organizationId, status: "pending" },
    orderBy: { createdAt: "desc" },
  });
}

export type InvitationSummary = Awaited<ReturnType<typeof getOrganizationInvitations>>[number];

const invitationDetailsSchema = z.object({
  invitationId: z.string().min(1),
  prenom: z.string().min(1),
  nom: z.string().min(1),
  telephone: z.string().min(1),
});

export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function attachInvitationDetails(
  input: z.infer<typeof invitationDetailsSchema>
): Promise<ActionResult<{ id: string }>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Non authentifié" };

  const parsed = invitationDetailsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const { invitationId, prenom, nom, telephone } = parsed.data;

  const invitation = await db.invitation.findUnique({ where: { id: invitationId } });
  if (!invitation || invitation.inviterId !== session.user.id) {
    return { success: false, error: "Invitation introuvable" };
  }

  await db.invitation.update({
    where: { id: invitationId },
    data: { prenom, nom, telephone },
  });

  return { success: true, data: { id: invitationId } };
}

export interface InvitationPublic {
  organizationName: string;
  email: string;
  role: string;
  prenom: string | null;
  nom: string | null;
}

// Lecture publique (non authentifiée) pour la page /accept-invite/[id] : le
// collaborateur invité n'a pas encore de compte, donc pas de session.
export async function getInvitationPublic(invitationId: string): Promise<ActionResult<InvitationPublic>> {
  const invitation = await db.invitation.findUnique({
    where: { id: invitationId },
    include: { organization: { select: { name: true } } },
  });

  if (!invitation || invitation.status !== "pending" || invitation.expiresAt < new Date()) {
    return { success: false, error: "Cette invitation est introuvable ou a expiré" };
  }

  const existingUser = await db.user.findUnique({ where: { email: invitation.email } });
  if (existingUser) {
    return { success: false, error: "Un compte existe déjà avec cet email. Connectez-vous pour rejoindre l'organisation." };
  }

  return {
    success: true,
    data: {
      organizationName: invitation.organization.name,
      email: invitation.email,
      role: invitation.role ?? "member",
      prenom: invitation.prenom,
      nom: invitation.nom,
    },
  };
}

const acceptInvitationSchema = z.object({
  invitationId: z.string().min(1),
  password: z.string().min(8),
});

// Crée le compte du collaborateur invité (email déjà prouvé par la
// possession du lien d'invitation, donc emailVerified: true directement —
// pas de second aller-retour email) et l'attache à l'organisation.
export async function acceptInvitationSetPassword(
  input: z.infer<typeof acceptInvitationSchema>
): Promise<ActionResult<{ email: string; organizationId: string }>> {
  const parsed = acceptInvitationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const { invitationId, password } = parsed.data;

  const invitation = await db.invitation.findUnique({ where: { id: invitationId } });
  if (!invitation || invitation.status !== "pending" || invitation.expiresAt < new Date()) {
    return { success: false, error: "Cette invitation est introuvable ou a expiré" };
  }

  const existingUser = await db.user.findUnique({ where: { email: invitation.email } });
  if (existingUser) {
    return { success: false, error: "Un compte existe déjà avec cet email. Connectez-vous pour rejoindre l'organisation." };
  }

  const name = [invitation.prenom, invitation.nom].filter(Boolean).join(" ") || invitation.email.split("@")[0];
  const hashed = await hashPassword(password);

  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email: invitation.email,
        emailVerified: true,
        phone: invitation.telephone,
      },
    });

    await tx.account.create({
      data: {
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: hashed,
      },
    });

    await tx.member.create({
      data: {
        id: randomUUID(),
        organizationId: invitation.organizationId,
        userId: user.id,
        role: invitation.role ?? "member",
        createdAt: new Date(),
      },
    });

    await tx.invitation.update({ where: { id: invitationId }, data: { status: "accepted" } });
  });

  return { success: true, data: { email: invitation.email, organizationId: invitation.organizationId } };
}
