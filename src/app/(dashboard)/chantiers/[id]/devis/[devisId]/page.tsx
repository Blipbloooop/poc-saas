import { notFound } from "next/navigation";
import { getDevisById } from "@/server/actions/devis";
import { getPrestations } from "@/server/actions/prestations";
import DevisEditor from "./_components/DevisEditor";

export default async function DevisPage({ params }: { params: Promise<{ id: string; devisId: string }> }) {
  const { id, devisId } = await params;
  const [devis, prestations] = await Promise.all([getDevisById(devisId), getPrestations()]);
  if (!devis) notFound();
  return <DevisEditor devis={devis} prestations={prestations} chantierId={id} />;
}
