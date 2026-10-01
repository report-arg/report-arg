"use client";
import { useId } from "react";
import { CLAIM_STATUSES } from "@/utils/claimStatus";
export default function ClaimFilters({ estado, categoria, categorias, onEstado, onCategoria, onClear, orden, onOrden }) {
  const id = useId();
  const activo = estado !== "Todos" || categoria !== "Todas" || (orden && orden !== "recientes");
  const estilo = "w-full rounded-lg border border-border-subtle bg-surface p-2 text-sm text-text-primary focus-visible:outline-primary";
  return <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-border-subtle bg-surface p-4">
    <div className="flex-1 min-w-40"><label htmlFor={`${id}-estado`} className="block text-xs text-text-secondary mb-1">Estado</label>
      <select id={`${id}-estado`} className={estilo} value={estado} onChange={e => onEstado(e.target.value)}><option>Todos</option>{CLAIM_STATUSES.map(e => <option key={e}>{e}</option>)}</select></div>
    <div className="flex-1 min-w-40"><label htmlFor={`${id}-categoria`} className="block text-xs text-text-secondary mb-1">Categoría</label>
      <select id={`${id}-categoria`} className={estilo} value={categoria} onChange={e => onCategoria(e.target.value)}><option>Todas</option>{categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
    {onOrden && <div className="flex-1 min-w-40"><label htmlFor={`${id}-orden`} className="block text-xs text-text-secondary mb-1">Ordenar por</label><select id={`${id}-orden`} className={estilo} value={orden} onChange={e => onOrden(e.target.value)}><option value="recientes">Más recientes</option><option value="atencion">Necesitan atención</option><option value="antiguos">Más tiempo esperando</option><option value="impacto">Mayor impacto</option></select></div>}
    <button type="button" onClick={onClear} disabled={!activo} className="rounded-lg bg-surface-subtle px-3 py-2 text-sm font-semibold text-text-secondary disabled:opacity-50">Limpiar filtros</button>
    {activo && <p className="w-full text-xs text-primary" role="status">Filtros activos: {[estado !== "Todos" ? estado : null, categoria !== "Todas" ? categorias.find(c => String(c.id) === categoria)?.nombre || "Categoría seleccionada" : null, orden && orden !== "recientes" ? "Orden personalizado" : null].filter(Boolean).join(" · ")}</p>}
  </div>;
}
