"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";
import { useAuthentification } from "@/hooks/use-authentification";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Logo } from "@/components/shared/Logo";
import { GoogleIcon } from "@/components/shared/GoogleIcon";

function SigninForm() {
  const {
    signin,
    signinWithGoogle,
    loading,
    error,
    emailNotVerified,
    resendVerificationEmail,
    verifyEmailOtp,
    success,
  } = useAuthentification();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState("");
  const otpSentFor = useRef<string | null>(null);

  useEffect(() => {
    if (emailNotVerified && otpSentFor.current !== emailNotVerified) {
      otpSentFor.current = emailNotVerified;
      resendVerificationEmail(emailNotVerified);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailNotVerified]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signin({ email, password, rememberMe }, redirectTo);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!emailNotVerified) return;
    try {
      await verifyEmailOtp(emailNotVerified, otp);
      router.push(redirectTo);
    } catch {
      // erreur déjà exposée via `error`
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="lg:hidden">
        <Logo iconSize={30} textSize={20} />
      </div>

      <div>
        <h2 className="text-[26px] font-bold tracking-[-0.3px] text-foreground">Connexion</h2>
        <p className="mt-1.5 text-[14.5px] text-muted-foreground">
          Heureux de vous revoir. Accédez à votre espace.
        </p>
      </div>

      {emailNotVerified && (
        <div className="space-y-3 rounded-lg border border-warning-text/20 bg-warning-bg px-3 py-3 text-sm text-warning-text">
          <div className="flex items-center gap-2 font-medium">
            <Mail className="h-4 w-4 shrink-0" />
            Vérifiez votre adresse email
          </div>
          <p>
            Un code à 6 chiffres a été envoyé à{" "}
            <span className="font-semibold">{emailNotVerified}</span>.
          </p>
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-2">
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              className="text-center text-lg tracking-[0.3em] font-mono"
            />
            <Button type="submit" disabled={loading || otp.length !== 6} className="w-full cursor-pointer">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Vérification..." : "Vérifier"}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => resendVerificationEmail(emailNotVerified)}
            disabled={loading}
            className="cursor-pointer underline hover:text-foreground disabled:opacity-50"
          >
            Renvoyer le code
          </button>
        </div>
      )}
      {success && !emailNotVerified && (
        <div className="rounded-lg border border-success/20 bg-success-bg px-3 py-2 text-sm text-success">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive-bg px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@entreprise.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between text-[13.5px]">
          <label className="flex cursor-pointer items-center gap-2 text-body">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-[15px] w-[15px] accent-primary"
            />
            Se souvenir de moi
          </label>
          <Link href="/forgot-password" className="font-semibold text-secondary hover:text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <div className="flex items-center gap-3.5 text-[12.5px] text-faint">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={() => signinWithGoogle(redirectTo)}
        disabled={loading}
        className="flex cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-border-strong bg-white py-2.5 text-[14.5px] font-semibold text-foreground hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon className="h-[17px] w-[17px]" />
        Continuer avec Google
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-bold text-primary hover:underline">
          Créer votre espace
        </Link>
      </p>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense>
      <SigninForm />
    </Suspense>
  );
}
