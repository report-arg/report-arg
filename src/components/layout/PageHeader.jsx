"use client";

import React from "react";

/**
 * Componente unificado para encabezados de página en ReportARG.
 * Garantiza consistencia en tamaño de tipografía, posición, espaciado y acciones.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.title - Título principal de la página
 * @param {React.ReactNode} [props.description] - Subtítulo o bajada descriptiva
 * @param {React.ReactNode} [props.action] - Botón o elementos de acción a la derecha
 * @param {string} [props.className] - Clases adicionales para el contenedor
 */
export default function PageHeader({
  title,
  description,
  action,
  className = ""
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border-subtle ${className}`}>
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary m-0">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-text-secondary mt-1 mb-0 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
