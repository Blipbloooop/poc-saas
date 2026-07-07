import Image from "next/image";
import { HardHat, FileText, Wrench } from "lucide-react";

const HIGHLIGHTS = [
  { icon: HardHat, text: "Suivi de chantiers en temps réel" },
  { icon: FileText, text: "Devis & factures générés en un clic" },
  { icon: Wrench, text: "Interventions planifiées pour vos équipes" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col lg:flex-row"
      style={{
        "--primary": "#f1701a",
        "--primary-dark": "#c85a12",
        "--primary-light": "#fde7d3",
        "--secondary": "#0a2149",
        "--color-primary": "#f1701a",
        "--color-primary-dark": "#c85a12",
        "--color-primary-light": "#fde7d3",
        "--color-primary-foreground": "#ffffff",
      } as React.CSSProperties}
    >
      <div className="relative hidden overflow-hidden bg-secondary lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(241,112,26,0.25),transparent_45%)]" />

        <Image
          src="/brand/logo-full.png"
          alt="NaviBat"
          width={495}
          height={365}
          priority
          className="relative h-auto w-56 xl:w-64"
        />

        <ul className="relative flex flex-col gap-5">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-white">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-sm font-medium">{text}</span>
            </li>
          ))}
        </ul>

        <p className="relative text-sm text-slate-400">
          L&apos;ERP des artisans qui pilote vos chantiers.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
