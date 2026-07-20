import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Routes accessibles sans être connecté
const PUBLIC_PATHS = new Set([
  "/signin",
  "/signup",
  "/forgot-password",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = getSessionCookie(request);
  const isPublic = PUBLIC_PATHS.has(pathname) || pathname.startsWith("/accept-invite/");

  // Les Server Actions postent sur l'URL de la page qui les a déclenchées
  // (ex: finishPendingSignup depuis /signup, juste après que verifyEmailOtp
  // vient d'ouvrir la session). Les rediriger casse le format de réponse
  // attendu par Next.js pour une action ("unexpected response from the
  // server" côté client) — on laisse systématiquement passer ces requêtes.
  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }

  // Pas de session → redirige vers /signin (sauf pages publiques et API)
  if (!session && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Déjà connecté → redirige vers /dashboard si on essaie d'accéder aux pages auth
  if (session && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protège tout sauf les fichiers statiques et les routes API Better Auth
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
