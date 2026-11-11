"use client";

import Link from "next/link";
import { Clock, FileText, UserPlus, MapPin, Building2, Tag, ChevronRight, AlertTriangle } from "lucide-react";

export default function DashboardQuickShortcuts({
  statsInstituciones = {},
  statsCiudades = {},
  statsReclamos = {},
}) {
  const pendientesInstituciones = Number(statsInstituciones.pendientes || 0);
  const sinPrincipal = Number(statsCiudades.sinPrincipal || 0);
  const sinAsignar = Number(statsReclamos.sinAsignar || 0);

  return (
    <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted m-0 mb-1">
          Accesos Directos y Operaciones
        </h3>
        <p className="text-xs text-text-secondary m-0 mb-4">
          Atajos directos a los módulos de administración y supervisión
        </p>

        <div className="space-y-2">
          {/* Solicitudes */}
          <Link
            href="/admin/solicitudes"
            className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group no-underline"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                <Clock size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-primary truncate m-0">
                  Bandeja de Solicitudes
                </p>
                <p className="text-[11px] text-text-muted truncate m-0">
                  Verificación de instituciones y activación
                </p>
              </div>
            </div>
            {pendientesInstituciones > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shrink-0">
                {pendientesInstituciones}
              </span>
            ) : (
              <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
            )}
          </Link>

          {/* Ciudades */}
          <Link
            href="/admin/ciudades"
            className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group no-underline"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                <MapPin size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-primary truncate m-0">
                  Gestión Territorial de Ciudades
                </p>
                <p className="text-[11px] text-text-muted truncate m-0">
                  Localidades activas e institución principal
                </p>
              </div>
            </div>
            {sinPrincipal > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shrink-0 inline-flex items-center gap-1">
                <AlertTriangle size={11} />
                {sinPrincipal}
              </span>
            ) : (
              <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
            )}
          </Link>

          {/* Instituciones */}
          <Link
            href="/admin/institutions"
            className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group no-underline"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform shrink-0">
                <Building2 size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-primary truncate m-0">
                  Padrón de Instituciones
                </p>
                <p className="text-[11px] text-text-muted truncate m-0">
                  Categorías, institución principal y habilitación
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
          </Link>

          {/* Reclamos */}
          <Link
            href="/admin/reclamos"
            className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group no-underline"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform shrink-0">
                <FileText size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-primary truncate m-0">
                  Supervisión de Reclamos
                </p>
                <p className="text-[11px] text-text-muted truncate m-0">
                  Monitoreo de estado y reasignación por ciudad
                </p>
              </div>
            </div>
            {sinAsignar > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shrink-0">
                {sinAsignar} huérfanos
              </span>
            ) : (
              <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
            )}
          </Link>

          {/* Categorías */}
          <Link
            href="/admin/categories"
            className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group no-underline"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                <Tag size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-primary truncate m-0">
                  Catálogo de Categorías
                </p>
                <p className="text-[11px] text-text-muted truncate m-0">
                  Cobertura institucional y altas/bajas lógicas
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
