"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Palette,
  Building2,
  Users,
  FileText,
  Bell,
  CreditCard,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  BookOpen,
  UserCircle,
  Loader2,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Dialog } from "@/components/ui/Dialog";
import { useTheme } from "@/components/shared/ThemeProvider";
import { authClient } from "@/lib/auth-client";
import { translateAuthError } from "@/lib/auth-errors";
import { getUsers, type UserSummary } from "@/server/actions/users";
import {
  getOrganizationInvitations,
  attachInvitationDetails,
  type InvitationSummary,
} from "@/server/actions/invitations";
import {
  getPrestations,
  createPrestation,
  updatePrestation,
  deletePrestation,
  type PrestationRow,
} from "@/server/actions/prestations";
import {
  getMyCompanyProfile,
  updateCompanyProfile,
  updateOrganizationLogo,
} from "@/server/actions/company-profile";
import {
  ACTIVITES,
  EFFECTIFS,
  type Activite,
  type Effectif,
} from "@/lib/constants/company";
import {
  PRIMARY_COLOR_PRESETS,
  SECONDARY_COLOR_PRESETS,
} from "@/lib/constants/theme";
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
  {
    id: "prestations" as const,
    label: "Catalogue prestations",
    icon: BookOpen,
  },
  { id: "notifications" as const, label: "Notifications", icon: Bell },
  { id: "abonnement" as const, label: "Abonnement", icon: CreditCard },
];

const COLORS_PRESET = PRIMARY_COLOR_PRESETS;
const COLORS_SECONDARY_PRESET = SECONDARY_COLOR_PRESETS;

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

  const initials =
    name
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
        <p className="text-sm text-slate-500">
          Gérez vos informations personnelles
        </p>
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
              <p className="text-sm font-semibold text-slate-800">
                {name || "—"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {session?.user?.email}
              </p>
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
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={loading}
              >
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
  const {
    setOrganizationLogo,
    setOrganizationName: setSidebarOrganizationName,
  } = useTheme();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activite, setActivite] = useState<Activite | "">("");
  const [activitePrecision, setActivitePrecision] = useState("");
  const [effectif, setEffectif] = useState<Effectif | "">("");
  const [siren, setSiren] = useState("");
  const [siret, setSiret] = useState("");
  const [adresse, setAdresse] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [ville, setVille] = useState("");
  const [tva, setTva] = useState("");
  const [mentionsLegales, setMentionsLegales] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [savingMentions, setSavingMentions] = useState(false);
  const [mentionsStatus, setMentionsStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  useEffect(() => {
    getMyCompanyProfile().then((result) => {
      if (result) {
        setOrganizationId(result.organizationId);
        setOrganizationName(result.organizationName);
        setLogoUrl(result.organizationLogo);
        if (result.profile) {
          setActivite(result.profile.activite);
          setActivitePrecision(result.profile.activitePrecision ?? "");
          setEffectif(result.profile.effectif ?? "");
          setSiren(result.profile.siren ?? "");
          setSiret(result.profile.siret ?? "");
          setAdresse(result.profile.adresse ?? "");
          setCodePostal(result.profile.codePostal ?? "");
          setVille(result.profile.ville ?? "");
          setTva(result.profile.tvaIntracommunautaire ?? "");
          setMentionsLegales(result.profile.mentionsLegales ?? "");
        }
      }
      setLoading(false);
    });
  }, []);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "logo");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Échec de l'envoi");

      const result = await updateOrganizationLogo(json.url);
      if (result.success) {
        setLogoUrl(result.data.logo);
        setOrganizationLogo(result.data.logo);
      }
    } catch {
      // L'erreur logo n'empêche pas le reste des paramètres de fonctionner
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSave() {
    if (!organizationId || !activite) return;
    setSaving(true);
    setStatus("idle");

    const { error: orgError } = await authClient.organization.update({
      organizationId,
      data: { name: organizationName },
    });

    const profileResult = await updateCompanyProfile({
      organizationId,
      activite,
      activitePrecision: activitePrecision || undefined,
      effectif: effectif || undefined,
      siren: siren || undefined,
      siret: siret || undefined,
      adresse: adresse || undefined,
      codePostal: codePostal || undefined,
      ville: ville || undefined,
      tvaIntracommunautaire: tva || undefined,
    });

    if (orgError || !profileResult.success) {
      setStatus("error");
      setErrorMsg(
        orgError?.message ??
          (!profileResult.success ? profileResult.error : ""),
      );
    } else {
      setStatus("success");
      setSidebarOrganizationName(organizationName);
    }
    setSaving(false);
    setTimeout(() => setStatus("idle"), 3000);
  }

  async function handleSaveMentionsLegales() {
    if (!organizationId || !activite) return;
    setSavingMentions(true);
    setMentionsStatus("idle");

    const result = await updateCompanyProfile({
      organizationId,
      activite,
      mentionsLegales,
    });
    setMentionsStatus(result.success ? "success" : "error");
    setSavingMentions(false);
    setTimeout(() => setMentionsStatus("idle"), 3000);
  }

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
          {loading ? (
            <div className="flex justify-center py-8 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Logo de l&apos;entreprise
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt="Logo"
                        width={64}
                        height={64}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <label>
                      <Button variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">
                          {uploadingLogo ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          Changer le logo
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoChange}
                        disabled={uploadingLogo}
                      />
                    </label>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG, WEBP ou SVG — max 2 Mo
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Nom de l&apos;entreprise
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Activité
                </label>
                <select
                  value={activite}
                  onChange={(e) => setActivite(e.target.value as Activite)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white"
                >
                  <option value="">Sélectionnez une activité</option>
                  {ACTIVITES.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
                {activite === "AUTRE" && (
                  <input
                    type="text"
                    placeholder="Précisez votre activité"
                    value={activitePrecision}
                    onChange={(e) => setActivitePrecision(e.target.value)}
                    className="w-full mt-2 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">
                  Taille de l&apos;équipe
                </label>
                <select
                  value={effectif}
                  onChange={(e) => setEffectif(e.target.value as Effectif)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white"
                >
                  <option value="">Non renseigné</option>
                  {EFFECTIFS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    SIREN
                  </label>
                  <input
                    type="text"
                    value={siren}
                    onChange={(e) => setSiren(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={codePostal}
                    onChange={(e) => setCodePostal(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  TVA intracommunautaire
                </label>
                <input
                  type="text"
                  value={tva}
                  onChange={(e) => setTva(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) bg-white"
                />
              </div>

              {status === "success" && (
                <p className="text-xs text-emerald-600">
                  Informations enregistrées
                </p>
              )}
              {status === "error" && (
                <p className="text-xs text-red-600">{errorMsg}</p>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || !activite}
                >
                  {saving ? "Enregistrement..." : "Sauvegarder"}
                </Button>
              </div>
            </>
          )}
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
            value={mentionsLegales}
            onChange={(e) => setMentionsLegales(e.target.value)}
            placeholder="TVA non applicable, art. 293 B du CGI. Conditions de paiement : 30 jours net…"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary) resize-none"
          />
          {mentionsStatus === "success" && (
            <p className="text-xs text-emerald-600">
              Mentions légales enregistrées
            </p>
          )}
          {mentionsStatus === "error" && (
            <p className="text-xs text-red-600">Une erreur est survenue</p>
          )}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveMentionsLegales}
              disabled={savingMentions}
            >
              {savingMentions ? "Enregistrement..." : "Sauvegarder"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeSettings() {
  const { primaryColor, secondaryColor, applyTheme } = useTheme();
  const [selectedColor, setSelectedColor] = useState(primaryColor);
  const [selectedSecondary, setSelectedSecondary] = useState(secondaryColor);
  const [applied, setApplied] = useState(false);

  // Sync avec le contexte au montage (après hydratation localStorage)
  useEffect(() => {
    setSelectedColor(primaryColor);
    setSelectedSecondary(secondaryColor);
  }, [primaryColor, secondaryColor]);

  const handleApply = () => {
    applyTheme(selectedColor, selectedSecondary);
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

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  member: "Membre",
  owner: "Propriétaire",
};

const EMPTY_INVITE_FORM = { prenom: "", nom: "", email: "", telephone: "", role: "member" as "admin" | "member" };

function CollaborateursSettings() {
  const { primaryColor } = useTheme();
  const { data: session } = authClient.useSession();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState(EMPTY_INVITE_FORM);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  function reloadAfterInvite() {
    setLoading(true);
    Promise.all([getUsers(), getOrganizationInvitations()])
      .then(([u, inv]) => {
        setUsers(u);
        setInvitations(inv);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    Promise.all([getUsers(), getOrganizationInvitations()])
      .then(([u, inv]) => {
        setUsers(u);
        setInvitations(inv);
      })
      .finally(() => setLoading(false));
  }, []);

  const currentRole = users.find((u) => u.id === session?.user?.id)?.role;
  const canInvite = currentRole === "admin";

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  function openInviteDialog() {
    setInviteForm(EMPTY_INVITE_FORM);
    setInviteError(null);
    setInviteOpen(true);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError(null);
    try {
      const { data: invitation, error: inviteErr } = await authClient.organization.inviteMember({
        email: inviteForm.email,
        role: inviteForm.role,
      });
      if (inviteErr || !invitation) throw new Error(translateAuthError(inviteErr?.message));

      await attachInvitationDetails({
        invitationId: invitation.id,
        prenom: inviteForm.prenom,
        nom: inviteForm.nom,
        telephone: inviteForm.telephone,
      });

      setInviteOpen(false);
      setInviteSuccess(`Invitation envoyée à ${inviteForm.email}`);
      reloadAfterInvite();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setInviting(false);
    }
  }

  const rowCount = users.length + invitations.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Comptes & accès</h2>
          <p className="text-sm text-slate-500">Gérez les utilisateurs inscrits et les invitations en attente</p>
        </div>
        {canInvite && (
          <Button type="button" onClick={openInviteDialog} className="cursor-pointer shrink-0">
            <Plus className="h-4 w-4" />
            Inviter
          </Button>
        )}
      </div>

      {inviteSuccess && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-success/20 bg-success-bg px-4 py-3 text-sm text-success">
          {inviteSuccess}
          <button
            type="button"
            onClick={() => setInviteSuccess(null)}
            aria-label="Fermer"
            className="cursor-pointer text-success/70 hover:text-success"
          >
            ✕
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">Utilisateurs {!loading && `(${rowCount})`}</h3>
        </CardHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current" />
          </div>
        ) : rowCount === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Aucun utilisateur</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Utilisateur", "Rôle", "Statut"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        >
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
                {invitations.map((inv) => {
                  const displayName = [inv.prenom, inv.nom].filter(Boolean).join(" ") || inv.email;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200 text-slate-500 text-xs font-bold flex-shrink-0">
                            {getInitials(displayName)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{displayName}</p>
                            <p className="text-xs text-slate-500">{inv.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700">{ROLE_LABELS[inv.role ?? "member"] ?? inv.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          En attente
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)}>
        <h3 className="text-lg font-bold text-foreground">Inviter un collaborateur</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Il recevra un email pour créer son mot de passe et rejoindre votre organisation.
        </p>

        <form onSubmit={handleInvite} className="mt-5 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-prenom">Prénom</Label>
              <Input
                id="invite-prenom"
                value={inviteForm.prenom}
                onChange={(e) => setInviteForm({ ...inviteForm, prenom: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-nom">Nom</Label>
              <Input
                id="invite-nom"
                value={inviteForm.nom}
                onChange={(e) => setInviteForm({ ...inviteForm, nom: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-email">Adresse e-mail</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="collegue@entreprise.fr"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-telephone">Téléphone</Label>
              <Input
                id="invite-telephone"
                type="tel"
                placeholder="06 12 34 56 78"
                value={inviteForm.telephone}
                onChange={(e) => setInviteForm({ ...inviteForm, telephone: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-role">Rôle</Label>
              <select
                id="invite-role"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as "admin" | "member" })}
                className="h-10 rounded-lg border border-border-strong bg-white px-3 text-sm text-foreground"
              >
                <option value="member">Membre</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </div>

          {inviteError && <p className="text-sm text-destructive">{inviteError}</p>}

          <Button type="submit" disabled={inviting} className="mt-2 cursor-pointer">
            {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {inviting ? "Envoi..." : "Envoyer l'invitation"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}

function PrestationsSettings() {
  const { primaryColor } = useTheme();
  const [rows, setRows] = useState<PrestationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "",
    description: "",
    prix: "",
    unite: "forfait",
    tva: "20",
  });
  const [saving, setSaving] = useState(false);
  const UNITE_OPTIONS = ["forfait", "h", "j", "m²", "ml", "u", "m³", "kg"];

  useEffect(() => {
    getPrestations()
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () =>
    setForm({
      label: "",
      description: "",
      prix: "",
      unite: "forfait",
      tva: "20",
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      label: form.label,
      description: form.description || undefined,
      prix: parseFloat(form.prix) || 0,
      unite: form.unite,
      tva: parseFloat(form.tva) || 20,
    };
    if (editId) {
      const r = await updatePrestation(editId, data);
      if (r.success) {
        setRows((p) => p.map((x) => (x.id === editId ? r.data : x)));
        setEditId(null);
        resetForm();
      }
    } else {
      const r = await createPrestation(data);
      if (r.success) {
        setRows((p) => [...p, r.data]);
        resetForm();
      }
    }
    setSaving(false);
  };

  const handleEdit = (p: PrestationRow) => {
    setEditId(p.id);
    setForm({
      label: p.label,
      description: p.description ?? "",
      prix: String(p.prix),
      unite: p.unite,
      tva: String(p.tva),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette prestation ?")) return;
    await deletePrestation(id);
    setRows((p) => p.filter((x) => x.id !== id));
  };

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));
  const inputCls =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Catalogue de prestations
        </h2>
        <p className="text-sm text-slate-500">
          Préenregistrez vos tarifs pour les utiliser dans vos devis
        </p>
      </div>

      {/* Formulaire */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800">
            {editId ? "Modifier la prestation" : "Nouvelle prestation"}
          </h3>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Désignation *
                </label>
                <input
                  required
                  className={inputCls}
                  value={form.label}
                  onChange={(e) => set("label", e.target.value)}
                  placeholder="Main d'œuvre plomberie (h)"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Description (optionnel)
                </label>
                <input
                  className={inputCls}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Détails…"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Prix unitaire HT (€) *
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputCls}
                  value={form.prix}
                  onChange={(e) => set("prix", e.target.value)}
                  placeholder="65"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Unité
                </label>
                <select
                  className={inputCls}
                  value={form.unite}
                  onChange={(e) => set("unite", e.target.value)}
                >
                  {UNITE_OPTIONS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  TVA (%)
                </label>
                <select
                  className={inputCls}
                  value={form.tva}
                  onChange={(e) => set("tva", e.target.value)}
                >
                  {[0, 5.5, 10, 20].map((t) => (
                    <option key={t} value={t}>
                      {t}%
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    resetForm();
                  }}
                  className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
                >
                  Annuler
                </button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editId ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {editId ? "Enregistrer" : "Ajouter"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-6">
          Aucune prestation enregistrée
        </p>
      ) : (
        <Card>
          <CardContent className="p-0">
            {rows.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {p.label}
                  </p>
                  {p.description && (
                    <p className="text-xs text-slate-400">{p.description}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {p.prix.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                  <p className="text-xs text-slate-400">
                    /{p.unite} · TVA {p.tva}%
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-xs"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
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

      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-5xl mb-4">🔔</p>
        <p className="text-base font-medium text-slate-600 mb-1">
          Préférences de notifications
        </p>
        <p className="text-sm text-center max-w-xs">
          Cette fonctionnalité sera disponible dans une prochaine version.
        </p>
      </div>
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

      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-5xl mb-4">💳</p>
        <p className="text-base font-medium text-slate-600 mb-1">
          Gestion de l&apos;abonnement
        </p>
        <p className="text-sm text-center max-w-xs">
          Cette fonctionnalité sera disponible dans une prochaine version.
        </p>
      </div>
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
