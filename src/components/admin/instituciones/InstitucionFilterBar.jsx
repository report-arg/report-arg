"use client";

import { Search, X, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const ESTADOS = [
  { key: "todos", label: "Todas" },
  { key: "verificada", label: "Verificadas" },
  { key: "pendiente", label: "Pendientes" },
  { key: "rechazada", label: "Rechazadas" },
  { key: "suspendida", label: "Suspendidas" },
];

export default function InstitucionFilterBar({
  busqueda = "",
  onBusquedaChange,
  onLimpiarBusqueda,
  filtroEstado = "todos",
  onFiltroEstadoChange,
  filtroCiudad = "",
  onFiltroCiudadChange,
  ciudades = [],
  onRefresh,
  loading = false,
  showStatusFilters = true,
}) {
  const opcionesCiudades = [
    { value: "", label: "Todas las ciudades" },
    ...ciudades.map((c) => ({
      value: String(c.id_ciudad ?? c.id),
      label: `${c.nombre}${c.provincia ? ` (${c.provincia})` : ""}`,
    })),
  ];

  return (
    <div className="bg-surface rounded-2xl border border-border-subtle p-4 sm:p-5 flex flex-col gap-4 shadow-2xs">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Buscador */}
        <div className="flex-1">
          <Input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange?.(e.target.value)}
            placeholder="Buscar por nombre, CUIT, tipo, ciudad o email..."
            leftIcon={<Search size={15} />}
            rightElement={
              busqueda ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onLimpiarBusqueda}
                  aria-label="Limpiar búsqueda"
                  className="p-1 h-auto min-h-0"
                >
                  <X size={14} />
                </Button>
              ) : null
            }
          />
        </div>

        {/* Filtro de ciudad */}
        {onFiltroCiudadChange && (
          <div className="w-full md:w-64 shrink-0">
            <Select
              value={String(filtroCiudad || "")}
              onChange={(val) => onFiltroCiudadChange?.(val)}
              options={opcionesCiudades}
              placeholder="Todas las ciudades"
            />
          </div>
        )}

        {/* Botón Actualizar */}
        {onRefresh && (
          <div className="shrink-0">
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              loading={loading}
              leftIcon={<RefreshCw size={14} />}
              title="Refrescar listado"
              className="w-full md:w-auto"
            >
              Actualizar
            </Button>
          </div>
        )}
      </div>

      {/* Pestañas de estado */}
      {showStatusFilters && (
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-subtle p-1 rounded-xl border border-border-subtle w-fit">
          {ESTADOS.map((est) => {
            const active = filtroEstado === est.key;
            return (
              <Button
                key={est.key}
                type="button"
                variant={active ? "outline" : "ghost"}
                size="sm"
                onClick={() => onFiltroEstadoChange?.(est.key)}
                className={
                  active
                    ? "bg-surface text-primary shadow-2xs border-border-subtle font-bold"
                    : "text-text-muted hover:text-text-primary border-transparent"
                }
              >
                {est.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
