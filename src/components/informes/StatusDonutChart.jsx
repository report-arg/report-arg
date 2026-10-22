"use client";

import { useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];

export default function StatusDonutChart({ items, onSelect }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.cantidad, 0), [items]);
  const active = activeIndex === null ? null : items[activeIndex];
  const centerValue = active?.cantidad ?? total;
  const centerLabel = active?.nombre ?? "Reclamos";

  if (!items.length) return <p className="mb-0 mt-5 text-sm text-text-secondary">No hay reclamos en este período.</p>;

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(220px,1fr)_minmax(160px,.8fr)] sm:items-center">
      <div className="h-60 min-w-0" role="img" aria-label="Gráfico circular de distribución por estado">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={items} dataKey="cantidad" nameKey="nombre" innerRadius={68} outerRadius={96} paddingAngle={4} stroke="none" onMouseEnter={(_, index) => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)} onClick={(entry) => onSelect?.(entry?.payload || entry)}>
              {items.map((item, index) => <Cell key={item.nombre} fill={COLORS[index % COLORS.length]} className="outline-none" />)}
            </Pie>
            <Tooltip formatter={(value) => [`${value} reclamo${Number(value) === 1 ? "" : "s"}`, "Cantidad"]} />
            <text x="50%" y="47%" textAnchor="middle" className="fill-[var(--color-text-primary)] text-2xl font-bold">{centerValue}</text>
            <text x="50%" y="58%" textAnchor="middle" className="fill-[var(--color-text-muted)] text-xs">{centerLabel}</text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="m-0 list-none space-y-2 p-0">
        {items.map((item, index) => <li key={item.nombre}><button type="button" onClick={() => onSelect?.(item)} onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)} onBlur={() => setActiveIndex(null)} className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary"><span className="flex min-w-0 items-center gap-2"><i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="truncate text-text-secondary">{item.nombre}</span></span><span className="font-bold text-text-primary">{item.cantidad}</span></button></li>)}
      </ul>
    </div>
  );
}
