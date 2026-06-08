"use client";

import { useState, useEffect } from "react";
import { Search, Mail, UserCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { getUsers, type UserSummary } from "@/server/actions/users";
import { useTheme } from "@/components/shared/ThemeProvider";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  MEMBER: "Membre",
  VIEWER: "Lecteur",
};

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function UserCard({ user, onClick }: { user: UserSummary; onClick: () => void }) {
  const { primaryColor } = useTheme();
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: primaryColor }}>
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[user.role] ?? user.role}</p>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
              <Mail className="w-3 h-3" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserDetail({ user, onClose }: { user: UserSummary; onClose: () => void }) {
  const { primaryColor } = useTheme();
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ backgroundColor: primaryColor }}>
            {getInitials(user.name)}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{ROLE_LABELS[user.role] ?? user.role}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <Mail className="w-4 h-4 text-slate-400" />
            <a href={`mailto:${user.email}`} className="hover:underline" style={{ color: primaryColor }}>{user.email}</a>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <UserCircle className="w-4 h-4 text-slate-400" />
            <span>Membre depuis le {new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollaborateursPage() {
  const { primaryColor } = useTheme();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserSummary | null>(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    search === "" ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Collaborateurs</h1>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} membre{users.length > 1 ? "s" : ""} dans l&apos;équipe</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: users.length, color: "bg-slate-50" },
          { label: "Admins", value: users.filter((u) => u.role === "ADMIN").length, color: "bg-blue-50" },
          { label: "Membres", value: users.filter((u) => u.role === "MEMBER").length, color: "bg-green-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Nom ou email…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 bg-white" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-sm">{users.length === 0 ? "Aucun collaborateur pour l'instant" : "Aucun résultat"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((u) => (
            <UserCard key={u.id} user={u} onClick={() => setSelected(u)} />
          ))}
        </div>
      )}

      {selected && <UserDetail user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
