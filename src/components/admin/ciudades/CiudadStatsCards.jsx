"use client";

import { Globe2, CheckCircle2, PowerOff, AlertTriangle } from "lucide-react";

export default function CiudadStatsCards({ stats = {}, loading = false }) {
  const statCards = [
    {
      label: "TOTAL REGISTRADAS",
      value: stats.total ?? 0,
      sub: "Localidades en padrón operativo",
      icon: <Globe2 size={20} className="text-primary" />,
      bgIcon: "bg-primary/10 text-primary border-primary/20",
    },
    {
      label: "CIUDADES ACTIVAS",
      value: stats.activas ?? 0,
      sub: "Habilitadas para reclamos y comunicados",
      icon: <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />,
      bgIcon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      label: "CIUDADES INACTIVAS",
      value: stats.inactivas ?? 0,
      sub: "Sin operación activa habilitada",
      icon: <PowerOff size={20} className="text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      label: "SIN INSTITUCIÓN PRINCIPAL",
      value: stats.sin_principal ?? 0,
      sub: "Requieren designar responsable general",
      icon: <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />,
      bgIcon: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, idx) => (
        <div
          key={idx}
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

