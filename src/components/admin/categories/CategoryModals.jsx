"use client";

import { PowerOff, Power, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function CategoryModals({
  modalBaja,
  onCloseBaja,
  onConfirmBaja,
  modalReactivar,
  onCloseReactivar,
  onConfirmReactivar,
  modalEliminar,
  onCloseEliminar,
  onConfirmEliminar,
  procesando = false,
}) {
  return (
    <>
      {/* Modal Baja Lógica */}
      {modalBaja && (
        <ConfirmModal
          isOpen={true}
          onClose={onCloseBaja}
          onConfirm={onConfirmBaja}
          title="¿Desactivar categoría?"
          description={`Estás por dar de baja lógica a "${modalBaja.nombre}". La categoría ya no podrá seleccionarse para nuevos reportes, pero se preservarán intactos los reclamos y comunicados existentes asociados.`}
          variant="warning"
          confirmText="Desactivar Categoría"
          cancelText="Cancelar"
          loading={procesando}
          loadingText="Desactivando..."
          icon={<PowerOff size={20} />}
        />
      )}

      {/* Modal Reactivar */}
      {modalReactivar && (
        <ConfirmModal
          isOpen={true}
          onClose={onCloseReactivar}
          onConfirm={onConfirmReactivar}
          title="¿Reactivar categoría?"
          description={`Al reactivar "${modalReactivar.nombre}", volverá a estar disponible inmediatamente en el selector para ciudadanos e instituciones.`}
          variant="success"
          confirmText="Reactivar Categoría"
          cancelText="Cancelar"
          loading={procesando}
          loadingText="Reactivando..."
          icon={<Power size={20} />}
        />
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <ConfirmModal
          isOpen={true}
          onClose={onCloseEliminar}
          onConfirm={onConfirmEliminar}
          title="¿Eliminar categoría definitivamente?"
          description={`Esta acción intentará borrar permanentemente la categoría "${modalEliminar.nombre}". Si la categoría tiene reclamos, comunicados o asignaciones asociadas, el sistema rechazará la eliminación para preservar la integridad referencial.`}
          variant="danger"
          confirmText="Intentar Eliminación"
          cancelText="Cancelar"
          loading={procesando}
          loadingText="Verificando..."
          icon={<Trash2 size={20} />}
        />
      )}
    </>
  );
}
