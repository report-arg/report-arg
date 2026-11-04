"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Textarea from "@/components/ui/Textarea";

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

  const handleConfirm = async () => {
    if (!motivo.trim()) {
      setError("El motivo de rechazo es obligatorio para notificar formalmente a la entidad.");
      return;
    }
    setError("");
    const res = await onConfirm?.(motivo.trim());
    if (res?.ok) {
      setMotivo("");
      setError("");
    }
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
      description={`Indicá el motivo detallado de rechazo para "${institucion.nombre}". El solicitante verá este motivo en su cuenta durante una ventana de 7 días (sin permisos operativos) para corregir los datos o convertir su cuenta a ciudadano, y el evento quedará en auditoría.`}
      variant="danger"
      confirmText="Confirmar rechazo"
      cancelText="Cancelar"
      loading={loading}
      loadingText="Rechazando..."
      icon={<XCircle size={20} />}
    >
      <div className="mt-2 text-left">
        <Textarea
          label="Motivo del rechazo *"
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value);
            setError("");
          }}
          placeholder="Ej. La documentación adjunta no coincide con el organismo público declarado o la ciudad no corresponde..."
          rows={3}
          error={error}
        />
      </div>
    </ConfirmModal>
  );
}
