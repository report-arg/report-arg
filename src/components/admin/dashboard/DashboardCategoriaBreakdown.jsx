"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function DashboardCategoriaBreakdown({
  porCategoria = [],
  maxCategoriaCantidad = 1,
  totalReclamosCalculado = 0,
}) {
  return (
    <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
            Reclamos por Categoría
          </h3>
          <p className="text-xs text-text-secondary m-0 mt-0.5">
            Volumen acumulado por temática
          </p>
        </div>
        <Link
          href="/admin/categories"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 no-underline"
        >
          Gestionar
          <ChevronRight size={12} />
        </Link>
      </div>

      {porCategoria.length === 0 ? (
        <p className="text-xs text-text-muted py-6 text-center m-0">
          No hay reclamos categorizados en el sistema.
        </p>
      ) : (
        <div className="space-y-3.5">
          {porCategoria.slice(0, 6).map((c) => {
            const cantidad = Number(c.cantidad || 0);
            const porcentaje = Math.round((cantidad / maxCategoriaCantidad) * 100);

            return (
              <div key={c.categoria || "Sin categoría"} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-primary truncate pr-2">
                    {c.categoria || "Sin categoría asignada"}
                  </span>
                  <span className="font-bold text-text-secondary shrink-0">
                    {cantidad.toLocaleString()}{" "}
                    <span className="text-[11px] font-normal text-text-muted">
                      ({totalReclamosCalculado > 0 ? ((cantidad / totalReclamosCalculado) * 100).toFixed(0) : 0}%)
                    </span>
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(porcentaje, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
