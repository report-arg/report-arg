"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, ChevronRight, Building2, Eye, ShieldAlert, Filter } from "lucide-react";
import apiClient from "@/services/apiClient";
import StatusBadge from "@/components/ui/StatusBadge";
import ClaimProgress from "@/components/reclamos/ClaimProgress";
import ClaimFilters from "@/components/reclamos/ClaimFilters";
import useCategorias from "@/hooks/useCategorias";
import EmptyState from "@/components/ui/EmptyState";
import { getCategoryIcon, ReportProblemIcon } from "@/components/brand/icons";
import { tiempoRelativo, fechaExacta } from "@/utils/dateFormatters";

function getTextoTemporalCiudadano(r) {
  const fechaRef = r.fecha_ultimo_cambio_estado || r.fecha_creacion;
  const tiempo = tiempoRelativo(fechaRef);
  if (!tiempo) return "";
  if (r.estado === "Pendiente") return `Creado ${tiempo.toLowerCase()}`;
  if (r.estado === "Resuelto") return `Resuelto ${tiempo.toLowerCase()}`;
  if (r.estado === "Cancelado") return `Cancelado ${tiempo.toLowerCase()}`;
  return `${r.estado} desde ${tiempo.toLowerCase()}`;
}

export default function MisReclamosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [estado, setEstado] = useState("Todos");
  const [categoria, setCategoria] = useState("Todas");
  const [error, setError] = useState("");
  const { categorias } = useCategorias("reclamo");

  const hayFiltrosActivos = useMemo(() => {
    return estado !== "Todos" || categoria !== "Todas";
  }, [estado, categoria]);

  useEffect(() => {
    if (status === "loading" || !session?.user?.id) return;
    let vigente = true;
    setLoading(true);
    setError("");
    const params = {};
    if (estado !== "Todos") params.estado = estado;
    if (categoria !== "Todas") params.categoria = categoria;
    apiClient.get('/reclamos/mis-reclamos', { params })
      .then(r => { if (!r.data.ok) throw new Error(r.data.mensaje); if (vigente) setReclamos(r.data.data || []); })
      .catch(err => { if (vigente) setError(err.response?.data?.mensaje || "No se pudieron cargar tus reclamos. Intentá nuevamente."); })
      .finally(() => { if (vigente) setLoading(false); });
    return () => { vigente = false; };
  }, [session, status, estado, categoria]);

  function handleLimpiarFiltros() {
    setEstado("Todos");
    setCategoria("Todas");
  }

  return (
    <div className="w-full">
      {/* Header Mis Reclamos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
            Mis reclamos
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Seguí el avance y las actualizaciones de tus reportes en la ciudad.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/ciudadano/reclamos/nuevo")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <ReportProblemIcon size={15} />
          <span>Reportar un problema</span>
        </button>
      </div>

      <ClaimFilters
        estado={estado}
        categoria={categoria}
        categorias={categorias}
        onEstado={setEstado}
        onCategoria={setCategoria}
        onClear={handleLimpiarFiltros}
      />

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
          <p role="alert">{error}</p>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-2xl bg-surface border border-border-subtle animate-pulse">
              <div className="w-1/3 h-4 bg-border-subtle rounded mb-2.5" />
              <div className="w-2/3 h-4 bg-surface-subtle rounded mb-2.5" />
              <div className="w-full h-3 bg-surface-subtle rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && reclamos.length === 0 && (
        hayFiltrosActivos ? (
          <EmptyState
            icon={Filter}
            title="Sin resultados para los filtros seleccionados"
            description="No encontramos reclamos tuyos que coincidan con los filtros aplicados."
            actionLabel="Limpiar filtros"
            onAction={handleLimpiarFiltros}
          />
        ) : (
          <EmptyState
            title="Todavía no registraste ningún reclamo"
            description="Reportá los problemas que veas en tu ciudad para informar a las autoridades y darles seguimiento."
            actionLabel="Reportar un problema"
            onAction={() => router.push("/ciudadano/reclamos/nuevo")}
          />
        )
      )}

      {!loading && !error && reclamos.length > 0 && (
        <div className="space-y-3">
          {reclamos.map(r => {
            const CategoryIcon = getCategoryIcon(r.categoriaCodigo || r.categoriaNombre, r.categoriaNombre);
            const fechaTooltip = fechaExacta(r.fecha_ultimo_cambio_estado || r.fecha_creacion);

            return (
              <Link
                key={r.id}
                href={`/ciudadano/reclamos/${r.id}`}
                className="block p-4 rounded-2xl bg-surface border border-border-subtle shadow-xs hover:border-primary/40 hover:shadow-sm transition-all duration-200 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {/* Fila Superior: Título + Estado Badge + Chevron */}
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {r.titulo}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={r.estado} size="sm" />
                    <ChevronRight
                      size={16}
                      className="text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                </div>

                {/* Fila de Metadatos Limpia (Privado/Público, Categoría, Institución, Ubicación, Editado) */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-muted mb-3">
                  {/* Visibilidad */}
                  {r.visibilidad === "privado" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-400">
                      <ShieldAlert size={12} className="shrink-0" />
                      <span>Privado</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-text-muted">
                      <Eye size={12} className="shrink-0" />
                      <span>Público</span>
                    </span>
                  )}

                  {r.categoriaNombre && (
                    <>
                      <span className="text-border-subtle select-none">·</span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-text-primary">
                        <CategoryIcon size={13} className="text-primary shrink-0" />
                        <span>{r.categoriaNombre}</span>
                      </span>
                    </>
                  )}

                  {r.institucionNombre && (
                    <>
                      <span className="text-border-subtle select-none">·</span>
                      <span className="inline-flex items-center gap-1 text-text-secondary">
                        <Building2 size={12} className="shrink-0 text-text-muted" />
                        <span className="truncate max-w-[200px]">{r.institucionNombre}</span>
                      </span>
                    </>
                  )}

                  {r.direccion && (
                    <>
                      <span className="text-border-subtle select-none">·</span>
                      <span className="inline-flex items-center gap-1 text-text-muted">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate max-w-[180px]">{r.direccion}</span>
                      </span>
                    </>
                  )}

                  {r.editado === 1 && (
                    <>
                      <span className="text-border-subtle select-none">·</span>
                      <span className="text-[11px] text-text-muted italic">
                        (editado)
                      </span>
                    </>
                  )}
                </div>

                {/* Barra de Progreso Compacta + Referencia Temporal Única */}
                <div className="pt-2.5 border-t border-border-subtle/70">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="w-full sm:max-w-xs">
                      <ClaimProgress estado={r.estado} />
                    </div>

                    <div
                      className="text-xs text-text-muted font-medium sm:text-right shrink-0"
                      title={fechaTooltip}
                    >
                      {getTextoTemporalCiudadano(r)}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
