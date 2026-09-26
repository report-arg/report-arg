"use client";

import React from "react";
import { PinReportArg } from "@/components/brand/icons";

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
  return (
    <div className="flex flex-col items-center justify-center p-8 my-4 text-center rounded-2xl bg-white border border-slate-200/80 shadow-xs">
      <div className="w-12 h-12 mb-3 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center">
        <CustomIcon size={24} />
      </div>
      <h4 className="text-base font-bold text-slate-900 mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
