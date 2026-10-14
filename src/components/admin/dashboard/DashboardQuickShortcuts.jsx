"use client";

import Link from "next/link";
import { Clock, FileText, UserPlus, MapPin, ChevronRight } from "lucide-react";

export default function DashboardQuickShortcuts({
  statsInstituciones = {},
}) {
  return (
    <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted m-0 mb-1">
          Accesos Directos
        </h3>
        <p className="text-xs text-text-secondary m-0 mb-4">
          Atajos a las principales funciones del panel
        </p>

        <div className="space-y-2">
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
                  Verificar Solicitudes
                </p>
                <p className="text-[11px] text-text-muted truncate m-0">
                  Altas institucionales pendientes
                </p>
              </div>
            </div>
            {statsInstituciones.pendientes > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shrink-0">
                {statsInstituciones.pendientes}
              </span>
            ) : (
              <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
            )}
          </Link>

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
                  Bandeja y reasignación de instituciones
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
          </Link>

          <Link
            href="/admin/users/new"
            className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group no-underline"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                <UserPlus size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-primary truncate m-0">
                  Crear Nuevo Usuario
                </p>
                <p className="text-[11px] text-text-muted truncate m-0">
                  Alta manual con rol asignado
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
          </Link>

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
                  Administración Territorial
                </p>
                <p className="text-[11px] text-text-muted truncate m-0">
                  Ciudades y localidades operativas
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
