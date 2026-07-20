"use client";

import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_COLOR_PRESETS, SECONDARY_COLOR_PRESETS } from "@/lib/constants/theme";

interface StepThemeProps {
  primary: string;
  secondary: string;
  onChangePrimary: (color: string) => void;
  onChangeSecondary: (color: string) => void;
}

function Swatches({
  colors,
  selected,
  onSelect,
}: {
  colors: typeof PRIMARY_COLOR_PRESETS;
  selected: string;
  onSelect: (color: string) => void;
}) {
  const isCustom = !colors.some((c) => c.value.toLowerCase() === selected.toLowerCase());

  return (
    <div className="flex flex-wrap items-center gap-3">
      {colors.map((c) => (
        <button
          key={c.value}
          type="button"
          title={c.label}
          onClick={() => onSelect(c.value)}
          className="relative h-9 w-9 cursor-pointer rounded-full transition-transform hover:scale-110"
          style={{ backgroundColor: c.value }}
        >
          {selected === c.value && <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />}
        </button>
      ))}

      <label
        title="Autre"
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border-strong transition-transform hover:scale-110"
        style={isCustom ? { backgroundColor: selected, borderStyle: "solid", borderColor: selected } : undefined}
      >
        {isCustom ? (
          <Check className="h-4 w-4 text-white" />
        ) : (
          <Plus className="pointer-events-none h-4 w-4 text-faint" />
        )}
        <input
          type="color"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

export function StepTheme({ primary, secondary, onChangePrimary, onChangeSecondary }: StepThemeProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[20px] font-bold text-foreground">Choisissez votre thème</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Utilisé dans l&apos;application et sur vos devis/factures. Modifiable à tout moment.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold text-foreground">Couleur principale</span>
        <Swatches colors={PRIMARY_COLOR_PRESETS} selected={primary} onSelect={onChangePrimary} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold text-foreground">Couleur secondaire (sidebar)</span>
        <Swatches colors={SECONDARY_COLOR_PRESETS} selected={secondary} onSelect={onChangeSecondary} />
      </div>

      <div
        className={cn("flex items-center gap-3 rounded-lg p-3")}
        style={{ backgroundColor: secondary }}
      >
        <span className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: primary }}>
          Aperçu
        </span>
        <span className="text-xs text-white/70">Sidebar & bouton primaire</span>
      </div>
    </div>
  );
}

export default StepTheme;
