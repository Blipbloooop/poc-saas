"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, FileText, Loader2, AlertTriangle } from "lucide-react";
import { getDevisByToken, signDevis } from "@/server/actions/devis";
import { formatCurrency } from "@/lib/utils";

type DevisData = Awaited<ReturnType<typeof getDevisByToken>>;

export default function SignaturePage() {
  const { token } = useParams<{ token: string }>();
  const [devis, setDevis] = useState<DevisData>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDevisByToken(token).then((d) => {
      setDevis(d);
      if (d?.status === "SIGNE") setSigned(true);
    }).catch(() => setError("Erreur lors du chargement")).finally(() => setLoading(false));
  }, [token]);

  const handleSign = async () => {
    setSigning(true);
    const result = await signDevis(token);
    if (result.success) setSigned(true);
    else setError(result.error ?? "Erreur lors de la signature");
    setSigning(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
    </div>
  );

  if (!devis) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center text-slate-500">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-400" />
        <p className="text-lg font-semibold">Lien invalide ou expiré</p>
      </div>
    </div>
  );

  if (signed) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center text-slate-700 max-w-sm">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <p className="text-xl font-bold">Devis signé !</p>
        <p className="text-sm text-slate-500 mt-2">Votre accord a bien été enregistré. Vous recevrez une confirmation par email.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm mb-4">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Devis {devis.numero}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Votre devis est prêt à signer</h1>
          <p className="text-sm text-slate-500 mt-1">{devis.chantier.nom}</p>
        </div>

        {/* Devis */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">

          {/* Client */}
          <div className="px-8 py-6 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Destinataire</p>
            <p className="text-base font-semibold text-slate-900">{devis.clientNom}</p>
            {devis.clientAdresse && <p className="text-sm text-slate-500">{devis.clientAdresse}</p>}
          </div>

          {/* Lignes */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Désignation</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Qté</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">P.U. HT</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">TVA</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {devis.lignes.map((l) => (
                  <tr key={l.id}>
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-slate-900">{l.label}</p>
                      {l.description && <p className="text-xs text-slate-400 mt-0.5">{l.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">{l.quantite} {l.unite}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">{formatCurrency(l.prixUnitaire)}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">{l.tva}%</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">{formatCurrency(l.totalHT)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50">
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex gap-8 text-sm text-slate-600">
                <span>Total HT</span>
                <span className="font-medium w-28 text-right">{formatCurrency(devis.totalHT)}</span>
              </div>
              <div className="flex gap-8 text-sm text-slate-600">
                <span>TVA</span>
                <span className="font-medium w-28 text-right">{formatCurrency(devis.totalTVA)}</span>
              </div>
              <div className="flex gap-8 text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total TTC</span>
                <span className="w-28 text-right">{formatCurrency(devis.totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {devis.notes && (
            <div className="px-8 py-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{devis.notes}</p>
            </div>
          )}
        </div>

        {/* Bouton signature */}
        {error && <p className="text-center text-sm text-red-500 mb-4">{error}</p>}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-slate-400 text-center max-w-sm">
            En cliquant sur &quot;Signer le devis&quot;, vous acceptez les conditions et donnez votre accord pour la réalisation des travaux décrits ci-dessus.
          </p>
          <button
            onClick={handleSign}
            disabled={signing}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-sm bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-60 shadow-lg shadow-green-600/20"
          >
            {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {signing ? "Signature en cours…" : "Signer le devis"}
          </button>
        </div>
      </div>
    </div>
  );
}
