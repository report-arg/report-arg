"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, AlertCircle } from "lucide-react";
import FeedCard from "@/components/feed/FeedCard";
import EmptyState from "@/components/ui/EmptyState";
import { ReportProblemIcon } from "@/components/brand/icons";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [perfil, setPerfil] = useState(null);
  const [feed, setFeed] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [tendencias, setTendencias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar perfil
  useEffect(() => {
    if (!session?.user?.id) return;
    apiClient.get(`/auth/me`)
      .then(r => r.data)
      .then(d => { if (d.ok) setPerfil(d.data); })
      .catch(() => {});
  }, [session?.user?.id]);

  // Cargar datos de resumen y tendencias
  useEffect(() => {
    Promise.all([
      apiClient.get(`/actividad/resumen`).then(r => r.data).catch(() => ({ ok: false })),
      apiClient.get(`/feed/tendencias`).then(r => r.data).catch(() => ({ ok: false }))
    ]).then(([resResumen, resTend]) => {
      if (resResumen.ok) setResumen(resResumen.data);
      if (resTend.ok) setTendencias(resTend.data || []);
    });
  }, []);

  // Cargar feed limitado (solo novedades)
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      // Pedimos 5 ítems recientes de todo tipo
      const res = await apiClient.get(`/feed?pagina=1&limite=5`);
      const data = res.data;
      if (data.ok) {
        setFeed(data.data || []);
      } else {
        toast.error(data.mensaje || "Ocurrió un error al cargar las publicaciones");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al cargar el feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const nombreUsuario = perfil?.nombre || session?.user?.name || "Ciudadano";
  const primerNombre = nombreUsuario.split(" ")[0];

  const ciudad = perfil?.ciudad_activa || perfil?.ciudad_declarada || null;
  const provincia = perfil?.provincia_activa || perfil?.provincia_declarada || null;

  const ubicacionTexto = ciudad
    ? `${ciudad}${provincia ? `, ${provincia}` : ""}`
    : "tu ciudad";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-6">

      {/* Cabecera limpia y resumen integrado */}
      <div className="mb-10 flex flex-col md:flex-row gap-6 md:items-start justify-between">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary mb-1">
                Hola, {primerNombre}
              </h1>
              <p className="text-sm text-text-secondary">
                Esto es lo más relevante hoy en <span className="font-semibold text-text-primary">{ubicacionTexto}</span>.
              </p>
            </div>

            <button
              onClick={() => router.push("/ciudadano/reclamos/nuevo")}
              className="btn-primary-report shrink-0"
            >
              <ReportProblemIcon size={16} />
              <span>Reportar un problema</span>
            </button>
          </div>

          {/* Resumen Compacto con Superficie Suave */}
          {(resumen || tendencias.length > 0) && (
            <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-official-surface border border-official-border space-y-4">
              {resumen && (
                <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-text-secondary">
                  <span className="font-semibold text-text-primary">
                    {resumen.activos} {resumen.activos === 1 ? "reporte activo" : "reportes activos"}
                  </span>
                  
                  {resumen.resueltosRecientes?.length > 0 && (
                    <>
                      <span className="text-text-muted px-1">•</span>
                      <span>
                        <span className="font-semibold text-[var(--status-resuelto-text)]">{resumen.resueltosRecientes.length}</span>{" "}
                        {resumen.resueltosRecientes.length === 1 ? "resuelto recientemente" : "resueltos recientemente"}
                      </span>
                    </>
                  )}
                  
                  {resumen.comunicados > 0 && (
                    <>
                      <span className="text-text-muted px-1">•</span>
                      <span>
                        <span className="font-semibold text-primary">{resumen.comunicados}</span>{" "}
                        {resumen.comunicados === 1 ? "comunicado" : "comunicados"}
                      </span>
                    </>
                  )}
                </div>
              )}

              {tendencias.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">
                    Lo más reportado
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {tendencias.slice(0, 3).map((t) => {
                      // Importar getCategoryIcon dinámicamente si no está en scope
                      const CategoryIcon = require("@/components/brand/icons").getCategoryIcon(t.codigo || t.nombre, t.nombre);
                      return (
                        <div key={t.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border-subtle text-xs font-semibold text-text-secondary shadow-xs hover:border-primary transition-colors cursor-pointer">
                          <CategoryIcon size={14} className="text-primary" />
                          <span>{t.nombre}</span>
                          <span className="bg-surface-subtle px-1.5 py-0.5 rounded text-[10px] text-text-muted font-bold">{t.total}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ahora en Viale (Novedades) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">Ahora en {ciudad || "tu ciudad"}</h2>
          {feed.length > 0 && (
            <button
              onClick={() => router.push("/ciudadano/explorar")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
            >
              Ver todo <ArrowRight size={14} />
            </button>
          )}
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="p-4 rounded-xl bg-surface border border-border-subtle animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-surface-subtle border border-border-subtle" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-32 h-3.5 bg-border-subtle rounded" />
                    <div className="w-20 h-2.5 bg-surface-subtle rounded" />
                  </div>
                </div>
                <div className="w-3/4 h-5 bg-surface-subtle rounded mb-2" />
                <div className="w-full h-12 bg-surface-subtle rounded" />
              </div>
            ))}
          </div>
        )}

        <div>
          {!loading && feed.length === 0 && (
            <EmptyState
              title="No hay novedades recientes"
              description="Todavía no hay publicaciones en tu ciudad. ¡Sé el primero en reportar un problema!"
              actionLabel="Reportar un problema"
              onAction={() => router.push("/ciudadano/reclamos/nuevo")}
            />
          )}

          {!loading && feed.map(item => (
            <div key={item.id} className="mb-4">
              <FeedCard
                item={item}
                onEliminado={(id) => setFeed(prev => prev.filter(x => x.id !== id))}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
