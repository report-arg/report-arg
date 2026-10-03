"use client";

import { Loader2, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import Modal from "./Modal";

/**
 * Modal de confirmación y acciones unificado para toda la aplicación ReportARG.
 * Garantiza consistencia visual absoluta en botones de Cancelar / Confirmar,
 * estados de carga (`loading`), variantes semánticas y accesibilidad.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibilidad del modal
 * @param {Function} props.onClose - Callback al cancelar o cerrar
 * @param {Function} props.onConfirm - Callback al confirmar la acción
 * @param {string} props.title - Título principal
 * @param {string|React.ReactNode} [props.description] - Subtítulo o texto explicativo
 * @param {'primary'|'danger'|'success'|'warning'} [props.variant='primary'] - Variante semántica
 * @param {string} [props.confirmText='Confirmar'] - Texto del botón de confirmación
 * @param {string} [props.cancelText='Cancelar'] - Texto del botón de cancelación
 * @param {boolean} [props.loading=false] - Estado de carga durante la operación
 * @param {string} [props.loadingText] - Texto alternativo al estar en loading
 * @param {boolean} [props.confirmDisabled=false] - Deshabilita el botón de confirmación
 * @param {React.ReactNode} [props.icon] - Ícono personalizado (sobrescribe el de la variante)
 * @param {'sm'|'md'|'lg'} [props.maxWidth='md'] - Ancho del modal
 * @param {React.ReactNode} [props.children] - Contenido interactivo adicional (inputs, textareas, etc.)
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant = "primary",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  loadingText,
  confirmDisabled = false,
  icon,
  maxWidth = "md",
  children,
}) {
  const variantConfig = {
    primary: {
      btnClass: "bg-primary hover:bg-[var(--color-primary-hover,#0046b3)] text-white",
      iconBg: "bg-primary-subtle text-primary",
      defaultIcon: <RefreshCw size={20} className={loading ? "animate-spin" : ""} />,
    },
    danger: {
      btnClass: "bg-rose-600 hover:bg-rose-700 text-white",
      iconBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
      defaultIcon: <XCircle size={20} />,
    },
    success: {
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
      defaultIcon: <CheckCircle2 size={20} />,
    },
    warning: {
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white",
      iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
      defaultIcon: <AlertTriangle size={20} />,
    },
  }[variant] || {
    btnClass: "bg-primary hover:bg-[var(--color-primary-hover,#0046b3)] text-white",
    iconBg: "bg-primary-subtle text-primary",
    defaultIcon: <RefreshCw size={20} />,
  };

  const handleConfirm = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!loading && !confirmDisabled) {
      onConfirm?.(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title={title}
      description={description}
      icon={icon || variantConfig.defaultIcon}
      iconBgClass={variantConfig.iconBg}
      maxWidth={maxWidth}
      showCloseButton={!loading}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleConfirm} className="space-y-4">
        {/* Contenido adicional opcional (inputs, textareas, alertas) */}
        {children && <div className="space-y-3 pt-1">{children}</div>}

        {/* Barra de acciones estandarizada */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-xl cursor-pointer transition-colors border border-transparent hover:border-border-subtle disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>

          <button
            type="submit"
            disabled={loading || confirmDisabled}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${variantConfig.btnClass}`}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin shrink-0" />
                <span>{loadingText || "Procesando..."}</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
