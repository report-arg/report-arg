"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, CheckCircle2, AlertTriangle, Info, Tag } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import apiClient from "@/services/apiClient";

export default function CategoriaAsignacionModal({
  isOpen,
  onClose,
  categoria,
  ciudades = [],
}) {
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [asignacion, setAsignacion] = useState(null);
  const [loading, setLoading] = useState(false);

  // Seleccionar la primera ciudad por defecto al abrir
  useEffect(() => {
    if (isOpen && ciudades.length > 0 && !ciudadSeleccionada) {
      setCiudadSeleccionada(String(ciudades[0].id_ciudad ?? ciudades[0].id));
    }
  }, [isOpen, ciudades, ciudadSeleccionada]);

  // Consultar la resolución cuando cambia la ciudad o categoría
  useEffect(() => {
    if (!isOpen || !categoria?.id || !ciudadSeleccionada) {
      setAsignacion(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    apiClient
      .get(`/admin/categorias/${categoria.id}/asignacion?id_ciudad=${ciudadSeleccionada}`)
      .then((res) => {
        if (isMounted && res.data?.ok) {
          setAsignacion(res.data.data);
        }
      })
      .catch(() => {
        if (isMounted) setAsignacion(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, categoria?.id, ciudadSeleccionada]);

  const opcionesCiudades = ciudades.map((c) => ({
    value: String(c.id_ciudad ?? c.id),
    label: `${c.nombre}${c.provincia ? ` (${c.provincia})` : ""}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignación Institucional por Localidad"
      description={`Verificá qué entidad atiende los reclamos de "${categoria?.nombre || ""}" según el territorio.`}
      icon={<Building2 size={20} />}
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Selector de Ciudad */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
            <MapPin size={14} className="text-text-muted" />
            Seleccioná una localidad:
          </label>
          <Select
            value={ciudadSeleccionada}
            onChange={(val) => setCiudadSeleccionada(val)}
            options={opcionesCiudades}
            placeholder="Seleccionar localidad..."
            className="w-full text-xs"
          />
        </div>

        {/* Resultado de la resolución */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle">
          {loading ? (
            <p className="text-xs text-text-muted text-center py-4 m-0">
              Consultando resolución institucional...
            </p>
          ) : !asignacion ? (
            <p className="text-xs text-text-muted text-center py-4 m-0">
              Seleccioná una localidad para ver la entidad responsable asignada.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-text-muted font-medium">Tipo de Cobertura:</span>
                {asignacion.tipo === "especializada" ? (
                  <Badge variant="primary" size="sm" icon={<CheckCircle2 size={12} />}>
                    Especializada
                  </Badge>
                ) : asignacion.tipo === "principal" ? (
                  <Badge variant="warning" size="sm" icon={<Info size={12} />}>
                    Institución Principal (Respaldo)
                  </Badge>
                ) : (
                  <Badge variant="danger" size="sm" icon={<AlertTriangle size={12} />}>
                    Sin Cobertura
                  </Badge>
                )}
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border-subtle flex items-start gap-3">
                <Building2 size={18} className="text-primary shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-text-primary m-0 truncate">
                    {asignacion.institucion?.nombre || "Sin institución asignada"}
                  </p>
                  <p className="text-[11px] text-text-muted mt-1 m-0">
                    {asignacion.detalle}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón de cierre */}
        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
