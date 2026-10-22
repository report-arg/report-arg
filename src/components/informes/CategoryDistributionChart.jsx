const COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];

export default function CategoryDistributionChart({ items, onSelect }) {
  if (!items.length) return <p className="mb-0 mt-5 text-sm text-text-secondary">No hay reclamos categorizados en este período.</p>;
  const total = items.reduce((sum, item) => sum + item.cantidad, 0);
  return (
    <div className="mt-6" role="img" aria-label="Distribución proporcional por categoría">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-subtle" aria-hidden="true">
        {items.map((item, index) => <div key={item.nombre} className="first:rounded-l-full last:rounded-r-full transition-[width]" style={{ width: `${(item.cantidad / total) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }} />)}
      </div>
      <ul className="mt-5 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
        {items.map((item, index) => {
          const percentage = Math.round((item.cantidad / total) * 100);
          return <li key={item.nombre}><button type="button" onClick={() => item.id && onSelect?.(item)} disabled={!item.id} className="w-full rounded-lg border border-border-subtle bg-surface-subtle/50 p-3 text-left transition-colors hover:bg-surface-subtle disabled:cursor-default disabled:hover:bg-surface-subtle/50 focus:outline-none focus:ring-2 focus:ring-primary"><div className="flex items-start justify-between gap-3"><span className="flex min-w-0 items-center gap-2 text-sm font-medium text-text-primary"><i className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="line-clamp-2">{item.nombre}</span></span><span className="shrink-0 text-right"><strong className="block text-base text-text-primary">{item.cantidad}</strong><span className="text-[11px] text-text-muted">{percentage}%</span></span></div></button></li>;
        })}
      </ul>
    </div>
  );
}
