"use client";

import { CheckCircle2, XCircle } from "lucide-react";

const PASOS = [
  { key: "Pendiente", label: "Pendiente" },
  { key: "En revisión", label: "En revisión" },
  { key: "En proceso", label: "En proceso" },
  { key: "Resuelto", label: "Resuelto" },
];

export default function ClaimProgress({ estado }) {
  if (estado === "Cancelado") {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
        <XCircle size={13} className="shrink-0" />
        <span>Reclamo cancelado</span>
      </div>
    );
  }

  const currentIdx = PASOS.findIndex((p) => p.key === estado);
  const esResuelto = estado === "Resuelto";

  return (
    <div className="w-full">
      {/* Barra fina segmentada (4 etapas de vida del reclamo) */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {PASOS.map((paso, idx) => {
          const isCompleted = esResuelto || (currentIdx >= 0 && idx <= currentIdx);
          const isCurrent = !esResuelto && idx === currentIdx;

          return (
            <div
              key={paso.key}
              className={`h-full rounded-full transition-colors ${
                esResuelto
                  ? "bg-emerald-500"
                  : isCurrent
                  ? "bg-primary"
                  : isCompleted
                  ? "bg-primary/80"
                  : "bg-surface-subtle border border-border-subtle/50"
              }`}
              title={`${paso.label} (${isCompleted ? "Alcanzado" : "Pendiente"})`}
            />
          );
        })}
      </div>

      {/* Referencia sutil de avance */}
      <div className="flex items-center justify-between text-[10px] text-text-muted mt-1 font-medium">
        <span className={currentIdx === 0 ? "font-bold text-text-primary" : ""}>
          Pendiente
        </span>
        <span className={esResuelto ? "font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1" : ""}>
          {esResuelto && <CheckCircle2 size={11} />}
          <span>Resuelto</span>
        </span>
      </div>
    </div>
  );
}
