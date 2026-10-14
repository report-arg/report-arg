"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

export default function DashboardAttentionBanner({
  hayPendientesInstituciones = false,
  hayPendientesReclamos = false,
  pendientesInstituciones = 0,
  pendientesReclamos = 0,
}) {
  const requiereAtencion = hayPendientesInstituciones || hayPendientesReclamos;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        requiereAtencion
          ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-300 dark:border-amber-800/60"
          : "bg-surface border-border-subtle"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
              requiereAtencion
                ? "bg-amber-500 text-white"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {requiereAtencion ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary m-0">
                {requiereAtencion ? "Requiere Atención Administrativa" : "Estado Operativo Normal"}
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  requiereAtencion
                    ? "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                    : "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                }`}
              >
                {requiereAtencion ? "Pendientes detectados" : "Al día"}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1 m-0 leading-relaxed">
              {requiereAtencion
                ? `Se detectaron tareas pendientes que demandan tu intervención: ${[
                    hayPendientesInstituciones
                      ? `${pendientesInstituciones} solicitud(es) de instituciones sin verificar`
                      : null,
                    hayPendientesReclamos
                      ? `${pendientesReclamos} reclamo(s) ciudadano(s) en espera de revisión inicial`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" y ")}.`
                : "No hay solicitudes de registro pendientes ni reclamos ciudadanos sin clasificar. Todos los flujos se encuentran al día."}
            </p>
          </div>
        </div>

        {/* Acciones directas si requiere atención */}
        {requiereAtencion && (
          <div className="flex flex-wrap items-center gap-2 sm:self-center shrink-0">
            {hayPendientesInstituciones && (
              <Link
                href="/admin/solicitudes"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition-colors no-underline"
              >
                <span>Revisar solicitudes ({pendientesInstituciones})</span>
                <ArrowRight size={13} />
              </Link>
            )}
            {hayPendientesReclamos && (
              <Link
                href="/admin/reclamos?estado=Pendiente"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-text-primary bg-surface hover:bg-surface-subtle border border-border-subtle shadow-xs transition-colors no-underline"
              >
                <span>Ver reclamos pendientes ({pendientesReclamos})</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
