"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { translateAuthError } from "@/lib/auth-errors";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/shared/Logo";
import { createPendingSignup } from "@/server/actions/pending-signup";
import { Stepper } from "./_components/Stepper";
import { StepEntreprise, type EntrepriseData } from "./_components/StepEntreprise";
import { StepInfosLegales, type InfosLegalesData } from "./_components/StepInfosLegales";
import { StepCompteAdmin, type CompteAdminData } from "./_components/StepCompteAdmin";
import { StepConfirmation } from "./_components/StepConfirmation";

const STEP_LABELS = ["Entreprise", "Infos légales", "Compte admin", "Confirmation"];

const EMPTY_ENTREPRISE: EntrepriseData = { nom: "", activite: "", activitePrecision: "", effectif: "" };
const EMPTY_INFOS_LEGALES: InfosLegalesData = { siret: "", siren: "", adresse: "", codePostal: "", ville: "", tva: "" };
const EMPTY_COMPTE_ADMIN: CompteAdminData = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  password: "",
  confirmPassword: "",
};

function isStep0Valid(data: EntrepriseData): boolean {
  if (data.nom.trim().length === 0 || data.activite === "") return false;
  if (data.activite === "AUTRE" && data.activitePrecision.trim().length === 0) return false;
  return true;
}

function isStep2Valid(data: CompteAdminData): boolean {
  return (
    data.prenom.trim().length > 0 &&
    data.nom.trim().length > 0 &&
    data.email.trim().length > 0 &&
    data.telephone.trim().length > 0 &&
    data.password.length >= 8 &&
    data.password === data.confirmPassword
  );
}

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [entreprise, setEntreprise] = useState<EntrepriseData>(EMPTY_ENTREPRISE);
  const [infosLegales, setInfosLegales] = useState<InfosLegalesData>(EMPTY_INFOS_LEGALES);
  const [compteAdmin, setCompteAdmin] = useState<CompteAdminData>(EMPTY_COMPTE_ADMIN);

  function next() {
    setError(null);
    setStep((s) => Math.min(2, s + 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  // Étape "Compte admin" : on met de côté les infos entreprise/légales
  // (pas encore de session tant que l'email n'est pas confirmé), on crée le
  // compte, puis on bascule sur l'étape de confirmation — bloquante : la
  // création de l'organisation ne se fait qu'après validation du code à 6
  // chiffres (cf. StepConfirmation), sans quitter le wizard.
  async function handleCreateAccount() {
    setLoading(true);
    setError(null);

    try {
      const pendingResult = await createPendingSignup({
        email: compteAdmin.email,
        data: { entreprise, infosLegales, telephone: compteAdmin.telephone },
      });
      if (!pendingResult.success) throw new Error(pendingResult.error);

      const { error: signupError } = await authClient.signUp.email({
        name: `${compteAdmin.prenom} ${compteAdmin.nom}`.trim(),
        email: compteAdmin.email,
        password: compteAdmin.password,
      });
      if (signupError) throw new Error(translateAuthError(signupError.message));

      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Link href="/">
        <Logo iconSize={32} textSize={21} />
      </Link>

      <Stepper labels={STEP_LABELS} currentStep={step} />

      <div className="w-full max-w-[560px] rounded-[14px] border border-border bg-card p-9 shadow-[0_1px_2px_rgba(30,42,90,.05),0_12px_32px_rgba(30,42,90,.06)]">
        {step === 0 && <StepEntreprise data={entreprise} onChange={setEntreprise} />}
        {step === 1 && <StepInfosLegales data={infosLegales} onChange={setInfosLegales} />}
        {step === 2 && <StepCompteAdmin data={compteAdmin} onChange={setCompteAdmin} />}
        {step === 3 && <StepConfirmation email={compteAdmin.email} />}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {step < 3 && (
          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={back} disabled={loading} className="cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            ) : (
              <span />
            )}

            {step < 2 ? (
              <Button
                type="button"
                onClick={next}
                disabled={step === 0 && !isStep0Valid(entreprise)}
                className="cursor-pointer"
              >
                Continuer
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleCreateAccount}
                disabled={loading || !isStep2Valid(compteAdmin)}
                className="cursor-pointer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Création..." : "Créer mon compte"}
              </Button>
            )}
          </div>
        )}
      </div>

      {step < 3 && (
        <p className="text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/signin" className="font-bold text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      )}
    </>
  );
}
