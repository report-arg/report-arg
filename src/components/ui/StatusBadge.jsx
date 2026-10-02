"use client";

import { getEstadoConfig } from "@/utils/claimStatus";
import Badge from "./Badge";

const STATUS_VARIANTS = {
  // Reclamos
  "Pendiente": { variant: "neutral", dot: "bg-slate-500" },
  "En revisión": { variant: "primary", dot: "bg-primary" },
  "En proceso": { variant: "warning", dot: "bg-amber-500" },
  "Resuelto": { variant: "success", dot: "bg-emerald-500" },
  "Cancelado": { variant: "danger", dot: "bg-rose-500" },

  // Comunicados / Contenido
  "Publicado": { variant: "success", dot: "bg-emerald-500" },
  "Borrador": { variant: "neutral", dot: "bg-slate-400" },
  "Archivado": { variant: "outline", dot: "bg-slate-400" },

  // Usuarios / Cuentas
  "Activo": { variant: "success", dot: "bg-emerald-500" },
  "Inactivo": { variant: "danger", dot: "bg-rose-500" },
};

/**
 * Badge de estado general reutilizable para ReportARG.
 * Soporta estados de reclamos, comunicados y usuarios, con indicador de punto (dot).
 *
 * @param {Object} props
 * @param {string} props.status - Nombre del estado ('Pendiente', 'Resuelto', 'Activo', etc.)
 * @param {string} [props.label] - Texto opcional a mostrar si difiere del status
 * @param {boolean} [props.showDot=true] - Mostrar punto indicador de color
 * @param {'sm'|'md'|'lg'} [props.size='sm']
 * @param {string} [props.className]
 */
export default function StatusBadge({
  status,
  estado,
  label,
  showDot = true,
  size = "sm",
  className = "",
  ...rest
}) {
  const normalized = status || estado || "Pendiente";
  const statusInfo = STATUS_VARIANTS[normalized] || {
    variant: "neutral",
    dot: "bg-slate-500",
  };

  const displayText = label || normalized;

  return (
    <Badge
      variant={statusInfo.variant}
      size={size}
      className={`font-semibold ${className}`}
      icon={
        showDot ? (
          <span
            className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} shrink-0`}
            aria-hidden="true"
          />
        ) : undefined
      }
      {...rest}
    >
      {displayText}
    </Badge>
  );
}
