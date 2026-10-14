"use client";

import { Loader2 } from "lucide-react";

export default function ClaimStatsCards({
  stats = {},
  loading = false,
  filtroEstado = "",
  onFiltroEstadoChange,
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* Total */}
      <div className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs">
        <p className="text-xs font-semibold text-text-muted m-0">Total Reclamos</p>
        <h3 className="text-2xl font-black text-text-primary mt-1 m-0">
          {loading ? <Loader2 size={18} className="animate-spin text-text-muted" /> : stats.total || 0}
        </h3>
        <p className="text-[11px] text-text-secondary mt-1 m-0">Reportes registrados</p>
      </div>

      {/* Pendientes */}
      <div
        onClick={() => onFiltroEstadoChange?.(filtroEstado === "Pendiente" ? "" : "Pendiente")}
        className={`p-4 rounded-2xl bg-surface border shadow-xs cursor-pointer transition-all hover:border-amber-400 ${
          filtroEstado === "Pendiente"
            ? "border-amber-500 ring-2 ring-amber-500/20"
            : "border-border-subtle"
        }`}
        title="Click para filtrar Pendientes"
      >
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 m-0">Pendientes</p>
        <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 m-0">
          {loading ? <Loader2 size={18} className="animate-spin text-text-muted" /> : stats.pendientes || 0}
        </h3>
        <p className="text-[11px] text-text-secondary mt-1 m-0">Sin iniciar gestión</p>
      </div>

      {/* En Proceso */}
      <div
        onClick={() => onFiltroEstadoChange?.(filtroEstado === "En proceso" ? "" : "En proceso")}
        className={`p-4 rounded-2xl bg-surface border shadow-xs cursor-pointer transition-all hover:border-sky-400 ${
          filtroEstado === "En proceso"
            ? "border-sky-500 ring-2 ring-sky-500/20"
            : "border-border-subtle"
        }`}
        title="Click para filtrar En proceso"
      >
        <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 m-0">En Proceso</p>
        <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1 m-0">
          {loading ? (
            <Loader2 size={18} className="animate-spin text-text-muted" />
          ) : (
            (stats.enProceso || 0) + (stats.enRevision || 0)
          )}
        </h3>
        <p className="text-[11px] text-text-secondary mt-1 m-0">Con intervención activa</p>
      </div>

      {/* Resueltos */}
      <div
        onClick={() => onFiltroEstadoChange?.(filtroEstado === "Resuelto" ? "" : "Resuelto")}
        className={`p-4 rounded-2xl bg-surface border shadow-xs cursor-pointer transition-all hover:border-emerald-400 ${
          filtroEstado === "Resuelto"
            ? "border-emerald-500 ring-2 ring-emerald-500/20"
            : "border-border-subtle"
        }`}
        title="Click para filtrar Resueltos"
      >
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 m-0">Resueltos</p>
        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 m-0">
          {loading ? <Loader2 size={18} className="animate-spin text-text-muted" /> : stats.resueltos || 0}
        </h3>
        <p className="text-[11px] text-text-secondary mt-1 m-0">Completados con éxito</p>
      </div>
    </div>
  );
}
