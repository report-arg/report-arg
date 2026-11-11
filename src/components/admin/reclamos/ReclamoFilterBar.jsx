"use client";

import { Search, X, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { CLAIM_STATUSES } from "@/utils/reclamoStatus";

const ESTADOS_FILTRO = [
  { value: "", label: "Todos los estados" },
  ...CLAIM_STATUSES.map((s) => ({ value: s, label: s })),
];

export default function ReclamoFilterBar({
  busqueda = "",
  onBusquedaChange,
  onLimpiarBusqueda,
  filtroEstado = "",
  onFiltroEstadoChange,
  filtroCiudad = "",
  onFiltroCiudadChange,
  ciudades = [],
  filtroCategoria = "",
  onFiltroCategoriaChange,
  categorias = [],
  filtroInstitucion = "",
  onFiltroInstitucionChange,
  instituciones = [],
  filtroAnomalia = false,
  onFiltroAnomaliaChange,
  onLimpiarTodo,
  totalResultados = 0,
  totalGeneral = 0,
}) {
  const opcionesCiudades = [
    { value: "", label: "Ciudad: Todas" },
    ...ciudades.map((c) => ({
      value: String(c.id_ciudad || c.id),
      label: c.provincia ? `${c.nombre} (${c.provincia})` : c.nombre,
    })),
  ];

  const opcionesCategorias = [
    { value: "", label: "Categoría: Todas" },
    ...categorias.map((cat) => ({
      value: String(cat.id_categoria || cat.id),
      label: cat.nombre,
    })),
  ];

  const opcionesInstituciones = [
    { value: "", label: "Institución: Todas" },
    { value: "sin_asignar", label: "Sin institución asignada" },
    ...instituciones.map((inst) => ({
      value: String(inst.id || inst.id_institucion),
      label: inst.ciudad_nombre ? `${inst.nombre} (${inst.ciudad_nombre})` : inst.nombre,
    })),
  ];

  const hayFiltrosActivos =
    Boolean(busqueda) ||
    Boolean(filtroEstado) ||
    Boolean(filtroCiudad) ||
    Boolean(filtroCategoria) ||
    Boolean(filtroInstitucion) ||
    Boolean(filtroAnomalia);

  return (
    <div className="bg-surface rounded-2xl border border-border-subtle p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Buscador */}
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Buscar por ID, título, dirección, autor o institución..."
            value={busqueda}
            onChange={(e) => onBusquedaChange?.(e.target.value)}
            leftIcon={<Search size={16} />}
            className="pr-9"
          />
          {busqueda && (
            <button
              type="button"
              onClick={onLimpiarBusqueda}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 rounded-full cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filtro rápido de anomalías y limpiar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={filtroAnomalia ? "danger" : "outline"}
            size="sm"
            leftIcon={<AlertTriangle size={14} />}
            onClick={() => onFiltroAnomaliaChange?.(!filtroAnomalia)}
          >
            {filtroAnomalia ? "Solo con anomalía" : "Anomalías"}
          </Button>

          {hayFiltrosActivos && (
            <Button
              type="button"
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

      {/* Fila de selectores por Estado, Ciudad, Categoría e Institución */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <Select
          value={filtroEstado}
          onChange={(val) => onFiltroEstadoChange?.(val)}
          options={ESTADOS_FILTRO}
          placeholder="Todos los estados"
        />
        <Select
          value={filtroCiudad}
          onChange={(val) => onFiltroCiudadChange?.(val)}
          options={opcionesCiudades}
          placeholder="Ciudad: Todas"
        />
        <Select
          value={filtroCategoria}
          onChange={(val) => onFiltroCategoriaChange?.(val)}
          options={opcionesCategorias}
          placeholder="Categoría: Todas"
        />
        <Select
          value={filtroInstitucion}
          onChange={(val) => onFiltroInstitucionChange?.(val)}
          options={opcionesInstituciones}
          placeholder="Institución: Todas"
        />
      </div>

      {/* Resumen de resultados */}
      <div className="text-[12px] text-text-muted flex flex-wrap items-center justify-between gap-2 pt-1">
        <span>
          Mostrando <strong>{totalResultados}</strong> de <strong>{totalGeneral}</strong> reclamos registrados
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {filtroEstado && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-medium text-[11px]">
              Estado: {filtroEstado}
            </span>
          )}
          {filtroAnomalia && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-medium text-[11px]">
              Con anomalía de asignación
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
