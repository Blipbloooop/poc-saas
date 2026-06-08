"use client";

import { useState, useEffect } from "react";
import {
  Palette,
  Building2,
  Users,
  FileText,
  Bell,
  CreditCard,
  ChevronRight,
  Check,
  Upload,
  Plus,
  Trash2,
  BookOpen,
  UserCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useTheme } from "@/components/shared/ThemeProvider";
import { authClient } from "@/lib/auth-client";
import { getUsers, type UserSummary } from "@/server/actions/users";
import { getPrestations, createPrestation, updatePrestation, deletePrestation, type PrestationRow } from "@/server/actions/prestations";
import { cn } from "@/lib/utils";

type SettingsTab =
  | "profil"
  | "general"
  | "theme"
  | "collaborateurs"
  | "prestations"
  | "notifications"
  | "abonnement";

const SIDEBAR_ITEMS = [
  { id: "profil" as const, label: "Mon profil", icon: UserCircle },
  { id: "general" as const, label: "Général", icon: Building2 },
  { id: "theme" as const, label: "Thème & apparence", icon: Palette },
  { id: "collaborateurs" as const, label: "Comptes & accès", icon: Users },
  { id: "prestations" as const, label: "Catalogue prestations", icon: BookOpen },
  { id: "notifications" as const, label: "Notifications", icon: Bell },
  { id: "abonnement" as const, label: "Abonnement", icon: CreditCard },
];

const COLORS_PRESET = [
  { label: "Vert", value: "#16a34a" },
  { label: "Bleu", value: "#2563eb" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Orange", value: "#ea580c" },
  { label: "Rouge", value: "#dc2626" },
  { label: "Gris", value: "#475569" },
];

const COLORS_SECONDARY_PRESET = [
  { label: "Ardoise", value: "#0f172a" },
  { label: "Gris foncé", value: "#1e293b" },
  { label: "Zinc", value: "#27272a" },
  { label: "Neutre", value: "#171717" },
  { label: "Marron", value: "#292524" },
  { label: "Indigo", value: "#1e1b4b" },
];

// ─── Sections de paramètres ───────────────────────────────────────────────────

function ProfilSettings() {
  const { data: session, refetch } = authClient.useSession();
  const { primaryColor } = useTheme();

  const [name, setName] = useState(session?.user?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Sync quand la session charge
  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.name]);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setStatus("idle");

    const { error } = await authClient.updateUser({ name: name.trim() });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message ?? "Une erreur est survenue");
    } else {
      setStatus("success");
      await refetch();
    }
    setLoading(false);
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Mon profil</h2>
        <p className="text-sm text-slate-500">Gérez vos informations personnelles</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{name || "—"}</p>
              <p className="text-xs text-slate-500 mt-0.5">{session?.user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {status === "success" && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700 flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                Profil mis à jour avec succès
              </div>
            )}
            {status === "error" && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Prénom Nom"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email ?? ""}
                readOnly
                className="bg-slate-50 cursor-not-allowed opacity-70"
              />
              <p className="text-xs text-slate-400">
                La modification de l&apos;email sera disponible prochainement.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Sauvegarder"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Informations générales
        </h2>
        <p className="text-sm text-slate-500">
          Configurez les informations de votre entreprise
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">Entreprise</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-2">
              Logo de l&apos;entreprise
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-(--primary)">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <Button variant="outline" size="sm">
                  <Upload className="w-3.5 h-3.5" />
                  Changer le logo
                </Button>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG ou SVG — max 2 Mo
                </p>
              </div>
            </div>
          </div>

          {[
            {
              label: "Nom de l'entreprise",
              value: "Bâtiment Dubois & Associés",
              type: "text",
            },
            { label: "Siret", value: "813 425 312 00024", type: "text" },
            {
              label: "Adresse",
              value: "45 route de la Soie, 69100 Villeurbanne",
              type: "text",
            },
            { label: "Téléphone", value: "04 72 11 22 33", type: "tel" },
            {
              label: "Email",
              value: "contact@dubois-batiment.fr",
              type: "email",
            },
            {
              label: "Site web",
              value: "www.dubois-batiment.fr",
              type: "text",
            },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                {f.label}
              </label>
              <input
                type={f.type}
                defaultValue={f.value}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white"
              />
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm">
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">
            Mentions légales (devis & factures)
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            rows={4}
            defaultValue="TVA non applicable, art. 293 B du CGI. Conditions de paiement : 30 jours net. En cas de retard de paiement, des pénalités de retard seront appliquées au taux de 3 fois le taux d'intérêt légal."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) resize-none"
          />
          <div className="flex justify-end">
            <Button variant="primary" size="sm">
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeSettings() {
  const { primaryColor, secondaryColor, sidebarCompact, applyTheme } =
    useTheme();
  const [selectedColor, setSelectedColor] = useState(primaryColor);
  const [selectedSecondary, setSelectedSecondary] = useState(secondaryColor);
  const [selectedCompact, setSelectedCompact] = useState(sidebarCompact);
  const [applied, setApplied] = useState(false);

  // Sync avec le contexte au montage (après hydratation localStorage)
  useEffect(() => {
    setSelectedColor(primaryColor);
    setSelectedSecondary(secondaryColor);
    setSelectedCompact(sidebarCompact);
  }, [primaryColor, secondaryColor, sidebarCompact]);

  const handleApply = () => {
    applyTheme(selectedColor, selectedSecondary, selectedCompact);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  const handleColorInput = (val: string) => {
    // Accepte saisie hex en cours de frappe
    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
      setSelectedColor(val);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Thème & apparence
        </h2>
        <p className="text-sm text-slate-500">
          Personnalisez les couleurs et l&apos;affichage
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">
            Couleur principale
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {COLORS_PRESET.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedColor(c.value)}
                className="flex flex-col items-center gap-2 group"
                title={c.label}
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

            {/* Couleur personnalisée via color picker natif */}
            <div className="flex flex-col items-center gap-2">
              <label className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer relative overflow-hidden hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  title="Choisir une couleur"
                />
              </label>
              <span className="text-xs text-slate-500">Autre</span>
            </div>
          </div>

          {/* Aperçu + input hex */}
          <div className="mt-4 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0 border border-slate-200"
              style={{ backgroundColor: selectedColor }}
            />
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => handleColorInput(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white font-mono w-28"
              maxLength={7}
              spellCheck={false}
            />
            <span className="text-sm text-slate-500">Couleur sélectionnée</span>
          </div>

          {/* Aperçu live */}
          <div className="mt-4 p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: selectedColor }}
            >
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div
              className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
              style={{ backgroundColor: selectedColor }}
            >
              Bouton primaire
            </div>
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                color: selectedColor,
                backgroundColor: selectedColor + "1a",
                border: `1px solid ${selectedColor}40`,
              }}
            >
              Badge actif
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">
            Couleur secondaire (sidebar, textes)
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {COLORS_SECONDARY_PRESET.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedSecondary(c.value)}
                className="flex flex-col items-center gap-2 group"
                title={c.label}
              >
                <div
                  className="w-10 h-10 rounded-xl relative transition-transform group-hover:scale-110"
                  style={{ backgroundColor: c.value }}
                >
                  {selectedSecondary === c.value && (
                    <Check className="absolute inset-0 m-auto w-5 h-5 text-white" />
                  )}
                </div>
                <span className="text-xs text-slate-500">{c.label}</span>
              </button>
            ))}

            <div className="flex flex-col items-center gap-2">
              <label className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer relative overflow-hidden hover:scale-110 transition-transform">
                <Plus className="w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="color"
                  value={selectedSecondary}
                  onChange={(e) => setSelectedSecondary(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  title="Choisir une couleur"
                />
              </label>
              <span className="text-xs text-slate-500">Autre</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg shrink-0 border border-slate-200"
              style={{ backgroundColor: selectedSecondary }}
            />
            <input
              type="text"
              value={selectedSecondary}
              onChange={(e) => {
                if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                  setSelectedSecondary(e.target.value);
                }
              }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white font-mono w-28"
              maxLength={7}
              spellCheck={false}
            />
            <span className="text-sm text-slate-500">Couleur sélectionnée</span>
          </div>

          <div className="mt-4 p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: selectedSecondary }}
            >
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div
              className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
              style={{ backgroundColor: selectedSecondary }}
            >
              Sidebar
            </div>
            <span className="text-xs text-slate-500">
              Aperçu couleur secondaire
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">
            Mise en page sidebar
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Sidebar étendue",
                desc: "Labels + icônes",
                compact: false,
                preview: (
                  <div className="flex h-16 rounded-lg overflow-hidden border border-slate-200">
                    <div className="w-14 bg-slate-800 flex flex-col gap-1 p-1.5">
                      <div
                        className="h-1.5 rounded"
                        style={{ backgroundColor: selectedColor }}
                      />
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
                compact: true,
                preview: (
                  <div className="flex h-16 rounded-lg overflow-hidden border border-slate-200">
                    <div className="w-6 bg-slate-800 flex flex-col gap-1 p-1">
                      <div
                        className="h-1 rounded"
                        style={{ backgroundColor: selectedColor }}
                      />
                      <div className="h-1 bg-slate-600 rounded" />
                      <div className="h-1 bg-slate-600 rounded" />
                    </div>
                    <div className="flex-1 bg-slate-50" />
                  </div>
                ),
              },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setSelectedCompact(opt.compact)}
                className={cn(
                  "border-2 rounded-xl p-3 cursor-pointer transition-all text-left",
                  selectedCompact === opt.compact
                    ? "shadow-sm"
                    : "border-slate-200 hover:border-slate-300",
                )}
                style={
                  selectedCompact === opt.compact
                    ? {
                        borderColor: selectedColor,
                        backgroundColor: selectedColor + "0d",
                      }
                    : {}
                }
              >
                {opt.preview}
                <div className="mt-2">
                  <p className="text-sm font-medium text-slate-800">
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bouton d'application */}
      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" onClick={handleApply}>
          Appliquer le thème
        </Button>
        {applied && (
          <span
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: primaryColor }}
          >
            <Check className="w-4 h-4" />
            Thème appliqué !
          </span>
        )}
      </div>
    </div>
  );
}

function CollaborateursSettings() {
  const { primaryColor } = useTheme();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Administrateur",
    MEMBER: "Membre",
    VIEWER: "Lecteur",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Comptes & accès</h2>
        <p className="text-sm text-slate-500">Gérez les utilisateurs inscrits</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">
            Utilisateurs {!loading && `(${users.length})`}
          </h3>
        </CardHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Aucun utilisateur</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Utilisateur", "Rôle", "Statut"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700">{ROLE_LABELS[u.role] ?? u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Actif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Pré-configuration des devis
        </h2>
        <p className="text-sm text-slate-500">
          Définissez vos prestations types et tarifs
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Catalogue de prestations
            </h3>
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              Ajouter une prestation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {prestations.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 last:border-0"
            >
              <span className="text-slate-300 text-sm font-mono w-5">
                {i + 1}.
              </span>
              <input
                type="text"
                defaultValue={p.label}
                className="flex-1 text-sm text-slate-800 border border-transparent rounded-lg px-2 py-1 focus:outline-none focus:border-slate-200 focus:bg-slate-50"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  defaultValue={p.prix}
                  className="w-20 text-sm text-slate-800 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-(--primary) text-right"
                />
                <span className="text-sm text-slate-400">€ HT</span>
              </div>
              <button
                onClick={() =>
                  setPrestations((prev) => prev.filter((x) => x.id !== p.id))
                }
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
          <h3 className="text-sm font-semibold text-slate-800">
            Paramètres de facturation
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              label: "TVA par défaut",
              type: "select",
              options: ["0% (non assujetti)", "5.5%", "10%", "20%"],
            },
            {
              label: "Validité des devis (jours)",
              type: "number",
              value: "30",
            },
            {
              label: "Numérotation devis",
              type: "text",
              value: "DEV-2024-{NNN}",
            },
            {
              label: "Numérotation factures",
              type: "text",
              value: "FAC-2024-{NNN}",
            },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                {f.label}
              </label>
              {f.type === "select" ? (
                <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white">
                  {f.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type}
                  defaultValue={f.value}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm">
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PrestationsSettings() {
  const { primaryColor } = useTheme();
  const [rows, setRows] = useState<PrestationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", description: "", prix: "", unite: "forfait", tva: "20" });
  const [saving, setSaving] = useState(false);
  const UNITE_OPTIONS = ["forfait", "h", "j", "m²", "ml", "u", "m³", "kg"];

  useEffect(() => {
    getPrestations().then(setRows).finally(() => setLoading(false));
  }, []);

  const resetForm = () => setForm({ label: "", description: "", prix: "", unite: "forfait", tva: "20" });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = { label: form.label, description: form.description || undefined, prix: parseFloat(form.prix) || 0, unite: form.unite, tva: parseFloat(form.tva) || 20 };
    if (editId) {
      const r = await updatePrestation(editId, data);
      if (r.success) { setRows((p) => p.map((x) => x.id === editId ? r.data : x)); setEditId(null); resetForm(); }
    } else {
      const r = await createPrestation(data);
      if (r.success) { setRows((p) => [...p, r.data]); resetForm(); }
    }
    setSaving(false);
  };

  const handleEdit = (p: PrestationRow) => {
    setEditId(p.id);
    setForm({ label: p.label, description: p.description ?? "", prix: String(p.prix), unite: p.unite, tva: String(p.tva) });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette prestation ?")) return;
    await deletePrestation(id);
    setRows((p) => p.filter((x) => x.id !== id));
  };

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Catalogue de prestations</h2>
        <p className="text-sm text-slate-500">Préenregistrez vos tarifs pour les utiliser dans vos devis</p>
      </div>

      {/* Formulaire */}
      <Card>
        <CardHeader><h3 className="text-sm font-semibold text-slate-800">{editId ? "Modifier la prestation" : "Nouvelle prestation"}</h3></CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-600 block mb-1">Désignation *</label>
                <input required className={inputCls} value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="Main d'œuvre plomberie (h)" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-600 block mb-1">Description (optionnel)</label>
                <input className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Détails…" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Prix unitaire HT (€) *</label>
                <input required type="number" min={0} step="0.01" className={inputCls} value={form.prix} onChange={(e) => set("prix", e.target.value)} placeholder="65" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Unité</label>
                <select className={inputCls} value={form.unite} onChange={(e) => set("unite", e.target.value)}>
                  {UNITE_OPTIONS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">TVA (%)</label>
                <select className={inputCls} value={form.tva} onChange={(e) => set("tva", e.target.value)}>
                  {[0, 5.5, 10, 20].map((t) => <option key={t} value={t}>{t}%</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              {editId && (
                <button type="button" onClick={() => { setEditId(null); resetForm(); }} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700">Annuler</button>
              )}
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editId ? "Enregistrer" : "Ajouter"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-400"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current" /></div>
      ) : rows.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-6">Aucune prestation enregistrée</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            {rows.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{p.label}</p>
                  {p.description && <p className="text-xs text-slate-400">{p.description}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-900">{p.prix.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</p>
                  <p className="text-xs text-slate-400">/{p.unite} · TVA {p.tva}%</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-xs">✏️</button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NotificationsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Notifications</h2>
        <p className="text-sm text-slate-500">
          Choisissez ce que vous souhaitez recevoir
        </p>
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
            <h3 className="text-sm font-semibold text-slate-800">
              {section.title}
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            {section.items.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0"
              >
                <span className="text-sm text-slate-700">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={item.checked}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-checked:bg-(--primary) rounded-full transition-colors" />
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
        <p className="text-sm text-slate-500">
          Gérez votre abonnement et votre facturation
        </p>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-green-800">
                  Plan Pro
                </span>
                <span className="bg-(--primary) text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  Actuel
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                89€{" "}
                <span className="text-sm font-normal text-green-700">
                  / mois HT
                </span>
              </p>
              <p className="text-xs text-green-700 mt-1">
                Facturé annuellement · Prochain renouvellement le 01/01/2025
              </p>
            </div>
            <Button variant="outline" size="sm">
              Gérer le plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">
            Ce qui est inclus
          </h3>
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
            <div
              key={f}
              className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-50 last:border-0"
            >
              <Check className="w-4 h-4 shrink-0 text-(--primary)" />
              <span className="text-sm text-slate-700">{f}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">
            Historique de facturation
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          {[
            { date: "01/04/2024", montant: "89€ HT", statut: "Payé" },
            { date: "01/03/2024", montant: "89€ HT", statut: "Payé" },
            { date: "01/02/2024", montant: "89€ HT", statut: "Payé" },
          ].map((f) => (
            <div
              key={f.date}
              className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0"
            >
              <span className="text-sm text-slate-700">{f.date}</span>
              <span className="text-sm font-medium text-slate-900">
                {f.montant}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {f.statut}
              </span>
              <button className="text-xs text-slate-500 hover:text-(--primary) underline">
                Télécharger
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profil");
  const { primaryColor } = useTheme();

  const contentMap: Record<SettingsTab, React.ReactNode> = {
    profil: <ProfilSettings />,
    general: <GeneralSettings />,
    theme: <ThemeSettings />,
    prestations: <PrestationsSettings />,
    collaborateurs: <CollaborateursSettings />,
    notifications: <NotificationsSettings />,
    abonnement: <AbonnementSettings />,
  };

  return (
    <div className="flex h-full">
      {/* Sidebar paramètres */}
      <aside className="w-56 border-r border-slate-200 bg-white px-3 py-6 shrink-0">
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
                  ? "text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
              style={activeTab === id ? { backgroundColor: primaryColor } : {}}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {activeTab !== id && (
                <ChevronRight className="w-3 h-3 ml-auto text-slate-300" />
              )}
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
