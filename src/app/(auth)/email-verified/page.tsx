"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function EmailVerifiedContent() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/signin");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

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
          <CardTitle>Email confirmé !</CardTitle>
          <CardDescription>Votre compte est maintenant actif</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <div className="space-y-2">
            <p className="text-sm">
              Votre adresse email a bien été vérifiée. Connectez-vous pour accéder à votre espace.
            </p>
            <p className="text-xs text-muted-foreground">
              Redirection automatique dans {countdown} seconde{countdown > 1 ? "s" : ""}...
            </p>
          </div>
          <Button onClick={() => router.push("/signin")} className="w-full cursor-pointer">
            Se connecter maintenant
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmailVerifiedPage() {
  return (
    <Suspense>
      <EmailVerifiedContent />
    </Suspense>
  );
}
