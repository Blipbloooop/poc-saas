import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERP Pro — Gestion artisans & PME",
  description: "Solution de gestion complète pour artisans et PME",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
