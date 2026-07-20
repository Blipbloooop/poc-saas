import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ChipButton } from "./ChipButton";
import { ACTIVITES, EFFECTIFS, type Activite, type Effectif } from "@/lib/constants/company";

export interface EntrepriseData {
  nom: string;
  activite: Activite | "";
  activitePrecision: string;
  effectif: Effectif | "";
}

interface StepEntrepriseProps {
  data: EntrepriseData;
  onChange: (data: EntrepriseData) => void;
}

export function StepEntreprise({ data, onChange }: StepEntrepriseProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[23px] font-bold tracking-[-0.3px] text-foreground">Votre entreprise</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Ces informations apparaîtront sur vos devis et factures.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nomEntreprise">Nom de l&apos;entreprise</Label>
        <Input
          id="nomEntreprise"
          placeholder="Martin Rénovation"
          value={data.nom}
          onChange={(e) => onChange({ ...data, nom: e.target.value })}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold text-foreground">Votre activité principale</span>
        <div className="flex flex-wrap gap-2">
          {ACTIVITES.map((a) => (
            <ChipButton
              key={a.value}
              label={a.label}
              selected={data.activite === a.value}
              onClick={() => onChange({ ...data, activite: a.value })}
            />
          ))}
        </div>
        {data.activite === "AUTRE" && (
          <Input
            placeholder="Précisez votre activité"
            value={data.activitePrecision}
            onChange={(e) => onChange({ ...data, activitePrecision: e.target.value })}
            autoFocus
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold text-foreground">Taille de l&apos;équipe</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EFFECTIFS.map((e) => (
            <ChipButton
              key={e.value}
              label={e.label}
              selected={data.effectif === e.value}
              onClick={() => onChange({ ...data, effectif: e.value })}
              className="text-center"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default StepEntreprise;
