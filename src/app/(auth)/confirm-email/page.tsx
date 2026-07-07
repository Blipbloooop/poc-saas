"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ConfirmEmailPage() {
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
          <CardTitle>Vérifiez votre email</CardTitle>
          <CardDescription>Un lien de confirmation vous a été envoyé</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-sm">
              Consultez votre boîte mail et cliquez sur le lien de confirmation pour activer votre compte.
            </p>
            <p className="text-xs text-muted-foreground">
              Vérifiez également vos spams si vous ne trouvez pas l&apos;email.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full cursor-pointer">
            <Link href="/signin">Retour à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
