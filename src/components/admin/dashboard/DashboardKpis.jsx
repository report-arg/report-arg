"use client";

import Link from "next/link";
import { FileText, Users, Building2, Clock } from "lucide-react";

export default function DashboardKpis({
  statsReclamos = {},
  statsUsuarios = {},
  statsInstituciones = {},
  activosReclamos = 0,
}) {
  const hayPendientes = statsInstituciones.pendientes > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Reclamos Totales */}
      <Link
        href="/admin/reclamos"
        className="group block p-5 rounded-2xl bg-surface border border-border-subtle hover:border-primary/40 shadow-xs transition-all no-underline"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Reclamos Totales
          </span>
          <span className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
            <FileText size={18} />
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-text-primary m-0 tracking-tight">
          {(statsReclamos.total || 0).toLocaleString()}
        </p>
        <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {statsReclamos.resueltos || 0} resueltos
          </span>{" "}
          · {activosReclamos} en gestión
        </p>
      </Link>

      {/* Card 2: Usuarios Activos */}
      <Link
        href="/admin/users"
        className="group block p-5 rounded-2xl bg-surface border border-border-subtle hover:border-primary/40 shadow-xs transition-all no-underline"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Usuarios Activos
          </span>
          <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
            <Users size={18} />
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-text-primary m-0 tracking-tight">
          {(statsUsuarios.activos || 0).toLocaleString()}
        </p>
        <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
          de {(statsUsuarios.total || 0).toLocaleString()} registrados
          {statsUsuarios.inactivos > 0 && ` (${statsUsuarios.inactivos} inactivos)`}
        </p>
      </Link>

      {/* Card 3: Instituciones */}
      <Link
        href="/admin/institutions"
        className="group block p-5 rounded-2xl bg-surface border border-border-subtle hover:border-primary/40 shadow-xs transition-all no-underline"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Instituciones
          </span>
          <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
            <Building2 size={18} />
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-text-primary m-0 tracking-tight">
          {(statsInstituciones.total || 0).toLocaleString()}
        </p>
        <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
          <span className="font-semibold text-text-primary">
            {statsInstituciones.verificadas || 0}
          </span>{" "}
          verificadas operativas
        </p>
      </Link>

      {/* Card 4: Pendientes de Aprobación */}
      <Link
        href="/admin/solicitudes"
        className={`group block p-5 rounded-2xl border shadow-xs transition-all no-underline ${
          hayPendientes
            ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-300 dark:border-amber-800/60 hover:border-amber-400"
            : "bg-surface border-border-subtle hover:border-primary/40"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Pendientes Aprobación
          </span>
          <span
            className={`p-2 rounded-xl group-hover:scale-105 transition-transform ${
              hayPendientes
                ? "bg-amber-500 text-white"
                : "bg-surface-subtle text-text-muted"
            }`}
          >
            <Clock size={18} />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <p
            className={`text-2xl sm:text-3xl font-extrabold m-0 tracking-tight ${
              hayPendientes ? "text-amber-600 dark:text-amber-400" : "text-text-primary"
            }`}
          >
            {(statsInstituciones.pendientes || 0).toLocaleString()}
          </p>
          {hayPendientes && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300">
              Acción req.
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
          {hayPendientes
            ? "Solicitudes de alta en espera"
            : "Sin solicitudes pendientes"}
        </p>
      </Link>
    </div>
  );
}
