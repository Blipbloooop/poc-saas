"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  HardHat,
  Clock,
  AlertTriangle,
  LayoutGrid,
  X,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "@/components/shared/ThemeProvider";
import CreateChantierModal from "@/components/shared/CreateChantierModal";
import CreationTypeDialog, {
  type CreationMode,
} from "@/components/shared/CreationTypeDialog";
import {
  getDashboardStats,
  type DashboardStats,
} from "@/server/actions/dashboard";
import { type ChantierWithResponsable } from "@/server/actions/chantiers";

// ─── Config widgets ───────────────────────────────────────────────────────────

interface WidgetConfig {
  id: string;
  label: string;
  description: string;
}

const WIDGETS: WidgetConfig[] = [
  {
    id: "kpis",
    label: "KPIs chantiers",
    description: "Total, en cours, retards, budget",
  },
  {
    id: "nouveau-chantier",
    label: "Créer un chantier",
    description: "Accès rapide à la création",
  },
];

const STORAGE_KEY = "dashboard-widgets";

// ─── Hook widgets ─────────────────────────────────────────────────────────────

function useDashboardWidgets() {
  const allIds = WIDGETS.map((w) => w.id);
  const [visible, setVisible] = useState<string[]>(allIds);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setVisible(JSON.parse(saved));
      } catch {
        setVisible(allIds);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id: string) => {
    setVisible((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };
  const reset = () => {
    setVisible(allIds);
    localStorage.removeItem(STORAGE_KEY);
  };
  const isVisible = (id: string) => visible.includes(id);
  const hiddenCount = allIds.length - visible.length;

  return {
    isVisible,
    toggle,
    reset,
    widgets: WIDGETS,
    hiddenCount,
  };
}

// ─── Drawer customizer ────────────────────────────────────────────────────────

function DashboardCustomizer({
  widgets,
  isVisible,
  onToggle,
  onReset,
  onClose,
}: {
  widgets: WidgetConfig[];
  isVisible: (id: string) => boolean;
  onToggle: (id: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const { primaryColor } = useTheme();
  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" style={{ color: primaryColor }} />
            <h2 className="text-sm font-semibold text-slate-900">
              Personnaliser le dashboard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {widgets.map((widget) => {
            const active = isVisible(widget.id);
            return (
              <button
                key={widget.id}
                onClick={() => onToggle(widget.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
                style={
                  active
                    ? {
                        borderColor: primaryColor,
                        backgroundColor: primaryColor + "0d",
                      }
                    : { borderColor: "#e2e8f0", backgroundColor: "white" }
                }
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={
                    active
                      ? {
                          backgroundColor: primaryColor + "20",
                          color: primaryColor,
                        }
                      : { backgroundColor: "#f1f5f9", color: "#94a3b8" }
                  }
                >
                  {active ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${active ? "text-slate-900" : "text-slate-400"}`}
                  >
                    {widget.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {widget.description}
                  </p>
                </div>
                <div
                  className="flex-shrink-0 w-9 h-5 rounded-full relative"
                  style={{ backgroundColor: active ? primaryColor : "#e2e8f0" }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{
                      transform: active
                        ? "translateX(18px)"
                        : "translateX(2px)",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-5 py-4 border-t border-slate-100">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
          </button>
        </div>
      </div>
    </>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon,
  alert,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  const { primaryColor } = useTheme();
  return (
    <Card className={alert ? "border-red-200 bg-red-50/30" : ""}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: alert ? "#fee2e2" : primaryColor + "18",
              color: alert ? "#dc2626" : primaryColor,
            }}
          >
            {icon}
          </div>
        </div>
        <p
          className="text-3xl font-bold tracking-tight"
          style={{ color: alert ? "#dc2626" : "#0f172a" }}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Vue dashboard ────────────────────────────────────────────────────────────

function DashboardView({
  isVisible,
  stats,
  onCreateChantier,
}: {
  isVisible: (id: string) => boolean;
  stats: DashboardStats | null;
  onCreateChantier: () => void;
}) {
  const { primaryColor } = useTheme();
  const c = stats?.chantiers;

  return (
    <div className="space-y-5">
      {isVisible("kpis") && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Total chantiers"
            value={c ? String(c.total) : "—"}
            sub={
              c ? `${c.termine} terminé${c.termine > 1 ? "s" : ""}` : undefined
            }
            icon={<HardHat className="w-4 h-4" />}
          />
          <KpiCard
            label="En cours"
            value={c ? String(c.enCours) : "—"}
            sub={
              c
                ? `${c.prospect} prospect${c.prospect > 1 ? "s" : ""}`
                : undefined
            }
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <KpiCard
            label="En retard"
            value={c ? String(c.enRetard) : "—"}
            sub="Délai dépassé"
            icon={<Clock className="w-4 h-4" />}
            alert={!!c && c.enRetard > 0}
          />
          <KpiCard
            label="Budget total"
            value={c ? formatCurrency(c.budgetTotal) : "—"}
            sub={c ? `${formatCurrency(c.budgetEnCours)} en cours` : undefined}
            icon={<AlertTriangle className="w-4 h-4" />}
          />
        </div>
      )}

      {isVisible("nouveau-chantier") && (
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: primaryColor + "18",
                color: primaryColor,
              }}
            >
              <HardHat className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Nouveau chantier
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Créez un chantier en quelques clics
              </p>
            </div>
            <button
              onClick={onCreateChantier}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              + Créer
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [createMode, setCreateMode] = useState<CreationMode | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { primaryColor } = useTheme();
  const { isVisible, toggle, reset, widgets, hiddenCount } =
    useDashboardWidgets();

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const handleTypeSelected = (mode: CreationMode) => {
    setCreateMode(mode);
    setShowTypeDialog(false);
  };

  // Redirige vers le détail du chantier créé, onglet devis si mode devis
  const handleChantierCreated = (chantier: ChantierWithResponsable) => {
    setCreateMode(null);
    const tab = createMode === "devis" ? "?tab=devis" : "";
    router.push(`/chantiers/${chantier.id}${tab}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomizerOpen(true)}
            className="relative gap-1.5"
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

      <DashboardView
        isVisible={isVisible}
        stats={stats}
        onCreateChantier={() => setShowTypeDialog(true)}
      />

      {customizerOpen && (
        <DashboardCustomizer
          widgets={widgets}
          isVisible={isVisible}
          onToggle={toggle}
          onReset={reset}
          onClose={() => setCustomizerOpen(false)}
        />
      )}

      {showTypeDialog && (
        <CreationTypeDialog
          onSelect={handleTypeSelected}
          onClose={() => setShowTypeDialog(false)}
        />
      )}

      {createMode && (
        <CreateChantierModal
          onClose={() => setCreateMode(null)}
          onCreated={handleChantierCreated}
        />
      )}
    </div>
  );
}
