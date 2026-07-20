import { authClient } from "@/lib/auth-client";
import { translateAuthError } from "@/lib/auth-errors";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SigninData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export function useAuthentification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState<string | null>(null);
  const router = useRouter();

  const signin = async (data: SigninData, redirectTo = "/dashboard") => {
    setLoading(true);
    setError(null);
    setEmailNotVerified(null);

    try {
      const { data: result, error: authError } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe ?? true,
        callbackURL: redirectTo,
      });

      if (authError) {
        if (authError.code === "EMAIL_NOT_VERIFIED") {
          setEmailNotVerified(data.email);
          return;
        }
        throw new Error(translateAuthError(authError.message));
      }

      // Une nouvelle session démarre toujours sans organisation active :
      // on active la première (ou seule) organisation du membre.
      const { data: organizations } = await authClient.organization.list();
      if (organizations && organizations.length > 0) {
        await authClient.organization.setActive({ organizationId: organizations[0].id });
      }

      setSuccess("Vous êtes connecté");
      router.push(redirectTo);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signinWithGoogle = async (redirectTo = "/dashboard") => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      });

      if (authError) throw new Error(translateAuthError(authError.message));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion Google indisponible pour le moment");
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (authError) throw new Error(translateAuthError(authError.message));
      setSuccess("Code envoyé. Vérifiez votre boîte mail.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le code.");
    } finally {
      setLoading(false);
    }
  };

  // Vérifie le code à 6 chiffres et connecte l'utilisateur (autoSignInAfterVerification).
  const verifyEmailOtp = async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await authClient.emailOtp.verifyEmail({ email, otp });
      if (authError) throw new Error(translateAuthError(authError.message));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code invalide ou expiré");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signin,
    signinWithGoogle,
    resendVerificationEmail,
    verifyEmailOtp,
    loading,
    emailNotVerified,
    error,
    success,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
