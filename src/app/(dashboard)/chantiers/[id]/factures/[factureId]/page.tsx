import { notFound } from "next/navigation";
import { getFactureById } from "@/server/actions/factures";
import { getPrestations } from "@/server/actions/prestations";
import FactureEditor from "./_components/FactureEditor";

export default async function FacturePage({ params }: { params: Promise<{ id: string; factureId: string }> }) {
  const { id, factureId } = await params;
  const [facture, prestations] = await Promise.all([getFactureById(factureId), getPrestations()]);
  if (!facture) notFound();
  return <FactureEditor facture={facture} prestations={prestations} chantierId={id} />;
}
