"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, HardHat, Settings, Bell, LogOut } from "lucide-react";
import { useTheme } from "@/components/shared/ThemeProvider";
import { Logo } from "@/components/shared/Logo";
import { authClient } from "@/lib/auth-client";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/chantiers", label: "Chantiers", icon: HardHat },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { primaryColor, organizationLogo, organizationName } = useTheme();
  const { data: session } = authClient.useSession();

  const userName = session?.user?.name ?? "Utilisateur";
  const userEmail = session?.user?.email ?? "";
  const initials = getInitials(userName);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/signin");
  };

  return (
    <aside
      className="flex h-full w-60 flex-col text-white relative"
      style={{ backgroundColor: "var(--secondary)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 py-5 border-b"
        style={{ borderColor: "var(--secondary-border)" }}
      >
        {organizationLogo ? (
          <Image
            src={organizationLogo}
            alt="Logo de l'entreprise"
            width={32}
            height={32}
            className="h-8 w-8 flex-shrink-0 rounded object-contain"
          />
        ) : (
          <Logo variant="white" iconOnly iconSize={30} className="flex-shrink-0" />
        )}
        {organizationName && (
          <p className="font-bold text-sm text-white leading-tight truncate">{organizationName}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "text-white" : "text-slate-400 sidebar-item-hover hover:text-white"
              }`}
              style={isActive ? { backgroundColor: primaryColor } : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        className="px-2 py-4 border-t space-y-1"
        style={{ borderColor: "var(--secondary-border)" }}
      >
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 sidebar-item-hover hover:text-white transition-colors">
          <Bell className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 text-left">Notifications</span>
        </button>

        {/* Profil utilisateur */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {initials}
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <p className="text-xs font-medium text-white truncate">{userName}</p>
            <p className="text-xs truncate" style={{ color: "var(--secondary-border)" }}>
              {userEmail}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
