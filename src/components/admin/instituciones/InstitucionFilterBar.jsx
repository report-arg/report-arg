"use client";

import { Search, X, Filter, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

const ESTADOS = [
  { key: "todos", label: "Todas las entidades" },
  { key: "verificada", label: "Verificadas" },
  { key: "pendiente", label: "Pendientes" },
  { key: "rechazada", label: "Rechazadas" },
];

export default function InstitucionFilterBar({
  busqueda = "",
  onBusquedaChange,
  onLimpiarBusqueda,
  filtroEstado = "todos",
  onFiltroEstadoChange,
  onRefresh,
  loading = false,
  showStatusFilters = true,
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border-subtle p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-2xs">
      {/* Buscador */}
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange?.(e.target.value)}
          placeholder="Buscar por nombre, tipo, ciudad o email..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border-subtle bg-surface-subtle text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:bg-surface outline-hidden transition-all"
        />
        {busqueda && (
          <button
            onClick={onLimpiarBusqueda}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Controles de filtros de estado y refresco */}
      <div className="flex flex-wrap items-center gap-2">
        {showStatusFilters && (
          <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-xl border border-border-subtle">
            {ESTADOS.map((est) => {
              const active = filtroEstado === est.key;
              return (
                <button
                  key={est.key}
                  onClick={() => onFiltroEstadoChange?.(est.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-surface text-primary shadow-xs border border-border-subtle"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {est.label}
                </button>
              );
            })}
          </div>
        )}

        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            loading={loading}
            leftIcon={<RefreshCw size={14} />}
            title="Refrescar listado"
          >
            Actualizar
          </Button>
        )}
      </div>
    </div>
  );
}
