"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ChantierStatus } from "@prisma/client";
import { resolveActiveOrganizationId } from "@/lib/organization";

export async function getDashboardStats() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");

  const organizationId = await resolveActiveOrganizationId(session);
  if (!organizationId) {
    return {
      chantiers: { total: 0, enCours: 0, prospect: 0, termine: 0, annule: 0, enRetard: 0, budgetTotal: 0, budgetEnCours: 0 },
      usersCount: 0,
    };
  }

  const [chantiers, usersCount] = await Promise.all([
    db.chantier.findMany({
      where: { organizationId, deletedAt: null },
      select: { status: true, budget: true, dateDebut: true, dateFin: true },
    }),
    db.member.count({ where: { organizationId } }),
  ]);

  const now = new Date();

  const total = chantiers.length;
  const enCours = chantiers.filter((c) => c.status === ChantierStatus.EN_COURS).length;
  const prospect = chantiers.filter((c) => c.status === ChantierStatus.PROSPECT).length;
  const termine = chantiers.filter((c) => c.status === ChantierStatus.TERMINE).length;
  const annule = chantiers.filter((c) => c.status === ChantierStatus.ANNULE).length;

  // Chantiers en retard : EN_COURS avec dateFin dépassée
  const enRetard = chantiers.filter(
    (c) => c.status === ChantierStatus.EN_COURS && c.dateFin && c.dateFin < now
  ).length;

  const budgetTotal = chantiers.reduce((acc, c) => acc + (c.budget ?? 0), 0);
  const budgetEnCours = chantiers
    .filter((c) => c.status === ChantierStatus.EN_COURS)
    .reduce((acc, c) => acc + (c.budget ?? 0), 0);

  return {
    chantiers: { total, enCours, prospect, termine, annule, enRetard, budgetTotal, budgetEnCours },
    usersCount,
  };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;
