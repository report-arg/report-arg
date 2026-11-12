"use client";

import {
  MapPin,
  Crown,
  Building2,
  Users,
  FileText,
  Loader2,
  Power,
  PowerOff,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function CiudadTable({
  ciudades = [],
  loading = false,
  error = "",
  onReintentar = () => {},
  onAbrirPrincipal = () => {},
  onAbrirActivar = () => {},
  onAbrirDesactivar = () => {},
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
      {/* Cabecera de la tabla */}
      <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-primary m-0">
            Padrón Territorial de Ciudades
          </h3>
          <p className="text-xs text-text-muted m-0 mt-0.5">
            {ciudades.length}{" "}
            {ciudades.length === 1 ? "localidad encontrada" : "localidades encontradas"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-text-muted text-xs gap-2">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span>Consultando datos territoriales...</span>
        </div>
      ) : error ? (
        <div className="py-12 px-4 text-center">
          <p className="text-xs text-rose-600 font-semibold mb-3">{error}</p>
          <Button onClick={onReintentar} variant="outline" size="sm">
            Reintentar
          </Button>
        </div>
      ) : ciudades.length === 0 ? (
        <div className="py-16 text-center text-text-muted text-xs space-y-2 px-4">
          <p className="font-semibold text-text-primary m-0">
            No se encontraron localidades con los filtros seleccionados.
          </p>
          <p className="m-0">
            Podés limpiar los filtros de búsqueda o registrar una nueva localidad desde el botón superior.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Ciudad y Provincia</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Institución Principal</th>
                <th className="py-3 px-4">Comunidad y Actividad</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {ciudades.map((c) => {
                const esActiva = Number(c.activa ?? 1) === 1;
                const tienePrincipal = Boolean(c.id_institucion_principal);
                const elegibles = Array.isArray(c.instituciones_elegibles)
                  ? c.instituciones_elegibles
                  : [];

                return (
                  <tr key={c.id} className="hover:bg-surface-subtle/50 transition-colors">
                    {/* Ciudad y Provincia */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                            esActiva
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-surface-subtle text-text-muted border-border-subtle"
                          }`}
                        >
                          <MapPin size={15} />
                        </div>
                        <div>
                          <p className="font-bold text-text-primary m-0">{c.nombre}</p>
                          <p className="text-[11px] text-text-muted m-0">{c.provincia}</p>
                        </div>
                      </div>
                    </td>

                    {/* Estado Operativo */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {esActiva ? (
                        <Badge variant="success" size="sm">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Inactiva
                        </Badge>
                      )}
                    </td>

                    {/* Institución Principal */}
                    <td className="py-3.5 px-4">
                      {tienePrincipal ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <Crown size={13} className="text-amber-500 shrink-0" />
                            <span className="font-bold text-text-primary">
                              {c.institucion_principal_nombre}
                            </span>
                          </div>
                          <span className="text-[11px] text-text-muted">
                            Responsable general de la ciudad
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <Badge variant="danger" size="sm">
                            Sin institución principal
                          </Badge>
                          <span className="text-[11px] text-text-muted">
                            {elegibles.length > 0
                              ? `${elegibles.length} ${
                                  elegibles.length === 1
                                    ? "institución verificada disponible"
                                    : "instituciones verificadas disponibles"
                                }`
                              : "Requiere verificar al menos una institución"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Comunidad y Actividad */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-3 text-text-secondary">
                        <span
                          className="inline-flex items-center gap-1"
                          title="Instituciones verificadas y activas"
                        >
                          <Building2 size={13} className="text-text-muted" />
                          <strong className="text-text-primary">
                            {c.instituciones_verificadas ?? 0}
                          </strong>{" "}
                          inst.
                          {Number(c.instituciones_pendientes) > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                              +{c.instituciones_pendientes} pend.
                            </span>
                          )}
                        </span>

                        <span
                          className="inline-flex items-center gap-1"
                          title="Ciudadanos registrados en la localidad"
                        >
                          <Users size={13} className="text-text-muted" />
                          <strong className="text-text-primary">
                            {c.ciudadanos_total ?? 0}
                          </strong>{" "}
                          vecinos
                        </span>

                        <span
                          className="inline-flex items-center gap-1"
                          title="Total de reclamos en la ciudad"
                        >
                          <FileText size={13} className="text-text-muted" />
                          <strong className="text-text-primary">
                            {c.reclamos_total ?? 0}
                          </strong>{" "}
                          reclamos
                        </span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          onClick={() => onAbrirPrincipal(c)}
                          variant="outline"
                          size="sm"
                          leftIcon={<Crown size={13} />}
                          title="Designar o cambiar la institución principal de la ciudad"
                        >
                          {tienePrincipal ? "Cambiar principal" : "Designar principal"}
                        </Button>

                        {esActiva ? (
                          <Button
                            onClick={() => onAbrirDesactivar(c)}
                            variant="danger-soft"
                            size="sm"
                            leftIcon={<PowerOff size={13} />}
                          >
                            Desactivar
                          </Button>
                        ) : (
                          <Button
                            onClick={() => onAbrirActivar(c)}
                            variant="success"
                            size="sm"
                            leftIcon={<Power size={13} />}
                          >
                            Activar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

