"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Map, Activity } from "lucide-react";
import apiClient from "@/services/apiClient";
import { getCategoryIcon } from "@/components/brand/icons";

const MapaReclamos = dynamic(
  () => import("@/components/home/MapaReclamos"),
  { ssr: false, loading: () => <div className="h-36 flex items-center justify-center text-xs text-slate-400">Cargando mapa…</div> }
);

export default function TrendingSidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [perfil, setPerfil] = useState(null);
  const [tendencias, setTendencias] = useState([]);
  const [reclamos, setReclamos] = useState([]);

  useEffect(() => {
    if (!session?.user?.id) return;
    apiClient.get(`/auth/me`)
      .then(r => r.data)
      .then(d => { if (d.ok) setPerfil(d.data); })
      .catch(() => {});
  }, [session?.user?.id]);

  useEffect(() => {
    apiClient.get(`/feed/tendencias`)
      .then(r => r.data)
      .then(d => { if (d.ok) setTendencias(d.data); })
      .catch(() => {});

    apiClient.get(`/reclamos/mapa`)
      .then(r => r.data)
      .then(d => { if (d.ok) setReclamos(d.data.slice(0, 50)); })
      .catch(() => {});
  }, []);

  const ciudadNombre = perfil?.ciudad_activa || perfil?.ciudad_declarada || "Tu ciudad";
  const tituloSeccion = `${ciudadNombre} hoy`;

  return (
    <aside className="home-right-sidebar">

      {/* Bloque de actividad por categoría en la ciudad (sin hashtags) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <Activity size={16} className="text-[var(--color-brand-600)]" />
          <h3 className="text-sm font-bold text-slate-900">
            {tituloSeccion}
          </h3>
        </div>

        {tendencias.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">
            Sin actividad registrada en el día.
          </p>
        ) : (
          <div className="space-y-2.5">
            {tendencias.map((t) => {
              const CategoryIcon = getCategoryIcon(t.codigo || t.nombre, t.nombre);
              const totalPublicaciones = t.total || (t.reclamos || 0) + (t.comunicados || 0);

              return (
                <div
                  key={t.id}
                  onClick={() => router.push(`/home/explorar?categoria=${t.id}`)}
                  className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center shrink-0">
                      <CategoryIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {t.nombre}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {totalPublicaciones} reporte{totalPublicaciones !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mapa de actividad en vivo */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Mapa de la ciudad
          </h3>
          <span className="text-[10px] font-semibold text-[var(--color-brand-600)] bg-[var(--color-brand-50)] px-2 py-0.5 rounded-full">
            En vivo
          </span>
        </div>

        <div
          onClick={() => router.push("/home/mapa")}
          className="rounded-xl overflow-hidden border border-slate-200 cursor-pointer relative group"
          title="Ver mapa interactivo completo"
        >
          <MapaReclamos reclamos={reclamos} height="150px" />
          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              Abrir mapa completo
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-2 text-center">
          Hacéc clic para explorar en el mapa interactivo
        </p>
      </div>

    </aside>
  );
}
