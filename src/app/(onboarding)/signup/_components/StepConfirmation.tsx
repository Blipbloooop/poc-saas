"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";
import { useAuthentification } from "@/hooks/use-authentification";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { finishPendingSignup } from "@/server/actions/pending-signup";

interface StepConfirmationProps {
  email: string;
}

export function StepConfirmation({ email }: StepConfirmationProps) {
  const router = useRouter();
  const { resendVerificationEmail, verifyEmailOtp, loading, success, error, clearError } = useAuthentification();
  const [otp, setOtp] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  // Le code n'est utilisable qu'une fois : une fois vérifié, on ne relance
  // jamais verifyEmailOtp à nouveau (seul finishPendingSignup peut être rejoué).
  const [verified, setVerified] = useState(false);
  // Verrou synchrone (contrairement à `loading`, mis à jour via un re-render) :
  // évite qu'un double-clic très rapide envoie deux requêtes de vérification,
  // ce qui provoquait une organisation jamais créée en prod.
  const submittingRef = useRef(false);

  async function finalizeAccount() {
    setFinishing(true);
    try {
      const result = await finishPendingSignup();
      if (!result.success) throw new Error(result.error);
      router.push("/dashboard");
    } catch (err) {
      setFinishing(false);
      setFinishError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setFinishError(null);

    try {
      await verifyEmailOtp(email, otp);
      // autoSignInAfterVerification a ouvert la session : on peut finaliser
      // l'inscription (organisation + profil entreprise) sans quitter la page.
      setVerified(true);
      await finalizeAccount();
    } catch (err) {
      setFinishError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      submittingRef.current = false;
    }
  }

  const busy = loading || finishing;

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
        <Mail className="h-7 w-7 text-primary" />
      </div>
      <div>
        <h1 className="text-[23px] font-bold tracking-[-0.3px] text-foreground">Confirmez votre email</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Un code à 6 chiffres a été envoyé à <span className="font-semibold">{email}</span>.
        </p>
      </div>

      {verified ? (
        <div className="flex w-full max-w-[280px] flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Email confirmé. {finishError ? "La configuration de votre espace a échoué :" : "Configuration de votre espace..."}
          </p>
          {finishError && <p className="text-sm text-destructive">{finishError}</p>}
          {finishError && (
            <Button type="button" onClick={finalizeAccount} disabled={finishing} className="w-full cursor-pointer">
              {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {finishing ? "Configuration..." : "Réessayer"}
            </Button>
          )}
        </div>
      ) : (
        <>
          <form onSubmit={handleVerify} className="flex w-full max-w-[280px] flex-col gap-3">
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                clearError();
                setFinishError(null);
              }}
              required
              autoFocus
              disabled={busy}
              className="text-center text-xl tracking-[0.3em] font-mono"
            />

            {(error || finishError) && <p className="text-sm text-destructive">{error || finishError}</p>}
            {success && <p className="text-sm text-success">{success}</p>}

            <Button type="submit" disabled={busy || otp.length !== 6} className="w-full cursor-pointer">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {busy ? "Vérification..." : "Vérifier"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">Vérifiez également vos spams si vous ne trouvez pas l&apos;email.</p>

          <button
            type="button"
            onClick={() => resendVerificationEmail(email)}
            disabled={busy}
            className="cursor-pointer text-sm font-semibold text-primary underline hover:text-primary-dark disabled:opacity-50"
          >
            Renvoyer le code
          </button>
        </>
      )}
    </div>
  );
}

export default StepConfirmation;
