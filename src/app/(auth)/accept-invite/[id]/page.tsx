"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Logo } from "@/components/shared/Logo";
import { getInvitationPublic, acceptInvitationSetPassword, type InvitationPublic } from "@/server/actions/invitations";

const ROLE_LABELS: Record<string, string> = { admin: "Administrateur", member: "Membre" };

interface AcceptInvitePageProps {
  params: Promise<{ id: string }>;
}

export default function AcceptInvitePage({ params }: AcceptInvitePageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [invitation, setInvitation] = useState<InvitationPublic | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInvitationPublic(id)
      .then((result) => {
        if (result.success) setInvitation(result.data);
        else setInvitationError(result.error);
      })
      .finally(() => setChecking(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const result = await acceptInvitationSetPassword({ invitationId: id, password });
      if (!result.success) throw new Error(result.error);

      const { error: signinError } = await authClient.signIn.email({
        email: result.data.email,
        password,
        rememberMe: true,
      });
      if (signinError) throw new Error("Compte créé, mais la connexion automatique a échoué. Connectez-vous manuellement.");

      await authClient.organization.setActive({ organizationId: result.data.organizationId });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="lg:hidden">
        <Logo iconSize={30} textSize={20} />
      </div>

      <Card className="w-full">
        {checking ? (
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Vérification de l&apos;invitation...</p>
          </CardContent>
        ) : invitationError || !invitation ? (
          <>
            <CardHeader className="text-center">
              <CardTitle>Invitation invalide</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-4 text-center">
              <XCircle className="h-14 w-14 text-destructive" />
              <p className="text-sm text-muted-foreground">{invitationError}</p>
              <Button asChild variant="outline" className="w-full cursor-pointer">
                <a href="/signin">Retour à la connexion</a>
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle>Rejoignez {invitation.organizationName}</CardTitle>
              <CardDescription>
                {invitation.prenom ? `Bonjour ${invitation.prenom}, choisissez` : "Choisissez"} votre mot de passe pour
                accéder à votre espace en tant que {ROLE_LABELS[invitation.role] ?? invitation.role}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <Input id="email" type="email" value={invitation.email} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="8 caractères minimum"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmation</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Répétez le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Rejoindre l&apos;équipe
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
