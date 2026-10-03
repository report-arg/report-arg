"use client";

import React, { forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Componente Input de formulario reutilizable para ReportARG.
 * Incluye label integrado, iconografía izquierda, elemento derecho (ej. botón de ver contraseña),
 * mensajes de ayuda y estados de error con accesibilidad (aria-invalid, aria-describedby).
 *
 * @param {Object} props
 * @param {string} [props.label] - Etiqueta superior del campo
 * @param {string} [props.error] - Mensaje de error para validación
 * @param {string} [props.helperText] - Texto de ayuda o instrucción inferior
 * @param {React.ReactNode} [props.leftIcon] - Ícono a la izquierda dentro del campo
 * @param {React.ReactNode} [props.rightElement] - Elemento a la derecha (botón, ícono, acción)
 * @param {boolean} [props.required=false]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.containerClassName]
 * @param {string} [props.className]
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightElement,
    required = false,
    disabled = false,
    id: externalId,
    type = "text",
    className = "",
    containerClassName = "",
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const inputId = externalId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const hasError = Boolean(error);

  return (
    <div className={`w-full space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-text-primary"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center justify-center text-text-muted pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? errorId : helperText ? helperId : undefined
          }
          className={`w-full text-xs sm:text-sm py-2 px-3 rounded-xl border transition-colors bg-surface text-text-primary placeholder:text-text-muted/60 disabled:opacity-50 disabled:cursor-not-allowed ${
            leftIcon ? "pl-10" : ""
          } ${rightElement ? "pr-10" : ""} ${
            hasError
              ? "border-rose-400 focus:border-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100"
              : "border-border-subtle hover:border-border-strong focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
          } ${className}`}
          {...rest}
        />

        {rightElement && (
          <div className="absolute right-3 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>

      {hasError ? (
        <p
          id={errorId}
          className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1"
        >
          <AlertCircle size={12} className="shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-[11px] text-text-muted mt-1">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
