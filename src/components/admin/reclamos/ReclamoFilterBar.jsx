"use client";

import { Search, X, Filter } from "lucide-react";
import Button from "@/components/ui/Button";
import { CLAIM_STATUSES } from "@/utils/reclamoStatus";

const ESTADOS_FILTRO = [
  { key: "", label: "Todos los estados" },
  ...CLAIM_STATUSES.map((s) => ({ key: s, label: s })),
];

export default function ReclamoFilterBar({
  busqueda = "",
  onBusquedaChange,
  onLimpiarBusqueda,
  filtroEstado = "",
  onFiltroEstadoChange,
  onLimpiarTodo,
  totalResultados = 0,
  totalGeneral = 0,
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border-subtle p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por ID, título, dirección, autor o institución..."
            value={busqueda}
            onChange={(e) => onBusquedaChange?.(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-border-subtle bg-surface text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition-all"
          />
          {busqueda && (
            <button
              onClick={onLimpiarBusqueda}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded-full cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filtro por estado */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted shrink-0 hidden sm:block" />
          <select
            value={filtroEstado}
            onChange={(e) => onFiltroEstadoChange?.(e.target.value)}
            className="py-2 px-3 text-xs sm:text-sm rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-primary outline-hidden transition-all cursor-pointer"
          >
            {ESTADOS_FILTRO.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>

          {(busqueda || filtroEstado) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLimpiarTodo}
              className="text-xs text-text-secondary"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Resumen de resultados */}
      <div className="text-[12px] text-text-muted flex items-center justify-between pt-1">
        <span>
          Mostrando <strong>{totalResultados}</strong> de <strong>{totalGeneral}</strong> reclamos registrados
        </span>
        {filtroEstado && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium text-[11px]">
            Filtro activo: {filtroEstado}
          </span>
        )}
      </div>
    </div>
  );
}
