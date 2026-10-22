const COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];

function Legend({ items, total }) {
  return <ul className="m-0 list-none space-y-2 p-0">{items.map((item, index) => <li key={item.nombre} className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2 text-text-secondary"><i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="truncate">{item.nombre}</span></span><span className="shrink-0 font-semibold text-text-primary">{item.cantidad} <span className="font-normal text-text-muted">({total ? Math.round((item.cantidad / total) * 100) : 0}%)</span></span></li>)}</ul>;
}

export default function DistributionChart({ title, items, emptyMessage, variant = "bars" }) {
  const total = items.reduce((sum, item) => sum + item.cantidad, 0);
  const max = Math.max(...items.map((item) => item.cantidad), 0);
  const stops = items.reduce((segments, item, index) => {
    const start = segments.end;
    const end = start + (total ? (item.cantidad / total) * 100 : 0);
    segments.parts.push(`${COLORS[index % COLORS.length]} ${start}% ${end}%`);
    segments.end = end;
    return segments;
  }, { parts: [], end: 0 }).parts.join(", ");
  return (
    <section className="rounded-xl border border-border-subtle bg-surface p-4 sm:p-5">
      <h2 className="m-0 text-base font-bold text-text-primary">{title}</h2>
      {items.length === 0 ? (
        <p className="mb-0 mt-5 text-sm text-text-secondary">{emptyMessage}</p>
      ) : variant === "donut" ? (
        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative grid h-36 w-36 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${stops})` }} aria-hidden="true"><div className="grid h-24 w-24 place-items-center rounded-full bg-surface text-center"><strong className="text-2xl text-text-primary">{total}</strong><span className="text-[10px] text-text-muted">reclamos</span></div></div>
          <div className="w-full min-w-0"><Legend items={items} total={total} /></div>
        </div>
      ) : (
        <div className="mt-5"><div className="flex h-40 items-end gap-3 border-b border-border-subtle px-1" aria-hidden="true">{items.map((item, index) => <div key={item.nombre} className="flex h-full min-w-10 flex-1 flex-col justify-end text-center"><span className="mb-1 text-xs font-bold text-text-primary">{item.cantidad}</span><div className="min-h-1 rounded-t-md" style={{ height: `${max ? Math.max((item.cantidad / max) * 100, 4) : 0}%`, backgroundColor: COLORS[index % COLORS.length] }} /></div>)}</div><div className="mt-2"><Legend items={items} total={total} /></div></div>
      )}
    </section>
  );
}
