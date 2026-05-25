# CLAUDE.md — SaaS B2B / CRM

## Stack technique

```
Framework  : Next.js 15 (App Router)
Déploiement: Vercel
UI         : shadcn/ui + Tailwind CSS
Data       : TanStack Query + Server Actions
Formulaires: React Hook Form + Zod
État global: Zustand
Auth       : Better Auth
DB         : PostgreSQL (Neon / Supabase) + Prisma (ou Drizzle)
Language   : TypeScript strict
```

---

## Architecture des dossiers

```
src/
├── app/                        # App Router Next.js
│   ├── (auth)/                 # Groupe de routes : login, register, reset
│   ├── (dashboard)/            # Groupe de routes : app protégée
│   │   ├── layout.tsx          # Layout avec auth guard
│   │   └── [feature]/
│   │       ├── page.tsx        # Server Component (fetch initial)
│   │       └── _components/    # Composants locaux à la route
│   ├── api/
│   │   ├── auth/[...all]/      # Better Auth handler
│   │   └── webhooks/           # Webhooks externes (Stripe, etc.)
│   └── layout.tsx
├── components/
│   ├── ui/                     # Composants shadcn/ui (ne pas modifier)
│   └── shared/                 # Composants réutilisables custom
├── lib/
│   ├── auth.ts                 # Config Better Auth (serveur)
│   ├── auth-client.ts          # Config Better Auth (client)
│   ├── db.ts                   # Instance Prisma singleton
│   ├── validations/            # Schémas Zod partagés
│   └── utils.ts                # cn() et helpers
├── server/
│   └── actions/                # Server Actions Next.js
├── hooks/                      # Custom hooks React
├── stores/                     # Stores Zustand
└── types/                      # Types TypeScript globaux
```

---

## Règles TypeScript

- **TypeScript strict** activé dans `tsconfig.json` : `"strict": true`
- Pas de `any` — utiliser `unknown` et affiner avec des guards
- Toujours typer les props des composants avec une `interface` dédiée
- Utiliser `satisfies` pour valider des objets de config sans perdre l'inférence
- Exporter les types inférés depuis Zod : `type FormData = z.infer<typeof formSchema>`
- Pas d'`enum` TypeScript — utiliser `as const` objects ou unions de strings

```typescript
// ✅ Bon
const ROLES = ["admin", "member", "viewer"] as const;
type Role = (typeof ROLES)[number];

// ❌ Éviter
enum Role {
  Admin,
  Member,
  Viewer,
}
```

---

## Next.js App Router — règles fondamentales

### Server vs Client Components

- **Par défaut : Server Component.** Ajouter `"use client"` uniquement si nécessaire
- Nécessite `"use client"` : hooks React, event handlers, state, effets, APIs navigateur
- Ne jamais importer une lib CSS-in-JS runtime dans un Server Component
- Les Server Components peuvent être async — en profiter pour fetch directement

```typescript
// ✅ Server Component — fetch direct, pas de useEffect
export default async function UsersPage() {
  const users = await db.user.findMany({ where: { tenantId: getTenantId() } })
  return <UserTable users={users} />
}
```

### Server Actions

- Toujours déclarer `"use server"` en haut du fichier ou de la fonction
- **Valider les inputs avec Zod** systématiquement — ne jamais faire confiance aux données entrantes
- Vérifier l'authentification et les permissions en début de chaque action
- Retourner un objet typé `{ success, data?, error? }` — pas de throws silencieux
- Appeler `revalidatePath()` ou `revalidateTag()` après chaque mutation

```typescript
// src/server/actions/users.ts
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
});

export async function createUser(input: unknown) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  const user = await db.user.create({
    data: { ...parsed.data, tenantId: session.user.tenantId },
  });

  revalidatePath("/dashboard/users");
  return { success: true, data: user };
}
```

### Metadata et SEO

- Toujours exporter `metadata` ou `generateMetadata` dans les pages publiques
- Utiliser `notFound()` de Next.js pour les ressources inexistantes

---

## Base de données — Prisma

### Schéma

- Toujours inclure `createdAt`, `updatedAt`, `id` (cuid2 ou uuid) sur chaque modèle
- **Multi-tenant** : chaque modèle métier a un champ `tenantId` + relation `Tenant`
- Soft delete : ajouter `deletedAt DateTime?` plutôt que de supprimer physiquement
- Index sur les champs filtrés fréquemment : `tenantId`, `email`, `status`

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  role      UserRole  @default(MEMBER)
  tenantId  String
  tenant    Tenant    @relation(fields: [tenantId], references: [id])
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([tenantId])
  @@index([email])
}
```

### Singleton Prisma (éviter les connexions multiples en dev)

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

### Requêtes

- Toujours filtrer par `tenantId` — ne jamais faire de requête globale sans scope tenant
- Sélectionner uniquement les champs nécessaires avec `select` ou `omit`
- Utiliser `db.$transaction()` pour les opérations atomiques
- Paginer avec `take` + `skip` ou cursor-based pagination pour les grosses listes

---

## Authentification — Better Auth

### Configuration

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  plugins: [organization()], // multi-tenant natif
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // refresh après 1 jour
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
});
```

### Sécurité Auth

- Ne jamais exposer le token de session dans des logs
- Vérifier la session **côté serveur** dans chaque Server Action et route API
- Utiliser le middleware Next.js pour protéger les routes dashboard
- Rate limiting sur les routes d'auth (utiliser `@upstash/ratelimit` sur Vercel)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const session = getSessionCookie(request);
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

---

## Multi-tenant

- Chaque `Organization` Better Auth = un `Tenant`
- **Toujours** résoudre le `tenantId` depuis la session — jamais depuis un paramètre URL non vérifié
- Row-Level Security (RLS) activé sur PostgreSQL pour une isolation forte
- Les URLs peuvent contenir un slug tenant (`/app/[tenant]/...`) mais la vérification se fait côté serveur

```typescript
// Helper à réutiliser dans chaque Server Action
async function requireTenant() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.activeOrganizationId) throw new Error("Unauthorized");
  return session.user.activeOrganizationId;
}
```

---

## TanStack Query

- Utiliser TanStack Query **uniquement côté client** pour les données mutées fréquemment ou temps réel
- Pour les données initiales stables : fetch dans le Server Component et passer en props
- Définir les `queryKey` de façon structurée : `["resource", tenantId, filters]`
- Toujours définir `staleTime` — ne pas laisser à 0 par défaut sur un CRM

```typescript
// hooks/useUsers.ts
export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
```

---

## Formulaires — React Hook Form + Zod

- Schéma Zod défini une seule fois dans `lib/validations/` et partagé front/back
- Utiliser `zodResolver` de `@hookform/resolvers/zod`
- Toujours afficher les erreurs de validation inline, pas en toast uniquement
- Les Server Actions revalident le schéma indépendamment du client

```typescript
// lib/validations/user.ts
export const createUserSchema = z.object({
  name: z.string().min(2, "Minimum 2 caractères"),
  email: z.string().email("Email invalide"),
  role: z.enum(["admin", "member", "viewer"]),
});
```

---

## Zustand

- Un store par domaine fonctionnel (pas un store global fourre-tout)
- Ne pas stocker de données serveur dans Zustand — c'est le rôle de TanStack Query
- Zustand = UI state (modals ouverts, filtres actifs, sidebar collapsed...)
- Utiliser `immer` middleware pour les mutations complexes

```typescript
// stores/ui.ts
interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

---

## Sécurité

### Règles générales

- **Ne jamais** faire confiance aux données côté client — tout revalider serveur
- Variables d'environnement : seules les vars préfixées `NEXT_PUBLIC_` sont exposées au client
- Secrets (DB, auth, clés API) uniquement dans des vars sans `NEXT_PUBLIC_`
- Valider les variables d'env au démarrage avec Zod

```typescript
// src/env.ts — valider les envs au build
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

### Headers de sécurité

Configurer dans `next.config.ts` :

```typescript
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];
```

### Protection CSRF

- Les Server Actions Next.js ont une protection CSRF intégrée
- Pour les routes API custom : vérifier l'`Origin` header

### Injection SQL

- Prisma utilise des requêtes préparées — pas d'interpolation de chaînes dans `$queryRaw`
- Si `$queryRaw` nécessaire : utiliser impérativement `Prisma.sql` template tag

---

## Performance

### Images

- Toujours utiliser `next/image` — jamais de balise `<img>` directe
- Définir `width` et `height` explicitement ou utiliser `fill` avec un conteneur positionné
- Format WebP/AVIF automatique via Vercel Image Optimization

### Fonts

- Utiliser `next/font` pour charger les polices — zéro layout shift, self-hosted automatiquement

### Bundles

- Analyser avec `@next/bundle-analyzer` si le bundle client dépasse 200 Ko
- Lazy load les composants lourds avec `dynamic()` : éditeurs rich text, charts, cartes
- Pas d'import de lib entière : `import { format } from "date-fns"` pas `import * as dateFns`

### Caching

- Utiliser `unstable_cache` pour cacher des requêtes DB coûteuses côté serveur
- Taguer le cache avec `revalidateTag()` après les mutations liées
- `staleTime` adapté dans TanStack Query selon la criticité des données

---

## Gestion des erreurs

- Créer des fichiers `error.tsx` et `not-found.tsx` dans chaque segment de route important
- Logger les erreurs serveur avec un service dédié (Sentry recommandé sur Vercel)
- Ne jamais exposer les stack traces en production dans les réponses API
- Retourner des messages d'erreur utilisateur compréhensibles, pas les erreurs techniques

```typescript
// Pattern de retour uniforme pour les Server Actions
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string | ZodError };
```

---

## Variables d'environnement requises

```bash
# Base de données
DATABASE_URL=

# Better Auth
BETTER_AUTH_SECRET=          # openssl rand -base64 32
BETTER_AUTH_URL=             # https://ton-domaine.com

# App
NEXT_PUBLIC_APP_URL=

# Optionnel
SENTRY_DSN=
UPSTASH_REDIS_REST_URL=      # pour le rate limiting
UPSTASH_REDIS_REST_TOKEN=
```

---

## Commandes utiles

```bash
# Dev
pnpm dev

# DB
pnpm prisma migrate dev --name <nom>
pnpm prisma generate
pnpm prisma studio

# Type check
pnpm tsc --noEmit

# Lint
pnpm eslint . --fix

# Build
pnpm build
```

---

## Conventions de nommage

| Élément        | Convention                    | Exemple                |
| -------------- | ----------------------------- | ---------------------- |
| Composants     | PascalCase                    | `UserTable.tsx`        |
| Hooks          | camelCase préfixé `use`       | `useUsers.ts`          |
| Server Actions | camelCase                     | `createUser.ts`        |
| Stores Zustand | camelCase préfixé `use`       | `useUIStore.ts`        |
| Variables env  | SCREAMING_SNAKE_CASE          | `DATABASE_URL`         |
| Routes API     | kebab-case                    | `/api/user-invites`    |
| Tables DB      | PascalCase singulier (Prisma) | `User`, `Organization` |
