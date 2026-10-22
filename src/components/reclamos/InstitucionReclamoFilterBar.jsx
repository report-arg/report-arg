"use client";

import { useId } from "react";
import {
  Search,
  X,
  AlertTriangle,
  Clock,
  History,
  Users,
  Calendar,
} from "lucide-react";
import {
  CategoriaDropdown,
  StatusDropdown,
  SortDropdown,
  Select,
} from "@/components/ui";

export const LIS02_SORT_OPTIONS = [
  { value: "recientes", label: "Más recientes", icon: Clock },
  { value: "antiguos", label: "Más antiguos", icon: History },
  { value: "impacto", label: "Mayor impacto ciudadano", icon: Users },
];

const VISIBILIDAD_OPTIONS = [
  { value: "Todas", label: "Públicos y privados" },
  { value: "publico", label: "Público" },
  { value: "privado", label: "Privado" },
];

export default function InstitucionReclamoFilterBar({
  busqueda = "",
  onBusquedaChange,
  estado = "Todos",
  onEstadoChange,
  categoria = "Todas",
  categorias = [],
  onCategoriaChange,
  visibilidad = "Todas",
  onVisibilidadChange,
  fechaDesde = "",
  onFechaDesdeChange,
  fechaHasta = "",
  onFechaHastaChange,
  demorado = false,
  onDemoradoChange,
  orderBy = "recientes",
  onOrderByChange,
  onClear,
  total = 0,
}) {
  const id = useId();

  const hayFiltrosActivos =
    Boolean(busqueda && busqueda.trim()) ||
    (estado && estado !== "Todos") ||
    (categoria && categoria !== "Todas") ||
    (visibilidad && visibilidad !== "Todas") ||
    Boolean(fechaDesde) ||
    Boolean(fechaHasta) ||
    Boolean(demorado) ||
    (orderBy && orderBy !== "recientes");

  const categoriaNombreActiva =
    categoria && categoria !== "Todas"
      ? categorias.find((c) => String(c.id) === String(categoria))?.nombre ||
        "Categoría"
      : null;

  return (
    <section
      aria-label="Filtros y búsqueda de reclamos"
      className="mb-5 rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-4 shadow-2xs space-y-3.5"
    >
      {/* Fila 1: Búsqueda por ID, título o dirección + Ordenamiento + Solo Demorados */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-3">
        {/* Buscador */}
        <div className="flex-1 min-w-[220px]">
          <label
            htmlFor={`${id}-busqueda`}
            className="block text-[11px] font-semibold text-text-muted mb-1"
          >
            Buscar reclamo
          </label>
          <div className="relative flex items-center">
            <Search
              size={15}
              className="absolute left-3 text-text-muted pointer-events-none"
            />
            <input
              id={`${id}-busqueda`}
              type="text"
              value={busqueda}
              onChange={(e) => onBusquedaChange?.(e.target.value)}
              placeholder="Buscar por ID (#0042), título o dirección..."
              className="w-full h-9 pl-9 pr-8 rounded-xl border border-border-subtle bg-surface text-xs text-text-primary placeholder:text-text-muted/70 hover:border-border-strong focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => onBusquedaChange?.("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 text-text-muted hover:text-text-primary p-0.5 rounded-full cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Ordenamiento (solo recientes, antiguos, impacto) */}
        <div className="w-full sm:w-auto sm:min-w-[220px]">
          <label
            htmlFor={`${id}-orden`}
            className="block text-[11px] font-semibold text-text-muted mb-1"
          >
            Ordenar por
          </label>
          <SortDropdown
            id={`${id}-orden`}
            value={orderBy || "recientes"}
            options={LIS02_SORT_OPTIONS}
            onChange={onOrderByChange}
            triggerClassName="w-full"
            menuClassName="left-0 w-full min-w-[220px]"
          />
        </div>

        {/* Toggle Solo Demorados */}
        <div className="shrink-0">
          <button
            type="button"
            aria-pressed={Boolean(demorado)}
            onClick={() => onDemoradoChange?.(!demorado)}
            className={`h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border transition-all cursor-pointer select-none ${
              demorado
                ? "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-2xs"
                : "bg-surface text-text-secondary border-border-subtle hover:border-border-strong hover:text-text-primary"
            }`}
          >
            <AlertTriangle
              size={14}
              className={
                demorado
                  ? "text-amber-600 dark:text-amber-400 shrink-0"
                  : "text-text-muted shrink-0"
              }
            />
            <span>Solo demorados (+5d)</span>
          </button>
        </div>
      </div>

      {/* Fila 2: Estado + Categoría + Visibilidad + Período de creación + Limpiar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end pt-1">
        {/* Estado */}
        <div className="lg:col-span-3">
          <label
            htmlFor={`${id}-estado`}
            className="block text-[11px] font-semibold text-text-muted mb-1"
          >
            Estado
          </label>
          <StatusDropdown
            id={`${id}-estado`}
            value={estado}
            onChange={onEstadoChange}
            placeholder="Todos los estados"
            triggerClassName="w-full"
            menuClassName="left-0 w-full min-w-[190px]"
          />
        </div>

        {/* Categoría */}
        <div className="lg:col-span-3">
          <label
            htmlFor={`${id}-categoria`}
            className="block text-[11px] font-semibold text-text-muted mb-1"
          >
            Categoría
          </label>
          <CategoriaDropdown
            id={`${id}-categoria`}
            categorias={categorias}
            value={categoria === "Todas" || !categoria ? null : categoria}
            onChange={(catId) =>
              onCategoriaChange?.(catId ? String(catId) : "Todas")
            }
            showAllOption={true}
            allOptionLabel="Todas las categorías"
            placeholder="Todas las categorías"
            triggerClassName="w-full"
            menuClassName="left-0 w-full min-w-[220px]"
          />
        </div>

        {/* Visibilidad */}
        <div className="lg:col-span-2">
          <Select
            id={`${id}-visibilidad`}
            label="Visibilidad"
            value={visibilidad}
            options={VISIBILIDAD_OPTIONS}
            onChange={onVisibilidadChange}
          />
        </div>

        {/* Fecha Desde */}
        <div className="lg:col-span-2">
          <label
            htmlFor={`${id}-fecha-desde`}
            className="block text-[11px] font-semibold text-text-muted mb-1"
          >
            Creado desde
          </label>
          <div className="relative flex items-center">
            <Calendar
              size={13}
              className="absolute left-2.5 text-text-muted pointer-events-none"
            />
            <input
              id={`${id}-fecha-desde`}
              type="date"
              value={fechaDesde}
              max={fechaHasta || undefined}
              onChange={(e) => onFechaDesdeChange?.(e.target.value)}
              className="w-full h-9 pl-8 pr-2 rounded-xl border border-border-subtle bg-surface text-xs text-text-primary hover:border-border-strong focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Fecha Hasta */}
        <div className="lg:col-span-2">
          <label
            htmlFor={`${id}-fecha-hasta`}
            className="block text-[11px] font-semibold text-text-muted mb-1"
          >
            Creado hasta
          </label>
          <div className="relative flex items-center">
            <Calendar
              size={13}
              className="absolute left-2.5 text-text-muted pointer-events-none"
            />
            <input
              id={`${id}-fecha-hasta`}
              type="date"
              value={fechaHasta}
              min={fechaDesde || undefined}
              onChange={(e) => onFechaHastaChange?.(e.target.value)}
              className="w-full h-9 pl-8 pr-2 rounded-xl border border-border-subtle bg-surface text-xs text-text-primary hover:border-border-strong focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Fila 3: Resumen de resultados + Filtros activos + Botón Limpiar filtros */}
      <div className="pt-2.5 border-t border-border-subtle/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
        <div className="flex flex-wrap items-center gap-1.5">
          <span>
            Total:{" "}
            <strong className="text-text-primary">{total}</strong>{" "}
            {total === 1 ? "reclamo asignado" : "reclamos asignados"}
          </span>

          {hayFiltrosActivos && (
            <>
              <span className="mx-1 text-border-subtle">|</span>
              <span className="font-semibold text-text-secondary">
                Criterios activos:
              </span>

              {busqueda?.trim() && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium">
                  Búsqueda: &ldquo;{busqueda.trim()}&rdquo;
                </span>
              )}

              {estado && estado !== "Todos" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium">
                  {estado}
                </span>
              )}

              {categoriaNombreActiva && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium">
                  {categoriaNombreActiva}
                </span>
              )}

              {visibilidad && visibilidad !== "Todas" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium">
                  {visibilidad === "privado" ? "Privado" : "Público"}
                </span>
              )}

              {(fechaDesde || fechaHasta) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium">
                  {fechaDesde && fechaHasta
                    ? `${fechaDesde} a ${fechaHasta}`
                    : fechaDesde
                    ? `Desde ${fechaDesde}`
                    : `Hasta ${fechaHasta}`}
                </span>
              )}

              {demorado && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium">
                  Demorados (+5d)
                </span>
              )}

              {orderBy && orderBy !== "recientes" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium">
                  {orderBy === "antiguos"
                    ? "Más antiguos"
                    : "Mayor impacto ciudadano"}
                </span>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={!hayFiltrosActivos}
          aria-disabled={!hayFiltrosActivos}
          className={`h-8 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
            hayFiltrosActivos
              ? "bg-surface-subtle text-text-primary hover:bg-border-subtle cursor-pointer border border-border-subtle"
              : "bg-surface-subtle/40 text-text-muted/40 border border-border-subtle/40 cursor-not-allowed"
          }`}
        >
          {hayFiltrosActivos && <X size={12} className="shrink-0" />}
          <span>Limpiar filtros</span>
        </button>
      </div>
    </section>
  );
}
