import type { Metadata } from "next";
import { Figtree, Nunito } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "NaviBat — L'ERP des artisans qui pilote vos chantiers",
  description: "Solution de gestion complète pour artisans et PME du bâtiment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`h-full ${figtree.variable} ${nunito.variable}`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
