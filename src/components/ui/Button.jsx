"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

/**
 * Componente Button reutilizable de ReportARG.
 * Cumple con la jerarquía visual de BUTTON_HIERARCHY, accesibilidad por teclado,
 * estados de carga (`loading`), variantes semánticas y soporte de navegación vía `href`.
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'|'danger-soft'|'success'|'success-soft'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'|'icon'} [props.size='md']
 * @param {boolean} [props.loading=false] - Muestra spinner y bloquea interacción
 * @param {string} [props.loadingText] - Texto a mostrar durante la carga
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.fullWidth=false]
 * @param {string} [props.href] - Si se provee, renderiza un Next.js Link accesible
 * @param {React.ReactNode} [props.leftIcon] - Ícono a la izquierda del texto
 * @param {React.ReactNode} [props.rightIcon] - Ícono a la derecha del texto
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    loadingText,
    disabled = false,
    fullWidth = false,
    href,
    leftIcon,
    rightIcon,
    type = "button",
    children,
    className = "",
    ...rest
  },
  ref
) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold select-none transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0";

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
    md: "text-xs px-4 py-2 rounded-xl gap-2",
    lg: "text-sm px-5 py-2.5 rounded-xl gap-2.5 font-bold",
    icon: "p-2 rounded-xl text-text-muted hover:text-text-primary",
  }[size] || "text-xs px-4 py-2 rounded-xl gap-2";

  const variantClasses = {
    // 1. Primary Solid Brand Blue
    primary:
      "bg-primary hover:bg-[var(--color-primary-hover,#0046b3)] active:bg-[#00358A] text-white shadow-2xs hover:shadow-xs",
    // 2. Secondary Soft Neutral
    secondary:
      "bg-surface-subtle text-text-primary border border-border-subtle hover:bg-surface-elevated hover:border-border-strong active:bg-surface-subtle/80 shadow-2xs",
    // 3. Outline
    outline:
      "bg-transparent text-text-primary border border-border-strong hover:bg-surface-subtle active:bg-surface-subtle/80",
    // 4. Ghost / Tertiary
    ghost:
      "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-subtle active:bg-surface-subtle/80",
    // 5. Danger Solid
    danger:
      "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-2xs hover:shadow-xs",
    // 6. Danger Soft
    "danger-soft":
      "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60",
    // 7. Success Solid
    success:
      "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-2xs hover:shadow-xs",
    // 8. Success Soft
    "success-soft":
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60",
  }[variant] || "bg-primary text-white";

  const widthClass = fullWidth ? "w-full" : "";
  const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${widthClass} ${className}`;

  const content = (
    <>
      {loading ? (
        <Loader2 size={size === "sm" ? 13 : 15} className="animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
      )}

      {loading && loadingText ? <span>{loadingText}</span> : children}

      {!loading && rightIcon && (
        <span className="shrink-0 flex items-center">{rightIcon}</span>
      )}
    </>
  );

  // Si tiene href, renderizamos como Link de Next.js
  if (href && !disabled && !loading) {
    return (
      <Link ref={ref} href={href} className={combinedClasses} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={combinedClasses}
      {...rest}
    >
      {content}
    </button>
  );
});

export default Button;
