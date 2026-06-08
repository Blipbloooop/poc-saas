"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Send, Printer, BookOpen, X, Loader2, Check, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTheme } from "@/components/shared/ThemeProvider";
import { formatCurrency } from "@/lib/utils";
import { saveDevis, sendDevisForSignature, type SaveDevisInput } from "@/server/actions/devis";
import type { PrestationRow } from "@/server/actions/prestations";
import type { DevisWithLignes } from "@/server/actions/devis";

type DevisData = NonNullable<Awaited<ReturnType<typeof import("@/server/actions/devis").getDevisById>>>;

interface Ligne {
  id?: string;
  ordre: number;
  label: string;
  description: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  tva: number;
  totalHT: number;
}

const TVA_OPTIONS = [0, 5.5, 10, 20];
const UNITE_OPTIONS = ["forfait", "h", "j", "m²", "ml", "u", "m³", "kg"];

function computeLigneTotal(l: Pick<Ligne, "quantite" | "prixUnitaire">) {
  return Math.round(l.quantite * l.prixUnitaire * 100) / 100;
}

// ─── Dialog sélection prestation ─────────────────────────────────────────────

function PrestationPicker({
  prestations,
  onSelect,
  onClose,
}: { prestations: PrestationRow[]; onSelect: (p: PrestationRow) => void; onClose: () => void }) {
  const { primaryColor } = useTheme();
  const [search, setSearch] = useState("");
  const filtered = prestations.filter((p) => p.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: primaryColor }} />
            <h3 className="text-sm font-semibold">Choisir une prestation</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-4 pt-3">
          <input type="text" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200" autoFocus />
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">Aucune prestation</p>
          ) : filtered.map((p) => (
            <button key={p.id} onClick={() => { onSelect(p); onClose(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all text-left">
              <div>
                <p className="text-sm font-medium text-slate-900">{p.label}</p>
                {p.description && <p className="text-xs text-slate-400">{p.description}</p>}
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(p.prix)}</p>
                <p className="text-xs text-slate-400">/{p.unite} · TVA {p.tva}%</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Vue print ────────────────────────────────────────────────────────────────

function PrintView({
  devis, lignes, form, totaux, onClose,
}: {
  devis: DevisData;
  lignes: Ligne[];
  form: { clientNom: string; clientEmail: string; clientAdresse: string; notes: string; mentionsLegales: string; validiteJours: number };
  totaux: { ht: number; tva: number; ttc: number };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto print:block">
      <div className="no-print flex items-center gap-3 px-6 py-3 border-b border-slate-200 bg-white sticky top-0">
        <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg ml-auto">
          <Printer className="w-4 h-4" /> Télécharger PDF
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-12">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-2xl font-bold text-slate-900">DEVIS</p>
            <p className="text-slate-500">{devis.numero}</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-semibold">Date : {new Date().toLocaleDateString("fr-FR")}</p>
            <p>Validité : {form.validiteJours} jours</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chantier</p>
            <p className="font-semibold text-slate-900">{devis.chantier.nom}</p>
            {devis.chantier.adresse && <p className="text-sm text-slate-600">{devis.chantier.adresse}</p>}
            {devis.chantier.ville && <p className="text-sm text-slate-600">{devis.chantier.ville}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Client</p>
            <p className="font-semibold text-slate-900">{form.clientNom || "—"}</p>
            {form.clientAdresse && <p className="text-sm text-slate-600 whitespace-pre-wrap">{form.clientAdresse}</p>}
            {form.clientEmail && <p className="text-sm text-slate-600">{form.clientEmail}</p>}
          </div>
        </div>

        <table className="w-full mb-8 text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Désignation</th>
              <th className="px-4 py-2.5 text-right font-semibold text-slate-600 w-20">Qté</th>
              <th className="px-4 py-2.5 text-right font-semibold text-slate-600 w-24">P.U. HT</th>
              <th className="px-4 py-2.5 text-right font-semibold text-slate-600 w-16">TVA</th>
              <th className="px-4 py-2.5 text-right font-semibold text-slate-600 w-24">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-slate-900">{l.label}</p>
                  {l.description && <p className="text-xs text-slate-400">{l.description}</p>}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-600">{l.quantite} {l.unite}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">{formatCurrency(l.prixUnitaire)}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">{l.tva}%</td>
                <td className="px-4 py-2.5 text-right font-medium text-slate-900">{formatCurrency(l.totalHT)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600"><span>Total HT</span><span className="font-medium">{formatCurrency(totaux.ht)}</span></div>
            <div className="flex justify-between text-slate-600"><span>TVA</span><span className="font-medium">{formatCurrency(totaux.tva)}</span></div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200"><span>Total TTC</span><span>{formatCurrency(totaux.ttc)}</span></div>
          </div>
        </div>

        {form.notes && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{form.notes}</p>
          </div>
        )}
        {form.mentionsLegales && (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400 whitespace-pre-wrap">{form.mentionsLegales}</p>
          </div>
        )}
      </div>

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
}

// ─── Éditeur principal ────────────────────────────────────────────────────────

interface Props {
  devis: DevisData;
  prestations: PrestationRow[];
  chantierId: string;
}

export default function DevisEditor({ devis, prestations, chantierId }: Props) {
  const { primaryColor } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [showPrestations, setShowPrestations] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  const [form, setForm] = useState({
    clientNom: devis.clientNom,
    clientEmail: devis.clientEmail ?? "",
    clientAdresse: devis.clientAdresse ?? "",
    validiteJours: devis.validiteJours,
    tvaDefault: devis.tvaDefault,
    notes: devis.notes ?? "",
    mentionsLegales: devis.mentionsLegales ?? "",
  });

  const [lignes, setLignes] = useState<Ligne[]>(
    devis.lignes.map((l) => ({
      id: l.id, ordre: l.ordre, label: l.label,
      description: l.description ?? "", quantite: l.quantite,
      unite: l.unite, prixUnitaire: l.prixUnitaire, tva: l.tva, totalHT: l.totalHT,
    }))
  );

  const setFormField = (k: keyof typeof form, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  const addLigne = (preset?: Partial<Ligne>) => {
    setLignes((p) => [...p, {
      ordre: p.length, label: preset?.label ?? "", description: preset?.description ?? "",
      quantite: preset?.quantite ?? 1, unite: preset?.unite ?? "forfait",
      prixUnitaire: preset?.prixUnitaire ?? 0, tva: preset?.tva ?? form.tvaDefault,
      totalHT: preset?.totalHT ?? 0,
    }]);
  };

  const addFromPrestation = (p: PrestationRow) => {
    addLigne({ label: p.label, description: p.description ?? "", prixUnitaire: p.prix, unite: p.unite, tva: p.tva, totalHT: p.prix });
  };

  const updateLigne = (idx: number, field: keyof Ligne, value: string | number) => {
    setLignes((prev) => prev.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, [field]: value };
      if (field === "quantite" || field === "prixUnitaire") {
        updated.totalHT = computeLigneTotal(updated);
      }
      return updated;
    }));
  };

  const removeLigne = (idx: number) => setLignes((p) => p.filter((_, i) => i !== idx).map((l, i) => ({ ...l, ordre: i })));

  const totaux = {
    ht: Math.round(lignes.reduce((s, l) => s + l.totalHT, 0) * 100) / 100,
    tva: Math.round(lignes.reduce((s, l) => s + l.totalHT * (l.tva / 100), 0) * 100) / 100,
    ttc: 0,
  };
  totaux.ttc = Math.round((totaux.ht + totaux.tva) * 100) / 100;

  const handleSave = async () => {
    setSaving(true);
    const input: SaveDevisInput = { ...form, lignes: lignes.map((l, i) => ({ ...l, ordre: i })) };
    await saveDevis(devis.id, input);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  const handleSend = async () => {
    await handleSave();
    setSendLoading(true);
    const result = await sendDevisForSignature(devis.id);
    if (result.success) setSignatureUrl(result.signatureUrl);
    setSendLoading(false);
  };

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white";

  return (
    <>
      {showPrint && (
        <PrintView devis={devis} lignes={lignes} form={form} totaux={totaux} onClose={() => setShowPrint(false)} />
      )}
      {showPrestations && (
        <PrestationPicker prestations={prestations} onSelect={addFromPrestation} onClose={() => setShowPrestations(false)} />
      )}

      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href={`/chantiers/${chantierId}?tab=devis`} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <p className="text-xs text-slate-400">{devis.chantier.reference} · {devis.chantier.nom}</p>
              <h1 className="text-lg font-bold text-slate-900">Devis {devis.numero}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPrint(true)}>
              <Printer className="w-4 h-4" /> Aperçu PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />}
              {saving ? "Enregistrement…" : saved ? "Enregistré !" : "Enregistrer"}
            </Button>
            {devis.status === "BROUILLON" && (
              <Button variant="primary" size="sm" onClick={handleSend} disabled={sendLoading}>
                {sendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer pour signature
              </Button>
            )}
          </div>
        </div>

        {/* Lien signature */}
        {signatureUrl && (
          <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-semibold text-blue-800 mb-1.5">Lien de signature généré — partagez-le à votre client :</p>
            <div className="flex items-center gap-3">
              <code className="text-xs text-blue-700 flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 truncate">{signatureUrl}</code>
              <button onClick={() => navigator.clipboard.writeText(signatureUrl)} className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg flex-shrink-0 hover:bg-blue-700">Copier</button>
            </div>
          </div>
        )}

        {/* Corps */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-5xl">

            {/* Client */}
            <Card>
              <CardHeader><h3 className="text-sm font-semibold text-slate-800">Informations client</h3></CardHeader>
              <CardContent className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Nom / Raison sociale</label>
                  <input className={inputCls} value={form.clientNom} onChange={(e) => setFormField("clientNom", e.target.value)} placeholder="M. et Mme Dupont" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
                  <input className={inputCls} type="email" value={form.clientEmail} onChange={(e) => setFormField("clientEmail", e.target.value)} placeholder="client@exemple.fr" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-600 block mb-1">Adresse</label>
                  <textarea className={`${inputCls} resize-none`} rows={2} value={form.clientAdresse} onChange={(e) => setFormField("clientAdresse", e.target.value)} placeholder="12 rue des Lilas, 69003 Lyon" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Validité (jours)</label>
                  <input className={inputCls} type="number" min={1} value={form.validiteJours} onChange={(e) => setFormField("validiteJours", parseInt(e.target.value) || 30)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">TVA par défaut (%)</label>
                  <select className={inputCls} value={form.tvaDefault} onChange={(e) => setFormField("tvaDefault", parseFloat(e.target.value))}>
                    {TVA_OPTIONS.map((t) => <option key={t} value={t}>{t}%</option>)}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Lignes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Lignes du devis</h3>
                  <div className="flex gap-2">
                    {prestations.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => setShowPrestations(true)}>
                        <BookOpen className="w-4 h-4" /> Depuis catalogue
                      </Button>
                    )}
                    <Button variant="primary" size="sm" onClick={() => addLigne()}>
                      <Plus className="w-4 h-4" /> Ligne libre
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase w-8" />
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase">Désignation</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase w-24">Qté</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase w-24">Unité</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase w-28">P.U. HT</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase w-20">TVA%</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase w-28">Total HT</th>
                      <th className="px-2 py-2.5 w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lignes.map((l, i) => (
                      <tr key={i}>
                        <td className="px-2 py-2 text-slate-300"><GripVertical className="w-4 h-4" /></td>
                        <td className="px-2 py-2">
                          <input className="w-full px-2 py-1.5 text-sm border border-transparent hover:border-slate-200 rounded focus:outline-none focus:border-slate-300 bg-transparent focus:bg-white" placeholder="Description de la prestation" value={l.label} onChange={(e) => updateLigne(i, "label", e.target.value)} />
                          <input className="w-full px-2 py-1 text-xs text-slate-400 border border-transparent hover:border-slate-200 rounded focus:outline-none focus:border-slate-300 bg-transparent focus:bg-white mt-0.5" placeholder="Détail optionnel…" value={l.description} onChange={(e) => updateLigne(i, "description", e.target.value)} />
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min={0} step="0.01" className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 bg-white text-right" value={l.quantite} onChange={(e) => updateLigne(i, "quantite", parseFloat(e.target.value) || 0)} />
                        </td>
                        <td className="px-2 py-2">
                          <select className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none bg-white" value={l.unite} onChange={(e) => updateLigne(i, "unite", e.target.value)}>
                            {UNITE_OPTIONS.map((u) => <option key={u}>{u}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min={0} step="0.01" className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 bg-white text-right" value={l.prixUnitaire} onChange={(e) => updateLigne(i, "prixUnitaire", parseFloat(e.target.value) || 0)} />
                        </td>
                        <td className="px-2 py-2">
                          <select className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none bg-white text-right" value={l.tva} onChange={(e) => updateLigne(i, "tva", parseFloat(e.target.value))}>
                            {TVA_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <span className="text-sm font-semibold text-slate-900">{formatCurrency(l.totalHT)}</span>
                        </td>
                        <td className="px-2 py-2">
                          <button onClick={() => removeLigne(i)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {lignes.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                    <p className="text-sm">Aucune ligne — ajoutez une prestation</p>
                  </div>
                )}
              </div>

              {/* Totaux */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <div className="w-60 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Total HT</span><span className="font-medium">{formatCurrency(totaux.ht)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>TVA</span><span className="font-medium">{formatCurrency(totaux.tva)}</span></div>
                  <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-200"><span>Total TTC</span><span>{formatCurrency(totaux.ttc)}</span></div>
                </div>
              </div>
            </Card>

            {/* Notes + mentions légales */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Notes client</label>
                  <textarea className={`${inputCls} resize-none`} rows={4} value={form.notes} onChange={(e) => setFormField("notes", e.target.value)} placeholder="Conditions particulières, précisions…" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Mentions légales</label>
                  <textarea className={`${inputCls} resize-none`} rows={4} value={form.mentionsLegales} onChange={(e) => setFormField("mentionsLegales", e.target.value)} placeholder="TVA non applicable, art. 293 B du CGI…" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
