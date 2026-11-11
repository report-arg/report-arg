"use client";

import Link from "next/link";
import { FileText, Users, Building2, Clock, MapPin, AlertCircle } from "lucide-react";

export default function DashboardKpis({
  statsReclamos = {},
  statsUsuarios = {},
  statsInstituciones = {},
  statsCiudades = {},
  activosReclamos = 0,
}) {
  const hayPendientes = Number(statsInstituciones.pendientes || 0) > 0;
  const sinPrincipal = Number(statsCiudades.sinPrincipal || 0);
  const sinAsignar = Number(statsReclamos.sinAsignar || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Card 1: Pendientes de Aprobación */}
      <Link
        href="/admin/solicitudes"
        className={`group block p-4 sm:p-5 rounded-2xl border shadow-xs transition-all no-underline ${
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
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                : "bg-surface-subtle text-text-muted"
            }`}
          >
            <Clock size={17} />
          </span>
        </div>
        <p
          className={`text-2xl sm:text-3xl font-extrabold m-0 tracking-tight ${
            hayPendientes ? "text-amber-600 dark:text-amber-400" : "text-text-primary"
          }`}
        >
          {Number(statsInstituciones.pendientes || 0).toLocaleString()}
        </p>
        <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
          {hayPendientes ? (
            <span className="text-amber-700 dark:text-amber-400 font-semibold">
              Requiere revisión administrativa
            </span>
          ) : (
            "Todas las solicitudes al día"
          )}
        </p>
      </Link>

      {/* Card 2: Cobertura de Ciudades */}
      <Link
        href="/admin/ciudades"
        className={`group block p-4 sm:p-5 rounded-2xl border shadow-xs transition-all no-underline ${
          sinPrincipal > 0
            ? "bg-rose-500/5 dark:bg-rose-500/10 border-rose-300 dark:border-rose-800/60 hover:border-rose-400"
            : "bg-surface border-border-subtle hover:border-primary/40"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Ciudades Operativas
          </span>
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <MapPin size={17} />
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-text-primary m-0 tracking-tight">
          {(statsCiudades.activas || 0).toLocaleString()}
        </p>
        <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
          {sinPrincipal > 0 ? (
            <span className="text-rose-600 dark:text-rose-400 font-semibold inline-flex items-center gap-1">
              <AlertCircle size={12} />
              {sinPrincipal} sin institución principal
            </span>
          ) : (
            `de ${(statsCiudades.total || 0).toLocaleString()} registradas`
          )}
        </p>
      </Link>

      {/* Card 3: Instituciones */}
      <Link
        href="/admin/institutions"
        className="group block p-4 sm:p-5 rounded-2xl bg-surface border border-border-subtle hover:border-primary/40 shadow-xs transition-all no-underline"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Instituciones
          </span>
          <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
            <Building2 size={17} />
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-text-primary m-0 tracking-tight">
          {(statsInstituciones.verificadas || 0).toLocaleString()}
        </p>
        <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
          verificadas operativas
          {Number(statsInstituciones.suspendidas || 0) > 0 &&
            ` · ${statsInstituciones.suspendidas} suspendidas`}
        </p>
      </Link>

      {/* Card 4: Usuarios Activos */}
      <Link
        href="/admin/users"
        className="group block p-4 sm:p-5 rounded-2xl bg-surface border border-border-subtle hover:border-primary/40 shadow-xs transition-all no-underline"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Usuarios Activos
          </span>
          <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
            <Users size={17} />
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-text-primary m-0 tracking-tight">
          {(statsUsuarios.activos || 0).toLocaleString()}
        </p>
        <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
          de {(statsUsuarios.total || 0).toLocaleString()} registrados
          {Number(statsUsuarios.admins || 0) > 0 && ` (${statsUsuarios.admins} admins)`}
        </p>
      </Link>

      {/* Card 5: Reclamos Totales (Secundario Contextual) */}
      <Link
        href="/admin/reclamos"
        className="group block p-4 sm:p-5 rounded-2xl bg-surface border border-border-subtle hover:border-primary/40 shadow-xs transition-all no-underline"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Reclamos Totales
          </span>
          <span className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
            <FileText size={17} />
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-text-primary m-0 tracking-tight">
          {(statsReclamos.total || 0).toLocaleString()}
        </p>
        <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
          {sinAsignar > 0 ? (
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              ⚠️ {sinAsignar} sin asignar
            </span>
          ) : (
            `${statsReclamos.resueltos || 0} resueltos · ${activosReclamos} en gestión`
          )}
        </p>
      </Link>
    </div>
  );
}
