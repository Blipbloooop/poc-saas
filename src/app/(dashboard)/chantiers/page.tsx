import { getChantiers } from "@/server/actions/chantiers";
import ChantiersList from "./_components/ChantiersList";

export default async function ChantiersPage() {
  const chantiers = await getChantiers();
  return <ChantiersList initialChantiers={chantiers} />;
}
