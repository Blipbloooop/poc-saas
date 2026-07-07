"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { translateAuthError } from "@/lib/auth-errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

type Step = "email" | "otp" | "password" | "success";

const RESEND_DELAY = 60;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCountdown() {
    setResendCountdown(RESEND_DELAY);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) { clearInterval(countdownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await authClient.emailOtp.sendVerificationOtp({ email, type: "forget-password" });
      if (authError) throw new Error(translateAuthError(authError.message));
      setStep("otp");
      startCountdown();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError(null);
    try {
      const { error: authError } = await authClient.emailOtp.sendVerificationOtp({ email, type: "forget-password" });
      if (authError) throw new Error(translateAuthError(authError.message));
      setOtp("");
      startCountdown();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6 || !/^\d+$/.test(otp)) { setError("Le code doit contenir exactement 6 chiffres"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Code invalide ou expiré");
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code invalide ou expiré");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) { setError("Les mots de passe ne correspondent pas"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de la réinitialisation");
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  const stepConfig = {
    email: { title: "Mot de passe oublié", description: "Entrez votre email pour recevoir un code de vérification" },
    otp: { title: "Vérifiez votre email", description: `Un code à 6 chiffres a été envoyé à ${email}` },
    password: { title: "Nouveau mot de passe", description: "Choisissez un nouveau mot de passe sécurisé" },
    success: { title: "Mot de passe réinitialisé", description: "Votre mot de passe a été mis à jour avec succès" },
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center lg:hidden">
        <Image
          src="/brand/logo-lockup.png"
          alt="NaviBat"
          width={495}
          height={350}
          className="mx-auto h-12 w-auto"
        />
      </div>

      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>{stepConfig[step].title}</CardTitle>
          <CardDescription>{stepConfig[step].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step !== "success" && (
            <div className="flex items-center justify-center gap-2 mb-2">
              {(["email", "otp", "password"] as const).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    step === s ? "bg-primary text-primary-foreground"
                    : ["otp", "password"].indexOf(step) > i ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                  }`}>{i + 1}</div>
                  {i < 2 && <div className="w-8 h-px bg-border" />}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Adresse email</Label>
                <Input id="email" type="email" placeholder="vous@exemple.fr" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus />
              </div>
              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi en cours...</> : "Envoyer le code"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="otp">Code de vérification</Label>
                <Input id="otp" type="text" inputMode="numeric" placeholder="123456" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required autoFocus className="text-center text-xl tracking-widest font-mono" />
                <p className="text-xs text-muted-foreground">Le code est valide pendant 10 minutes.</p>
                <div className="flex justify-end pt-1">
                  {resendCountdown > 0 ? (
                    <span className="text-xs text-muted-foreground">Renvoyer dans {resendCountdown}s</span>
                  ) : (
                    <button type="button" onClick={handleResendOtp} className="text-xs text-primary hover:underline cursor-pointer">Renvoyer le code</button>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Vérification...</> : "Continuer"}
              </Button>
              <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(null); }} className="w-full text-sm text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Changer d&apos;adresse email
              </button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input id="newPassword" type="password" placeholder="8 caractères minimum" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type="password" placeholder="Répétez votre mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
                )}
              </div>
              <Button type="submit" className="w-full cursor-pointer" disabled={loading || (!!confirmPassword && newPassword !== confirmPassword)}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Réinitialisation...</> : "Réinitialiser le mot de passe"}
              </Button>
            </form>
          )}

          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              </div>
              <p className="text-sm text-muted-foreground">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              <Button className="w-full cursor-pointer" onClick={() => router.push("/signin")}>Se connecter</Button>
            </div>
          )}

          {step !== "success" && (
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/signin" className="text-primary hover:underline font-medium cursor-pointer inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Retour à la connexion
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
