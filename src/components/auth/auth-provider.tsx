"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthProvider({ children, requireAuth = false }: AuthProviderProps) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && requireAuth && !session) {
      router.push("/signin");
    }
  }, [session, isPending, requireAuth, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
