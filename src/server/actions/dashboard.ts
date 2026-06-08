"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ChantierStatus } from "@prisma/client";

export async function getDashboardStats() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non authentifié");

  const [chantiers, usersCount] = await Promise.all([
    db.chantier.findMany({
      where: { deletedAt: null },
      select: { status: true, budget: true, dateDebut: true, dateFin: true },
    }),
    db.user.count({ where: { deletedAt: null } }),
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
