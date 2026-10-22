"use client";

import Link from "next/link";
import {
  MapPin,
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
} from "lucide-react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import ReclamoVisibilityBadge from "@/components/reclamos/ReclamoVisibilityBadge";
import { getCategoryIcon } from "@/components/brand/icons";
import {
  formatearFechaCorta,
  fechaExacta,
  tiempoRelativo,
} from "@/utils/dateFormatters";

function formatAntiguedad(reclamo) {
  const dias = reclamo?.diasEnEstado;
  if (dias === undefined || dias === null) {
    return tiempoRelativo(
      reclamo?.fecha_ultimo_cambio_estado || reclamo?.fecha_creacion
    );
  }
  if (dias === 0) return "Menos de 1 día";
  return `${dias} ${dias === 1 ? "día" : "días"}`;
}

export default function InstitucionReclamoTable({
  reclamos = [],
  pagina = 1,
  limite = 20,
  total = 0,
  onCambiarPagina,
}) {
  if (!reclamos || reclamos.length === 0) return null;

  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const inicioRango = total > 0 ? (pagina - 1) * limite + 1 : 1;
  const finRango = total > 0 ? Math.min(pagina * limite, total) : reclamos.length;

  return (
    <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
      {/* Vista de Tabla para Escritorio y Tablet */}
      <div className="hidden md:block overflow-x-auto">
        <table
          className="w-full text-left border-collapse text-xs sm:text-sm"
          aria-label="Listado operativo de reclamos asignados"
        >
          <thead>
            <tr className="bg-surface-subtle border-b border-border-subtle text-text-secondary font-semibold uppercase tracking-wider text-[11px]">
              <th scope="col" className="py-3 px-4">
                Reclamo
              </th>
              <th scope="col" className="py-3 px-4">
                Categoría
              </th>
              <th scope="col" className="py-3 px-4">
                Creación
              </th>
              <th scope="col" className="py-3 px-4">
                Visibilidad
              </th>
              <th scope="col" className="py-3 px-4">
                Estado
              </th>
              <th scope="col" className="py-3 px-4">
                Afectados
              </th>
              <th scope="col" className="py-3 px-4">
                Antigüedad / Demora
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {reclamos.map((r) => {
              const CategoryIcon = getCategoryIcon(
                r.categoriaCodigo || r.categoriaNombre,
                r.categoriaNombre
              );
              const afectados = Number(r.afectadosCount || 0);
              const idFormateado = `#${String(r.id).padStart(4, "0")}`;
              const antiguedadTexto = formatAntiguedad(r);

              return (
                <tr
                  key={r.id}
                  className="hover:bg-surface-subtle/50 transition-colors group"
                >
                  {/* Identificador y Título */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold text-text-muted">
                        {idFormateado}
                      </span>
                    </div>
                    <Link
                      href={`/institucion/reclamos/${r.id}`}
                      className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-1 focus-visible:outline-none focus-visible:underline"
                    >
                      {r.titulo}
                    </Link>
                    {r.direccion && (
                      <div
                        className="flex items-center gap-1 text-[11px] text-text-muted mt-0.5"
                        title={r.direccion}
                      >
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate max-w-[240px]">
                          {r.direccion}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Categoría */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-subtle border border-border-subtle text-text-primary text-xs font-medium">
                      <CategoryIcon
                        size={14}
                        className="text-primary shrink-0"
                      />
                      <span>{r.categoriaNombre || "General"}</span>
                    </span>
                  </td>

                  {/* Fecha de creación */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-text-secondary">
                    <span
                      className="font-medium text-text-primary block"
                      title={fechaExacta(r.fecha_creacion)}
                    >
                      {formatearFechaCorta(r.fecha_creacion)}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {tiempoRelativo(r.fecha_creacion)}
                    </span>
                  </td>

                  {/* Visibilidad */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <ReclamoVisibilityBadge
                      visibilidad={r.visibilidad || "publico"}
                      size="sm"
                    />
                  </td>

                  {/* Estado actual */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={r.estado} size="sm" />
                  </td>

                  {/* Cantidad de afectados */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary"
                      title='Ciudadanos que indicaron "A mí también me pasa"'
                    >
                      <Users size={14} className="text-text-muted shrink-0" />
                      <span>
                        {afectados} {afectados === 1 ? "afectado" : "afectados"}
                      </span>
                    </div>
                  </td>

                  {/* Antigüedad o Indicador de Demora */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className="inline-flex items-center gap-1 text-xs text-text-secondary font-medium"
                        title={`Tiempo en estado ${r.estado}`}
                      >
                        <Clock size={12} className="text-text-muted shrink-0" />
                        <span>{antiguedadTexto}</span>
                      </span>

                      {Boolean(r.demorado) && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shrink-0"
                          title="Lleva 5 o más días en estado Pendiente esperando atención"
                        >
                          <AlertTriangle size={11} className="shrink-0" />
                          <span>Demorado</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Acción para acceder al detalle */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Button
                      href={`/institucion/reclamos/${r.id}`}
                      size="sm"
                      variant="outline"
                      rightIcon={<ChevronRight size={14} />}
                      aria-label={`Gestionar reclamo ${idFormateado}: ${r.titulo}`}
                    >
                      Gestionar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista Compacta Responsive para Mobile */}
      <div className="md:hidden divide-y divide-border-subtle">
        {reclamos.map((r) => {
          const CategoryIcon = getCategoryIcon(
            r.categoriaCodigo || r.categoriaNombre,
            r.categoriaNombre
          );
          const afectados = Number(r.afectadosCount || 0);
          const idFormateado = `#${String(r.id).padStart(4, "0")}`;
          const antiguedadTexto = formatAntiguedad(r);

          return (
            <div key={r.id} className="p-4 space-y-3">
              {/* Fila superior: ID + Estado + Demorado */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-text-muted">
                    {idFormateado}
                  </span>
                  <ReclamoVisibilityBadge
                    visibilidad={r.visibilidad || "publico"}
                    size="sm"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Boolean(r.demorado) && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                      title="Lleva 5 o más días en estado Pendiente esperando atención"
                    >
                      <AlertTriangle size={11} className="shrink-0" />
                      <span>Demorado</span>
                    </span>
                  )}
                  <StatusBadge status={r.estado} size="sm" />
                </div>
              </div>

              {/* Título */}
              <div>
                <Link
                  href={`/institucion/reclamos/${r.id}`}
                  className="text-sm font-bold text-text-primary hover:text-primary transition-colors block leading-snug"
                >
                  {r.titulo}
                </Link>
                {r.direccion && (
                  <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{r.direccion}</span>
                  </div>
                )}
              </div>

              {/* Metadatos: Categoría, Creación, Antigüedad y Afectados */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <CategoryIcon size={13} className="text-primary shrink-0" />
                  <span className="truncate font-medium text-text-primary">
                    {r.categoriaNombre || "General"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-text-muted shrink-0" />
                  <span>{formatearFechaCorta(r.fecha_creacion)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-text-muted shrink-0" />
                  <span>
                    {afectados} {afectados === 1 ? "afectado" : "afectados"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-text-muted shrink-0" />
                  <span>{antiguedadTexto}</span>
                </div>
              </div>

              {/* Acción */}
              <div className="pt-2 border-t border-border-subtle flex justify-end">
                <Button
                  href={`/institucion/reclamos/${r.id}`}
                  size="sm"
                  variant="outline"
                  rightIcon={<ChevronRight size={14} />}
                  aria-label={`Gestionar reclamo ${idFormateado}: ${r.titulo}`}
                >
                  Gestionar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie de tabla: Resumen de resultados y Paginación */}
      <div className="p-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted bg-surface-subtle/30">
        <div>
          <span>
            Mostrando{" "}
            <strong className="text-text-primary">{inicioRango}</strong>–
            <strong className="text-text-primary">{finRango}</strong> de{" "}
            <strong className="text-text-primary">
              {total || reclamos.length}
            </strong>{" "}
            {(total || reclamos.length) === 1 ? "resultado" : "resultados"}
          </span>
          {totalPaginas > 1 && (
            <span className="ml-2">
              · Página <strong className="text-text-primary">{pagina}</strong> de{" "}
              <strong className="text-text-primary">{totalPaginas}</strong>
            </span>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={pagina <= 1}
              onClick={() => onCambiarPagina?.(pagina - 1)}
              leftIcon={<ChevronLeft size={14} />}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagina >= totalPaginas}
              onClick={() => onCambiarPagina?.(pagina + 1)}
              rightIcon={<ChevronRight size={14} />}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
