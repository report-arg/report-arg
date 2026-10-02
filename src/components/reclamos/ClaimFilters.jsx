"use client";

import { useId, useMemo } from "react";
import { CLAIM_STATUSES } from "@/utils/claimStatus";
import { X } from "lucide-react";
import Select from "@/components/ui/Select";

export default function ClaimFilters({
  estado,
  categoria,
  categorias = [],
  onEstado,
  onCategoria,
  onClear,
  orden,
  onOrden,
}) {
  const id = useId();
  const hayFiltrosActivos =
    (estado && estado !== "Todos") ||
    (categoria && categoria !== "Todas") ||
    (orden && orden !== "recientes");

  const optionsEstado = useMemo(() => [
    { value: "Todos", label: "Todos los estados" },
    ...CLAIM_STATUSES.map((e) => ({ value: e, label: e })),
  ], []);

  const optionsCategoria = useMemo(() => [
    { value: "Todas", label: "Todas las categorías" },
    ...categorias.map((c) => ({ value: c.id, label: c.nombre })),
  ], [categorias]);

  const optionsOrden = useMemo(() => [
    { value: "recientes", label: "Más recientes" },
    { value: "atencion", label: "Requieren atención" },
    { value: "antiguos", label: "Más tiempo esperando" },
    { value: "impacto", label: "Mayor impacto" },
  ], []);

  return (
    <div className="mb-5 rounded-2xl border border-border-subtle bg-surface p-3 sm:px-4 sm:py-3 shadow-2xs">
      <div className="flex flex-wrap items-end gap-3">
        {/* Filtro Estado */}
        <div className="flex-1 min-w-[150px]">
          <Select
            id={`${id}-estado`}
            label="Estado"
            value={estado}
            onChange={onEstado}
            options={optionsEstado}
          />
        </div>

        {/* Filtro Categoría */}
        <div className="flex-1 min-w-[170px]">
          <Select
            id={`${id}-categoria`}
            label="Categoría"
            value={categoria}
            onChange={onCategoria}
            options={optionsCategoria}
          />
        </div>

        {/* Ordenar por (Solo Institución) */}
        {onOrden && (
          <div className="flex-1 min-w-[170px]">
            <Select
              id={`${id}-orden`}
              label="Ordenar por"
              value={orden}
              onChange={onOrden}
              options={optionsOrden}
            />
          </div>
        )}

        {/* Botón Limpiar filtros */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onClear}
            disabled={!hayFiltrosActivos}
            aria-disabled={!hayFiltrosActivos}
            className={`h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
              hayFiltrosActivos
                ? "bg-surface-subtle text-text-primary hover:bg-border-subtle cursor-pointer border border-border-subtle"
                : "bg-surface-subtle/40 text-text-muted/40 border border-border-subtle/40 cursor-not-allowed"
            }`}
          >
            {hayFiltrosActivos && <X size={12} className="shrink-0" />}
            <span>Limpiar filtros</span>
          </button>
        </div>
      </div>

      {/* Indicador sutil de filtros activos */}
      {hayFiltrosActivos && (
        <div className="mt-2.5 pt-2 border-t border-border-subtle/60 flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted">
          <span className="font-semibold text-text-secondary">Filtros activos:</span>
          {estado !== "Todos" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium">
              {estado}
            </span>
          )}
          {categoria !== "Todas" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium">
              {categorias.find((c) => String(c.id) === String(categoria))?.nombre || "Categoría"}
            </span>
          )}
          {orden && orden !== "recientes" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium">
              {orden === "atencion"
                ? "Requieren atención"
                : orden === "antiguos"
                ? "Más tiempo esperando"
                : "Mayor impacto"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
