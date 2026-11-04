"use client";

import { useState } from "react";
import { ShieldOff, ShieldCheck, AlertTriangle } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Textarea from "@/components/ui/Textarea";

export default function InstitucionStatusModal({
  isOpen = false,
  onClose,
  onConfirm,
  institucion,
  loading = false,
}) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  if (!institucion) return null;

  const estaActiva = Number(institucion.activo ?? 1) === 1;
  const esPrincipalDeCiudadActiva =
    Number(institucion.es_principal) === 1 && Number(institucion.ciudad_activa ?? 1) === 1;

  const handleConfirm = async () => {
    if (estaActiva) {
      if (esPrincipalDeCiudadActiva) return;
      if (!motivo.trim()) {
        setError("El motivo de suspensión es obligatorio para la trazabilidad de auditoría.");
        return;
      }
      setError("");
      const res = await onConfirm?.({ activo: false, motivo: motivo.trim() });
      if (res?.ok) {
        setMotivo("");
        setError("");
      }
    } else {
      const res = await onConfirm?.({
        activo: true,
        motivo: motivo.trim() || "Rehabilitación administrativa",
      });
      if (res?.ok) {
        setMotivo("");
        setError("");
      }
    }
  };

  const handleClose = () => {
    setMotivo("");
    setError("");
    onClose?.();
  };

  if (estaActiva) {
    return (
      <ConfirmModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Suspender institución operativa"
        description={`Estás evaluando suspender operativamente a "${institucion.nombre}" en ${
          institucion.ciudad_nombre || "su ciudad"
        }.`}
        variant="danger"
        confirmText="Suspender institución"
        cancelText="Cancelar"
        loading={loading}
        loadingText="Suspendiendo..."
        confirmDisabled={esPrincipalDeCiudadActiva}
        icon={<ShieldOff size={20} />}
      >
        <div className="space-y-3 text-left">
          {esPrincipalDeCiudadActiva ? (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold m-0 mb-1">
                  Acción protegida: Institución Principal de ciudad activa
                </p>
                <p className="m-0 leading-relaxed">
                  Una ciudad activa no puede existir sin una institución principal operativa. Para
                  suspender esta entidad, primero debés designar otra institución verificada como
                  principal en {institucion.ciudad_nombre || "esta ciudad"}.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-secondary leading-relaxed">
                Al suspender esta institución especializada, sus{" "}
                <strong className="text-text-primary">
                  reclamos abiertos (Pendiente, En revisión, En proceso)
                </strong>{" "}
                se reasignarán automáticamente a la institución principal de{" "}
                {institucion.ciudad_nombre || "su ciudad"} y no recibirá nuevas derivaciones.
              </div>
              <Textarea
                label="Motivo de la suspensión *"
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  setError("");
                }}
                placeholder="Ej. Finalización de convenio municipal o reestructuración de cuadrillas..."
                rows={3}
                error={error}
              />
            </>
          )}
        </div>
      </ConfirmModal>
    );
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Rehabilitar institución"
      description={`¿Querés volver a habilitar operativamente a "${institucion.nombre}"? La cuenta recuperará el acceso a su panel institucional y podrá volver a recibir reclamos de sus categorías asignadas.`}
      variant="success"
      confirmText="Rehabilitar institución"
      cancelText="Cancelar"
      loading={loading}
      loadingText="Rehabilitando..."
      icon={<ShieldCheck size={20} />}
    >
      <div className="mt-2 text-left">
        <Textarea
          label="Observación de rehabilitación (opcional)"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ej. Regularización de convenio operativo..."
          rows={2}
        />
      </div>
    </ConfirmModal>
  );
}
