import { AlertTriangle } from "lucide-react";
export default function ClaimTracking({ reclamo, advertir = false }) {
  if (reclamo?.diasEnEstado === undefined || reclamo?.diasEnEstado === null) return null;
  return <span className="inline-flex flex-wrap items-center gap-2 text-xs text-text-secondary">
    <span>{reclamo.diasEnEstado === 0 ? "Menos de un día" : `${reclamo.diasEnEstado} día${reclamo.diasEnEstado === 1 ? "" : "s"}`} en {reclamo.estado}</span>
    {advertir && reclamo.demorado && <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold bg-[var(--color-brand-warning-50)] text-[var(--color-brand-warning-600)] border border-[var(--color-brand-warning-100)]"><AlertTriangle size={12} /> Demorado</span>}
  </span>;
}
