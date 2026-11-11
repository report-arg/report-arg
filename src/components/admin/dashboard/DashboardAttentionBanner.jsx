"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, MapPin, Building2, Clock } from "lucide-react";

export default function DashboardAttentionBanner({
  requiereAtencion = false,
  hayPendientesInstituciones = false,
  hayPendientesReclamos = false,
  hayCiudadesSinPrincipal = false,
  hayReclamosSinAsignar = false,
  pendientesInstituciones = 0,
  pendientesReclamos = 0,
  ciudadesSinPrincipal = 0,
  reclamosSinAsignar = 0,
  demoraDias = 0,
}) {
  const listaAlertas = [];

  if (hayPendientesInstituciones) {
    listaAlertas.push({
      texto: `${pendientesInstituciones} solicitud(es) de verificación institucional pendientes`,
      href: "/admin/solicitudes",
      accion: `Revisar solicitudes (${pendientesInstituciones})`,
      urgente: true,
      icono: Building2,
    });
  }

  if (hayCiudadesSinPrincipal) {
    listaAlertas.push({
      texto: `${ciudadesSinPrincipal} ciudad(es) activa(s) sin institución principal designada`,
      href: "/admin/ciudades",
      accion: `Configurar institución principal (${ciudadesSinPrincipal})`,
      urgente: true,
      icono: MapPin,
    });
  }

  if (hayReclamosSinAsignar) {
    listaAlertas.push({
      texto: `${reclamosSinAsignar} reclamo(s) sin institución responsable asignada`,
      href: "/admin/reclamos?institucion=sin_asignar",
      accion: `Asignar reclamos (${reclamosSinAsignar})`,
      urgente: true,
      icono: ShieldAlert,
    });
  }

  if (hayPendientesReclamos) {
    listaAlertas.push({
      texto: `${pendientesReclamos} reclamo(s) en espera de revisión inicial${demoraDias > 0 ? ` (antigüedad máxima: ${demoraDias} día${demoraDias > 1 ? "s" : ""})` : ""}`,
      href: "/admin/reclamos?estado=Pendiente",
      accion: `Ver reclamos pendientes (${pendientesReclamos})`,
      urgente: false,
      icono: Clock,
    });
  }

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        requiereAtencion
          ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-300 dark:border-amber-800/60"
          : "bg-surface border-border-subtle"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
            <p className="text-xs text-text-secondary mt-1 m-0 leading-relaxed max-w-2xl">
              {requiereAtencion
                ? `Se detectaron tareas administrativas pendientes de supervisión: ${listaAlertas
                    .map((a) => a.texto)
                    .join(" · ")}.`
                : "No hay solicitudes institucionales pendientes, todas las ciudades cuentan con institución principal válida y los reclamos se encuentran asignados correctamente."}
            </p>
          </div>
        </div>

        {/* Acciones directas si requiere atención */}
        {requiereAtencion && (
          <div className="flex flex-wrap items-center gap-2 lg:self-center shrink-0">
            {listaAlertas.map((alerta) => (
              <Link
                key={alerta.href}
                href={alerta.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all no-underline shadow-2xs ${
                  alerta.urgente
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-surface hover:bg-surface-subtle text-text-primary border border-border-subtle"
                }`}
              >
                <span>{alerta.accion}</span>
                <ArrowRight size={13} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
