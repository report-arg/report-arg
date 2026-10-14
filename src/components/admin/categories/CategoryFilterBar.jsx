"use client";

import { Search, X, Filter, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CategoryFilterBar({
  busqueda = "",
  onBusquedaChange,
  onLimpiarBusqueda,
  filtroTipo = "",
  onFiltroTipoChange,
  filtroEstado = "",
  onFiltroEstadoChange,
  onRefresh,
  loading = false,
}) {
  return (
    <div className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      {/* Buscador */}
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange?.(e.target.value)}
          placeholder="Buscar por nombre, código o descripción..."
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:bg-surface focus:border-primary outline-hidden transition-all"
        />
        {busqueda && (
          <button
            onClick={onLimpiarBusqueda}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 cursor-pointer"
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filtros Dropdowns y Botón Actualizar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tipo */}
        <div className="relative">
          <select
            value={filtroTipo}
            onChange={(e) => onFiltroTipoChange?.(e.target.value)}
            className="appearance-none pl-8 pr-8 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-semibold text-text-primary focus:bg-surface focus:border-primary outline-hidden cursor-pointer transition-all"
          >
            <option value="">Tipo: Todos</option>
            <option value="reclamo">Reclamos</option>
            <option value="comunicado">Comunicados</option>
            <option value="ambos">Ambos</option>
          </select>
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        {/* Estado */}
        <div className="relative">
          <select
            value={filtroEstado}
            onChange={(e) => onFiltroEstadoChange?.(e.target.value)}
            className="appearance-none pl-8 pr-8 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-semibold text-text-primary focus:bg-surface focus:border-primary outline-hidden cursor-pointer transition-all"
          >
            <option value="">Estado: Todos</option>
            <option value="activo">Activas</option>
            <option value="inactivo">Inactivas</option>
          </select>
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          loading={loading}
          leftIcon={<RefreshCw size={13} />}
          title="Actualizar listado"
        >
          Actualizar
        </Button>
      </div>
    </div>
  );
}
