"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const STATUS_CONFIG = [
  { key: "pendientes", label: "Pendiente", filterParam: "Pendiente", color: "#f59e0b", bgClass: "bg-amber-500", textClass: "text-amber-700 dark:text-amber-400" },
  { key: "enRevision", label: "En revisión", filterParam: "En revisión", color: "#6366f1", bgClass: "bg-indigo-500", textClass: "text-indigo-700 dark:text-indigo-400" },
  { key: "enProceso", label: "En proceso", filterParam: "En proceso", color: "#0ea5e9", bgClass: "bg-sky-500", textClass: "text-sky-700 dark:text-sky-400" },
  { key: "resueltos", label: "Resuelto", filterParam: "Resuelto", color: "#10b981", bgClass: "bg-emerald-500", textClass: "text-emerald-700 dark:text-emerald-400" },
  { key: "cancelados", label: "Cancelado", filterParam: "Cancelado", color: "#ef4444", bgClass: "bg-rose-500", textClass: "text-rose-700 dark:text-rose-400" },
];

export default function DashboardStatusDistribution({
  statsReclamos = {},
  totalReclamos = 0,
  totalReclamosCalculado = 0,
}) {
  const total = totalReclamosCalculado || totalReclamos || 0;

  return (
    <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
              Distribución por Estado
            </h3>
            <p className="text-xs text-text-secondary m-0 mt-0.5">
              Proporción sobre {total} reclamos registrados
            </p>
          </div>
          <Link
            href="/admin/reclamos"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 no-underline"
          >
            Supervisar
            <ChevronRight size={12} />
          </Link>
        </div>

        {/* Barra segmentada compacta */}
        <div className="w-full h-3 rounded-full bg-surface-subtle overflow-hidden flex my-4 border border-border-subtle/50">
          {total === 0 ? (
            <div className="w-full h-full bg-border-subtle/40" />
          ) : (
            STATUS_CONFIG.map((cfg) => {
              const cant = Number(statsReclamos[cfg.key] || 0);
              const pct = total > 0 ? (cant / total) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={cfg.key}
                  style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                  title={`${cfg.label}: ${cant} (${pct.toFixed(1)}%)`}
                  className="h-full transition-all"
                />
              );
            })
          )}
        </div>

        {/* Lista detallada con porcentajes y accesos a filtro */}
        <div className="space-y-2 mt-4">
          {STATUS_CONFIG.map((cfg) => {
            const cant = Number(statsReclamos[cfg.key] || 0);
            const pct = total > 0 ? ((cant / total) * 100).toFixed(1) : "0.0";

            return (
              <Link
                key={cfg.key}
                href={`/admin/reclamos?estado=${encodeURIComponent(cfg.filterParam)}`}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-subtle transition-colors group no-underline text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className="font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-text-muted">{pct}%</span>
                  <span className="font-bold text-text-primary w-10 text-right">
                    {cant.toLocaleString()}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-border-subtle mt-4 text-[11px] text-text-muted flex justify-between">
        <span>Resolución global</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {total > 0
            ? `${(((statsReclamos.resueltos || 0) / total) * 100).toFixed(0)}% resueltos`
            : "Sin datos"}
        </span>
      </div>
    </div>
  );
}
