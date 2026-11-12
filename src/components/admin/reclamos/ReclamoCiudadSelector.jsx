"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Building2, ArrowRight, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function ReclamoCiudadSelector({
  ciudades = [],
  loading = false,
  onSelectCiudad,
}) {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    if (!busqueda.trim()) return ciudades;
    const q = busqueda.toLowerCase().trim();
    return ciudades.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(q) ||
        c.provincia?.toLowerCase().includes(q) ||
        c.institucion_principal_nombre?.toLowerCase().includes(q)
    );
  }, [ciudades, busqueda]);

  return (
    <div className="w-full space-y-5 animate-in fade-in-50 duration-200">
      {/* Barra de búsqueda de localidad */}
      <div className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar localidad por nombre o provincia..."
            leftIcon={<Search size={16} className="text-text-muted" />}
            className="w-full text-xs sm:text-sm"
          />
        </div>
        <p className="text-xs text-text-muted shrink-0 m-0 text-right sm:text-left">
          {filtradas.length} {filtradas.length === 1 ? "localidad disponible" : "localidades disponibles"}
        </p>
      </div>

      {/* Grid responsivo de tarjetas territoriales */}
      {loading ? (
        <div className="p-12 text-center text-text-muted text-sm bg-surface rounded-2xl border border-border-subtle">
          Cargando catálogo territorial...
        </div>
      ) : filtradas.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-surface border border-border-subtle text-text-muted">
          <MapPin size={32} className="mx-auto mb-2 text-text-muted/50" />
          <p className="font-medium text-sm text-text-primary m-0">No se encontraron localidades</p>
          <p className="text-xs mt-1 m-0">Intenta con otro término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map((c) => {
            const idCiudad = String(c.id_ciudad ?? c.id);
            const totalReclamos = Number(c.reclamos_total ?? 0);
            const abiertos = Number(c.reclamos_abiertos ?? 0);
            const tienePrincipal = Boolean(c.institucion_principal_nombre);

            return (
              <div
                key={idCiudad}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-surface border border-border-subtle hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-3">
                  {/* Cabecera de la tarjeta */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-text-primary text-base truncate group-hover:text-primary transition-colors">
                        {c.nombre}
                      </h3>
                      <p className="text-xs text-text-muted truncate mt-0.5">{c.provincia || "Sin provincia"}</p>
                    </div>
                    <Badge variant={c.activa ? "success" : "neutral"} size="sm">
                      {c.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>

                  {/* Institución Principal */}
                  <div className="p-2.5 rounded-xl bg-surface-subtle/70 border border-border-subtle text-xs flex items-center gap-2">
                    <Building2 size={15} className={tienePrincipal ? "text-primary shrink-0" : "text-amber-500 shrink-0"} />
                    <span className="truncate text-text-secondary">
                      {c.institucion_principal_nombre || "Sin institución principal"}
                    </span>
                  </div>

                  {/* Métricas territoriales */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-surface-subtle/40 border border-border-subtle text-center">
                      <div className="text-base font-bold text-text-primary">{totalReclamos}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">Reclamos totales</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-subtle/40 border border-border-subtle text-center">
                      <div className="text-base font-bold text-amber-600 dark:text-amber-400">{abiertos}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">En gestión</div>
                    </div>
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="mt-4 pt-3 border-t border-border-subtle">
                  <Button
                    onClick={() => onSelectCiudad(idCiudad)}
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Supervisar reclamos
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

