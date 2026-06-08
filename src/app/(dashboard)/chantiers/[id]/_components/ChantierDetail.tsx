"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Info, FileText, HardHat, FolderOpen, Receipt,
  Plus, Upload, Trash2, Eye, CheckCircle2, Send, Loader2,
  Clock, MapPin, Euro, Calendar, User, X, ChevronRight,
} from "lucide-react";
import { ChantierStatus, DevisStatus, FactureStatus, InterventionStatus, DocumentCategorie } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTheme } from "@/components/shared/ThemeProvider";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ChantierWithResponsable } from "@/server/actions/chantiers";
import type { UserSummary } from "@/server/actions/users";
import { createDevis, sendDevisForSignature, deleteDevis, type DevisWithLignes } from "@/server/actions/devis";
import { createFactureFromDevis, createFactureBlank, updateFactureStatus } from "@/server/actions/factures";
import { createIntervention, updateInterventionStatus, deleteIntervention, type InterventionFull } from "@/server/actions/interventions";
import { createDocument, deleteDocument } from "@/server/actions/documents";
import { authClient } from "@/lib/auth-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type DevisRow = Awaited<ReturnType<typeof import("@/server/actions/devis").getDevisByChantierId>>[number];
type FactureRow = Awaited<ReturnType<typeof import("@/server/actions/factures").getFacturesByChantierId>>[number];
type DocRow = Awaited<ReturnType<typeof import("@/server/actions/documents").getDocumentsByChantierId>>[number];

// ─── Constantes ───────────────────────────────────────────────────────────────

const CHANTIER_STATUS_LABELS: Record<ChantierStatus, string> = {
  PROSPECT: "Prospect", EN_COURS: "En cours", TERMINE: "Terminé", ANNULE: "Annulé",
};
const CHANTIER_STATUS_COLORS: Record<ChantierStatus, string> = {
  PROSPECT: "bg-slate-100 text-slate-700",
  EN_COURS: "bg-amber-100 text-amber-700",
  TERMINE: "bg-green-100 text-green-700",
  ANNULE: "bg-red-100 text-red-700",
};
const DEVIS_STATUS_LABELS: Record<DevisStatus, string> = {
  BROUILLON: "Brouillon", ENVOYE: "Envoyé", SIGNE: "Signé", REFUSE: "Refusé", EXPIRE: "Expiré",
};
const DEVIS_STATUS_COLORS: Record<DevisStatus, string> = {
  BROUILLON: "bg-slate-100 text-slate-600",
  ENVOYE: "bg-blue-100 text-blue-700",
  SIGNE: "bg-green-100 text-green-700",
  REFUSE: "bg-red-100 text-red-700",
  EXPIRE: "bg-orange-100 text-orange-700",
};
const FACTURE_STATUS_LABELS: Record<FactureStatus, string> = {
  BROUILLON: "Brouillon", ENVOYEE: "Envoyée", PAYEE: "Payée", IMPAYEE: "Impayée",
};
const FACTURE_STATUS_COLORS: Record<FactureStatus, string> = {
  BROUILLON: "bg-slate-100 text-slate-600",
  ENVOYEE: "bg-blue-100 text-blue-700",
  PAYEE: "bg-green-100 text-green-700",
  IMPAYEE: "bg-red-100 text-red-700",
};
const INTER_STATUS_LABELS: Record<InterventionStatus, string> = {
  PLANIFIEE: "Planifiée", EN_COURS: "En cours", TERMINEE: "Terminée", ANNULEE: "Annulée",
};
const INTER_STATUS_COLORS: Record<InterventionStatus, string> = {
  PLANIFIEE: "bg-slate-100 text-slate-600",
  EN_COURS: "bg-amber-100 text-amber-700",
  TERMINEE: "bg-green-100 text-green-700",
  ANNULEE: "bg-red-100 text-red-700",
};
const DOC_CATEGORIE_LABELS: Record<DocumentCategorie, string> = {
  PLAN: "Plan", PHOTO: "Photo", BON_COMMANDE: "Bon de commande",
  RAPPORT: "Rapport", CONTRAT: "Contrat", AUTRE: "Autre",
};

type Tab = "info" | "devis" | "interventions" | "documents" | "factures";

// ─── Onglet Informations ──────────────────────────────────────────────────────

function TabInfo({ chantier }: { chantier: ChantierWithResponsable }) {
  const { primaryColor } = useTheme();
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 grid grid-cols-2 gap-4">
          {[
            { icon: <HardHat className="w-4 h-4" />, label: "Référence", value: chantier.reference },
            { icon: <Info className="w-4 h-4" />, label: "Statut", value: <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CHANTIER_STATUS_COLORS[chantier.status]}`}>{CHANTIER_STATUS_LABELS[chantier.status]}</span> },
            { icon: <MapPin className="w-4 h-4" />, label: "Adresse", value: [chantier.adresse, chantier.codePostal, chantier.ville].filter(Boolean).join(" ") || "—" },
            { icon: <User className="w-4 h-4" />, label: "Responsable", value: chantier.responsable?.name ?? "—" },
            { icon: <Calendar className="w-4 h-4" />, label: "Début", value: chantier.dateDebut ? formatDate(chantier.dateDebut.toISOString()) : "—" },
            { icon: <Calendar className="w-4 h-4" />, label: "Fin prévue", value: chantier.dateFin ? formatDate(chantier.dateFin.toISOString()) : "—" },
            { icon: <Euro className="w-4 h-4" />, label: "Budget HT", value: chantier.budget ? formatCurrency(chantier.budget) : "—" },
          ].map((row, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: primaryColor + "15", color: primaryColor }}>
                {row.icon}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{row.label}</p>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">{row.value}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {chantier.description && (
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{chantier.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Onglet Devis ─────────────────────────────────────────────────────────────

function TabDevis({ devisList, chantierId }: { devisList: DevisRow[]; chantierId: string }) {
  const { primaryColor } = useTheme();
  const [loading, setLoading] = useState(false);
  const [signatureLinks, setSignatureLinks] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    const result = await createDevis(chantierId);
    if (result.success) router.push(`/chantiers/${chantierId}/devis/${result.data.id}`);
    setLoading(false);
  };

  const handleSend = async (id: string) => {
    const result = await sendDevisForSignature(id);
    if (result.success) {
      setSignatureLinks((prev) => ({ ...prev, [id]: result.signatureUrl }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce devis ?")) return;
    await deleteDevis(id);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={handleCreate} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Nouveau devis
        </Button>
      </div>

      {devisList.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-slate-400">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucun devis — créez le premier</p>
        </CardContent></Card>
      ) : devisList.map((d) => (
        <Card key={d.id}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor + "15", color: primaryColor }}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{d.numero}</p>
                  <p className="text-xs text-slate-400">{d.clientNom || "Client non renseigné"} · {formatCurrency(d.totalTTC)} TTC</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${DEVIS_STATUS_COLORS[d.status]}`}>{DEVIS_STATUS_LABELS[d.status]}</span>
                <div className="flex gap-1">
                  <Link href={`/chantiers/${chantierId}/devis/${d.id}`}>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Éditer"><Eye className="w-4 h-4" /></button>
                  </Link>
                  {d.status === "BROUILLON" && (
                    <button onClick={() => handleSend(d.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Envoyer pour signature">
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {signatureLinks[d.id] && (
              <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-1">Lien de signature à envoyer au client :</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-blue-600 font-mono flex-1 truncate">{signatureLinks[d.id]}</p>
                  <button onClick={() => navigator.clipboard.writeText(signatureLinks[d.id])} className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg flex-shrink-0">Copier</button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Onglet Interventions ─────────────────────────────────────────────────────

function TabInterventions({ interventions, chantierId, users }: {
  interventions: InterventionFull[];
  chantierId: string;
  users: UserSummary[];
}) {
  const { primaryColor } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ titre: "", description: "", status: InterventionStatus.PLANIFIEE, dateDebut: "", dateFin: "", memo: "", userId: "" });
  const [list, setList] = useState(interventions);
  const router = useRouter();

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await createIntervention(chantierId, form);
    if (result.success) {
      setList((p) => [result.data, ...p]);
      setShowForm(false);
      setForm({ titre: "", description: "", status: InterventionStatus.PLANIFIEE, dateDebut: "", dateFin: "", memo: "", userId: "" });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette intervention ?")) return;
    await deleteIntervention(id);
    setList((p) => p.filter((i) => i.id !== id));
  };

  const handleStatusChange = async (id: string, status: InterventionStatus) => {
    await updateInterventionStatus(id, status);
    setList((p) => p.map((i) => i.id === id ? { ...i, status } : i));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Nouvelle intervention
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-5">
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-600 block mb-1">Titre *</label>
                  <input required value={form.titre} onChange={(e) => set("titre", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white" placeholder="Pose carrelage, installation électrique…" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Statut</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                    {(Object.keys(INTER_STATUS_LABELS) as InterventionStatus[]).map((s) => <option key={s} value={s}>{INTER_STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Intervenant</label>
                  <select value={form.userId} onChange={(e) => set("userId", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                    <option value="">— Non assigné —</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Date début</label>
                  <input type="datetime-local" value={form.dateDebut} onChange={(e) => set("dateDebut", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Date fin</label>
                  <input type="datetime-local" value={form.dateFin} onChange={(e) => set("dateFin", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-600 block mb-1">Description</label>
                  <textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none resize-none bg-white" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-600 block mb-1">Mémo</label>
                  <textarea rows={2} value={form.memo} onChange={(e) => set("memo", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none resize-none bg-white" placeholder="Note interne…" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700">Annuler</button>
                <Button type="submit" variant="primary" size="sm" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Créer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {list.length === 0 && !showForm ? (
        <Card><CardContent className="p-10 text-center text-slate-400">
          <HardHat className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucune intervention enregistrée</p>
        </CardContent></Card>
      ) : list.map((inter) => (
        <Card key={inter.id}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: primaryColor + "15", color: primaryColor }}>
                  <HardHat className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{inter.titre}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                    {inter.user && <span className="flex items-center gap-1"><User className="w-3 h-3" />{inter.user.name}</span>}
                    {inter.dateDebut && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(inter.dateDebut.toISOString())}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={inter.status}
                  onChange={(e) => handleStatusChange(inter.id, e.target.value as InterventionStatus)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
                >
                  {(Object.keys(INTER_STATUS_LABELS) as InterventionStatus[]).map((s) => <option key={s} value={s}>{INTER_STATUS_LABELS[s]}</option>)}
                </select>
                <button onClick={() => handleDelete(inter.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {inter.description && <p className="text-xs text-slate-500 mb-2 pl-12">{inter.description}</p>}
            {inter.memo && (
              <div className="ml-12 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800">
                <span className="font-semibold">Mémo :</span> {inter.memo}
              </div>
            )}

            {/* Docs liés à l'intervention */}
            {inter.documents.length > 0 && (
              <div className="ml-12 mt-3 space-y-1.5">
                {inter.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                    <FolderOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate hover:underline font-medium">{doc.nom}</a>
                    <span className="text-slate-400">{doc.uploadedBy.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Onglet Documents ─────────────────────────────────────────────────────────

function TabDocuments({ documents, chantierId }: { documents: DocRow[]; chantierId: string }) {
  const { primaryColor } = useTheme();
  const { data: session } = authClient.useSession();
  const [list, setList] = useState(documents);
  const [uploading, setUploading] = useState(false);
  const [memo, setMemo] = useState("");
  const [categorie, setCategorie] = useState<DocumentCategorie>(DocumentCategorie.AUTRE);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("chantierId", chantierId);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();

    if (data.success) {
      const docResult = await createDocument({
        nom: data.nom, categorie, url: data.url, taille: data.taille, mimeType: data.mimeType, memo: memo || undefined, chantierId,
      });
      if (docResult.success) setList((p) => [{ ...docResult.data, intervention: null }, ...p]);
    }
    setUploading(false);
    setMemo("");
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    await deleteDocument(id, chantierId);
    setList((p) => p.filter((d) => d.id !== id));
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  return (
    <div className="space-y-4">
      {/* Zone upload */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-40">
              <label className="text-xs font-medium text-slate-600 block mb-1">Catégorie</label>
              <select value={categorie} onChange={(e) => setCategorie(e.target.value as DocumentCategorie)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
                {(Object.keys(DOC_CATEGORIE_LABELS) as DocumentCategorie[]).map((c) => <option key={c} value={c}>{DOC_CATEGORIE_LABELS[c]}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <label className="text-xs font-medium text-slate-600 block mb-1">Mémo (optionnel)</label>
              <input value={memo} onChange={(e) => setMemo(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white" placeholder="Note sur le document…" />
            </div>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer hover:opacity-90 transition-opacity ${uploading ? "opacity-60 pointer-events-none" : ""}`} style={{ backgroundColor: primaryColor }}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Upload…" : "Importer un fichier"}
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </CardContent>
      </Card>

      {list.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-slate-400">
          <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucun document importé</p>
        </CardContent></Card>
      ) : (
        <Card>
          <div className="divide-y divide-slate-50">
            {list.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: primaryColor + "12", color: primaryColor }}>
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-900 hover:underline truncate block">{doc.nom}</a>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{DOC_CATEGORIE_LABELS[doc.categorie]}</span>
                    {formatSize(doc.taille) && <span>{formatSize(doc.taille)}</span>}
                    <span>par {doc.uploadedBy.name}</span>
                    {doc.intervention && <span className="text-amber-600">→ {doc.intervention.titre}</span>}
                  </div>
                  {doc.memo && <p className="text-xs text-slate-500 mt-0.5 italic">{doc.memo}</p>}
                </div>
                <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Onglet Factures ──────────────────────────────────────────────────────────

function TabFactures({ facturesList, devisList, chantierId }: {
  facturesList: FactureRow[];
  devisList: DevisRow[];
  chantierId: string;
}) {
  const { primaryColor } = useTheme();
  const [list, setList] = useState(facturesList);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const signedDevis = devisList.filter((d) => d.status === DevisStatus.SIGNE);

  const handleCreateFromDevis = async (devisId: string) => {
    setLoading(true);
    const result = await createFactureFromDevis(devisId);
    if (result.success) router.push(`/chantiers/${chantierId}/factures/${result.data.id}`);
    setLoading(false);
  };

  const handleCreateBlank = async () => {
    setLoading(true);
    const result = await createFactureBlank(chantierId);
    if (result.success) router.push(`/chantiers/${chantierId}/factures/${result.data.id}`);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: FactureStatus) => {
    await updateFactureStatus(id, status);
    setList((p) => p.map((f) => f.id === id ? { ...f, status } : f));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 flex-wrap">
        {signedDevis.map((d) => (
          <Button key={d.id} variant="primary" size="sm" onClick={() => handleCreateFromDevis(d.id)} disabled={loading}>
            <Receipt className="w-4 h-4" /> Facture depuis {d.numero}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={handleCreateBlank} disabled={loading}>
          <Plus className="w-4 h-4" /> Facture vierge
        </Button>
      </div>

      {list.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-slate-400">
          <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucune facture — créez-en une depuis un devis signé</p>
        </CardContent></Card>
      ) : list.map((f) => (
        <Card key={f.id}>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor + "15", color: primaryColor }}>
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{f.numero}</p>
                <p className="text-xs text-slate-400">{f.clientNom || "Client non renseigné"} · {formatCurrency(f.totalTTC)} TTC</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={f.status}
                onChange={(e) => handleStatusChange(f.id, e.target.value as FactureStatus)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
              >
                {(Object.keys(FACTURE_STATUS_LABELS) as FactureStatus[]).map((s) => <option key={s} value={s}>{FACTURE_STATUS_LABELS[s]}</option>)}
              </select>
              <Link href={`/chantiers/${chantierId}/factures/${f.id}`}>
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <Eye className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

interface Props {
  chantier: ChantierWithResponsable;
  devisList: DevisRow[];
  facturesList: FactureRow[];
  interventions: InterventionFull[];
  documents: DocRow[];
  users: UserSummary[];
  defaultTab: string;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "info", label: "Informations", icon: <Info className="w-4 h-4" /> },
  { id: "devis", label: "Devis", icon: <FileText className="w-4 h-4" /> },
  { id: "interventions", label: "Interventions", icon: <HardHat className="w-4 h-4" /> },
  { id: "documents", label: "Documents", icon: <FolderOpen className="w-4 h-4" /> },
  { id: "factures", label: "Factures", icon: <Receipt className="w-4 h-4" /> },
];

export default function ChantierDetail({ chantier, devisList, facturesList, interventions, documents, users, defaultTab }: Props) {
  const { primaryColor } = useTheme();
  const [tab, setTab] = useState<Tab>((defaultTab as Tab) ?? "info");

  const counts: Partial<Record<Tab, number>> = {
    devis: devisList.length,
    interventions: interventions.length,
    documents: documents.length,
    factures: facturesList.length,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/chantiers" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">{chantier.reference}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CHANTIER_STATUS_COLORS[chantier.status]}`}>
                {CHANTIER_STATUS_LABELS[chantier.status]}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">{chantier.nom}</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-slate-200 bg-white">
        <div className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === id ? "border-current" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              style={tab === id ? { color: primaryColor, borderColor: primaryColor } : {}}
            >
              {icon}
              {label}
              {counts[id] !== undefined && counts[id]! > 0 && (
                <span className="text-xs rounded-full px-1.5 min-w-5 h-5 flex items-center justify-center" style={{ backgroundColor: primaryColor + "20", color: primaryColor }}>
                  {counts[id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl">
          {tab === "info" && <TabInfo chantier={chantier} />}
          {tab === "devis" && <TabDevis devisList={devisList} chantierId={chantier.id} />}
          {tab === "interventions" && <TabInterventions interventions={interventions} chantierId={chantier.id} users={users} />}
          {tab === "documents" && <TabDocuments documents={documents} chantierId={chantier.id} />}
          {tab === "factures" && <TabFactures facturesList={facturesList} devisList={devisList} chantierId={chantier.id} />}
        </div>
      </div>
    </div>
  );
}
