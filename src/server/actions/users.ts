"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { resolveActiveOrganizationId } from "@/lib/organization";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");
  return session;
}

export async function getUsers() {
  const session = await requireSession();

  const organizationId = await resolveActiveOrganizationId(session);
  if (!organizationId) return [];

  const members = await db.member.findMany({
    where: { organizationId, user: { deletedAt: null } },
    select: {
      role: true,
      user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    phone: m.user.phone,
    role: m.role,
    createdAt: m.user.createdAt,
  }));
}

export type UserSummary = Awaited<ReturnType<typeof getUsers>>[number];

export async function updateOwnPhone(phone: string): Promise<{ success: boolean }> {
  const session = await requireSession();
  await db.user.update({ where: { id: session.user.id }, data: { phone } });
  return { success: true };
}
