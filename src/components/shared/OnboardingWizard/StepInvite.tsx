"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";

export interface InviteRow {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: "admin" | "member";
}

const ROLES: { value: InviteRow["role"]; label: string }[] = [
  { value: "member", label: "Membre" },
  { value: "admin", label: "Administrateur" },
];

export function emptyInviteRow(): InviteRow {
  return { prenom: "", nom: "", email: "", telephone: "", role: "member" };
}

interface StepInviteProps {
  rows: InviteRow[];
  onChange: (rows: InviteRow[]) => void;
}

export function StepInvite({ rows, onChange }: StepInviteProps) {
  function updateRow(index: number, patch: Partial<InviteRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[20px] font-bold text-foreground">Invitez votre équipe</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Chacun recevra un email pour créer son mot de passe. Vous pourrez aussi le faire plus tard.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Prénom"
                value={row.prenom}
                onChange={(e) => updateRow(i, { prenom: e.target.value })}
              />
              <Input placeholder="Nom" value={row.nom} onChange={(e) => updateRow(i, { nom: e.target.value })} />
            </div>
            <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input
                type="email"
                placeholder="collegue@entreprise.fr"
                value={row.email}
                onChange={(e) => updateRow(i, { email: e.target.value })}
              />
              <Input
                type="tel"
                placeholder="Téléphone"
                value={row.telephone}
                onChange={(e) => updateRow(i, { telephone: e.target.value })}
              />
              <select
                value={row.role}
                onChange={(e) => updateRow(i, { role: e.target.value as InviteRow["role"] })}
                className="rounded-lg border border-border-strong bg-white px-2 text-sm text-foreground"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="mt-2 flex cursor-pointer items-center gap-1 text-xs text-destructive hover:underline"
              >
                <Trash2 className="h-3 w-3" />
                Retirer
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...rows, emptyInviteRow()])}
        className="flex cursor-pointer items-center gap-1.5 self-start text-[13.5px] font-bold text-primary hover:underline"
      >
        <Plus className="h-3.5 w-3.5" />
        Ajouter un collaborateur
      </button>
    </div>
  );
}

export default StepInvite;
