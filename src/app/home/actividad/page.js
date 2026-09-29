"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Activity, CheckCircle2, ChevronRight, AlertCircle, Clock } from "lucide-react";
import apiClient from "@/services/apiClient";
import { getCategoryIcon } from "@/components/brand/icons";
import { tiempoRelativo } from "@/utils/dateFormatters";

export default function ActividadCiudadPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [perfil, setPerfil] = useState(null);
  const [tendencias, setTendencias] = useState([]);
  const [resumen, setResumen] = useState(null);
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
      apiClient.get(`/actividad/resumen`).then(r => r.data).catch(() => ({ ok: false }))
    ]).then(([resTend, resResumen]) => {
      if (resTend.ok) setTendencias(resTend.data || []);
      if (resResumen.ok) setResumen(resResumen.data || null);
    }).finally(() => setLoading(false));
  }, []);

  const ciudad = perfil?.ciudad_activa || perfil?.ciudad_declarada || "tu ciudad";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">

      {/* Header Actividad */}
      <div className="mb-8 pb-4 border-b border-slate-200/80">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Actividad en {ciudad}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Información y estado general de los problemas reportados en tu comunidad.
        </p>
      </div>

      {loading || !resumen ? (
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

          {/* Estado Global (Agregado) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-center items-center text-center">
              <p className="text-3xl font-black text-slate-800 mb-1">
                {resumen.activos + resumen.resueltos}
              </p>
              <p className="text-xs font-semibold text-slate-500">Reportes Totales</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 shadow-xs flex flex-col justify-center items-center text-center">
              <p className="text-3xl font-black text-amber-600 mb-1">
                {resumen.activos}
              </p>
              <p className="text-xs font-semibold text-amber-700">En curso</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 shadow-xs flex flex-col justify-center items-center text-center">
              <p className="text-3xl font-black text-emerald-600 mb-1">
                {resumen.resueltos}
              </p>
              <p className="text-xs font-semibold text-emerald-700">Resueltos</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 shadow-xs flex flex-col justify-center items-center text-center">
              <p className="text-3xl font-black text-indigo-600 mb-1">
                {resumen.comunicados}
              </p>
              <p className="text-xs font-semibold text-indigo-700">Comunicados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Problemas más reportados */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-slate-400" />
                Lo más reportado
              </h2>

              {tendencias.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Aún no hay suficiente actividad registrada para mostrar estadísticas.
                </p>
              ) : (
                <div className="space-y-2">
                  {tendencias.map(t => {
                    const CategoryIcon = getCategoryIcon(t.codigo || t.nombre, t.nombre);
                    return (
                      <div
                        key={t.id}
                        onClick={() => router.push(`/home/explorar?categoria=${t.id}`)}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 group-hover:text-[var(--color-brand-600)] flex items-center justify-center shrink-0 shadow-xs transition-colors">
                            <CategoryIcon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{t.nombre}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-xs">
                            {t.total}
                          </span>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resueltos Recientemente */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Resueltos recientemente
              </h2>

              {resumen.resueltosRecientes?.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No hay reclamos resueltos recientemente.
                </p>
              ) : (
                <div className="space-y-3">
                  {resumen.resueltosRecientes?.map(r => (
                    <div
                      key={r.id}
                      onClick={() => router.push(`/home/reclamos/${r.id}`)}
                      className="p-3.5 rounded-xl bg-emerald-50/30 border border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors cursor-pointer group"
                    >
                      <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-emerald-800 transition-colors">
                        {r.titulo}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 mt-2">
                        {r.categoriaNombre && (
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            {r.categoriaNombre}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {tiempoRelativo(r.fecha_creacion)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
