"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Building2,
  Star,
  Euro,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { mockContacts, type Contact } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";

const TYPE_CONFIG = {
  client: { label: "Client", color: "bg-green-100 text-green-700", icon: "👤" },
  fournisseur: { label: "Fournisseur", color: "bg-blue-100 text-blue-700", icon: "📦" },
  prestataire: { label: "Prestataire", color: "bg-purple-100 text-purple-700", icon: "🔧" },
  partenaire: { label: "Partenaire", color: "bg-amber-100 text-amber-700", icon: "🤝" },
} as const;

function ContactCard({
  contact,
  onClick,
}: {
  contact: Contact;
  onClick: () => void;
}) {
  const typeConf = TYPE_CONFIG[contact.type];

  return (
    <Card
      className="cursor-pointer hover:border-green-200 hover:shadow-md transition-all"
      onClick={onClick}
    >
      <CardContent>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
            {typeConf.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <p className="text-sm font-semibold text-slate-900 truncate">{contact.nom}</p>
                {contact.entreprise && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {contact.entreprise}
                  </p>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${typeConf.color}`}>
                {typeConf.label}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-500 mt-2">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span className="truncate">{contact.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" />
                {contact.telephone}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {contact.ville}
              </div>
            </div>

            {contact.chiffresAffaires && (
              <div className="flex items-center gap-1 mt-2 text-xs text-green-700 font-medium">
                <Euro className="w-3 h-3" />
                {formatCurrency(contact.chiffresAffaires)} de CA
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {contact.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContactDetail({
  contact,
  onClose,
}: {
  contact: Contact;
  onClose: () => void;
}) {
  const typeConf = TYPE_CONFIG[contact.type];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
            {typeConf.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{contact.nom}</h2>
            {contact.entreprise && (
              <p className="text-sm text-slate-500">{contact.entreprise}</p>
            )}
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${typeConf.color}`}>
              {typeConf.label}
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
              {[
                { icon: <Mail className="w-4 h-4 text-slate-400" />, value: contact.email, href: `mailto:${contact.email}` },
                { icon: <Phone className="w-4 h-4 text-slate-400" />, value: contact.telephone },
                { icon: <MapPin className="w-4 h-4 text-slate-400" />, value: `${contact.adresse}, ${contact.ville}` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                  {item.icon}
                  {item.href ? (
                    <a href={item.href} className="text-green-700 hover:underline">{item.value}</a>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CA si client/fournisseur */}
          {contact.chiffresAffaires && (
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Chiffre d&apos;affaires total</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(contact.chiffresAffaires)}</p>
            </div>
          )}

          {/* Tags */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag) => (
                <span key={tag} className="bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          {contact.notes && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Notes</p>
              <p className="text-sm text-slate-700 bg-amber-50 border border-amber-100 rounded-xl p-3 leading-relaxed">
                {contact.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="primary" size="sm">
              <Mail className="w-3.5 h-3.5" />
              Envoyer un email
            </Button>
            <Button variant="outline" size="sm">Éditer</Button>
            <Button variant="outline" size="sm">Voir les chantiers</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("tous");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = mockContacts.filter((c) => {
    const matchSearch =
      search === "" ||
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      (c.entreprise ?? "").toLowerCase().includes(search.toLowerCase()) ||
      c.ville.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === "tous" || c.type === typeFilter;
    return matchSearch && matchType;
  });

  const stats = {
    total: mockContacts.length,
    clients: mockContacts.filter((c) => c.type === "client").length,
    fournisseurs: mockContacts.filter((c) => c.type === "fournisseur").length,
    prestataires: mockContacts.filter((c) => c.type === "prestataire").length,
    partenaires: mockContacts.filter((c) => c.type === "partenaire").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Contacts</h1>
          <p className="text-sm text-slate-500 mt-0.5">{stats.total} contacts répertoriés</p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4" />
          Ajouter un contact
        </Button>
      </div>

      {/* Stats par type */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Clients", count: stats.clients, icon: "👤", color: "bg-green-50 border-green-100 text-green-700" },
          { label: "Fournisseurs", count: stats.fournisseurs, icon: "📦", color: "bg-blue-50 border-blue-100 text-blue-700" },
          { label: "Prestataires", count: stats.prestataires, icon: "🔧", color: "bg-purple-50 border-purple-100 text-purple-700" },
          { label: "Partenaires", count: stats.partenaires, icon: "🤝", color: "bg-amber-50 border-amber-100 text-amber-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-bold">{s.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardContent className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Nom, entreprise, ville, tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "tous", label: "Tous" },
              { value: "client", label: "👤 Clients" },
              { value: "fournisseur", label: "📦 Fournisseurs" },
              { value: "prestataire", label: "🔧 Prestataires" },
              { value: "partenaire", label: "🤝 Partenaires" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  typeFilter === f.value
                    ? "bg-green-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      <p className="text-xs text-slate-500 mb-4">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <ContactCard key={c.id} contact={c} onClick={() => setSelected(c)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">Aucun contact trouvé</p>
        </div>
      )}

      {selected && (
        <ContactDetail contact={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
