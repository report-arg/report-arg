"use client";

import { Building2, CheckCircle2, Clock } from "lucide-react";

export default function InstitucionStatsCards({ stats = {}, loading = false }) {
  const cards = [
    {
      label: "TOTAL REGISTRADAS",
      value: stats.total ?? 0,
      sub: "Entidades públicas / servicios",
      icon: <Building2 size={20} className="text-primary" />,
      bgIcon: "bg-primary/10 text-primary border-primary/20",
    },
    {
      label: "VERIFICADAS ACTIVAS",
      value: stats.verificadas ?? 0,
      sub: "Operativas con respuesta activa",
      icon: <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />,
      bgIcon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      label: "SOLICITUDES PENDIENTES",
      value: stats.pendientes ?? 0,
      sub: "Requieren revisión administrativa",
      icon: <Clock size={20} className="text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-surface rounded-2xl border border-border-subtle p-5 flex items-center justify-between shadow-2xs"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
              {card.label}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              {loading ? (
                <span className="inline-block w-8 h-7 bg-surface-subtle animate-pulse rounded-md" />
              ) : (
                card.value
              )}
            </div>
            <p className="text-xs text-text-muted m-0">{card.sub}</p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${card.bgIcon}`}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
