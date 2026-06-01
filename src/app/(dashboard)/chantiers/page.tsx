"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  User,
  Euro,
  ChevronDown,
  Eye,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  mockChantiers,
  CHANTIER_STATUTS,
  STATUT_LABELS,
  STATUT_COLORS,
  type Chantier,
  type ChantierStatut,
} from "@/lib/mock-data";
import CreateChantierModal from "@/components/shared/CreateChantierModal";
import { formatCurrency, formatDate } from "@/lib/utils";

// ─── Modal Détail Chantier ────────────────────────────────────────────────────

function ChantierDetailModal({
  chantier,
  onClose,
}: {
  chantier: Chantier;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-2xl">
          <div>
            <p className="text-xs text-slate-500 font-mono">{chantier.reference}</p>
            <h2 className="text-lg font-bold text-slate-900">{chantier.type}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUT_COLORS[chantier.statut]}`}>
              {STATUT_LABELS[chantier.statut]}
            </span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Client & adresse */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Client</p>
              <p className="text-sm font-semibold text-slate-900">{chantier.client}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Adresse</p>
              <p className="text-sm font-semibold text-slate-900">{chantier.adresse}</p>
              <p className="text-xs text-slate-500">{chantier.ville}</p>
            </div>
          </div>

          {/* Équipe */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Équipe</p>
            <div className="flex flex-wrap gap-2">
              {chantier.commercial && (
                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                  📊 {chantier.commercial} (Commercial)
                </div>
              )}
              {chantier.conducteur && (
                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                  🦺 {chantier.conducteur} (Conducteur)
                </div>
              )}
              {chantier.techniciens.map((t) => (
                <div key={t} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                  🔧 {t}
                </div>
              ))}
              {chantier.techniciens.length === 0 && !chantier.conducteur && (
                <span className="text-sm text-slate-400">Non affecté</span>
              )}
            </div>
          </div>

          {/* Dates & montant */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Début</p>
              <p className="text-sm font-semibold">{formatDate(chantier.dateDebut)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Fin prévue</p>
              <p className="text-sm font-semibold">{formatDate(chantier.dateFin)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Euro className="w-3 h-3" /> Montant HT</p>
              <p className="text-sm font-semibold text-green-700">{formatCurrency(chantier.montantHT)}</p>
            </div>
          </div>

          {/* Avancement */}
          {chantier.statut === "en_cours" && (
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Avancement</p>
                <p className="text-xs font-bold text-slate-700">{chantier.avancement}%</p>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${chantier.retard ? "bg-red-400" : "bg-green-500"}`}
                  style={{ width: `${chantier.avancement}%` }}
                />
              </div>
              {chantier.retard && (
                <p className="text-xs text-red-500 mt-1">⚠️ Chantier en retard</p>
              )}
            </div>
          )}

          {/* Notes */}
          {chantier.notes && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm text-slate-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
                {chantier.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="primary" size="sm">
              <FileText className="w-4 h-4" /> Voir le devis
            </Button>
            <Button variant="outline" size="sm">Éditer</Button>
            <Button variant="outline" size="sm">Photos / Notes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page Chantiers ───────────────────────────────────────────────────────────

export default function ChantiersPage() {
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState<ChantierStatut | "tous">("tous");
  const [selectedChantier, setSelectedChantier] = useState<Chantier | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [chantiers, setChantiers] = useState<Chantier[]>(mockChantiers);

  const handleChantierCreated = (chantier: Chantier) => {
    setChantiers((prev) => [chantier, ...prev]);
  };

  const filtered = chantiers.filter((c) => {
    const matchSearch =
      search === "" ||
      c.client.toLowerCase().includes(search.toLowerCase()) ||
      c.reference.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.ville.toLowerCase().includes(search.toLowerCase());
    const matchStatut = statutFilter === "tous" || c.statut === statutFilter;
    return matchSearch && matchStatut;
  });

  const totaux = {
    total: chantiers.length,
    enCours: chantiers.filter((c) => c.statut === "en_cours").length,
    retards: chantiers.filter((c) => c.retard).length,
    montantTotal: chantiers.reduce((acc, c) => acc + c.montantHT, 0),
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Chantiers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{totaux.total} chantiers · {totaux.enCours} en cours</p>
        </div>
        <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Créer un chantier
        </Button>
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total chantiers", value: String(totaux.total), color: "bg-slate-50 border-slate-200" },
          { label: "En cours", value: String(totaux.enCours), color: "bg-amber-50 border-amber-200" },
          { label: "En retard", value: String(totaux.retards), color: "bg-red-50 border-red-200" },
          { label: "CA total", value: formatCurrency(totaux.montantTotal), color: "bg-green-50 border-green-200" },
        ].map((k) => (
          <div key={k.label} className={`rounded-xl border p-4 ${k.color}`}>
            <p className="text-xs text-slate-500 font-medium">{k.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres & recherche */}
      <Card className="mb-6">
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un chantier, client, ville…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value as ChantierStatut | "tous")}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-slate-700"
              >
                <option value="tous">Tous les statuts</option>
                {CHANTIER_STATUTS.map((s) => (
                  <option key={s} value={s}>{STATUT_LABELS[s]}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
          </div>
        </CardContent>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="px-5 pb-4 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Technicien", placeholder: "Tous les techniciens" },
                { label: "Commercial", placeholder: "Tous les commerciaux" },
                { label: "Ville", placeholder: "Toutes les villes" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs text-slate-500 mb-1 block">{f.label}</label>
                  <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-slate-700">
                    <option>{f.placeholder}</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Tableau des chantiers */}
      <Card>
        <CardHeader>
          <p className="text-sm text-slate-500">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Référence", "Client / Type", "Ville", "Équipe", "Dates", "Montant HT", "Avancement", "Statut", ""].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedChantier(c)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">{c.reference}</span>
                      {c.retard && <span className="text-amber-500 text-xs">⚠️</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{c.client}</p>
                    <p className="text-xs text-slate-500">{c.type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {c.ville}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-slate-600 space-y-0.5">
                      {c.conducteur && <p>🦺 {c.conducteur}</p>}
                      {c.techniciens.slice(0, 1).map((t) => <p key={t}>🔧 {t}</p>)}
                      {c.techniciens.length > 1 && (
                        <p className="text-slate-400">+{c.techniciens.length - 1} autre(s)</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p>{formatDate(c.dateDebut)}</p>
                      <p className="text-slate-400">→ {formatDate(c.dateFin)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(c.montantHT)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {c.statut === "en_cours" ? (
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Avancement</span>
                          <span className={`font-medium ${c.retard ? "text-red-600" : "text-green-600"}`}>{c.avancement}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.retard ? "bg-red-400" : "bg-green-500"}`}
                            style={{ width: `${c.avancement}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUT_COLORS[c.statut]}`}>
                      {STATUT_LABELS[c.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        onClick={() => setSelectedChantier(c)}
                        title="Voir le détail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Plus d'actions">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <HardHat className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun chantier trouvé</p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal détail */}
      {selectedChantier && (
        <ChantierDetailModal
          chantier={selectedChantier}
          onClose={() => setSelectedChantier(null)}
        />
      )}

      {/* Modal création */}
      {createModalOpen && (
        <CreateChantierModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={handleChantierCreated}
        />
      )}
    </div>
  );
}

// Icône manquante importée directement
function HardHat({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" />
      <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
      <path d="M4 15v-3a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v3" />
    </svg>
  );
}
