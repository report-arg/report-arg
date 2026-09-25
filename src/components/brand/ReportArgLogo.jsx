import React from 'react';
import { PinReportArg } from './icons';

/**
 * Componente oficial de Identidad Visual para el Logo y Símbolo de ReportARG.
 * Garantiza que el icono del logo se renderice en azul de marca (#005CE6) en fondo claro.
 *
 * @param {Object} props
 * @param {"horizontal"|"symbol"|"app-icon"} [props.variant="horizontal"] - Variante del logo.
 * @param {number} [props.size=32] - Tamaño en px del isotipo o badge.
 * @param {boolean} [props.darkMode=false] - Ajusta contraste para fondos oscuros.
 * @param {string} [props.className=""] - Clases CSS adicionales.
 * @param {string} [props.ariaLabel="ReportARG"] - Etiqueta accesible.
 */
export function ReportArgLogo({
  variant = 'horizontal',
  size = 32,
  darkMode = false,
  className = '',
  ariaLabel = 'ReportARG - Participación Ciudadana',
  ...props
}) {
  const brandBlueHex = '#005CE6';
  const darkAccentHex = '#85C8FF';

  if (variant === 'symbol') {
    return (
      <div
        className={`inline-flex items-center justify-center ${className}`}
        aria-label={ariaLabel}
        role="img"
        {...props}
      >
        <PinReportArg
          size={size}
          style={{ color: darkMode ? '#FFFFFF' : brandBlueHex }}
          className={darkMode ? 'text-white' : 'text-[#005CE6]'}
          title="Símbolo ReportARG"
        />
      </div>
    );
  }

  if (variant === 'app-icon') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-2xl bg-[var(--color-brand-600)] text-white shadow-lg shadow-[var(--color-brand-600)]/25 ${className}`}
        style={{ width: `${size}px`, height: `${size}px`, backgroundColor: brandBlueHex }}
        aria-label={ariaLabel}
        role="img"
        {...props}
      >
        <PinReportArg size={Math.round(size * 0.58)} className="text-white" title="App Icon ReportARG" />
      </div>
    );
  }

  // Logo Horizontal Principal
  const textColorPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const iconStyle = { color: darkMode ? '#FFFFFF' : brandBlueHex };
  const argStyle = { color: darkMode ? darkAccentHex : brandBlueHex };

  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label={ariaLabel}
      role="img"
      {...props}
    >
      <PinReportArg
        size={size}
        style={iconStyle}
        className={darkMode ? 'text-white' : 'text-[#005CE6]'}
        title="ReportARG"
      />
      <span
        className={`font-bold tracking-tight ${textColorPrimary} select-none`}
        style={{ fontSize: `${Math.max(15, size * 0.75)}px`, lineHeight: 1 }}
      >
        Report<span style={argStyle} className={darkMode ? 'text-brand-300' : 'text-[#005CE6]'}>ARG</span>
      </span>
    </div>
  );
}

export default ReportArgLogo;
