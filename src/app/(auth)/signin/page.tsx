"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useAuthentification } from "@/hooks/use-authentification";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "SaaS BTP";

function SigninForm() {
  const { signin, loading, error, emailNotVerified, resendVerificationEmail, success } = useAuthentification();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signin({ email, password }, redirectTo);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">{APP_NAME}</h1>
      </div>

      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Connectez-vous à votre espace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailNotVerified && (
            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-3 text-sm text-amber-800 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Mail className="w-4 h-4 shrink-0" />
                Vérifiez votre adresse email
              </div>
              <p>
                Un email de confirmation a été envoyé à{" "}
                <span className="font-semibold">{emailNotVerified}</span>.
              </p>
              <button
                type="button"
                onClick={() => resendVerificationEmail(emailNotVerified)}
                disabled={loading}
                className="underline text-amber-700 hover:text-amber-900 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Envoi en cours..." : "Renvoyer l'email"}
              </button>
            </div>
          )}
          {success && !emailNotVerified && (
            <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline cursor-pointer"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
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

            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium cursor-pointer">
              Créer un compte
            </Link>
          </p>
        </CardContent>
      </Card>
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
