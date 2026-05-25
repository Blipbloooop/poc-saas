"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  Shield,
  Car,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { mockCollaborateurs, type Collaborateur } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const DISPO_CONFIG = {
  disponible: { label: "Disponible", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  en_chantier: { label: "En chantier", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  absent: { label: "Absent", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  conge: { label: "En congé", color: "bg-blue-100 text-blue-700", dot: "bg-blue-400" },
} as const;

function CollaborateurCard({
  collab,
  onClick,
}: {
  collab: Collaborateur;
  onClick: () => void;
}) {
  const dispo = DISPO_CONFIG[collab.disponibilite];
  return (
    <Card
      className="cursor-pointer hover:border-green-200 hover:shadow-md transition-all"
      onClick={onClick}
    >
      <CardContent>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {collab.avatar}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${dispo.dot}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {collab.prenom} {collab.nom}
                </p>
                <p className="text-xs text-slate-500">{collab.role}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${dispo.color}`}>
                {dispo.label}
              </span>
            </div>

            {collab.chantierActuel && (
              <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg mt-2">
                📍 {collab.chantierActuel}
              </p>
            )}

            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {collab.telephone}
              </span>
              {collab.permis && (
                <span className="flex items-center gap-1 text-green-600">
                  <Car className="w-3 h-3" />
                  Permis B
                </span>
              )}
            </div>

            {/* Compétences */}
            <div className="flex flex-wrap gap-1 mt-2">
              {collab.competences.slice(0, 3).map((c) => (
                <span key={c} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                  {c}
                </span>
              ))}
              {collab.competences.length > 3 && (
                <span className="bg-slate-100 text-slate-400 text-xs px-2 py-0.5 rounded-full">
                  +{collab.competences.length - 3}
                </span>
              )}
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}

function CollaborateurDetail({
  collab,
  onClose,
}: {
  collab: Collaborateur;
  onClose: () => void;
}) {
  const dispo = DISPO_CONFIG[collab.disponibilite];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {collab.avatar}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">
              {collab.prenom} {collab.nom}
            </h2>
            <p className="text-sm text-slate-500">{collab.role}</p>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${dispo.color}`}>
              {dispo.label}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Coordonnées */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Coordonnées</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${collab.email}`} className="text-green-700 hover:underline">
                  {collab.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" />
                {collab.telephone}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                Entrée le {collab.dateEntree}
              </div>
              {collab.permis && (
                <div className="flex items-center gap-3 text-sm text-green-700">
                  <Car className="w-4 h-4 text-green-500" />
                  Permis B valide
                </div>
              )}
            </div>
          </div>

          {/* Compétences */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Compétences</p>
            <div className="flex flex-wrap gap-2">
              {collab.competences.map((c) => (
                <span key={c} className="bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1.5 rounded-lg font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Autorisations CRM */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              <Shield className="w-3 h-3 inline mr-1" />
              Autorisations CRM
            </p>
            <div className="space-y-2">
              {[
                { label: "Voir les chantiers", active: true },
                { label: "Modifier les chantiers", active: collab.role.includes("Conducteur") },
                { label: "Accès aux devis", active: collab.role.includes("Commercial") || collab.role.includes("admin") },
                { label: "Accès à la facturation", active: collab.role.includes("administratif") || collab.role.includes("admin") },
                { label: "Gestion des collaborateurs", active: false },
                { label: "Paramètres du compte", active: false },
              ].map((perm) => (
                <div key={perm.label} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-sm text-slate-700">{perm.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={perm.active} className="sr-only peer" readOnly />
                    <div className="w-9 h-5 bg-slate-200 peer-checked:bg-green-500 rounded-full transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Agenda</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-3 h-3" />
                Voir l&apos;agenda Outlook
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-3 h-3" />
                Synchroniser Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollaborateursPage() {
  const [search, setSearch] = useState("");
  const [filterDispo, setFilterDispo] = useState<string>("tous");
  const [selected, setSelected] = useState<Collaborateur | null>(null);

  const filtered = mockCollaborateurs.filter((c) => {
    const matchSearch =
      search === "" ||
      `${c.prenom} ${c.nom}`.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchDispo = filterDispo === "tous" || c.disponibilite === filterDispo;
    return matchSearch && matchDispo;
  });

  const stats = {
    total: mockCollaborateurs.length,
    disponible: mockCollaborateurs.filter((c) => c.disponibilite === "disponible").length,
    enChantier: mockCollaborateurs.filter((c) => c.disponibilite === "en_chantier").length,
    absent: mockCollaborateurs.filter((c) => c.disponibilite === "absent" || c.disponibilite === "conge").length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Collaborateurs</h1>
          <p className="text-sm text-slate-500 mt-0.5">{stats.total} membres dans l&apos;équipe</p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4" />
          Ajouter un collaborateur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-slate-700", bg: "bg-slate-50" },
          { label: "Disponibles", value: stats.disponible, color: "text-green-700", bg: "bg-green-50" },
          { label: "En chantier", value: stats.enChantier, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Absents", value: stats.absent, color: "text-red-700", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Nom, rôle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "tous", label: "Tous" },
            { value: "disponible", label: "Disponibles" },
            { value: "en_chantier", label: "En chantier" },
            { value: "absent", label: "Absents" },
            { value: "conge", label: "Congés" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterDispo(f.value)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                filterDispo === f.value
                  ? "bg-green-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <CollaborateurCard key={c.id} collab={c} onClick={() => setSelected(c)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-sm">Aucun collaborateur trouvé</p>
        </div>
      )}

      {selected && (
        <CollaborateurDetail collab={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
