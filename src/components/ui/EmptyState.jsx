"use client";

import React from "react";
import { PinReportArg, ReportProblemIcon } from "@/components/brand/icons";

/**
 * Componente modular para estados vacíos en la experiencia Ciudadano.
 * Respeta la Identidad Visual de ReportARG.
 */
export default function EmptyState({
  title = "Por acá está todo tranquilo",
  description = "Todavía no hay publicaciones registradas en esta sección.",
  actionLabel = null,
  onAction = null,
  icon: CustomIcon = PinReportArg,
}) {
  const isReportar = actionLabel?.toLowerCase().includes("reportar");

  return (
    <div className="flex flex-col items-center justify-center p-8 my-4 text-center rounded-2xl bg-surface border border-border-subtle shadow-xs">
      <div className="w-12 h-12 mb-3 rounded-full bg-primary-subtle text-primary flex items-center justify-center">
        <CustomIcon size={24} />
      </div>
      <h4 className="text-base font-bold text-text-primary mb-1">
        {title}
      </h4>
      <p className="text-xs text-text-muted max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={
            isReportar
              ? "btn-primary-report inline-flex cursor-pointer"
              : "inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors cursor-pointer shadow-xs"
          }
        >
          {isReportar && <ReportProblemIcon size={16} />}
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
