"use client";

import { useState } from "react";
import { X, ChevronRight, ChevronLeft, HardHat, Check } from "lucide-react";
import { CHANTIER_STATUTS, STATUT_LABELS, type Chantier, type ChantierStatut } from "@/lib/mock-data";
import { useTheme } from "@/components/shared/ThemeProvider";

interface ChantierForm {
  client: string;
  type: string;
  adresse: string;
  ville: string;
  statut: ChantierStatut;
  montantHT: string;
  dateDebut: string;
  dateFin: string;
  commercial: string;
  conducteur: string;
  notes: string;
}

const EMPTY_FORM: ChantierForm = {
  client: "",
  type: "",
  adresse: "",
  ville: "",
  statut: "prospect",
  montantHT: "",
  dateDebut: "",
  dateFin: "",
  commercial: "",
  conducteur: "",
  notes: "",
};

function generateReference(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 900) + 100);
  return `CH-${year}-${num}`;
}

interface CreateChantierModalProps {
  onClose: () => void;
  onCreated: (chantier: Chantier) => void;
}

export default function CreateChantierModal({ onClose, onCreated }: CreateChantierModalProps) {
  const { primaryColor } = useTheme();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<ChantierForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ChantierForm, string>>>({});
  const [success, setSuccess] = useState(false);

  const set = (field: keyof ChantierForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep1 = () => {
    const next: typeof errors = {};
    if (!form.client.trim()) next.client = "Requis";
    if (!form.type.trim()) next.type = "Requis";
    if (!form.adresse.trim()) next.adresse = "Requis";
    if (!form.ville.trim()) next.ville = "Requis";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: typeof errors = {};
    if (!form.dateDebut) next.dateDebut = "Requis";
    if (!form.dateFin) next.dateFin = "Requis";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = () => {
    if (!validateStep2()) return;

    const chantier: Chantier = {
      id: `c-${Date.now()}`,
      reference: generateReference(),
      client: form.client,
      type: form.type,
      adresse: form.adresse,
      ville: form.ville,
      statut: form.statut,
      commercial: form.commercial,
      conducteur: form.conducteur,
      techniciens: [],
      dateDebut: form.dateDebut,
      dateFin: form.dateFin,
      montantHT: parseFloat(form.montantHT) || 0,
      avancement: 0,
      retard: false,
      notes: form.notes,
    };

    setSuccess(true);
    setTimeout(() => {
      onCreated(chantier);
      onClose();
    }, 1200);
  };

  const inputClass = (field: keyof ChantierForm) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white transition-colors ${
      errors[field]
        ? "border-red-300 focus:ring-red-200"
        : "border-slate-200 focus:border-transparent"
    }`;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor + "20" }}>
              <HardHat className="w-4 h-4" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Nouveau chantier</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-slate-50">
          {(["1", "2"] as const).map((s, i) => {
            const stepNum = i + 1 as 1 | 2;
            const active = step === stepNum;
            const done = step > stepNum;
            return (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                    style={
                      done
                        ? { backgroundColor: primaryColor, color: "white" }
                        : active
                        ? { backgroundColor: primaryColor + "20", color: primaryColor }
                        : { backgroundColor: "#f1f5f9", color: "#94a3b8" }
                    }
                  >
                    {done ? <Check className="w-3 h-3" /> : s}
                  </div>
                  <span className={`text-xs font-medium ${active ? "text-slate-800" : "text-slate-400"}`}>
                    {stepNum === 1 ? "Client & travaux" : "Planning & équipe"}
                  </span>
                </div>
                {i < 1 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />}
              </div>
            );
          })}
        </div>

        {/* Contenu — écran de succès */}
        {success ? (
          <div className="px-6 py-12 flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor + "20" }}
            >
              <Check className="w-7 h-7" style={{ color: primaryColor }} />
            </div>
            <p className="text-base font-semibold text-slate-900">Chantier créé !</p>
            <p className="text-sm text-slate-500">Il apparaît maintenant dans la liste des chantiers.</p>
          </div>
        ) : step === 1 ? (
          /* ── Étape 1 ── */
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Client <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="M. et Mme Dupont"
                  value={form.client}
                  onChange={(e) => set("client", e.target.value)}
                  className={inputClass("client")}
                  style={{ ["--tw-ring-color" as string]: primaryColor + "40" }}
                />
                {errors.client && <p className="text-xs text-red-500 mt-0.5">{errors.client}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Type de travaux <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Rénovation salle de bain"
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  className={inputClass("type")}
                />
                {errors.type && <p className="text-xs text-red-500 mt-0.5">{errors.type}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Adresse du chantier <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="12 rue des Lilas"
                value={form.adresse}
                onChange={(e) => set("adresse", e.target.value)}
                className={inputClass("adresse")}
              />
              {errors.adresse && <p className="text-xs text-red-500 mt-0.5">{errors.adresse}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Ville <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Lyon"
                  value={form.ville}
                  onChange={(e) => set("ville", e.target.value)}
                  className={inputClass("ville")}
                />
                {errors.ville && <p className="text-xs text-red-500 mt-0.5">{errors.ville}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Statut initial</label>
                <select
                  value={form.statut}
                  onChange={(e) => set("statut", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white text-slate-700"
                >
                  {CHANTIER_STATUTS.map((s) => (
                    <option key={s} value={s}>{STATUT_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Montant HT estimé (€)</label>
              <input
                type="number"
                placeholder="15000"
                min="0"
                value={form.montantHT}
                onChange={(e) => set("montantHT", e.target.value)}
                className={inputClass("montantHT")}
              />
            </div>
          </div>
        ) : (
          /* ── Étape 2 ── */
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Date de début <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.dateDebut}
                  onChange={(e) => set("dateDebut", e.target.value)}
                  className={inputClass("dateDebut")}
                />
                {errors.dateDebut && <p className="text-xs text-red-500 mt-0.5">{errors.dateDebut}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Date de fin prévue <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.dateFin}
                  onChange={(e) => set("dateFin", e.target.value)}
                  className={inputClass("dateFin")}
                />
                {errors.dateFin && <p className="text-xs text-red-500 mt-0.5">{errors.dateFin}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Commercial</label>
                <input
                  type="text"
                  placeholder="Prénom Nom"
                  value={form.commercial}
                  onChange={(e) => set("commercial", e.target.value)}
                  className={inputClass("commercial")}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Conducteur de travaux</label>
                <input
                  type="text"
                  placeholder="Prénom Nom"
                  value={form.conducteur}
                  onChange={(e) => set("conducteur", e.target.value)}
                  className={inputClass("conducteur")}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Notes internes</label>
              <textarea
                rows={3}
                placeholder="Instructions particulières, accès chantier…"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 bg-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            {step === 2 ? (
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Retour
              </button>
            ) : (
              <button
                onClick={onClose}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Annuler
              </button>
            )}

            {step === 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <Check className="w-4 h-4" />
                Créer le chantier
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
