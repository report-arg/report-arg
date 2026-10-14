"use client";

import {
  MapPin,
  Building2,
  User,
  Eye,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import ReclamoStatusBadge from "@/components/reclamos/ReclamoStatusBadge";
import { getCategoryIcon } from "@/components/brand/icons";
import { tiempoRelativo } from "@/utils/dateFormatters";

export default function ReclamoTable({
  reclamos = [],
  loading = false,
  pagina = 1,
  totalPaginas = 1,
  onCambiarPagina,
  onVerDetalle,
  onReasignar,
}) {
  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs py-20 flex flex-col items-center justify-center text-text-muted gap-3">
        <Loader2 size={24} className="animate-spin text-primary" />
        <p className="text-sm m-0">Cargando reclamos de la plataforma...</p>
      </div>
    );
  }

  if (reclamos.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs py-16 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center mx-auto mb-3 text-text-muted">
          <Inbox size={24} />
        </div>
        <h4 className="text-base font-bold text-text-primary m-0">No se encontraron reclamos</h4>
        <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
          No hay reportes que coincidan con los criterios de búsqueda o filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
      {/* Tabla Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-surface-subtle border-b border-border-subtle text-text-secondary font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Reclamo / Ubicación</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Institución Responsable</th>
              <th className="py-3 px-4">Autor / Fecha</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {reclamos.map((r) => {
              const CatIcon = getCategoryIcon(r.categoriaCodigo || r.categoriaNombre, r.categoriaNombre);
              return (
                <tr key={r.id} className="hover:bg-surface-subtle/50 transition-colors">
                  {/* ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-text-muted whitespace-nowrap">
                    #{String(r.id).padStart(4, "0")}
                  </td>

                  {/* Título y Dirección */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-semibold text-text-primary line-clamp-1 m-0">
                      {r.titulo}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mt-1">
                      <MapPin size={12} className="shrink-0 text-text-muted" />
                      <span className="truncate">{r.direccion || "Sin dirección especificada"}</span>
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-subtle border border-border-subtle text-text-primary text-xs font-medium">
                      <CatIcon size={14} className="text-primary shrink-0" />
                      <span>{r.categoriaNombre || "General"}</span>
                    </div>
                  </td>

                  {/* Institución */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {r.institucionNombre ? (
                      <div className="flex items-center gap-1.5 text-xs text-text-primary">
                        <Building2 size={13} className="text-text-muted shrink-0" />
                        <span className="font-medium truncate max-w-[180px]">
                          {r.institucionNombre}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40">
                        <AlertTriangle size={11} /> Sin asignar
                      </span>
                    )}
                  </td>

                  {/* Autor y Fecha */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-text-secondary">
                    <p className="m-0 text-text-primary font-medium truncate max-w-[150px]">
                      {r.autorNombre || "Ciudadano"}
                    </p>
                    <p className="m-0 text-[11px] text-text-muted mt-0.5">
                      {tiempoRelativo(r.fecha_creacion)}
                    </p>
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <ReclamoStatusBadge estado={r.estado} />
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onVerDetalle?.(r.id)}
                        leftIcon={<Eye size={14} />}
                        title="Ver detalle e historial"
                      >
                        Detalle
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onReasignar?.(r)}
                        leftIcon={<ArrowRightLeft size={14} />}
                        className="text-primary hover:bg-primary-subtle"
                        title="Reasignar a otra institución"
                      >
                        Reasignar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tarjetas Mobile */}
      <div className="md:hidden divide-y divide-border-subtle">
        {reclamos.map((r) => {
          const CatIcon = getCategoryIcon(r.categoriaCodigo || r.categoriaNombre, r.categoriaNombre);
          return (
            <div key={r.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-text-muted">
                  #{String(r.id).padStart(4, "0")}
                </span>
                <ReclamoStatusBadge estado={r.estado} />
              </div>

              <h4 className="font-semibold text-text-primary text-sm m-0">
                {r.titulo}
              </h4>

              <div className="space-y-1.5 text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <CatIcon size={13} className="text-primary shrink-0" />
                  <span>{r.categoriaNombre || "General"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-text-muted shrink-0" />
                  <span className="truncate">{r.direccion || "Sin dirección"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 size={13} className="text-text-muted shrink-0" />
                  <span>{r.institucionNombre || "Sin asignar"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                  <User size={12} className="shrink-0" />
                  <span>{r.autorNombre || "Ciudadano"} · {tiempoRelativo(r.fecha_creacion)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onVerDetalle?.(r.id)}
                  leftIcon={<Eye size={14} />}
                >
                  Ver Detalle
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReasignar?.(r)}
                  leftIcon={<ArrowRightLeft size={14} />}
                  className="text-primary"
                >
                  Reasignar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="p-4 border-t border-border-subtle flex items-center justify-between gap-4 text-xs">
          <span className="text-text-muted">
            Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong>
          </span>
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
        </div>
      )}
    </div>
  );
}
