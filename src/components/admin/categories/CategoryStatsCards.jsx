"use client";

import { Layers, CheckCircle2, PowerOff, Loader2 } from "lucide-react";

export default function CategoryStatsCards({
  total = 0,
  activas = 0,
  inactivas = 0,
  loading = false,
  filtroEstado = "",
  onFiltroEstadoChange,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border-subtle shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-text-muted m-0">Total Categorías</p>
          <h3 className="text-2xl font-black text-text-primary mt-1 m-0">
            {loading ? <Loader2 size={20} className="animate-spin text-text-muted mt-1" /> : total}
          </h3>
          <p className="text-[11px] text-text-secondary mt-1 m-0">Clasificaciones del sistema</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
          <Layers size={24} />
        </div>
      </div>

      {/* Activas */}
      <div
        onClick={() => onFiltroEstadoChange?.(filtroEstado === "activo" ? "" : "activo")}
        className={`p-4 sm:p-5 rounded-2xl bg-surface border shadow-xs flex items-center justify-between cursor-pointer transition-all hover:border-emerald-400 ${
          filtroEstado === "activo" ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-border-subtle"
        }`}
        title="Click para filtrar solo activas"
      >
        <div>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 m-0">Activas</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 m-0">
            {loading ? <Loader2 size={20} className="animate-spin text-text-muted mt-1" /> : activas}
          </h3>
          <p className="text-[11px] text-text-secondary mt-1 m-0">Disponibles para reportes</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 size={24} />
        </div>
      </div>

      {/* Inactivas */}
      <div
        onClick={() => onFiltroEstadoChange?.(filtroEstado === "inactivo" ? "" : "inactivo")}
        className={`p-4 sm:p-5 rounded-2xl bg-surface border shadow-xs flex items-center justify-between cursor-pointer transition-all hover:border-amber-400 ${
          filtroEstado === "inactivo" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-border-subtle"
        }`}
        title="Click para filtrar solo inactivas"
      >
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 m-0">Inactivas</p>
          <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 m-0">
            {loading ? <Loader2 size={20} className="animate-spin text-text-muted mt-1" /> : inactivas}
          </h3>
          <p className="text-[11px] text-text-secondary mt-1 m-0">Dadas de baja lógica</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <PowerOff size={24} />
        </div>
      </div>
    </div>
  );
}
