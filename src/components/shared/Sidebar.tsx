"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HardHat,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Bell,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/components/shared/ThemeProvider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/chantiers", label: "Chantiers", icon: HardHat },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { primaryColor, sidebarCompact, setSidebarCompact } = useTheme();

  return (
    <aside
      className={cn(
        "flex flex-col h-full text-white transition-all duration-300 relative",
        sidebarCompact ? "w-16" : "w-60"
      )}
      style={{ backgroundColor: "var(--secondary)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: "var(--secondary-border)" }}
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <Building2 className="w-5 h-5 text-white" />
        </div>
        {!sidebarCompact && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-white leading-tight">ERP Pro</p>
            <p className="text-xs leading-tight" style={{ color: "var(--secondary-border)" }}>
              Artisans & PME
            </p>
          </div>
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
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                isActive ? "text-white" : "text-slate-400 sidebar-item-hover hover:text-white"
              )}
              style={isActive ? { backgroundColor: primaryColor } : undefined}
              title={sidebarCompact ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCompact && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        className="px-2 py-4 border-t space-y-1"
        style={{ borderColor: "var(--secondary-border)" }}
      >
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 sidebar-item-hover hover:text-white transition-colors"
          title={sidebarCompact ? "Notifications" : undefined}
        >
          <Bell className="w-5 h-5 flex-shrink-0" />
          {!sidebarCompact && (
            <span className="flex-1 text-left">Notifications</span>
          )}
          {!sidebarCompact && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
              5
            </span>
          )}
        </button>

        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg",
            sidebarCompact ? "justify-center" : ""
          )}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ backgroundColor: primaryColor }}
          >
            GD
          </div>
          {!sidebarCompact && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-white truncate">Guillaume Dubois</p>
              <p className="text-xs truncate" style={{ color: "var(--secondary-border)" }}>
                Gérant
              </p>
            </div>
          )}
          {!sidebarCompact && (
            <button className="text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bouton collapse */}
      <button
        onClick={() => setSidebarCompact(!sidebarCompact)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
        style={{
          backgroundColor: "var(--secondary-hover)",
          borderColor: "var(--secondary-border)",
        }}
      >
        {sidebarCompact ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
