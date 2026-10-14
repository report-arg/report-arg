"use client";

import { AlertTriangle, UserCheck, UserX } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function UserStatusModal({
  isOpen = false,
  onClose,
  onConfirm,
  usuario,
  tipo = "inhabilitar", // 'inhabilitar' | 'rehabilitar'
  loading = false,
  error = "",
}) {
  if (!usuario) return null;

  const isInhabilitar = tipo === "inhabilitar";

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
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
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}
    </ConfirmModal>
  );
}
