"use client";

import { FileText, ShoppingCart, ChevronRight, X } from "lucide-react";
import { useTheme } from "@/components/shared/ThemeProvider";

export type CreationMode = "devis" | "bon_commande";

interface CreationTypeDialogProps {
  onSelect: (mode: CreationMode) => void;
  onClose: () => void;
}

export default function CreationTypeDialog({
  onSelect,
  onClose,
}: CreationTypeDialogProps) {
  const { primaryColor } = useTheme();
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Créer un chantier
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choisissez comment ce chantier démarre
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          {[
            {
              mode: "devis" as const,
              icon: <FileText className="w-7 h-7" />,
              title: "Créer un devis",
              desc: "Vous rédigez un devis à envoyer au client pour validation avant démarrage.",
            },
            {
              mode: "bon_commande" as const,
              icon: <ShoppingCart className="w-7 h-7" />,
              title: "Via bon de commande",
              desc: "Vous avez déjà reçu un bon de commande signé du client.",
            },
          ].map(({ mode, icon, title, desc }) => (
            <button
              key={mode}
              onClick={() => onSelect(mode)}
              className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-slate-200 hover:border-current transition-all text-center group"
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = primaryColor)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#e2e8f0")
              }
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: primaryColor + "15",
                  color: primaryColor,
                }}
              >
                {icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {desc}
                </p>
              </div>
              <div
                className="flex items-center gap-1 text-xs font-medium mt-1"
                style={{ color: primaryColor }}
              >
                Choisir <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
