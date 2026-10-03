"use client";

import React, { forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Componente Textarea de formulario reutilizable para ReportARG.
 * Cuenta con contador de caracteres, estados de error accesibles, labels y diseño adaptado.
 *
 * @param {Object} props
 * @param {string} [props.label] - Etiqueta superior
 * @param {string} [props.error] - Mensaje de error para validación
 * @param {string} [props.helperText] - Texto de instrucción o ayuda inferior
 * @param {boolean} [props.required=false]
 * @param {boolean} [props.disabled=false]
 * @param {number} [props.rows=3]
 * @param {number} [props.maxLength]
 * @param {boolean} [props.showCount=false] - Mostrar contador de caracteres restantes
 * @param {string} [props.containerClassName]
 * @param {string} [props.className]
 */
const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    required = false,
    disabled = false,
    rows = 3,
    maxLength,
    showCount = false,
    id: externalId,
    value,
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
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className={`w-full space-y-1.5 ${containerClassName}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text-primary"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        {showCount && maxLength && (
          <span className="text-[10px] text-text-muted font-medium ml-auto">
            {currentLength} / {maxLength}
          </span>
        )}
      </div>

      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        disabled={disabled}
        required={required}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? errorId : helperText ? helperId : undefined
        }
        className={`w-full text-xs sm:text-sm p-3 rounded-xl border transition-colors resize-y leading-relaxed bg-surface text-text-primary placeholder:text-text-muted/60 disabled:opacity-50 disabled:cursor-not-allowed ${
          hasError
            ? "border-rose-400 focus:border-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100"
            : "border-border-subtle hover:border-border-strong focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
        } ${className}`}
        {...rest}
      />

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

export default Textarea;
