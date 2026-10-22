import { ChevronRight } from "lucide-react";

export default function CategoryDistributionChart({ items, onSelect }) {
  if (!items.length) return <p className="mb-0 mt-5 text-sm text-text-secondary">No hay reclamos categorizados en este período.</p>;

  const maxCantidad = Math.max(...items.map((item) => item.cantidad), 1);

  return (
    <ul className="m-0 mt-5 list-none space-y-3 p-0" aria-label="Reclamos por categoría">
      {items.map((item) => {
        const porcentaje = Math.max((item.cantidad / maxCantidad) * 100, item.cantidad ? 4 : 0);
        const esSeleccionable = Boolean(item.id);

        return (
          <li key={item.id || item.nombre}>
            <button
              type="button"
              onClick={() => esSeleccionable && onSelect?.(item)}
              disabled={!esSeleccionable}
              className="group grid w-full grid-cols-[minmax(76px,1fr)_minmax(100px,3fr)_auto] items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-primary-subtle/40 disabled:cursor-default disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={esSeleccionable ? `Ver reclamos de la categoría ${item.nombre}` : item.nombre}
            >
              <span className="truncate text-xs font-medium text-text-secondary sm:text-sm">{item.nombre}</span>
              <span className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle" aria-hidden="true">
                <span className="block h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${porcentaje}%` }} />
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-text-primary sm:text-sm">
                {item.cantidad}
                {esSeleccionable && <ChevronRight size={15} className="text-text-muted transition-transform group-hover:translate-x-0.5" />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
