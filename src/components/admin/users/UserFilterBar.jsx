"use client";

import { Search, X, Filter } from "lucide-react";
import Button from "@/components/ui/Button";

export default function UserFilterBar({
  busqueda = "",
  onBusquedaChange,
  onLimpiarBusqueda,
  filtroRol = "Todos",
  onFiltroRolChange,
  filtroEstado = "Todos",
  onFiltroEstadoChange,
  onLimpiarTodo,
  hayFiltrosActivos = false,
}) {
  return (
    <div className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Buscador */}
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange?.(e.target.value)}
          placeholder="Buscar usuario por nombre o correo electrónico..."
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:bg-surface focus:border-primary outline-hidden transition-all"
        />
        {busqueda && (
          <button
            onClick={onLimpiarBusqueda}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Selectores de Rol y Estado */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 sm:flex-none">
          <select
            value={filtroRol}
            onChange={(e) => onFiltroRolChange?.(e.target.value)}
            className="w-full sm:w-auto appearance-none pl-8 pr-8 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-semibold text-text-primary focus:bg-surface focus:border-primary outline-hidden cursor-pointer transition-all"
          >
            <option value="Todos">Rol: Todos</option>
            <option value="admin">Administrador</option>
            <option value="institucion">Institución</option>
            <option value="ciudadano">Ciudadano</option>
          </select>
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        <div className="relative flex-1 sm:flex-none">
          <select
            value={filtroEstado}
            onChange={(e) => onFiltroEstadoChange?.(e.target.value)}
            className="w-full sm:w-auto appearance-none pl-8 pr-8 py-2 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-semibold text-text-primary focus:bg-surface focus:border-primary outline-hidden cursor-pointer transition-all"
          >
            <option value="Todos">Estado: Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        {hayFiltrosActivos && (
          <Button
            onClick={onLimpiarTodo}
            variant="ghost"
            size="sm"
            className="text-xs text-text-muted hover:text-text-primary"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
