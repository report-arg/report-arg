"use client";

import { CheckCircle } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function InstitutionApproveModal({
  isOpen = false,
  onClose,
  onConfirm,
  institucion,
  loading = false,
}) {
  if (!institucion) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="¿Verificar institución?"
      description={`Estás por habilitar a "${institucion.nombre}" (${institucion.email}). Al verificarse, la entidad podrá responder reclamos ciudadanos y publicar comunicados oficiales en su jurisdicción.`}
      variant="success"
      confirmText="Verificar institución"
      cancelText="Cancelar"
      loading={loading}
      loadingText="Verificando..."
      icon={<CheckCircle size={20} />}
    />
  );
}
