"use client";

import { useId } from "react";
import { X } from "lucide-react";
import { CategoryDropdown, StatusDropdown, SortDropdown } from "@/components/ui";

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

  return (
    <div className="mb-5 rounded-2xl border border-border-subtle bg-surface p-3 sm:px-4 sm:py-3 shadow-2xs">
      <div className="flex flex-wrap items-end gap-3">
        {/* Filtro Estado */}
        <div className="flex-1 min-w-[150px]">
          <label
            htmlFor={`${id}-estado`}
            className="block text-[11px] font-semibold text-text-muted mb-1"
          >
            Estado
          </label>
          <StatusDropdown
            id={`${id}-estado`}
            value={estado}
            onChange={onEstado}
            placeholder="Todos los estados"
            triggerClassName="w-full"
            menuClassName="left-0 w-full min-w-[190px]"
          />
        </div>

        {/* Filtro Categoría */}
        <div className="flex-1 min-w-[170px]">
          <label
            htmlFor={`${id}-categoria`}
            className="block text-[11px] font-semibold text-text-muted mb-1"
          >
            Categoría
          </label>
          <CategoryDropdown
            id={`${id}-categoria`}
            categorias={categorias}
            value={categoria === "Todas" || !categoria ? null : categoria}
            onChange={(catId) => onCategoria(catId ? String(catId) : "Todas")}
            showAllOption={true}
            allOptionLabel="Todas las categorías"
            placeholder="Todas las categorías"
            triggerClassName="w-full"
            menuClassName="left-0 w-full min-w-[220px]"
          />
        </div>

        {/* Ordenar por */}
        {onOrden && (
          <div className="flex-1 min-w-[170px]">
            <label
              htmlFor={`${id}-orden`}
              className="block text-[11px] font-semibold text-text-muted mb-1"
            >
              Ordenar por
            </label>
            <SortDropdown
              id={`${id}-orden`}
              value={orden || "recientes"}
              onChange={onOrden}
              triggerClassName="w-full"
              menuClassName="left-0 w-full min-w-[210px]"
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
          {estado && estado !== "Todos" && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium">
              {estado}
            </span>
          )}
          {categoria && categoria !== "Todas" && (
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
