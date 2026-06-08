"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Send, Printer, BookOpen, X, Loader2, Check, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTheme } from "@/components/shared/ThemeProvider";
import { formatCurrency } from "@/lib/utils";
import { saveFacture, updateFactureStatus, type SaveFactureInput } from "@/server/actions/factures";
import type { PrestationRow } from "@/server/actions/prestations";
import type { FactureFull } from "@/server/actions/factures";
import { FactureStatus } from "@prisma/client";

const TVA_OPTIONS = [0, 5.5, 10, 20];
const UNITE_OPTIONS = ["forfait", "h", "j", "m²", "ml", "u", "m³", "kg"];

const STATUS_LABELS: Record<FactureStatus, string> = {
  BROUILLON: "Brouillon", ENVOYEE: "Envoyée", PAYEE: "Payée", IMPAYEE: "Impayée",
};
const STATUS_COLORS: Record<FactureStatus, string> = {
  BROUILLON: "bg-slate-100 text-slate-600",
  ENVOYEE: "bg-blue-100 text-blue-700",
  PAYEE: "bg-green-100 text-green-700",
  IMPAYEE: "bg-red-100 text-red-700",
};

interface Ligne {
  ordre: number; label: string; description: string;
  quantite: number; unite: string; prixUnitaire: number; tva: number; totalHT: number;
}

function PrestationPicker({ prestations, onSelect, onClose }: { prestations: PrestationRow[]; onSelect: (p: PrestationRow) => void; onClose: () => void }) {
  const { primaryColor } = useTheme();
  const [search, setSearch] = useState("");
  const filtered = prestations.filter((p) => p.label.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" style={{ color: primaryColor }} /><h3 className="text-sm font-semibold">Choisir une prestation</h3></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-4 pt-3">
          <input type="text" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" autoFocus />
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => { onSelect(p); onClose(); }} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all text-left">
              <div><p className="text-sm font-medium text-slate-900">{p.label}</p>{p.description && <p className="text-xs text-slate-400">{p.description}</p>}</div>
              <div className="text-right ml-4 flex-shrink-0"><p className="text-sm font-semibold text-slate-900">{formatCurrency(p.prix)}</p><p className="text-xs text-slate-400">/{p.unite} · TVA {p.tva}%</p></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Props { facture: NonNullable<FactureFull>; prestations: PrestationRow[]; chantierId: string; }

export default function FactureEditor({ facture, prestations, chantierId }: Props) {
  const { primaryColor } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPrestations, setShowPrestations] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [status, setStatus] = useState(facture.status);

  const [form, setForm] = useState({
    clientNom: facture.clientNom, clientEmail: facture.clientEmail ?? "",
    clientAdresse: facture.clientAdresse ?? "",
    echeanceDate: facture.echeanceDate ? new Date(facture.echeanceDate).toISOString().split("T")[0] : "",
    notes: facture.notes ?? "",
  });

  const [lignes, setLignes] = useState<Ligne[]>(facture.lignes.map((l) => ({
    ordre: l.ordre, label: l.label, description: l.description ?? "",
    quantite: l.quantite, unite: l.unite, prixUnitaire: l.prixUnitaire, tva: l.tva, totalHT: l.totalHT,
  })));

  const setF = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const addLigne = (preset?: Partial<Ligne>) =>
    setLignes((p) => [...p, { ordre: p.length, label: preset?.label ?? "", description: preset?.description ?? "", quantite: preset?.quantite ?? 1, unite: preset?.unite ?? "forfait", prixUnitaire: preset?.prixUnitaire ?? 0, tva: preset?.tva ?? 20, totalHT: preset?.totalHT ?? 0 }]);

  const updateLigne = (idx: number, field: keyof Ligne, value: string | number) => {
    setLignes((prev) => prev.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, [field]: value };
      if (field === "quantite" || field === "prixUnitaire") updated.totalHT = Math.round(updated.quantite * updated.prixUnitaire * 100) / 100;
      return updated;
    }));
  };

  const totaux = {
    ht: Math.round(lignes.reduce((s, l) => s + l.totalHT, 0) * 100) / 100,
    tva: Math.round(lignes.reduce((s, l) => s + l.totalHT * (l.tva / 100), 0) * 100) / 100,
    ttc: 0,
  };
  totaux.ttc = Math.round((totaux.ht + totaux.tva) * 100) / 100;

  const handleSave = async () => {
    setSaving(true);
    const input: SaveFactureInput = { ...form, lignes: lignes.map((l, i) => ({ ...l, ordre: i })) };
    await saveFacture(facture.id, input);
    setSaved(true); setTimeout(() => setSaved(false), 2500); setSaving(false);
  };

  const handleStatusChange = async (newStatus: FactureStatus) => {
    await updateFactureStatus(facture.id, newStatus);
    setStatus(newStatus);
  };

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white";

  return (
    <>
      {showPrestations && <PrestationPicker prestations={prestations} onSelect={(p) => addLigne({ label: p.label, description: p.description ?? "", prixUnitaire: p.prix, unite: p.unite, tva: p.tva, totalHT: p.prix })} onClose={() => setShowPrestations(false)} />}

      {showPrint && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-200 bg-white sticky top-0 print:hidden">
            <button onClick={() => setShowPrint(false)} className="flex items-center gap-1.5 text-sm text-slate-600"><ArrowLeft className="w-4 h-4" /> Retour</button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg ml-auto"><Printer className="w-4 h-4" /> Télécharger PDF</button>
          </div>
          <div className="max-w-3xl mx-auto px-8 py-12">
            <div className="flex justify-between items-start mb-10">
              <div><p className="text-2xl font-bold text-slate-900">FACTURE</p><p className="text-slate-500">{facture.numero}</p></div>
              <div className="text-right text-sm text-slate-600">
                <p>Date : {new Date().toLocaleDateString("fr-FR")}</p>
                {form.echeanceDate && <p>Échéance : {new Date(form.echeanceDate).toLocaleDateString("fr-FR")}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chantier</p><p className="font-semibold text-slate-900">{facture.chantier.nom}</p></div>
              <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Client</p><p className="font-semibold text-slate-900">{form.clientNom || "—"}</p>{form.clientAdresse && <p className="text-sm text-slate-600 whitespace-pre-wrap">{form.clientAdresse}</p>}</div>
            </div>
            <table className="w-full mb-8 text-sm">
              <thead><tr className="bg-slate-100"><th className="px-4 py-2.5 text-left font-semibold text-slate-600">Désignation</th><th className="px-4 py-2.5 text-right font-semibold text-slate-600 w-20">Qté</th><th className="px-4 py-2.5 text-right font-semibold text-slate-600 w-24">P.U. HT</th><th className="px-4 py-2.5 text-right font-semibold text-slate-600 w-16">TVA</th><th className="px-4 py-2.5 text-right font-semibold text-slate-600 w-24">Total HT</th></tr></thead>
              <tbody>{lignes.map((l, i) => (<tr key={i} className="border-b border-slate-100"><td className="px-4 py-2.5"><p className="font-medium text-slate-900">{l.label}</p>{l.description && <p className="text-xs text-slate-400">{l.description}</p>}</td><td className="px-4 py-2.5 text-right text-slate-600">{l.quantite} {l.unite}</td><td className="px-4 py-2.5 text-right text-slate-600">{formatCurrency(l.prixUnitaire)}</td><td className="px-4 py-2.5 text-right text-slate-600">{l.tva}%</td><td className="px-4 py-2.5 text-right font-medium text-slate-900">{formatCurrency(l.totalHT)}</td></tr>))}</tbody>
            </table>
            <div className="flex justify-end mb-8"><div className="w-60 space-y-1.5 text-sm"><div className="flex justify-between text-slate-600"><span>Total HT</span><span>{formatCurrency(totaux.ht)}</span></div><div className="flex justify-between text-slate-600"><span>TVA</span><span>{formatCurrency(totaux.tva)}</span></div><div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-slate-200"><span>Total TTC</span><span>{formatCurrency(totaux.ttc)}</span></div></div></div>
            {form.notes && <p className="text-sm text-slate-600 whitespace-pre-wrap">{form.notes}</p>}
          </div>
          <style>{`@media print { .print\\:hidden { display: none !important; } }`}</style>
        </div>
      )}

      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href={`/chantiers/${chantierId}?tab=factures`} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
            <div>
              <p className="text-xs text-slate-400">{facture.chantier.reference} · {facture.chantier.nom}</p>
              <h1 className="text-lg font-bold text-slate-900">Facture {facture.numero}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={status} onChange={(e) => handleStatusChange(e.target.value as FactureStatus)} className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 ${STATUS_COLORS[status]}`}>
              {(Object.keys(STATUS_LABELS) as FactureStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={() => setShowPrint(true)}><Printer className="w-4 h-4" /> Aperçu PDF</Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />}
              {saving ? "Enregistrement…" : saved ? "Enregistré !" : "Enregistrer"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-5xl">
            <Card>
              <CardHeader><h3 className="text-sm font-semibold text-slate-800">Informations client</h3></CardHeader>
              <CardContent className="p-5 grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-slate-600 block mb-1">Nom / Raison sociale</label><input className={inputCls} value={form.clientNom} onChange={(e) => setF("clientNom", e.target.value)} /></div>
                <div><label className="text-xs font-medium text-slate-600 block mb-1">Email</label><input className={inputCls} type="email" value={form.clientEmail} onChange={(e) => setF("clientEmail", e.target.value)} /></div>
                <div><label className="text-xs font-medium text-slate-600 block mb-1">Adresse</label><textarea className={`${inputCls} resize-none`} rows={2} value={form.clientAdresse} onChange={(e) => setF("clientAdresse", e.target.value)} /></div>
                <div><label className="text-xs font-medium text-slate-600 block mb-1">Date d&apos;échéance</label><input className={inputCls} type="date" value={form.echeanceDate} onChange={(e) => setF("echeanceDate", e.target.value)} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Lignes de facturation</h3>
                  <div className="flex gap-2">
                    {prestations.length > 0 && <Button variant="outline" size="sm" onClick={() => setShowPrestations(true)}><BookOpen className="w-4 h-4" /> Depuis catalogue</Button>}
                    <Button variant="primary" size="sm" onClick={() => addLigne()}><Plus className="w-4 h-4" /> Ligne libre</Button>
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase w-8" />
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase">Désignation</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase w-24">Qté</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase w-24">Unité</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase w-28">P.U. HT</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase w-20">TVA%</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase w-28">Total HT</th>
                    <th className="px-2 py-2.5 w-8" />
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {lignes.map((l, i) => (
                      <tr key={i}>
                        <td className="px-2 py-2 text-slate-300"><GripVertical className="w-4 h-4" /></td>
                        <td className="px-2 py-2">
                          <input className="w-full px-2 py-1.5 text-sm border border-transparent hover:border-slate-200 rounded focus:outline-none focus:border-slate-300 bg-transparent focus:bg-white" value={l.label} onChange={(e) => updateLigne(i, "label", e.target.value)} />
                          <input className="w-full px-2 py-1 text-xs text-slate-400 border border-transparent hover:border-slate-200 rounded focus:outline-none focus:border-slate-300 bg-transparent focus:bg-white mt-0.5" placeholder="Détail optionnel…" value={l.description} onChange={(e) => updateLigne(i, "description", e.target.value)} />
                        </td>
                        <td className="px-2 py-2"><input type="number" min={0} step="0.01" className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none bg-white text-right" value={l.quantite} onChange={(e) => updateLigne(i, "quantite", parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-2"><select className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none bg-white" value={l.unite} onChange={(e) => updateLigne(i, "unite", e.target.value)}>{UNITE_OPTIONS.map((u) => <option key={u}>{u}</option>)}</select></td>
                        <td className="px-2 py-2"><input type="number" min={0} step="0.01" className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none bg-white text-right" value={l.prixUnitaire} onChange={(e) => updateLigne(i, "prixUnitaire", parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-2 py-2"><select className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none bg-white" value={l.tva} onChange={(e) => updateLigne(i, "tva", parseFloat(e.target.value))}>{TVA_OPTIONS.map((t) => <option key={t}>{t}</option>)}</select></td>
                        <td className="px-2 py-2 text-right"><span className="text-sm font-semibold text-slate-900">{formatCurrency(l.totalHT)}</span></td>
                        <td className="px-2 py-2"><button onClick={() => setLignes((p) => p.filter((_, idx) => idx !== i).map((x, idx) => ({ ...x, ordre: idx })))} className="p-1 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {lignes.length === 0 && <div className="text-center py-10 text-slate-400"><p className="text-sm">Aucune ligne</p></div>}
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <div className="w-60 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Total HT</span><span className="font-medium">{formatCurrency(totaux.ht)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>TVA</span><span className="font-medium">{formatCurrency(totaux.tva)}</span></div>
                  <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-200"><span>Total TTC</span><span>{formatCurrency(totaux.ttc)}</span></div>
                </div>
              </div>
            </Card>

            <Card>
              <CardContent className="p-5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Notes</label>
                <textarea className={`${inputCls} resize-none`} rows={3} value={form.notes} onChange={(e) => setF("notes", e.target.value)} placeholder="Conditions de paiement, mentions légales…" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
