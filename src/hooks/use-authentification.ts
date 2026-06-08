import { authClient } from "@/lib/auth-client";
import { translateAuthError } from "@/lib/auth-errors";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SigninData {
  email: string;
  password: string;
}

interface SignupData extends SigninData {
  firstName: string;
  lastName: string;
}

export function useAuthentification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState<string | null>(null);
  const router = useRouter();

  const signup = async (data: SignupData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: authError } = await authClient.signUp.email({
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
      });

      if (authError) throw new Error(translateAuthError(authError.message));

      // TODO: rediriger vers /confirm-email quand SMTP configuré
      router.push("/dashboard");
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signin = async (data: SigninData, redirectTo = "/dashboard") => {
    setLoading(true);
    setError(null);
    setEmailNotVerified(null);

    try {
      const { data: result, error: authError } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: true,
        callbackURL: redirectTo,
      });

      if (authError) {
        // TODO: réactiver quand SMTP configuré
        // if (authError.code === "EMAIL_NOT_VERIFIED") {
        //   setEmailNotVerified(data.email);
        //   return;
        // }
        throw new Error(translateAuthError(authError.message));
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

  const resendVerificationEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Impossible de renvoyer l'email. Réessayez dans quelques instants.");
      }

      setSuccess("Email de vérification renvoyé. Vérifiez votre boîte mail.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de renvoyer l'email.");
    } finally {
      setLoading(false);
    }
  };

  return {
    signup,
    signin,
    resendVerificationEmail,
    loading,
    emailNotVerified,
    error,
    success,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(null),
  };
}
