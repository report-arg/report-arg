"use client";

/**
 * Componente Badge reutilizable para estados, etiquetas, visibilidad y roles en ReportARG.
 * Respeta los tokens de diseño tanto en Light Mode como en Dark Mode.
 *
 * @param {Object} props
 * @param {'default'|'primary'|'success'|'danger'|'warning'|'info'|'neutral'|'outline'} [props.variant='default'] - Variante de color
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Tamaño del badge
 * @param {React.ReactNode} [props.icon] - Ícono opcional antes del texto
 * @param {boolean} [props.pill=true] - Bordes completamente redondeados o estándar
 * @param {React.ReactNode} props.children - Texto o contenido del badge
 * @param {string} [props.className] - Clases adicionales de Tailwind
 */
export default function Badge({
  variant = "default",
  size = "md",
  icon,
  pill = true,
  children,
  className = "",
  ...rest
}) {
  const sizeClasses = {
    sm: "text-xs px-2.5 py-0.5 gap-1.5",
    md: "text-xs px-3 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2",
  }[size] || "text-xs px-2.5 py-0.5 gap-1.5";

  const variantClasses = {
    default: "bg-surface-subtle text-text-secondary border border-border-subtle font-semibold",
    neutral: "bg-surface-subtle text-text-muted border border-border-subtle font-semibold",
    primary: "bg-primary-subtle text-primary border border-primary/25 font-semibold",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800 font-semibold",
    danger: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800 font-semibold",
    warning: "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800 font-semibold",
    info: "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-800 font-semibold",
    outline: "bg-surface-subtle/50 text-text-secondary border border-border-subtle font-semibold",
  }[variant] || "bg-surface-subtle text-text-secondary border border-border-subtle font-semibold";

  const roundedClass = pill ? "rounded-full" : "rounded-lg";

  return (
    <span
      className={`inline-flex items-center font-medium select-none ${roundedClass} ${sizeClasses} ${variantClasses} ${className}`}
      {...rest}
    >
      {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
