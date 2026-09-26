"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, ChevronRight, Building2 } from "lucide-react";
import apiClient from "@/services/apiClient";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import ClaimVisibilityBadge from "@/components/reclamos/ClaimVisibilityBadge";
import ClaimProgress from "@/components/reclamos/ClaimProgress";
import EmptyState from "@/components/common/EmptyState";
import { getCategoryIcon, ReportProblemIcon } from "@/components/brand/icons";
import { tiempoRelativo, fechaExacta } from "@/utils/dateFormatters";

export default function MisReclamosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading" || !session?.user?.id) return;
    apiClient.get(`/reclamos/mis-reclamos`)
      .then(r => r.data)
      .then(d => { if (d.ok) setReclamos(d.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">

      {/* Header Mis Reclamos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Mis reclamos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Seguí el avance y las actualizaciones de tus reportes en la ciudad
          </p>
        </div>

        <button
          onClick={() => router.push("/home/reclamos/nuevo")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <ReportProblemIcon size={16} />
          <span>Reportar un problema</span>
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 animate-pulse">
              <div className="w-1/3 h-4 bg-slate-200 rounded mb-2" />
              <div className="w-2/3 h-5 bg-slate-100 rounded mb-2" />
              <div className="w-full h-8 bg-slate-50 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && reclamos.length === 0 && (
        <EmptyState
          title="Todavía no registradas ningún reporte"
          description="Reportá los problemas que veas en tu ciudad para informar a las autoridades y darles seguimiento."
          actionLabel="Reportar un problema"
          onAction={() => router.push("/home/reclamos/nuevo")}
        />
      )}

      {!loading && (
        <div className="space-y-3.5">
          {reclamos.map(r => {
            const CategoryIcon = getCategoryIcon(r.categoriaCodigo || r.categoriaNombre, r.categoriaNombre);
            const fechaLarga = fechaExacta(r.fecha_creacion);

            return (
              <div
                key={r.id}
                onClick={() => router.push(`/home/reclamos/${r.id}`)}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm hover:border-[var(--color-brand-200)] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <ClaimVisibilityBadge visibilidad={r.visibilidad} />

                      {r.categoriaNombre && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          <CategoryIcon size={12} className="text-[var(--color-brand-600)]" />
                          <span>{r.categoriaNombre}</span>
                        </span>
                      )}

                      {r.editado === 1 && (
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Editado
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[var(--color-brand-600)] transition-colors leading-snug">
                      {r.titulo}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <ClaimStatusBadge estado={r.estado} />
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-[var(--color-brand-600)] transition-colors mt-1" />
                  </div>
                </div>

                {/* Metadatos adicionales */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 my-2 pt-1 border-t border-slate-100">
                  {r.institucionNombre && (
                    <span className="inline-flex items-center gap-1 font-medium text-[var(--color-brand-700)]">
                      <Building2 size={13} />
                      <span>{r.institucionNombre}</span>
                    </span>
                  )}

                  {r.direccion && (
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <MapPin size={13} className="text-slate-400" />
                      <span className="truncate max-w-[220px]">{r.direccion}</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1" title={fechaLarga}>
                    <Clock size={13} className="text-slate-400" />
                    <span>{tiempoRelativo(r.fecha_creacion)}</span>
                  </span>
                </div>

                {/* Barra de progreso visual de estado del reclamo */}
                <div className="mt-3">
                  <ClaimProgress estado={r.estado} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
