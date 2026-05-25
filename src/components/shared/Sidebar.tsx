"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HardHat,
  Users,
  BookUser,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Bell,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/chantiers", label: "Chantiers", icon: HardHat },
  { href: "/collaborateurs", label: "Collaborateurs", icon: Users },
  { href: "/contacts", label: "Contacts", icon: BookUser },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-slate-900 text-white transition-all duration-300 relative",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-white leading-tight">ERP Pro</p>
            <p className="text-xs text-slate-400 leading-tight">Artisans & PME</p>
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
                isActive
                  ? "bg-green-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-slate-700 space-y-1">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={collapsed ? "Notifications" : undefined}
        >
          <Bell className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <span className="flex-1 text-left">Notifications</span>
          )}
          {!collapsed && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
              5
            </span>
          )}
        </button>

        {/* Profil utilisateur */}
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg",
            collapsed ? "justify-center" : ""
          )}
        >
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
            GD
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-white truncate">Guillaume Dubois</p>
              <p className="text-xs text-slate-400 truncate">Gérant</p>
            </div>
          )}
          {!collapsed && (
            <button className="text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bouton collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
