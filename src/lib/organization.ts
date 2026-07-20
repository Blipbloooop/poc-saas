import { db } from "@/lib/db";

interface SessionLike {
  session: { id: string; activeOrganizationId?: string | null };
  user: { id: string };
}

// Une session fraîche démarre toujours avec activeOrganizationId à null,
// même si l'utilisateur appartient déjà à une organisation (comportement
// Better Auth). On retombe sur sa première organisation et on répare la
// session en base pour que les prochains appels n'aient plus à le refaire.
export async function resolveActiveOrganizationId(session: SessionLike): Promise<string | null> {
  if (session.session.activeOrganizationId) return session.session.activeOrganizationId;

  const membership = await db.member.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { organizationId: true },
  });
  if (!membership) return null;

  await db.session.update({
    where: { id: session.session.id },
    data: { activeOrganizationId: membership.organizationId },
  });

  return membership.organizationId;
}
