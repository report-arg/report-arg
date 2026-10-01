"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import apiClient from "@/services/apiClient";
import Link from "next/link";
import { Clock, AlertTriangle, CheckCircle, Search, FileText } from "lucide-react";
import { tiempoRelativo } from "@/utils/dateFormatters";

export default function InstitucionHome() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBandeja() {
      try {
        const res = await apiClient.get("/institucion/reclamos/bandeja");
        if (res.data.ok) {
          setReclamos(res.data.data);
        }
      } catch (err) {
        console.error("Error al cargar bandeja", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBandeja();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Agrupamiento lógico
  const pendientes = reclamos.filter(r => r.estado === "Pendiente");
  const enRevision = reclamos.filter(r => r.estado === "En revisión");
  const enProceso = reclamos.filter(r => r.estado === "En proceso");
  
  // Priorización (Demorados, Pendientes antiguos, etc)
  const hoy = new Date();
  
  // Un reclamo pendiente que lleva más de 5 días está demorado
  const reclamosAtencion = pendientes
    .map(r => {
      const msDiff = hoy.getTime() - new Date(r.fecha_creacion).getTime();
      const dias = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      return { ...r, diasAntiguedad: dias, esDemorado: dias > 5 };
    })
    .sort((a, b) => {
      // Priorizar demorados
      if (a.esDemorado && !b.esDemorado) return -1;
      if (!a.esDemorado && b.esDemorado) return 1;
      
      // Priorizar por mayor cantidad de afectados
      if (b.afectadosCount !== a.afectadosCount) {
        return b.afectadosCount - a.afectadosCount;
      }
      
      // Priorizar por antigüedad
      return b.diasAntiguedad - a.diasAntiguedad;
    })
    .slice(0, 5); // Tomar los 5 más urgentes

  return (
    <div className="w-full">
      <div className="mb-10 flex flex-col md:flex-row gap-6 md:items-start justify-between">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary mb-1">
                Hola, {session?.user?.name || "Institución"}
              </h1>
              <p className="text-sm text-text-secondary">
                Estos son los reclamos que necesitan tu atención hoy.
              </p>
            </div>

            <button
              onClick={() => router.push("/institucion/comunicados/nuevo")}
              className="btn-primary-report shrink-0"
              style={{ backgroundColor: "var(--color-brand-600)", color: "white" }} // O adaptar a la clase que corresponda
            >
              <FileText size={16} />
              <span>Crear comunicado</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resumen compacto horizontal */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-10 pb-4 border-b border-border-subtle">
        <Link href="/institucion/reclamos?estado=pendiente" className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-rose-600 transition-colors cursor-pointer">
          <AlertTriangle size={16} className="text-rose-500" />
          <span>{pendientes.length} pendientes</span>
        </Link>
        <Link href="/institucion/reclamos?estado=en_revision" className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-amber-600 transition-colors cursor-pointer">
          <Search size={16} className="text-amber-500" />
          <span>{enRevision.length} en revisión</span>
        </Link>
        <Link href="/institucion/reclamos?estado=en_proceso" className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-blue-600 transition-colors cursor-pointer">
          <Clock size={16} className="text-blue-500" />
          <span>{enProceso.length} en proceso</span>
        </Link>
      </div>

      {/* Sección principal: Necesitan atención */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            Necesitan atención
            {reclamosAtencion.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                {reclamosAtencion.length}
              </span>
            )}
          </h2>
          <Link href="/institucion/reclamos" className="text-sm font-semibold text-primary hover:underline">
            Ver todos &rarr;
          </Link>
        </div>
        <p className="text-sm text-text-secondary mb-6">
          Reclamos demorados, con mayor impacto o pendientes de revisión.
        </p>

        {reclamosAtencion.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-bold text-text-primary mb-1">Sin reclamos que requieran atención</h3>
            <p className="text-sm text-text-secondary">
              No hay reclamos pendientes o demorados en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reclamosAtencion.map(reclamo => {
              const tiempo = tiempoRelativo(reclamo.fecha_creacion);
              return (
                <div key={reclamo.id} className="bg-surface rounded-xl p-4 sm:p-5 border border-border-subtle hover:border-primary/40 transition-colors shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-surface-subtle px-2 py-1 rounded-md">
                        {reclamo.categoriaNombre}
                      </span>
                      {reclamo.esDemorado && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-100 flex items-center gap-1">
                          <AlertTriangle size={10} /> Demorado
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                        Pendiente
                      </span>
                    </div>
                    
                    <h3 className="text-sm sm:text-base font-bold text-text-primary truncate mb-1">
                      {reclamo.titulo}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-xs font-medium text-text-secondary flex-wrap">
                      <span className="truncate max-w-[200px]">{reclamo.direccion}</span>
                      <span className="w-1 h-1 rounded-full bg-border-subtle"></span>
                      <span>Recibido {tiempo.toLowerCase()}</span>
                      {reclamo.afectadosCount > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border-subtle"></span>
                          <span className="text-primary font-semibold">
                            {reclamo.afectadosCount} vecino{reclamo.afectadosCount !== 1 ? 's' : ''} afectado{reclamo.afectadosCount !== 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="shrink-0 mt-3 sm:mt-0">
                    <Link
                      href={`/institucion/reclamos/${reclamo.id}`}
                      className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-surface-subtle hover:bg-[var(--color-brand-50)] text-primary text-xs font-bold rounded-lg transition-colors border border-border-subtle hover:border-[var(--color-brand-200)]"
                    >
                      Gestionar reclamo
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
