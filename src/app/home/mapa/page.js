"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";
import apiClient from "@/services/apiClient";

const MapaReclamos = dynamic(
  () => import("@/components/home/MapaReclamos"),
  { ssr: false, loading: () => <div className="mapa-loading"><Loader2 size={24} className="spin" /> Cargando mapa…</div> }
);

const ESTADO_LABEL = {
  recibido: "Recibido",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  rechazado: "Rechazado",
};

const FILTROS = [
  { key: "", label: "Todos" },
  { key: "recibido", label: "Recibido" },
  { key: "en_proceso", label: "En proceso" },
  { key: "resuelto", label: "Resuelto" },
  { key: "rechazado", label: "Rechazado" },
];

export default function MapaPage() {
  const router = useRouter();
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    apiClient.get(`/reclamos/mapa`)
      .then(r => r.data)
      .then(d => { if (d.ok) setReclamos(d.data); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const visibles = filtro ? reclamos.filter(r => r.estado === filtro) : reclamos;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} /> Volver
        </button>
        <h1 className="text-xl font-bold text-text-primary m-0 tracking-tight">
          Mapa de Reclamos
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTROS.map(f => {
          const isActive = filtro === f.key;
          const count = f.key === "" ? reclamos.length : reclamos.filter(r => r.estado === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isActive 
                  ? "bg-primary border-primary text-white shadow-xs" 
                  : "bg-surface border-border-subtle text-text-muted hover:border-primary"
              }`}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${
                isActive ? "bg-white/20 text-white" : "bg-primary-subtle text-primary"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className={`grid gap-4 ${seleccionado ? "grid-cols-1 lg:grid-cols-[1fr_300px]" : "grid-cols-1"}`}>
        <div className="relative rounded-xl overflow-hidden h-[500px] border border-border-subtle shadow-xs">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface text-text-muted text-sm gap-2 font-medium z-[1000]">
              <Loader2 size={24} className="animate-spin text-primary" /> Cargando datos…
            </div>
          ) : (
            <>
              <MapaReclamos reclamos={visibles} height="500px" onMarkerClick={setSeleccionado} />
              {visibles.length === 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface/95 backdrop-blur-md border border-border-subtle rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-text-secondary shadow-md whitespace-nowrap z-[1000]">
                  <MapPin size={16} className="text-primary" />
                  No hay reclamos con ubicación para este filtro
                </div>
              )}
            </>
          )}
        </div>

        {seleccionado && (
          <div className="p-5 rounded-2xl bg-surface border border-border-subtle h-fit shadow-xs relative flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-bold text-text-muted tracking-wider">
                RECLAMO #{String(seleccionado.id).padStart(4, "0")}
              </span>
              <button
                onClick={() => setSeleccionado(null)}
                className="text-text-muted hover:text-red-500 transition-colors cursor-pointer p-1 -mr-2 -mt-2 rounded-full hover:bg-surface-subtle"
              >
                x
              </button>
            </div>
            <p className="font-bold text-[15px] text-text-primary mb-1 leading-snug">{seleccionado.titulo}</p>
            {seleccionado.categoriaNombre && (
              <p className="text-xs text-text-muted font-medium mb-4">{seleccionado.categoriaNombre}</p>
            )}
            
            {seleccionado.direccion && (
              <div className="flex items-start gap-2 text-xs text-text-secondary mb-5">
                <MapPin size={14} className="shrink-0 mt-0.5 text-text-muted" />
                <span className="leading-relaxed">{seleccionado.direccion}</span>
              </div>
            )}
            
            <div className="mt-auto pt-4 border-t border-border-subtle">
              <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[var(--status-${seleccionado.estado.replace("_", "-")}-bg)] text-[var(--status-${seleccionado.estado.replace("_", "-")}-text)]`}>
                {ESTADO_LABEL[seleccionado.estado]}
              </span>
            </div>
          </div>
        )}
      </div>

      {!loading && reclamos.length > 0 && (
        <p className="text-xs font-semibold text-text-muted mt-4 text-right">
          {visibles.length} de {reclamos.length} reclamo{reclamos.length !== 1 ? "s" : ""} con ubicación registrada
        </p>
      )}
    </div>
  );
}
