"use client";

import { useState } from "react";
import {
  Palette,
  Building2,
  Users,
  FileText,
  Shield,
  Bell,
  CreditCard,
  ChevronRight,
  Check,
  Upload,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { mockCollaborateurs } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type SettingsTab =
  | "general"
  | "theme"
  | "collaborateurs"
  | "devis"
  | "notifications"
  | "abonnement";

const SIDEBAR_ITEMS = [
  { id: "general" as const, label: "Général", icon: Building2 },
  { id: "theme" as const, label: "Thème & apparence", icon: Palette },
  { id: "collaborateurs" as const, label: "Comptes & accès", icon: Users },
  { id: "devis" as const, label: "Pré-config devis", icon: FileText },
  { id: "notifications" as const, label: "Notifications", icon: Bell },
  { id: "abonnement" as const, label: "Abonnement", icon: CreditCard },
];

const COLORS_PRESET = [
  { label: "Vert (actuel)", value: "#16a34a" },
  { label: "Bleu", value: "#2563eb" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Orange", value: "#ea580c" },
  { label: "Rouge", value: "#dc2626" },
  { label: "Gris", value: "#475569" },
];

// ─── Sections de paramètres ───────────────────────────────────────────────────

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Informations générales</h2>
        <p className="text-sm text-slate-500">Configurez les informations de votre entreprise</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">Entreprise</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-2">Logo de l&apos;entreprise</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <Button variant="outline" size="sm">
                  <Upload className="w-3.5 h-3.5" />
                  Changer le logo
                </Button>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG ou SVG — max 2 Mo</p>
              </div>
            </div>
          </div>

          {/* Champs */}
          {[
            { label: "Nom de l'entreprise", value: "Bâtiment Dubois & Associés", type: "text" },
            { label: "Siret", value: "813 425 312 00024", type: "text" },
            { label: "Adresse", value: "45 route de la Soie, 69100 Villeurbanne", type: "text" },
            { label: "Téléphone", value: "04 72 11 22 33", type: "tel" },
            { label: "Email", value: "contact@dubois-batiment.fr", type: "email" },
            { label: "Site web", value: "www.dubois-batiment.fr", type: "text" },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-medium text-slate-600 block mb-1">{f.label}</label>
              <input
                type={f.type}
                defaultValue={f.value}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm">Sauvegarder</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">Mentions légales (devis & factures)</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            rows={4}
            defaultValue="TVA non applicable, art. 293 B du CGI. Conditions de paiement : 30 jours net. En cas de retard de paiement, des pénalités de retard seront appliquées au taux de 3 fois le taux d'intérêt légal."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
          <div className="flex justify-end">
            <Button variant="primary" size="sm">Sauvegarder</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeSettings() {
  const [selectedColor, setSelectedColor] = useState("#16a34a");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Thème & apparence</h2>
        <p className="text-sm text-slate-500">Personnalisez les couleurs et l&apos;affichage</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">Couleur principale</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {COLORS_PRESET.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedColor(c.value)}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-10 h-10 rounded-xl relative transition-transform group-hover:scale-110"
                  style={{ backgroundColor: c.value }}
                >
                  {selectedColor === c.value && (
                    <Check className="absolute inset-0 m-auto w-5 h-5 text-white" />
                  )}
                </div>
                <span className="text-xs text-slate-500">{c.label}</span>
              </button>
            ))}

            {/* Couleur personnalisée */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                <Plus className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-xs text-slate-500">Autre</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0"
              style={{ backgroundColor: selectedColor }}
            />
            <input
              type="text"
              value={selectedColor}
              readOnly
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white font-mono w-32"
            />
            <span className="text-sm text-slate-500">Couleur sélectionnée</span>
          </div>

          <div className="mt-4">
            <Button variant="primary" size="sm">Appliquer le thème</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">Mise en page sidebar</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Sidebar étendue",
                desc: "Labels + icônes",
                active: true,
                preview: (
                  <div className="flex h-16 rounded-lg overflow-hidden border border-slate-200">
                    <div className="w-14 bg-slate-800 flex flex-col gap-1 p-1.5">
                      <div className="h-1.5 bg-green-500 rounded" />
                      <div className="h-1.5 bg-slate-600 rounded" />
                      <div className="h-1.5 bg-slate-600 rounded" />
                    </div>
                    <div className="flex-1 bg-slate-50" />
                  </div>
                ),
              },
              {
                label: "Sidebar compacte",
                desc: "Icônes uniquement",
                active: false,
                preview: (
                  <div className="flex h-16 rounded-lg overflow-hidden border border-slate-200">
                    <div className="w-6 bg-slate-800 flex flex-col gap-1 p-1">
                      <div className="h-1 bg-green-500 rounded" />
                      <div className="h-1 bg-slate-600 rounded" />
                      <div className="h-1 bg-slate-600 rounded" />
                    </div>
                    <div className="flex-1 bg-slate-50" />
                  </div>
                ),
              },
            ].map((opt) => (
              <label
                key={opt.label}
                className={cn(
                  "border-2 rounded-xl p-3 cursor-pointer transition-colors",
                  opt.active ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"
                )}
              >
                {opt.preview}
                <div className="mt-2">
                  <p className="text-sm font-medium text-slate-800">{opt.label}</p>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CollaborateursSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Comptes & accès</h2>
        <p className="text-sm text-slate-500">Gérez les autorisations par collaborateur</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Collaborateurs ({mockCollaborateurs.length})</h3>
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              Inviter
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Collaborateur", "Rôle", "Accès", "Statut", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockCollaborateurs.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {c.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{c.prenom} {c.nom}</p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-700">{c.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700">
                      <option>Lecture seule</option>
                      <option selected={c.role.includes("Conducteur")}>Utilisateur standard</option>
                      <option selected={c.role.includes("Commercial") || c.role.includes("admin")}>Utilisateur avancé</option>
                      <option>Administrateur</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      c.disponibilite === "conge"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-green-100 text-green-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        c.disponibilite === "conge" ? "bg-slate-400" : "bg-green-500"
                      }`} />
                      {c.disponibilite === "conge" ? "Inactif" : "Actif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DevisSettings() {
  const [prestations, setPrestations] = useState([
    { id: "p1", label: "Main d'œuvre plomberie (h)", prix: 65 },
    { id: "p2", label: "Main d'œuvre électricité (h)", prix: 70 },
    { id: "p3", label: "Main d'œuvre maçonnerie (h)", prix: 55 },
    { id: "p4", label: "Déplacement forfait", prix: 40 },
    { id: "p5", label: "Location nacelle (j)", prix: 350 },
    { id: "p6", label: "Pose carrelage au m²", prix: 35 },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Pré-configuration des devis</h2>
        <p className="text-sm text-slate-500">Définissez vos prestations types et tarifs</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Catalogue de prestations</h3>
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              Ajouter une prestation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {prestations.map((p, i) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 last:border-0">
              <span className="text-slate-300 text-sm font-mono w-5">{i + 1}.</span>
              <input
                type="text"
                defaultValue={p.label}
                className="flex-1 text-sm text-slate-800 border border-transparent rounded-lg px-2 py-1 focus:outline-none focus:border-slate-200 focus:bg-slate-50"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  defaultValue={p.prix}
                  className="w-20 text-sm text-slate-800 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
                />
                <span className="text-sm text-slate-400">€ HT</span>
              </div>
              <button
                onClick={() => setPrestations((prev) => prev.filter((x) => x.id !== p.id))}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">Paramètres de facturation</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "TVA par défaut", type: "select", options: ["0% (non assujetti)", "5.5%", "10%", "20%"] },
            { label: "Validité des devis (jours)", type: "number", value: "30" },
            { label: "Numérotation devis", type: "text", value: "DEV-2024-{NNN}" },
            { label: "Numérotation factures", type: "text", value: "FAC-2024-{NNN}" },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-medium text-slate-600 block mb-1">{f.label}</label>
              {f.type === "select" ? (
                <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  {f.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={f.type}
                  defaultValue={f.value}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm">Sauvegarder</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Notifications</h2>
        <p className="text-sm text-slate-500">Choisissez ce que vous souhaitez recevoir</p>
      </div>

      {[
        {
          title: "Chantiers",
          items: [
            { label: "Chantier en retard", checked: true },
            { label: "Nouveau chantier créé", checked: true },
            { label: "Chantier terminé", checked: true },
            { label: "Document ajouté à un chantier", checked: false },
          ],
        },
        {
          title: "Devis & facturation",
          items: [
            { label: "Devis signé par le client", checked: true },
            { label: "Devis sans réponse depuis 7 jours", checked: true },
            { label: "Facture en retard de paiement", checked: true },
            { label: "Nouveau devis créé", checked: false },
          ],
        },
        {
          title: "Équipe",
          items: [
            { label: "Collaborateur absent non justifié", checked: false },
            { label: "Nouveau collaborateur invité", checked: true },
            { label: "Modification d'autorisation", checked: true },
          ],
        },
      ].map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800">{section.title}</h3>
          </CardHeader>
          <CardContent className="p-0">
            {section.items.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0"
              >
                <span className="text-sm text-slate-700">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-200 peer-checked:bg-green-500 rounded-full transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AbonnementSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Abonnement</h2>
        <p className="text-sm text-slate-500">Gérez votre abonnement et votre facturation</p>
      </div>

      {/* Plan actuel */}
      <Card className="border-green-200 bg-green-50">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-green-800">Plan Pro</span>
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">Actuel</span>
              </div>
              <p className="text-2xl font-bold text-green-900">89€ <span className="text-sm font-normal text-green-700">/ mois HT</span></p>
              <p className="text-xs text-green-700 mt-1">Facturé annuellement · Prochain renouvellement le 01/01/2025</p>
            </div>
            <Button variant="outline" size="sm">Gérer le plan</Button>
          </div>
        </CardContent>
      </Card>

      {/* Inclus */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">Ce qui est inclus</h3>
        </CardHeader>
        <CardContent className="p-0">
          {[
            "Utilisateurs illimités",
            "Chantiers illimités",
            "Devis & facturation",
            "Signature électronique",
            "Synchronisation agenda",
            "Support prioritaire",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-50 last:border-0">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-slate-700">{f}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Facturation */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">Historique de facturation</h3>
        </CardHeader>
        <CardContent className="p-0">
          {[
            { date: "01/04/2024", montant: "89€ HT", statut: "Payé" },
            { date: "01/03/2024", montant: "89€ HT", statut: "Payé" },
            { date: "01/02/2024", montant: "89€ HT", statut: "Payé" },
          ].map((f) => (
            <div key={f.date} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-700">{f.date}</span>
              <span className="text-sm font-medium text-slate-900">{f.montant}</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{f.statut}</span>
              <button className="text-xs text-slate-500 hover:text-green-700 underline">Télécharger</button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const contentMap: Record<SettingsTab, React.ReactNode> = {
    general: <GeneralSettings />,
    theme: <ThemeSettings />,
    collaborateurs: <CollaborateursSettings />,
    devis: <DevisSettings />,
    notifications: <NotificationsSettings />,
    abonnement: <AbonnementSettings />,
  };

  return (
    <div className="flex h-full">
      {/* Sidebar paramètres */}
      <aside className="w-56 border-r border-slate-200 bg-white px-3 py-6 flex-shrink-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 mb-3">
          Paramètres
        </p>
        <nav className="space-y-1">
          {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                activeTab === id
                  ? "bg-green-50 text-green-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
              {activeTab !== id && <ChevronRight className="w-3 h-3 ml-auto text-slate-300" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl">{contentMap[activeTab]}</div>
      </div>
    </div>
  );
}
