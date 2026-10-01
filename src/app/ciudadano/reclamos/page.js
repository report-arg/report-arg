"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, ChevronRight, Building2 } from "lucide-react";
import apiClient from "@/services/apiClient";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import ClaimVisibilityBadge from "@/components/reclamos/ClaimVisibilityBadge";
import ClaimProgress from "@/components/reclamos/ClaimProgress";
import EmptyState from "@/components/ui/EmptyState";
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
    <div className="w-full">

      {/* Header Mis Reclamos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            Mis reclamos
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Seguí el avance y las actualizaciones de tus reportes en la ciudad
          </p>
        </div>

        <button
          onClick={() => router.push("/ciudadano/reclamos/nuevo")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <ReportProblemIcon size={16} />
          <span>Reportar un problema</span>
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl bg-surface border border-border-subtle animate-pulse">
              <div className="w-1/3 h-4 bg-border-subtle rounded mb-2" />
              <div className="w-2/3 h-5 bg-surface-subtle rounded mb-2" />
              <div className="w-full h-8 bg-surface-subtle rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && reclamos.length === 0 && (
        <EmptyState
          title="Todavía no registradas ningún reporte"
          description="Reportá los problemas que veas en tu ciudad para informar a las autoridades y darles seguimiento."
          actionLabel="Reportar un problema"
          onAction={() => router.push("/ciudadano/reclamos/nuevo")}
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
                onClick={() => router.push(`/ciudadano/reclamos/${r.id}`)}
                className="p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs hover:shadow-sm hover:border-primary transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <ClaimVisibilityBadge visibilidad={r.visibilidad} />

                      {r.categoriaNombre && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-subtle text-text-secondary text-[11px] font-semibold border border-border-subtle">
                          <CategoryIcon size={12} className="text-primary" />
                          <span>{r.categoriaNombre}</span>
                        </span>
                      )}

                      {r.editado === 1 && (
                        <span className="text-[10px] font-semibold bg-surface-subtle text-text-muted px-1.5 py-0.5 rounded border border-border-subtle">
                          Editado
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
                      {r.titulo}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <ClaimStatusBadge estado={r.estado} />
                    <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-colors mt-1" />
                  </div>
                </div>

                {/* Metadatos adicionales */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted my-2 pt-1 border-t border-border-subtle">
                  {r.institucionNombre && (
                    <span className="inline-flex items-center gap-1 font-medium text-primary">
                      <Building2 size={13} />
                      <span>{r.institucionNombre}</span>
                    </span>
                  )}

                  {r.direccion && (
                    <span className="inline-flex items-center gap-1 text-text-secondary">
                      <MapPin size={13} className="text-text-muted" />
                      <span className="truncate max-w-[220px]">{r.direccion}</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1" title={fechaLarga}>
                    <Clock size={13} className="text-text-muted" />
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
