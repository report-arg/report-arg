"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import apiClient from "@/services/apiClient";
import Link from "next/link";
import { Clock, AlertTriangle, CheckCircle, Search, FileText } from "lucide-react";
import ClaimTracking from "@/components/reclamos/ClaimTracking";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import { tiempoRelativo } from "@/utils/dateFormatters";
import PageHeader from "@/components/layout/PageHeader";

export default function InstitucionHome() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBandeja() {
      try {
        const res = await apiClient.get("/institucion/reclamos/bandeja?orderBy=atencion");
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
  
  // Reclamos activos que requieren atención de la institución (no resueltos ni cancelados)
  // Ya vienen ordenados por prioridad de atención (demorados, afectados, tiempo sin resolver)
  const activos = reclamos.filter(r => r.estado !== "Resuelto" && r.estado !== "Cancelado");
  const reclamosAtencion = activos.slice(0, 5);

  return (
    <div className="w-full">
      {/* 1. Encabezado Unificado */}
      <PageHeader
        title={`Hola, ${session?.user?.name || "Institución"}`}
        description="Estos son los reclamos que necesitan tu atención hoy."
        action={
          <button
            onClick={() => router.push("/institucion/comunicados/nuevo")}
            className="btn-primary-report shrink-0 cursor-pointer"
          >
            <FileText size={16} />
            <span>Crear comunicado</span>
          </button>
        }
      />

      {/* 2. Resumen operativo rápido (3 métricas clave) */}
      <section aria-label="Resumen operativo" className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/institucion/reclamos?estado=Pendiente"
            className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-rose-500/40 shadow-xs hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Pendientes</span>
              <AlertTriangle size={16} className="text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-text-primary mt-2 mb-0 group-hover:text-rose-600 transition-colors">
              {pendientes.length}
            </p>
          </Link>

          <Link
            href="/institucion/reclamos?estado=En%20revisi%C3%B3n"
            className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-amber-500/40 shadow-xs hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">En revisión</span>
              <Search size={16} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-text-primary mt-2 mb-0 group-hover:text-amber-600 transition-colors">
              {enRevision.length}
            </p>
          </Link>

          <Link
            href="/institucion/reclamos?estado=En%20proceso"
            className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-blue-500/40 shadow-xs hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">En proceso</span>
              <Clock size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-text-primary mt-2 mb-0 group-hover:text-blue-600 transition-colors">
              {enProceso.length}
            </p>
          </Link>
        </div>
      </section>

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
              No hay reclamos activos en este momento.
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
                      <ClaimTracking reclamo={reclamo} advertir />
                      <ClaimStatusBadge estado={reclamo.estado} />
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
