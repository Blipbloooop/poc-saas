import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export interface CompteAdminData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  password: string;
  confirmPassword: string;
}

interface StepCompteAdminProps {
  data: CompteAdminData;
  onChange: (data: CompteAdminData) => void;
}

export function StepCompteAdmin({ data, onChange }: StepCompteAdminProps) {
  const passwordsMismatch =
    data.confirmPassword.length > 0 && data.password !== data.confirmPassword;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[23px] font-bold tracking-[-0.3px] text-foreground">Votre compte</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Vous êtes à quelques secondes de piloter vos chantiers.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prenom">Prénom</Label>
          <Input
            id="prenom"
            placeholder="Julien"
            value={data.prenom}
            onChange={(e) => onChange({ ...data, prenom: e.target.value })}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nom">Nom</Label>
          <Input
            id="nom"
            placeholder="Martin"
            value={data.nom}
            onChange={(e) => onChange({ ...data, nom: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="vous@entreprise.fr"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          required
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="telephone">Téléphone portable</Label>
        <Input
          id="telephone"
          type="tel"
          placeholder="06 12 34 56 78"
          value={data.telephone}
          onChange={(e) => onChange({ ...data, telephone: e.target.value })}
          required
          autoComplete="tel"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="8 caractères minimum"
            value={data.password}
            onChange={(e) => onChange({ ...data, password: e.target.value })}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirmation</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Répétez le mot de passe"
            value={data.confirmPassword}
            onChange={(e) => onChange({ ...data, confirmPassword: e.target.value })}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </div>
      {passwordsMismatch && (
        <p className="-mt-3 text-xs text-destructive">Les mots de passe ne correspondent pas</p>
      )}

      <div className="flex items-start gap-3 rounded-lg border border-border-strong bg-background px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-[13px] leading-relaxed text-body">
          Vous serez le premier administrateur de votre entreprise. Vous pourrez ensuite inviter vos
          collaborateurs.
        </p>
      </div>
    </div>
  );
}

export default StepCompteAdmin;
