"use client";

import { Search, X, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const TIPOS_OPTIONS = [
  { value: "", label: "Tipo: Todos" },
  { value: "reclamo", label: "Reclamos" },
  { value: "comunicado", label: "Comunicados" },
  { value: "ambos", label: "Ambos" },
];

const ESTADOS_OPTIONS = [
  { value: "", label: "Estado: Todos" },
  { value: "activo", label: "Activas" },
  { value: "inactivo", label: "Inactivas" },
];

export default function CategoriaFilterBar({
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
        <Input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange?.(e.target.value)}
          placeholder="Buscar por nombre, código o descripción..."
          leftIcon={<Search size={16} />}
          className="pr-9"
        />
        {busqueda && (
          <button
            type="button"
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
        <div className="w-36">
          <Select
            value={filtroTipo}
            onChange={(val) => onFiltroTipoChange?.(val)}
            options={TIPOS_OPTIONS}
            placeholder="Tipo: Todos"
          />
        </div>

        <div className="w-36">
          <Select
            value={filtroEstado}
            onChange={(val) => onFiltroEstadoChange?.(val)}
            options={ESTADOS_OPTIONS}
            placeholder="Estado: Todos"
          />
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
