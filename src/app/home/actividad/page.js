"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Activity, MapPin, Building2, CheckCircle2, ChevronRight } from "lucide-react";
import apiClient from "@/services/apiClient";
import EmptyState from "@/components/common/EmptyState";
import { getCategoryIcon } from "@/components/brand/icons";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import { tiempoRelativo } from "@/utils/dateFormatters";

export default function ActividadCiudadPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [perfil, setPerfil] = useState(null);
  const [tendencias, setTendencias] = useState([]);
  const [reclamosPublicos, setReclamosPublicos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    apiClient.get(`/auth/me`)
      .then(r => r.data)
      .then(d => { if (d.ok) setPerfil(d.data); })
      .catch(() => {});
  }, [session?.user?.id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get(`/feed/tendencias`).then(r => r.data).catch(() => ({ ok: false })),
      apiClient.get(`/reclamos/publicos`).then(r => r.data).catch(() => ({ ok: false }))
    ]).then(([resTend, resRecl]) => {
      if (resTend.ok) setTendencias(resTend.data || []);
      if (resRecl.ok) setReclamosPublicos(resRecl.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const ciudad = perfil?.ciudad_activa || perfil?.ciudad_declarada || "tu ciudad";
  const reclamosResueltos = reclamosPublicos.filter(r => r.estado === "Resuelto" || r.estado === "resuelto");
  const reclamosConAfectados = [...reclamosPublicos]
    .filter(r => (r.afectadosCount || 0) > 0)
    .sort((a, b) => (b.afectadosCount || 0) - (a.afectadosCount || 0))
    .slice(0, 5);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">

      {/* Header Actividad */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] text-xs font-semibold mb-1.5">
            <Activity size={13} />
            <span>Resumen territorial</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Actividad en {ciudad}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Estado de los servicios, temas activos y resolución de reclamos en la comunidad
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 animate-pulse">
              <div className="w-40 h-5 bg-slate-200 rounded mb-3" />
              <div className="w-full h-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">

          {/* Bloque 1: Categorías con mayor actividad real */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Temas con mayor movimiento en {ciudad}
            </h2>

            {tendencias.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                Aún no hay suficiente actividad registrada para mostrar estadísticas de temas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tendencias.map(t => {
                  const CategoryIcon = getCategoryIcon(t.codigo || t.nombre, t.nombre);
                  return (
                    <div
                      key={t.id}
                      onClick={() => router.push(`/home/explorar?categoria=${t.id}`)}
                      className="p-3.5 rounded-xl bg-slate-50 hover:bg-[var(--color-brand-50)]/40 border border-slate-200/80 hover:border-[var(--color-brand-200)] transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-[var(--color-brand-600)] flex items-center justify-center shrink-0 shadow-xs">
                          <CategoryIcon size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{t.nombre}</p>
                          <p className="text-[11px] text-slate-500">
                            {t.total} reporte{t.total !== 1 ? "s" : ""} registrado{t.total !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bloque 2: Reclamos resueltos recientemente */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Reclamos resueltos recientemente</span>
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {reclamosResueltos.length} resuelto{reclamosResueltos.length !== 1 ? "s" : ""}
              </span>
            </div>

            {reclamosResueltos.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                No hay reclamos marcados como resueltos recientemente.
              </p>
            ) : (
              <div className="space-y-2.5">
                {reclamosResueltos.slice(0, 5).map(r => (
                  <div
                    key={r.id}
                    onClick={() => router.push(`/home/reclamos/${r.id}`)}
                    className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 hover:border-emerald-200 transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{r.titulo}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {r.categoriaNombre && <span>{r.categoriaNombre}</span>}
                        {r.direccion && <span>· {r.direccion}</span>}
                      </div>
                    </div>
                    <ClaimStatusBadge estado={r.estado} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bloque 3: Reclamos con más vecinos afectados */}
          {reclamosConAfectados.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Problemas con mayor adhesión de vecinos
              </h2>
              <div className="space-y-2.5">
                {reclamosConAfectados.map(r => (
                  <div
                    key={r.id}
                    onClick={() => router.push(`/home/reclamos/${r.id}`)}
                    className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/60 hover:border-amber-300 transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{r.titulo}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{r.direccion}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg shrink-0">
                      {r.afectadosCount} afectados
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
