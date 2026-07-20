"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, MapPin, HardHat, ChevronRight } from "lucide-react";
import { ChantierStatus } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CreateChantierModal from "@/components/shared/CreateChantierModal";
import CreationTypeDialog, { type CreationMode } from "@/components/shared/CreationTypeDialog";
import { type ChantierWithResponsable } from "@/server/actions/chantiers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTheme } from "@/components/shared/ThemeProvider";

const STATUS_LABELS: Record<ChantierStatus, string> = {
  PROSPECT: "Prospect", EN_COURS: "En cours", TERMINE: "Terminé", ANNULE: "Annulé",
};
const STATUS_COLORS: Record<ChantierStatus, string> = {
  PROSPECT: "bg-slate-100 text-slate-700",
  EN_COURS: "bg-amber-100 text-amber-700",
  TERMINE: "bg-green-100 text-green-700",
  ANNULE: "bg-red-100 text-red-700",
};

// ─── Page liste ───────────────────────────────────────────────────────────────

interface Props {
  initialChantiers: ChantierWithResponsable[];
}

export default function ChantiersList({ initialChantiers }: Props) {
  const { primaryColor } = useTheme();
  const router = useRouter();
  const [chantiers, setChantiers] = useState(initialChantiers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChantierStatus | "tous">("tous");
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [createMode, setCreateMode] = useState<CreationMode | null>(null);

  const filtered = chantiers.filter((c) => {
    const matchSearch =
      search === "" ||
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.reference.toLowerCase().includes(search.toLowerCase()) ||
      (c.ville ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.responsable?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "tous" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totaux = {
    total: chantiers.length,
    enCours: chantiers.filter((c) => c.status === ChantierStatus.EN_COURS).length,
    enRetard: chantiers.filter((c) => c.status === ChantierStatus.EN_COURS && c.dateFin && new Date(c.dateFin) < new Date()).length,
    budgetTotal: chantiers.reduce((acc, c) => acc + (c.budget ?? 0), 0),
  };

  const handleTypeSelected = (mode: CreationMode) => {
    setCreateMode(mode);
    setShowTypeDialog(false);
  };

  const handleChantierCreated = (chantier: ChantierWithResponsable) => {
    setChantiers((prev) => [chantier, ...prev]);
    setCreateMode(null);
    // Redirige vers le détail, onglet devis si mode devis
    const tab = createMode === "devis" ? "?tab=devis" : "";
    router.push(`/chantiers/${chantier.id}${tab}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Chantiers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{totaux.total} chantier{totaux.total > 1 ? "s" : ""} · {totaux.enCours} en cours</p>
        </div>
        <Button variant="primary" onClick={() => setShowTypeDialog(true)}>
          <Plus className="w-4 h-4" /> Créer un chantier
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: String(totaux.total), color: "bg-slate-50 border-slate-200" },
          { label: "En cours", value: String(totaux.enCours), color: "bg-amber-50 border-amber-200" },
          { label: "En retard", value: String(totaux.enRetard), color: "bg-red-50 border-red-200" },
          { label: "Budget total", value: formatCurrency(totaux.budgetTotal), color: "bg-green-50 border-green-200" },
        ].map((k) => (
          <div key={k.label} className={`rounded-xl border p-4 ${k.color}`}>
            <p className="text-xs text-slate-500 font-medium">{k.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Référence, nom, ville, responsable…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {([
              { value: "tous", label: "Tous" },
              { value: ChantierStatus.PROSPECT, label: "Prospect" },
              { value: ChantierStatus.EN_COURS, label: "En cours" },
              { value: ChantierStatus.TERMINE, label: "Terminé" },
              { value: ChantierStatus.ANNULE, label: "Annulé" },
            ] as const).map((f) => (
              <button key={f.value} onClick={() => setStatusFilter(f.value as ChantierStatus | "tous")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                style={statusFilter === f.value
                  ? { backgroundColor: primaryColor, color: "white" }
                  : { backgroundColor: "white", border: "1px solid #e2e8f0", color: "#475569" }}>
                {f.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <p className="text-sm text-slate-500">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Référence", "Nom", "Localisation", "Responsable", "Dates", "Budget HT", "Statut", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => {
                const retard = c.status === ChantierStatus.EN_COURS && c.dateFin && new Date(c.dateFin) < new Date();
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => router.push(`/chantiers/${c.id}`)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">{c.reference}</span>
                        {retard && <span className="text-amber-500 text-xs">⚠️</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{c.nom}</p>
                      {c.description && <p className="text-xs text-slate-400 truncate max-w-48">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {(c.ville || c.adresse) ? (
                        <span className="text-xs text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />{c.ville ?? c.adresse}
                        </span>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600">{c.responsable?.name ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-600 space-y-0.5">
                        {c.dateDebut && <p>{formatDate(c.dateDebut.toISOString())}</p>}
                        {c.dateFin && <p className="text-slate-400">→ {formatDate(c.dateFin.toISOString())}</p>}
                        {!c.dateDebut && !c.dateFin && <span className="text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-slate-900">{c.budget ? formatCurrency(c.budget) : <span className="text-slate-400">—</span>}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/chantiers/${c.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors inline-flex">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <HardHat className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{chantiers.length === 0 ? "Aucun chantier créé pour l'instant" : "Aucun résultat"}</p>
              {chantiers.length === 0 && (
                <button onClick={() => setShowTypeDialog(true)} className="mt-3 text-sm font-medium hover:underline" style={{ color: primaryColor }}>
                  Créer votre premier chantier →
                </button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Dialogs */}
      {showTypeDialog && (
        <CreationTypeDialog onSelect={handleTypeSelected} onClose={() => setShowTypeDialog(false)} />
      )}
      {createMode && (
        <CreateChantierModal onClose={() => setCreateMode(null)} onCreated={handleChantierCreated} />
      )}
    </div>
  );
}
