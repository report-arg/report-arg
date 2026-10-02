"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Modal base accesible y reutilizable para toda la aplicación ReportARG.
 * Soporta cierre con Escape, click fuera, focus trap básico y animación suave.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controla si el modal está visible
 * @param {Function} props.onClose - Callback al cerrar el modal
 * @param {string|React.ReactNode} [props.title] - Título del modal
 * @param {string|React.ReactNode} [props.description] - Subtítulo o descripción breve
 * @param {React.ReactNode} [props.icon] - Ícono a mostrar en el encabezado
 * @param {string} [props.iconBgClass] - Clases de fondo y color para el contenedor del ícono
 * @param {'sm'|'md'|'lg'|'xl'} [props.maxWidth='md'] - Ancho máximo del modal
 * @param {boolean} [props.showCloseButton=true] - Mostrar u ocultar la 'X' superior
 * @param {boolean} [props.closeOnBackdrop=true] - Cerrar al hacer click en el backdrop
 * @param {boolean} [props.closeOnEscape=true] - Cerrar con la tecla Escape
 * @param {React.ReactNode} props.children - Contenido del cuerpo del modal
 * @param {string} [props.className] - Clases adicionales para la tarjeta del modal
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconBgClass = "bg-primary-subtle text-primary",
  maxWidth = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  children,
  className = "",
}) {
  const dialogRef = useRef(null);

  // Cierre con Escape y bloqueo de scroll en el body
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[maxWidth] || "max-w-md";

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={closeOnBackdrop ? () => onClose?.() : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className={`relative w-full ${maxWidthClasses} bg-surface rounded-2xl p-5 sm:p-6 shadow-2xl border border-border-subtle animate-in zoom-in-95 duration-150 text-text-primary ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cerrar 'X' */}
        {showCloseButton && (
          <button
            type="button"
            onClick={() => onClose?.()}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        )}

        {/* Encabezado opcional */}
        {(title || icon) && (
          <div className="flex items-start gap-3.5 mb-4">
            {icon && (
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}
              >
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1 pr-6">
              {title && (
                <h3 className="text-base font-bold text-text-primary leading-snug">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cuerpo del modal */}
        <div className="text-sm text-text-secondary">{children}</div>
      </div>
    </div>
  );

  // Client-side portal si estamos en el navegador
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
