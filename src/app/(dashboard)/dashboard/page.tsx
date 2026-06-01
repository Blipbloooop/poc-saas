"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  FileText,
  AlertTriangle,
  Clock,
  Euro,
  HardHat,
  Users,
  CalendarCheck,
  PenLine,
  Zap,
  Package,
  MapPin,
  CheckSquare,
  Send,
  FilePlus,
  Bell,
  LayoutGrid,
  X,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  type Role,
  type Chantier,
  mockKPIs,
  mockChartData,
  mockAlertes,
  mockRdv,
  mockRentabiliteChantiers,
  mockInterventionsOuvrier,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "@/components/shared/ThemeProvider";
import CreateChantierModal from "@/components/shared/CreateChantierModal";

// ─── Config widgets ───────────────────────────────────────────────────────────

interface WidgetConfig {
  id: string;
  label: string;
  description: string;
}

const WIDGETS_BY_ROLE: Record<Role, WidgetConfig[]> = {
  direction: [
    { id: "kpis", label: "KPIs principaux", description: "CA, devis, impayés, retards" },
    { id: "progress", label: "Objectif mensuel", description: "Barre de progression du CA cible" },
    { id: "chart-ca", label: "Graphique CA 6 mois", description: "Évolution du chiffre d'affaires" },
    { id: "chart-rentabilite", label: "Rentabilité chantiers", description: "Marge par chantier" },
    { id: "alertes", label: "Alertes importantes", description: "Notifications critiques" },
    { id: "nouveau-chantier", label: "Créer un chantier", description: "Accès rapide à la création" },
  ],
  commercial: [
    { id: "kpis", label: "KPIs commerciaux", description: "Devis, leads, taux de conversion" },
    { id: "rdv", label: "Rendez-vous du jour", description: "Planning des RDV clients" },
    { id: "pipeline", label: "Pipeline commercial", description: "Funnel prospects → signés" },
    { id: "nouveau-chantier", label: "Créer un chantier", description: "Accès rapide à la création" },
  ],
  conducteur: [
    { id: "kpis", label: "KPIs chantiers", description: "Chantiers, retards, matériaux" },
    { id: "chantiers", label: "Chantiers actifs", description: "Avancement et équipes" },
    { id: "nouveau-chantier", label: "Créer un chantier", description: "Accès rapide à la création" },
  ],
  ouvrier: [
    { id: "kpis", label: "KPIs journée", description: "Interventions et heures" },
    { id: "intervention", label: "Intervention en cours", description: "Détails du chantier actif" },
    { id: "checklist", label: "Check-list", description: "Tâches de l'intervention" },
  ],
  administratif: [
    { id: "kpis", label: "KPIs administratifs", description: "Devis, factures, signatures" },
    { id: "taches", label: "Tâches prioritaires", description: "To-do du jour" },
    { id: "nouveau-chantier", label: "Créer un chantier", description: "Accès rapide à la création" },
  ],
};

// ─── Hook persistance widgets ─────────────────────────────────────────────────

function useDashboardWidgets(role: Role) {
  const allIds = WIDGETS_BY_ROLE[role].map((w) => w.id);
  const storageKey = `dashboard-widgets-${role}`;

  const [visible, setVisible] = useState<string[]>(allIds);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setVisible(JSON.parse(saved) as string[]);
      } catch {
        setVisible(allIds);
      }
    } else {
      setVisible(allIds);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const toggle = (id: string) => {
    setVisible((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    setVisible(allIds);
    localStorage.removeItem(storageKey);
  };

  const isVisible = (id: string) => visible.includes(id);
  const hiddenCount = allIds.length - visible.length;

  return { isVisible, toggle, reset, widgets: WIDGETS_BY_ROLE[role], hiddenCount };
}

// ─── Drawer personnalisation ──────────────────────────────────────────────────

interface CustomizerProps {
  role: Role;
  widgets: WidgetConfig[];
  isVisible: (id: string) => boolean;
  onToggle: (id: string) => void;
  onReset: () => void;
  onClose: () => void;
}

function DashboardCustomizer({ widgets, isVisible, onToggle, onReset, onClose }: CustomizerProps) {
  const { primaryColor } = useTheme();

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" style={{ color: primaryColor }} />
            <h2 className="text-sm font-semibold text-slate-900">Personnaliser le dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <p className="text-xs text-slate-500 mb-4">
            Activez ou désactivez les blocs que vous souhaitez afficher dans votre tableau de bord.
          </p>

          {widgets.map((widget) => {
            const active = isVisible(widget.id);
            return (
              <button
                key={widget.id}
                onClick={() => onToggle(widget.id)}
                className="w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left"
                style={
                  active
                    ? { borderColor: primaryColor, backgroundColor: primaryColor + "0d" }
                    : { borderColor: "#e2e8f0", backgroundColor: "white" }
                }
              >
                <div
                  className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={
                    active
                      ? { backgroundColor: primaryColor + "20", color: primaryColor }
                      : { backgroundColor: "#f1f5f9", color: "#94a3b8" }
                  }
                >
                  {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${active ? "text-slate-900" : "text-slate-400"}`}>
                    {widget.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{widget.description}</p>
                </div>
                <div
                  className="flex-shrink-0 w-9 h-5 rounded-full transition-colors relative mt-1"
                  style={{ backgroundColor: active ? primaryColor : "#e2e8f0" }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{ transform: active ? "translateX(18px)" : "translateX(2px)" }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-slate-100">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Card Nouveau Chantier ────────────────────────────────────────────────────

interface NewChantierCardProps {
  recentCount: number;
  onOpen: () => void;
}

function NewChantierCard({ recentCount, onOpen }: NewChantierCardProps) {
  const { primaryColor } = useTheme();
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: primaryColor + "15" }}
        >
          <HardHat className="w-6 h-6" style={{ color: primaryColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">Nouveau chantier</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {recentCount > 0
              ? `${recentCount} créé${recentCount > 1 ? "s" : ""} cette session`
              : "Créez un chantier en quelques clics"}
          </p>
        </div>
        <button
          onClick={onOpen}
          className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          + Créer
        </button>
      </CardContent>
    </Card>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  alert?: boolean;
}

function KpiCard({ label, value, sub, icon, color, alert }: KpiCardProps) {
  return (
    <Card className={alert ? "border-red-200" : ""}>
      <CardContent className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold mt-0.5 ${alert ? "text-red-600" : "text-slate-900"}`}>
            {value}
          </p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Vues par rôle ────────────────────────────────────────────────────────────

interface ViewProps {
  isVisible: (id: string) => boolean;
  onCreateChantier: () => void;
  recentChantiersCount: number;
}

function DirectionView({ isVisible, onCreateChantier, recentChantiersCount }: ViewProps) {
  const kpi = mockKPIs.direction;
  const progress = Math.round((kpi.caMonth / kpi.caTarget) * 100);

  return (
    <div className="space-y-6">
      {isVisible("kpis") && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="CA du mois"
            value={formatCurrency(kpi.caMonth)}
            sub={`Objectif : ${formatCurrency(kpi.caTarget)}`}
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            color="bg-green-50"
          />
          <KpiCard
            label="Devis en attente"
            value={String(kpi.devisEnAttente)}
            sub="Réponse client attendue"
            icon={<FileText className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50"
          />
          <KpiCard
            label="Factures impayées"
            value={formatCurrency(kpi.montantImpaye)}
            sub={`${kpi.facturesImpayees} factures`}
            icon={<Euro className="w-5 h-5 text-red-600" />}
            color="bg-red-50"
            alert
          />
          <KpiCard
            label="Chantiers en retard"
            value={`${kpi.chantiersEnRetard} / ${kpi.totalChantiers}`}
            sub="Nécessitent attention"
            icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
            color="bg-amber-50"
            alert={kpi.chantiersEnRetard > 0}
          />
        </div>
      )}

      {isVisible("progress") && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-700">Progression objectif mensuel</p>
              <span className="text-sm font-bold text-green-600">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {formatCurrency(kpi.caMonth)} réalisé · {formatCurrency(kpi.caTarget - kpi.caMonth)} restant
            </p>
          </CardContent>
        </Card>
      )}

      {(isVisible("chart-ca") || isVisible("chart-rentabilite")) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isVisible("chart-ca") && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-slate-800">Chiffre d&apos;affaires 6 mois</h3>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mois" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip formatter={(v) => (typeof v === "number" ? formatCurrency(v) : v)} />
                    <Line type="monotone" dataKey="ca" stroke="#16a34a" strokeWidth={2} dot={{ fill: "#16a34a" }} name="CA" />
                    <Line type="monotone" dataKey="objectif" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="4 4" name="Objectif" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {isVisible("chart-rentabilite") && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-slate-800">Rentabilité par chantier</h3>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mockRentabiliteChantiers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="chantier" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => (typeof v === "number" ? `${v}%` : v)} />
                    <Bar dataKey="marge" fill="#16a34a" radius={[4, 4, 0, 0]} name="Marge" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isVisible("alertes") && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Alertes importantes
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100">
              {mockAlertes.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <div
                    className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      a.type === "danger" ? "bg-red-500" : a.type === "warning" ? "bg-amber-500" : "bg-blue-400"
                    }`}
                  />
                  <p className="text-sm text-slate-700">{a.message}</p>
                  <span className="ml-auto text-xs text-slate-400 flex-shrink-0">{a.date}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {isVisible("nouveau-chantier") && (
        <NewChantierCard recentCount={recentChantiersCount} onOpen={onCreateChantier} />
      )}
    </div>
  );
}

function CommercialView({ isVisible, onCreateChantier, recentChantiersCount }: ViewProps) {
  const kpi = mockKPIs.commercial;
  return (
    <div className="space-y-6">
      {isVisible("kpis") && (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          <KpiCard
            label="Devis à relancer"
            value={String(kpi.devisARelancer)}
            sub="Sans réponse > 7 jours"
            icon={<Bell className="w-5 h-5 text-amber-600" />}
            color="bg-amber-50"
            alert
          />
          <KpiCard
            label="Signatures en attente"
            value={String(kpi.signaturesAttentes)}
            sub="Devis acceptés non signés"
            icon={<PenLine className="w-5 h-5 text-purple-600" />}
            color="bg-purple-50"
          />
          <KpiCard
            label="Nouveaux leads"
            value={String(kpi.nouveauxLeads)}
            sub="Ce mois-ci"
            icon={<Users className="w-5 h-5 text-green-600" />}
            color="bg-green-50"
          />
          <KpiCard
            label="Taux de conversion"
            value={`${kpi.tauxConversion}%`}
            sub="Devis → Chantier"
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50"
          />
          <KpiCard
            label="Devis en cours"
            value={String(kpi.devisEnCours)}
            sub="Envoyés ce mois"
            icon={<FileText className="w-5 h-5 text-slate-600" />}
            color="bg-slate-50"
          />
          <KpiCard
            label="RDV aujourd&apos;hui"
            value={String(kpi.rdvAujourdhui)}
            sub="Clients à rencontrer"
            icon={<CalendarCheck className="w-5 h-5 text-green-600" />}
            color="bg-green-50"
          />
        </div>
      )}

      {isVisible("rdv") && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800">Rendez-vous du jour</h3>
          </CardHeader>
          <CardContent className="p-0">
            {mockRdv.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 last:border-0">
                <div className="text-sm font-bold text-green-700 w-14 flex-shrink-0">{r.heure}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{r.client}</p>
                  <p className="text-xs text-slate-500">{r.type}</p>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {r.adresse}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isVisible("pipeline") && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800">Pipeline commercial</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Prospects", count: 4, color: "bg-slate-100 text-slate-700" },
                { label: "Devis envoyés", count: 5, color: "bg-blue-100 text-blue-700" },
                { label: "En négociation", count: 2, color: "bg-amber-100 text-amber-700" },
                { label: "Signés", count: 3, color: "bg-green-100 text-green-700" },
              ].map((col) => (
                <div key={col.label} className={`rounded-xl p-4 text-center ${col.color}`}>
                  <p className="text-2xl font-bold">{col.count}</p>
                  <p className="text-xs font-medium mt-1">{col.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isVisible("nouveau-chantier") && (
        <NewChantierCard recentCount={recentChantiersCount} onOpen={onCreateChantier} />
      )}
    </div>
  );
}

function ConducteurView({ isVisible, onCreateChantier, recentChantiersCount }: ViewProps) {
  const kpi = mockKPIs.conducteur;
  return (
    <div className="space-y-6">
      {isVisible("kpis") && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Chantiers du jour"
            value={String(kpi.chantiersDuJour)}
            icon={<HardHat className="w-5 h-5 text-green-600" />}
            color="bg-green-50"
          />
          <KpiCard
            label="Retards"
            value={String(kpi.retards)}
            sub="Chantiers en décalage"
            icon={<Clock className="w-5 h-5 text-red-600" />}
            color="bg-red-50"
            alert
          />
          <KpiCard
            label="Tâches urgentes"
            value={String(kpi.tachesUrgentes)}
            icon={<Zap className="w-5 h-5 text-amber-600" />}
            color="bg-amber-50"
            alert
          />
          <KpiCard
            label="Matériaux manquants"
            value={String(kpi.materiauxManquants)}
            sub="À commander"
            icon={<Package className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50"
          />
        </div>
      )}

      {isVisible("chantiers") && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800">Chantiers actifs</h3>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { ref: "CH-2024-001", client: "M. et Mme Leroy", avancement: 65, retard: true, equipe: "Moreau, Fontaine" },
              { ref: "CH-2024-005", client: "Résidence Les Acacias", avancement: 40, retard: true, equipe: "Moreau" },
              { ref: "CH-2024-002", client: "SCI Les Platanes", avancement: 0, retard: false, equipe: "Belhadj" },
            ].map((c) => (
              <div key={c.ref} className="px-5 py-4 border-b border-slate-50 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{c.ref} — {c.client}</p>
                    <p className="text-xs text-slate-500">Équipe : {c.equipe}</p>
                  </div>
                  {c.retard && <Badge variant="danger">En retard</Badge>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.retard ? "bg-red-400" : "bg-green-500"}`}
                      style={{ width: `${c.avancement}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-10 text-right">{c.avancement}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isVisible("nouveau-chantier") && (
        <NewChantierCard recentCount={recentChantiersCount} onOpen={onCreateChantier} />
      )}
    </div>
  );
}

function OuvrierView({ isVisible, onCreateChantier, recentChantiersCount }: ViewProps) {
  const intervention = mockInterventionsOuvrier[0];
  const [checklist, setChecklist] = useState(intervention.checklist);

  const toggleCheck = (index: number) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === index ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div className="space-y-6">
      {isVisible("kpis") && (
        <div className="grid grid-cols-2 gap-4">
          <KpiCard
            label="Interventions du jour"
            value="2"
            icon={<HardHat className="w-5 h-5 text-green-600" />}
            color="bg-green-50"
          />
          <KpiCard
            label="Heures travaillées"
            value="6h30"
            sub="Pointage en cours"
            icon={<Clock className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50"
          />
        </div>
      )}

      {isVisible("intervention") && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Intervention en cours</h3>
              <Badge variant="success">Actif</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-base font-semibold text-slate-900">{intervention.type}</p>
              <p className="text-sm text-slate-600">{intervention.client}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
              <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{intervention.adresse}</span>
            </div>
            <div className="flex gap-2 text-xs text-slate-500">
              <span className="bg-slate-100 px-2 py-1 rounded">{intervention.heureDebut}</span>
              <span className="self-center">→</span>
              <span className="bg-slate-100 px-2 py-1 rounded">{intervention.heureFin}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {isVisible("checklist") && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-green-600" />
              Check-list d&apos;intervention
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            {checklist.map((item, i) => (
              <label
                key={i}
                className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleCheck(i)}
                  className="w-4 h-4 accent-green-600"
                />
                <span className={`text-sm ${item.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AdministratifView({ isVisible, onCreateChantier, recentChantiersCount }: ViewProps) {
  const kpi = mockKPIs.administratif;
  return (
    <div className="space-y-6">
      {isVisible("kpis") && (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          <KpiCard
            label="Devis à envoyer"
            value={String(kpi.devisAEnvoyer)}
            icon={<Send className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50"
          />
          <KpiCard
            label="Factures à éditer"
            value={String(kpi.facturesAEditer)}
            icon={<FilePlus className="w-5 h-5 text-purple-600" />}
            color="bg-purple-50"
          />
          <KpiCard
            label="Factures impayées"
            value={formatCurrency(kpi.montantImpaye)}
            sub={`${kpi.facturesImpayees} factures`}
            icon={<Euro className="w-5 h-5 text-red-600" />}
            color="bg-red-50"
            alert
          />
          <KpiCard
            label="Signatures en attente"
            value={String(kpi.signaturesAttentes)}
            icon={<PenLine className="w-5 h-5 text-amber-600" />}
            color="bg-amber-50"
          />
          <KpiCard
            label="Documents manquants"
            value={String(kpi.documentsManquants)}
            icon={<FileText className="w-5 h-5 text-slate-600" />}
            color="bg-slate-50"
          />
        </div>
      )}

      {isVisible("taches") && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800">Tâches prioritaires du jour</h3>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { label: "Envoyer devis CH-2024-004 à M. Tissot", priorite: "Urgent", done: false },
              { label: "Relancer facture SCI Les Platanes (22 000 €)", priorite: "Urgent", done: false },
              { label: "Éditer facture CH-2024-003 Boulangerie Michaud", priorite: "Normal", done: false },
              { label: "Demander docs manquants chantier CH-2024-002", priorite: "Normal", done: true },
              { label: "Planifier RDV signature devis CH-2024-006", priorite: "Normal", done: false },
            ].map((t, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0 ${t.done ? "opacity-50" : ""}`}>
                <input type="checkbox" defaultChecked={t.done} className="w-4 h-4 accent-green-600" readOnly />
                <span className={`text-sm flex-1 ${t.done ? "line-through text-slate-400" : "text-slate-700"}`}>{t.label}</span>
                <Badge variant={t.priorite === "Urgent" ? "danger" : "outline"}>{t.priorite}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isVisible("nouveau-chantier") && (
        <NewChantierCard recentCount={recentChantiersCount} onOpen={onCreateChantier} />
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const ROLES_LIST = [
  { value: "direction" as const, label: "Direction / Gérant" },
  { value: "commercial" as const, label: "Commercial" },
  { value: "conducteur" as const, label: "Conducteur de travaux" },
  { value: "ouvrier" as const, label: "Ouvrier / Technicien" },
  { value: "administratif" as const, label: "Assistant admin." },
];

export default function DashboardPage() {
  const [activeRole, setActiveRole] = useState<Role>("direction");
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [recentChantiers, setRecentChantiers] = useState<Chantier[]>([]);
  const { primaryColor } = useTheme();
  const { isVisible, toggle, reset, widgets, hiddenCount } = useDashboardWidgets(activeRole);

  const handleChantierCreated = (chantier: Chantier) => {
    setRecentChantiers((prev) => [chantier, ...prev]);
  };

  const viewProps = {
    isVisible,
    onCreateChantier: () => setCreateModalOpen(true),
    recentChantiersCount: recentChantiers.length,
  };

  const roleViews: Record<Role, React.ReactNode> = {
    direction: <DirectionView {...viewProps} />,
    commercial: <CommercialView {...viewProps} />,
    conducteur: <ConducteurView {...viewProps} />,
    ouvrier: <OuvrierView {...viewProps} />,
    administratif: <AdministratifView {...viewProps} />,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-0.5">Lundi 22 avril 2024</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Switcher de rôle */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <span className="text-xs text-slate-400 px-2 font-medium">Vue :</span>
            {ROLES_LIST.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveRole(value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                style={
                  activeRole === value
                    ? { backgroundColor: primaryColor, color: "white" }
                    : { color: "#475569" }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bouton personnaliser */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomizerOpen(true)}
            className="relative"
          >
            <LayoutGrid className="w-4 h-4" />
            Personnaliser
            {hiddenCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                {hiddenCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Vue selon le rôle */}
      {roleViews[activeRole]}

      {/* Drawer personnalisation */}
      {customizerOpen && (
        <DashboardCustomizer
          role={activeRole}
          widgets={widgets}
          isVisible={isVisible}
          onToggle={toggle}
          onReset={reset}
          onClose={() => setCustomizerOpen(false)}
        />
      )}

      {/* Modal création chantier */}
      {createModalOpen && (
        <CreateChantierModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={handleChantierCreated}
        />
      )}
    </div>
  );
}
