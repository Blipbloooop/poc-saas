"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { lookupSiret } from "@/server/actions/siret";

export interface InfosLegalesData {
  siret: string;
  siren: string;
  adresse: string;
  codePostal: string;
  ville: string;
  tva: string;
}

interface StepInfosLegalesProps {
  data: InfosLegalesData;
  onChange: (data: InfosLegalesData) => void;
}

export function StepInfosLegales({ data, onChange }: StepInfosLegalesProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState(false);

  const digitsOnly = data.siret.replace(/\D/g, "");

  async function handleLookup() {
    setLoading(true);
    setError(null);
    setFound(false);

    const result = await lookupSiret(digitsOnly);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onChange({
      ...data,
      siret: result.data.siret,
      siren: result.data.siren,
      adresse: result.data.adresse,
      codePostal: result.data.codePostal,
      ville: result.data.ville,
      tva: result.data.tvaIntracommunautaire,
    });
    setFound(true);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[23px] font-bold tracking-[-0.3px] text-foreground">Informations légales</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Renseignez votre SIRET, on préremplit le reste automatiquement.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="siret">SIREN / SIRET</Label>
        <div className="flex gap-2">
          <Input
            id="siret"
            placeholder="14 chiffres"
            value={data.siret}
            onChange={(e) => onChange({ ...data, siret: e.target.value })}
            maxLength={20}
            inputMode="numeric"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleLookup}
            disabled={loading || digitsOnly.length !== 14}
            className="shrink-0 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Rechercher
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {found && <p className="text-xs text-success">Entreprise trouvée, informations préremplies.</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="adresse">Adresse</Label>
        <Input
          id="adresse"
          placeholder="Préremplie après recherche SIRET"
          value={data.adresse}
          onChange={(e) => onChange({ ...data, adresse: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="codePostal">Code postal</Label>
          <Input
            id="codePostal"
            value={data.codePostal}
            onChange={(e) => onChange({ ...data, codePostal: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ville">Ville</Label>
          <Input id="ville" value={data.ville} onChange={(e) => onChange({ ...data, ville: e.target.value })} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tva">TVA intracommunautaire</Label>
        <Input id="tva" value={data.tva} onChange={(e) => onChange({ ...data, tva: e.target.value })} />
      </div>
    </div>
  );
}

export default StepInfosLegales;
