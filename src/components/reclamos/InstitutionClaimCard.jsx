"use client";

import Link from "next/link";
import { MapPin, Users, AlertTriangle, ShieldAlert, ChevronRight } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { getCategoryIcon } from "@/components/brand/icons";
import { tiempoRelativo, fechaExacta } from "@/utils/dateFormatters";

export default function InstitutionClaimCard({ item }) {
  const CategoryIcon = getCategoryIcon(item.categoriaCodigo || item.categoriaNombre, item.categoriaNombre);
  const afectados = item.afectadosCount || 0;
  const fechaRef = item.fecha_ultimo_cambio_estado || item.fecha_creacion;
  const tiempoTexto = tiempoRelativo(fechaRef);
  const fechaCompleta = fechaExacta(fechaRef);

  return (
    <Link
      href={`/institucion/reclamos/${item.id}`}
      className="group relative flex flex-col justify-between h-full bg-surface rounded-2xl border border-border-subtle p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
    >
      <div>
        {/* Fila Superior: Estado + Badges de Alerta/Privado + Antigüedad contextual */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={item.estado} size="sm" />

            {item.visibilidad === "privado" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 shrink-0">
                <ShieldAlert size={11} />
                <span>Privado</span>
              </span>
            )}

            {Boolean(item.demorado) && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 shrink-0"
                title="Lleva 5 o más días en estado Pendiente esperando atención"
              >
                <AlertTriangle size={11} />
                <span>Demorado (+5d)</span>
              </span>
            )}
          </div>

          {/* Antigüedad contextual única */}
          <span
            className="text-[11px] font-medium text-text-muted shrink-0"
            title={fechaCompleta}
          >
            {tiempoTexto}
          </span>
        </div>

        {/* Título del Reclamo */}
        <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
          {item.titulo}
        </h3>

        {/* Categoría y Ubicación */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-secondary">
          {item.categoriaNombre && (
            <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
              <CategoryIcon size={13} className="text-primary shrink-0" />
              <span>{item.categoriaNombre}</span>
            </span>
          )}

          {item.categoriaNombre && item.direccion && (
            <span className="text-border-subtle select-none">·</span>
          )}

          {item.direccion && (
            <span
              className="inline-flex items-center gap-1 text-text-muted truncate max-w-[200px]"
              title={item.direccion}
            >
              <MapPin size={12} className="shrink-0" />
              <span>{item.direccion}</span>
            </span>
          )}
        </div>
      </div>

      {/* Pie de la Card: Apoyo vecinal a la izquierda + affordance a la derecha */}
      <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
          <Users size={13} className="text-text-muted shrink-0" />
          <span>{afectados} {afectados === 1 ? "afectado" : "afectados"}</span>
        </div>

        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
          <span>Gestionar</span>
          <ChevronRight size={14} />
        </span>
      </div>
    </Link>
  );
}
