"use client";

import { ArrowRightLeft, Loader2, AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function ClaimReassignModal({
  isOpen = false,
  onClose,
  reclamo,
  instituciones = [],
  loadingInstituciones = false,
  institucionDestino = "",
  onInstitucionDestinoChange,
  motivo = "",
  onMotivoChange,
  error = "",
  guardando = false,
  onConfirmar,
}) {
  if (!reclamo) return null;

  // Filtrado territorial para instituciones elegibles: misma ciudad y no la institución actual
  const institucionesElegibles = instituciones.filter(
    (inst) =>
      Number(inst.id_ciudad) === Number(reclamo.id_ciudad) &&
      Number(inst.id) !== Number(reclamo.id_institucion)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reasignar Institución Responsable"
      description="Transferí la responsabilidad técnica de este reclamo respetando la jurisdicción territorial."
      icon={<ArrowRightLeft size={20} />}
      iconBgClass="bg-primary/10 text-primary"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Ficha resumen del reclamo */}
        <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-text-muted">
              #{String(reclamo.id).padStart(4, "0")}
            </span>
            <span className="text-[11px] font-medium text-text-secondary">
              Jurisdicción: <strong>{reclamo.ciudadNombre || "Misma Ciudad"}</strong>
            </span>
          </div>
          <p className="font-semibold text-text-primary text-sm m-0 line-clamp-1">
            {reclamo.titulo}
          </p>
          <p className="text-text-secondary m-0">
            Institución actual: <strong>{reclamo.institucionNombre || "Sin asignar"}</strong>
          </p>
        </div>

        {/* Selector de nueva institución */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Nueva Institución Responsable *
          </label>

          {loadingInstituciones ? (
            <div className="flex items-center gap-2 py-2 text-xs text-text-muted">
              <Loader2 size={14} className="animate-spin text-primary" />
              <span>Cargando instituciones elegibles...</span>
            </div>
          ) : institucionesElegibles.length === 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>
                No existen otras instituciones verificadas registradas en la misma ciudad para reasignar este reclamo.
              </span>
            </div>
          ) : (
            <select
              value={institucionDestino}
              onChange={(e) => onInstitucionDestinoChange?.(e.target.value)}
              className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-primary outline-hidden"
            >
              <option value="">Seleccionar institución destino...</option>
              {institucionesElegibles.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Motivo obligatorio */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Motivo de la Reasignación *
          </label>
          <textarea
            rows={3}
            placeholder="Explicá el motivo técnico o administrativo de la reasignación (obligatorio para auditoría)..."
            value={motivo}
            onChange={(e) => onMotivoChange?.(e.target.value)}
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-border-subtle bg-surface text-text-primary focus:border-primary outline-hidden resize-y"
          />
          <p className="text-[11px] text-text-muted mt-1 m-0">
            Este motivo quedará asentado de forma indeleble en el historial de eventos del reclamo.
          </p>
        </div>

        {/* Error de validación */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs font-medium">
            ⚠ {error}
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-3 border-t border-border-subtle">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={onConfirmar}
            loading={guardando}
            disabled={institucionesElegibles.length === 0 || !institucionDestino}
            leftIcon={<ArrowRightLeft size={15} />}
          >
            Confirmar reasignación
          </Button>
        </div>
      </div>
    </Modal>
  );
}
