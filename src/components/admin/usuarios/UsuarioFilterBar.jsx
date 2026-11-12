"use client";

import { Search, X, Filter } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const OPCIONES_ROL = [
  { value: "Todos", label: "Rol: Todos" },
  { value: "admin", label: "Administrador" },
  { value: "institucion", label: "Institución" },
  { value: "ciudadano", label: "Ciudadano" },
];

const OPCIONES_ESTADO = [
  { value: "Todos", label: "Estado: Todos" },
  { value: "activo", label: "Activos" },
  { value: "inactivo", label: "Inactivos" },
];

export default function UsuarioFilterBar({
  busqueda = "",
  onBusquedaChange,
  onLimpiarBusqueda,
  filtroRol = "Todos",
  onFiltroRolChange,
  filtroEstado = "Todos",
  onFiltroEstadoChange,
  filtroCiudad = "",
  onFiltroCiudadChange,
  ciudades = [],
  onLimpiarTodo,
  hayFiltrosActivos = false,
}) {
  const opcionesCiudades = [
    { value: "", label: "Todas las localidades" },
    ...ciudades.map((c) => ({
      value: String(c.id_ciudad ?? c.id),
      label: `${c.nombre}${c.provincia ? ` (${c.provincia})` : ""}`,
    })),
  ];

  return (
    <div className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Buscador */}
      <div className="relative flex-1">
        <Input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange?.(e.target.value)}
          placeholder="Buscar usuario por nombre o correo electrónico..."
          leftIcon={<Search size={16} className="text-text-muted" />}
          className="w-full text-xs"
        />
        {busqueda && (
          <button
            type="button"
            onClick={onLimpiarBusqueda}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded transition-colors"
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Selectores de Ciudad, Rol y Estado */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[180px] flex-1 sm:flex-none">
          <Select
            value={filtroCiudad}
            onChange={(val) => onFiltroCiudadChange?.(val)}
            options={opcionesCiudades}
            placeholder="Todas las localidades"
          />
        </div>

        <div className="min-w-[150px] flex-1 sm:flex-none">
          <Select
            value={filtroRol}
            onChange={(val) => onFiltroRolChange?.(val)}
            options={OPCIONES_ROL}
            placeholder="Rol: Todos"
          />
        </div>

        <div className="min-w-[140px] flex-1 sm:flex-none">
          <Select
            value={filtroEstado}
            onChange={(val) => onFiltroEstadoChange?.(val)}
            options={OPCIONES_ESTADO}
            placeholder="Estado: Todos"
          />
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
