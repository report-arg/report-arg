import React from 'react';

/**
 * Componente base SVG para la iconografía personalizada de ReportARG.
 * Hereda `currentColor` para responder dinámicamente a fondos claros y oscuros.
 *
 * @param {Object} props
 * @param {number|string} [props.size=24] - Tamaño del icono en px.
 * @param {string} [props.className=""] - Clases adicionales.
 * @param {"default"|"active"|"selected"|"disabled"} [props.variant="default"] - Variante semántica.
 * @param {string} [props.title] - Título accesible para lectores de pantalla.
 * @param {boolean} [props.ariaHidden] - Oculta el icono de lectores de pantalla si es decorativo.
 * @param {React.ReactNode} props.children - Elementos gráficos internos del SVG.
 */
export function IconBase({
  size = 24,
  className = '',
  variant = 'default',
  title,
  ariaHidden,
  children,
  ...props
}) {
  let variantClasses = '';

  if (variant === 'default') {
    // Hereda directamente el color de texto definido por el contenedor padre (text-slate-700, text-white, text-brand-100, etc.)
    variantClasses = 'text-current';
  } else if (variant === 'active') {
    variantClasses = 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-300)]';
  } else if (variant === 'selected') {
    variantClasses =
      'text-[var(--color-brand-700)] dark:text-[var(--color-brand-200)] bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/60 rounded-lg p-0.5';
  } else if (variant === 'disabled') {
    variantClasses = 'text-slate-300 dark:text-slate-600 opacity-50 cursor-not-allowed';
  }

  const isHidden = ariaHidden !== undefined ? ariaHidden : !title;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={isHidden}
      className={`transition-colors duration-150 shrink-0 ${variantClasses} ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

export default IconBase;
