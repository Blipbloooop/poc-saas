import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const HIGHLIGHTS = [
  "Devis, factures et signatures électroniques au même endroit",
  "Suivi de chantier en temps réel, du devis à la facture",
  "Un tableau de bord adapté à chaque rôle de votre équipe",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="hidden shrink-0 flex-col justify-between bg-secondary p-12 text-white lg:flex lg:w-[44%] lg:min-w-[420px] xl:p-14">
        <Link href="/">
          <Logo variant="white" iconSize={38} textSize={24} />
        </Link>

        <div className="flex max-w-[400px] flex-col gap-7">
          <h1 className="text-[34px] font-bold leading-[1.25] tracking-[-0.5px]">
            L&apos;ERP des artisans qui pilote vos chantiers.
          </h1>
          <ul className="flex flex-col gap-4 text-[15px] text-[#C6CDE3]">
            {HIGHLIGHTS.map((text) => (
              <li key={text} className="flex items-start gap-3">
                <span className="font-bold text-primary">—</span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[13px] text-sidebar-faint">© 2026 NaviBat — Tous droits réservés</p>
      </aside>

      <main className="flex flex-1 items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  );
}
