"use client";

import { useState, useEffect } from "react";
import { UserCheck, UserX } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Textarea from "@/components/ui/Textarea";

export default function UsuarioStatusModal({
  isOpen = false,
  onClose,
  onConfirm,
  usuario,
  tipo = "inhabilitar", // 'inhabilitar' | 'rehabilitar'
  loading = false,
  error = "",
}) {
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMotivo("");
    }
  }, [isOpen]);

  if (!usuario) return null;

  const isInhabilitar = tipo === "inhabilitar";

  const handleConfirm = () => {
    onConfirm?.(motivo.trim());
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={isInhabilitar ? "¿Inhabilitar cuenta de usuario?" : "¿Rehabilitar cuenta de usuario?"}
      description={
        isInhabilitar
          ? `Estás a punto de inhabilitar al usuario "${usuario.nombre || usuario.email}". Perderá inmediatamente la capacidad de iniciar sesión y operar en ReportARG.`
          : `Estás a punto de rehabilitar al usuario "${usuario.nombre || usuario.email}". Podrá volver a iniciar sesión y utilizar la plataforma.`
      }
      variant={isInhabilitar ? "danger" : "success"}
      confirmText={isInhabilitar ? "Inhabilitar usuario" : "Rehabilitar usuario"}
      cancelText="Cancelar"
      loading={loading}
      loadingText={isInhabilitar ? "Inhabilitando..." : "Rehabilitando..."}
      icon={
        isInhabilitar ? (
          <UserX size={20} className="text-rose-600" />
        ) : (
          <UserCheck size={20} className="text-emerald-600" />
        )
      }
    >
      <div className="mt-4 space-y-3">
        {isInhabilitar && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
              Motivo de la inhabilitación (opcional para auditoría)
            </label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describí la causa administrativa para el registro de auditoría..."
              rows={2}
              className="text-xs"
            />
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}
      </div>
    </ConfirmModal>
  );
}
