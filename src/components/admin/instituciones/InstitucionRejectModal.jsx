"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function InstitucionRejectModal({
  isOpen = false,
  onClose,
  onConfirm,
  institucion,
  loading = false,
}) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  if (!institucion) return null;

  const handleConfirm = () => {
    if (!motivo.trim()) {
      setError("El motivo de rechazo es obligatorio para notificar formalmente a la entidad.");
      return;
    }
    setError("");
    onConfirm?.(motivo.trim());
  };

  const handleClose = () => {
    setMotivo("");
    setError("");
    onClose?.();
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Rechazar solicitud institucional"
      description={`Indicá el motivo detallado de rechazo para "${institucion.nombre}". Este texto será enviado formalmente por correo electrónico al solicitante y registrado en la auditoría.`}
      variant="danger"
      confirmText="Confirmar rechazo"
      cancelText="Cancelar"
      loading={loading}
      loadingText="Rechazando..."
      icon={<XCircle size={20} />}
    >
      <div className="mt-3 text-left">
        <label className="block text-xs font-bold text-text-primary mb-1">
          Motivo del rechazo <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value);
            setError("");
          }}
          placeholder="Ej. La documentación adjunta no coincide con el organismo público declarado o la ciudad no corresponde..."
          rows={3}
          className={`w-full text-xs p-3 rounded-xl border ${
            error ? "border-rose-500" : "border-border-subtle"
          } bg-surface text-text-primary focus:border-rose-500 outline-hidden resize-y transition-all`}
        />
        {error && (
          <p className="text-[11px] text-rose-600 mt-1 font-semibold m-0">{error}</p>
        )}
      </div>
    </ConfirmModal>
  );
}
