"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, HardHat, Check, Loader2 } from "lucide-react";
import { ChantierStatus } from "@prisma/client";
import { createChantier, type CreateChantierInput, type ChantierWithResponsable } from "@/server/actions/chantiers";
import { getUsers, type UserSummary } from "@/server/actions/users";
import { useTheme } from "@/components/shared/ThemeProvider";

const STATUS_LABELS: Record<ChantierStatus, string> = {
  PROSPECT: "Prospect",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
};

interface ChantierForm {
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  status: ChantierStatus;
  budget: string;
  dateDebut: string;
  dateFin: string;
  responsableId: string;
  description: string;
}

const EMPTY_FORM: ChantierForm = {
  nom: "",
  adresse: "",
  ville: "",
  codePostal: "",
  status: ChantierStatus.PROSPECT,
  budget: "",
  dateDebut: "",
  dateFin: "",
  responsableId: "",
  description: "",
};

interface CreateChantierModalProps {
  onClose: () => void;
  onCreated: (chantier: ChantierWithResponsable) => void;
}

export default function CreateChantierModal({ onClose, onCreated }: CreateChantierModalProps) {
  const { primaryColor } = useTheme();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<ChantierForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ChantierForm, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {});
  }, []);

  const set = (field: keyof ChantierForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep1 = () => {
    const next: typeof errors = {};
    if (!form.nom.trim()) next.nom = "Requis";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setServerError(null);

    const input: CreateChantierInput = {
      nom: form.nom.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      adresse: form.adresse.trim() || undefined,
      ville: form.ville.trim() || undefined,
      codePostal: form.codePostal.trim() || undefined,
      budget: form.budget ? parseFloat(form.budget) : undefined,
      dateDebut: form.dateDebut || undefined,
      dateFin: form.dateFin || undefined,
      responsableId: form.responsableId || undefined,
    };

    const result = await createChantier(input);

    if (!result.success) {
      setServerError("Erreur lors de la création du chantier");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onCreated(result.data);
      onClose();
    }, 1200);
  };

  const inputClass = (field: keyof ChantierForm) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white transition-colors ${
      errors[field] ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-slate-200"
    }`;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor + "20" }}>
              <HardHat className="w-4 h-4" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Nouveau chantier</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Étapes */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-slate-50">
          {([1, 2] as const).map((s, i) => {
            const active = step === s;
            const done = step > s;
            return (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={done ? { backgroundColor: primaryColor, color: "white" } : active ? { backgroundColor: primaryColor + "20", color: primaryColor } : { backgroundColor: "#f1f5f9", color: "#94a3b8" }}
                  >
                    {done ? <Check className="w-3 h-3" /> : s}
                  </div>
                  <span className={`text-xs font-medium ${active ? "text-slate-800" : "text-slate-400"}`}>
                    {s === 1 ? "Informations" : "Planning & équipe"}
                  </span>
                </div>
                {i < 1 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2" />}
              </div>
            );
          })}
        </div>

        {/* Succès */}
        {success ? (
          <div className="px-6 py-12 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor + "20" }}>
              <Check className="w-7 h-7" style={{ color: primaryColor }} />
            </div>
            <p className="text-base font-semibold text-slate-900">Chantier créé !</p>
            <p className="text-sm text-slate-500">Il apparaît maintenant dans la liste.</p>
          </div>
        ) : step === 1 ? (
          <div className="px-6 py-5 space-y-4">
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{serverError}</div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nom du chantier <span className="text-red-400">*</span></label>
              <input type="text" placeholder="Ex : Rénovation salle de bain M. Leroy" value={form.nom} onChange={(e) => set("nom", e.target.value)} className={inputClass("nom")} />
              {errors.nom && <p className="text-xs text-red-500 mt-0.5">{errors.nom}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Adresse du chantier</label>
              <input type="text" placeholder="12 rue des Lilas" value={form.adresse} onChange={(e) => set("adresse", e.target.value)} className={inputClass("adresse")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Ville</label>
                <input type="text" placeholder="Lyon" value={form.ville} onChange={(e) => set("ville", e.target.value)} className={inputClass("ville")} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Code postal</label>
                <input type="text" placeholder="69001" value={form.codePostal} onChange={(e) => set("codePostal", e.target.value)} className={inputClass("codePostal")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Statut initial</label>
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white text-slate-700">
                  {(Object.keys(STATUS_LABELS) as ChantierStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Budget HT estimé (€)</label>
                <input type="number" placeholder="15000" min="0" value={form.budget} onChange={(e) => set("budget", e.target.value)} className={inputClass("budget")} />
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Date de début</label>
                <input type="date" value={form.dateDebut} onChange={(e) => set("dateDebut", e.target.value)} className={inputClass("dateDebut")} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Date de fin prévue</label>
                <input type="date" value={form.dateFin} onChange={(e) => set("dateFin", e.target.value)} className={inputClass("dateFin")} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Responsable</label>
              <select value={form.responsableId} onChange={(e) => set("responsableId", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white text-slate-700">
                <option value="">— Non assigné —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Notes internes</label>
              <textarea rows={3} placeholder="Instructions particulières, accès chantier…" value={form.description} onChange={(e) => set("description", e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white resize-none" />
            </div>
          </div>
        )}

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            {step === 2 ? (
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Retour
              </button>
            ) : (
              <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Annuler</button>
            )}

            {step === 1 ? (
              <button onClick={handleNext} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: primaryColor }}>
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60" style={{ backgroundColor: primaryColor }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {loading ? "Enregistrement…" : "Créer le chantier"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
