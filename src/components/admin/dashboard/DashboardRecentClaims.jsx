"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import { tiempoRelativo } from "@/utils/dateFormatters";

export default function DashboardRecentClaims({ ultimos = [] }) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
            Últimos Reclamos Ingresados
          </h3>
          <p className="text-xs text-text-secondary m-0 mt-0.5">
            Supervisión de ingresos recientes en la plataforma
          </p>
        </div>
        <Link
          href="/admin/reclamos"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 no-underline"
        >
          Ver todos en supervisión
          <ArrowRight size={13} />
        </Link>
      </div>

      {ultimos.length === 0 ? (
        <p className="text-xs text-text-muted py-6 text-center m-0">
          No hay reclamos recientes registrados.
        </p>
      ) : (
        <div className="divide-y divide-border-subtle overflow-hidden">
          {ultimos.map((r) => (
            <div
              key={r.id}
              className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-surface-subtle/50 px-2 -mx-2 rounded-xl transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-text-muted">
                    #{r.id}
                  </span>
                  <p className="text-xs font-bold text-text-primary truncate m-0">
                    {r.titulo}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-text-muted">
                  <span>{tiempoRelativo(r.fecha_creacion)}</span>
                  {r.categoriaNombre && (
                    <>
                      <span>·</span>
                      <span className="text-text-secondary">{r.categoriaNombre}</span>
                    </>
                  )}
                  <span>·</span>
                  <span
                    className={
                      r.institucionNombre
                        ? "text-text-secondary"
                        : "text-amber-600 dark:text-amber-400 font-medium"
                    }
                  >
                    {r.institucionNombre || "Sin institución asignada"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                <ClaimStatusBadge estado={r.estado} />
                <Link
                  href="/admin/reclamos"
                  className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Supervisar reclamo"
                >
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
