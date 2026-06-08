import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-auth", "@better-auth/kysely-adapter", "kysely"],
  // Config Turbopack vide — Next.js 16 utilise Turbopack par défaut
  turbopack: {},
};

export default nextConfig;
