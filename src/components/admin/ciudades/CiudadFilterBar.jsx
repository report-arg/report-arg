"use client";

import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const TABS_ESTADO = [
  { key: "todas", label: "Todas" },
  { key: "activa", label: "Activas" },
  { key: "inactiva", label: "Inactivas" },
  { key: "sin_principal", label: "Sin Institución Principal" },
];

export default function CiudadFilterBar({
  filtroEstado = "todas",
  onFiltroEstadoChange = () => {},
  filtroProvincia = "todas",
  onFiltroProvinciaChange = () => {},
  provinciasDisponibles = [],
  busqueda = "",
  onBusquedaChange = () => {},
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border-subtle p-4 shadow-2xs space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Pestañas de estado */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-subtle p-1 rounded-xl border border-border-subtle w-fit">
          {TABS_ESTADO.map((tab) => {
            const isActiva = filtroEstado === tab.key;
            return (
              <Button
                key={tab.key}
                type="button"
                size="sm"
                variant={isActiva ? "outline" : "ghost"}
                onClick={() => onFiltroEstadoChange(tab.key)}
                className={
                  isActiva
                    ? "bg-surface text-primary font-bold shadow-2xs"
                    : "text-text-muted"
                }
              >
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Buscador y filtro de provincia */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="w-full sm:w-56">
            <Select
              value={filtroProvincia}
              onChange={onFiltroProvinciaChange}
              options={provinciasDisponibles}
              placeholder="Filtrar por provincia"
            />
          </div>
          <div className="w-full sm:w-64">
            <Input
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
              placeholder="Buscar ciudad o institución..."
              leftIcon={<Search size={15} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

