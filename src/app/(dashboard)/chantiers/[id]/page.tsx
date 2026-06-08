import { notFound } from "next/navigation";
import { getChantierById } from "@/server/actions/chantiers";
import { getDevisByChantierId } from "@/server/actions/devis";
import { getFacturesByChantierId } from "@/server/actions/factures";
import { getInterventionsByChantierId } from "@/server/actions/interventions";
import { getDocumentsByChantierId } from "@/server/actions/documents";
import { getUsers } from "@/server/actions/users";
import ChantierDetail from "./_components/ChantierDetail";

export default async function ChantierPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;

  const [chantier, devisList, facturesList, interventions, documents, users] = await Promise.all([
    getChantierById(id),
    getDevisByChantierId(id),
    getFacturesByChantierId(id),
    getInterventionsByChantierId(id),
    getDocumentsByChantierId(id),
    getUsers(),
  ]);

  if (!chantier) notFound();

  return (
    <ChantierDetail
      chantier={chantier}
      devisList={devisList}
      facturesList={facturesList}
      interventions={interventions}
      documents={documents}
      users={users}
      defaultTab={tab ?? "info"}
    />
  );
}
