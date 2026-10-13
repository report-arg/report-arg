"use client";

import { useState, useEffect, useCallback, useId } from "react";
import Link from "next/link";
import {
  FileText,
  Users,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  FolderTree,
  UserPlus,
  MapPin,
  ExternalLink,
  Shield,
  Layers,
  ChevronRight,
} from "lucide-react";
import apiClient from "@/services/apiClient";
import ClaimStatusBadge from "@/components/reclamos/ClaimStatusBadge";
import { tiempoRelativo } from "@/utils/dateFormatters";

// Configuración visual por estado para el gráfico compacto
const STATUS_CONFIG = [
  { key: "pendientes", label: "Pendiente", filterParam: "Pendiente", color: "#f59e0b", bgClass: "bg-amber-500", textClass: "text-amber-700 dark:text-amber-400" },
  { key: "enRevision", label: "En revisión", filterParam: "En revisión", color: "#6366f1", bgClass: "bg-indigo-500", textClass: "text-indigo-700 dark:text-indigo-400" },
  { key: "enProceso", label: "En proceso", filterParam: "En proceso", color: "#0ea5e9", bgClass: "bg-sky-500", textClass: "text-sky-700 dark:text-sky-400" },
  { key: "resueltos", label: "Resuelto", filterParam: "Resuelto", color: "#10b981", bgClass: "bg-emerald-500", textClass: "text-emerald-700 dark:text-emerald-400" },
  { key: "cancelados", label: "Cancelado", filterParam: "Cancelado", color: "#ef4444", bgClass: "bg-rose-500", textClass: "text-rose-700 dark:text-rose-400" },
];

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Algoritmo para obtener escala de enteros estricta en el eje Y
function calcularEscalaEntera(valorMaximo) {
  if (valorMaximo <= 0) {
    return { max: 4, ticks: [0, 1, 2, 3, 4] };
  }
  if (valorMaximo <= 5) {
    const ticks = [];
    for (let i = 0; i <= valorMaximo; i++) ticks.push(i);
    return { max: valorMaximo, ticks };
  }
  let paso = 1;
  if (valorMaximo <= 12) paso = 2;
  else if (valorMaximo <= 25) paso = 5;
  else if (valorMaximo <= 50) paso = 10;
  else if (valorMaximo <= 100) paso = 20;
  else paso = Math.ceil(valorMaximo / 50) * 10;

  const max = Math.ceil(valorMaximo / paso) * paso;
  const ticks = [];
  for (let t = 0; t <= max; t += paso) {
    ticks.push(t);
  }
  return { max, ticks };
}

export default function DashboardStats() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [statsUsuarios, setStatsUsuarios] = useState({ total: 0, activos: 0, inactivos: 0, admins: 0 });
  const [statsReclamos, setStatsReclamos] = useState({ total: 0, pendientes: 0, enRevision: 0, enProceso: 0, resueltos: 0, cancelados: 0 });
  const [statsInstituciones, setStatsInstituciones] = useState({ total: 0, verificadas: 0, pendientes: 0 });
  const [ultimos, setUltimos] = useState([]);
  const [porCategoria, setPorCategoria] = useState([]);
  const [actividad, setActividad] = useState([]);

  const [hoveredMonth, setHoveredMonth] = useState(null);
  const chartId = useId();

  const cargarDatos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [uRes, rRes, iRes, ultRes, catRes, actRes] = await Promise.all([
        apiClient.get("/admin/usuarios/stats").catch(() => ({ data: { ok: false } })),
        apiClient.get("/admin/reclamos/stats").catch(() => ({ data: { ok: false } })),
        apiClient.get("/admin/instituciones/stats").catch(() => ({ data: { ok: false } })),
        apiClient.get("/admin/reclamos/ultimos").catch(() => ({ data: { ok: false } })),
        apiClient.get("/admin/reclamos/por-categoria").catch(() => ({ data: { ok: false } })),
        apiClient.get("/admin/reclamos/actividad-mensual").catch(() => ({ data: { ok: false } })),
      ]);

      if (uRes.data?.ok) setStatsUsuarios(uRes.data.data);
      if (rRes.data?.ok) setStatsReclamos(rRes.data.data);
      if (iRes.data?.ok) setStatsInstituciones(iRes.data.data);
      if (ultRes.data?.ok) setUltimos(ultRes.data.data || []);
      if (catRes.data?.ok) setPorCategoria(catRes.data.data || []);
      if (actRes.data?.ok) setActividad(actRes.data.data || []);
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
      setError("No se pudieron cargar todos los indicadores del dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Indicadores de atención administrativa
  const hayPendientesInstituciones = statsInstituciones.pendientes > 0;
  const hayPendientesReclamos = statsReclamos.pendientes > 0;
  const requiereAtencion = hayPendientesInstituciones || hayPendientesReclamos;

  // Cálculos para gráfico de actividad mensual
  // Mapeamos los 12 meses del año asegurando conteos enteros
  const datosActividad12Meses = MESES.map((nombreMes, index) => {
    const numMes = index + 1;
    const encontrado = actividad.find((a) => Number(a.mes) === numMes);
    return {
      mesIndex: index,
      mesNombre: nombreMes,
      total: encontrado ? Number(encontrado.total) : 0,
    };
  });

  const maxTotalActividad = Math.max(...datosActividad12Meses.map((d) => d.total), 0);
  const escalaY = calcularEscalaEntera(maxTotalActividad);

  // Cálculos de porcentajes para distribución de reclamos
  const totalReclamosCalculado = statsReclamos.total || 0;
  const activosReclamos = (statsReclamos.pendientes || 0) + (statsReclamos.enRevision || 0) + (statsReclamos.enProceso || 0);

  // Categoría máxima para escalar barras de progreso
  const maxCategoriaCantidad = porCategoria.length > 0 ? Math.max(...porCategoria.map((c) => Number(c.cantidad || 0)), 1) : 1;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Fila 1: 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface border border-border-subtle p-5 animate-pulse">
              <div className="h-4 w-24 bg-surface-subtle rounded mb-3" />
              <div className="h-8 w-16 bg-surface-subtle rounded mb-2" />
              <div className="h-3 w-32 bg-surface-subtle rounded" />
            </div>
          ))}
        </div>

        {/* Skeleton Sección Atención */}
        <div className="h-24 rounded-2xl bg-surface border border-border-subtle p-5 animate-pulse">
          <div className="h-4 w-40 bg-surface-subtle rounded mb-2" />
          <div className="h-4 w-3/4 bg-surface-subtle rounded" />
        </div>

        {/* Skeleton Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl bg-surface border border-border-subtle p-6 animate-pulse" />
          <div className="h-72 rounded-2xl bg-surface border border-border-subtle p-6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón de recarga sutil en encabezado del dashboard */}
      <div className="flex justify-end">
        <button
          onClick={() => cargarDatos(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-subtle border border-border-subtle transition-colors cursor-pointer shadow-2xs"
          title="Actualizar datos del dashboard"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin text-primary" : ""} />
          <span>{refreshing ? "Actualizando..." : "Actualizar datos"}</span>
        </button>
      </div>

      {/* Alerta de error si ocurrió algún fallo de red */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 flex items-center justify-between text-xs">
          <span>{error}</span>
          <button
            onClick={() => cargarDatos()}
            className="underline font-bold hover:text-rose-950 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 1. PRIMERA FILA: Cuatro indicadores principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Reclamos Totales */}
        <Link
          href="/admin/reclamos"
          className="group block p-5 rounded-2xl bg-surface border border-border-subtle hover:border-primary/40 shadow-xs transition-all no-underline"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Reclamos Totales
            </span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <FileText size={18} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-text-primary m-0 tracking-tight">
            {(statsReclamos.total || 0).toLocaleString()}
          </p>
          <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {statsReclamos.resueltos || 0} resueltos
            </span>{" "}
            · {activosReclamos} en gestión
          </p>
        </Link>

        {/* Card 2: Usuarios Activos */}
        <Link
          href="/admin/users"
          className="group block p-5 rounded-2xl bg-surface border border-border-subtle hover:border-primary/40 shadow-xs transition-all no-underline"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Usuarios Activos
            </span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Users size={18} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-text-primary m-0 tracking-tight">
            {(statsUsuarios.activos || 0).toLocaleString()}
          </p>
          <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
            de {(statsUsuarios.total || 0).toLocaleString()} registrados
            {statsUsuarios.inactivos > 0 && ` (${statsUsuarios.inactivos} inactivos)`}
          </p>
        </Link>

        {/* Card 3: Instituciones */}
        <Link
          href="/admin/institutions"
          className="group block p-5 rounded-2xl bg-surface border border-border-subtle hover:border-primary/40 shadow-xs transition-all no-underline"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Instituciones
            </span>
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
              <Building2 size={18} />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-text-primary m-0 tracking-tight">
            {(statsInstituciones.total || 0).toLocaleString()}
          </p>
          <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
            <span className="font-semibold text-text-primary">
              {statsInstituciones.verificadas || 0}
            </span>{" "}
            verificadas operativas
          </p>
        </Link>

        {/* Card 4: Pendientes de Aprobación */}
        <Link
          href="/admin/solicitudes"
          className={`group block p-5 rounded-2xl border shadow-xs transition-all no-underline ${
            hayPendientesInstituciones
              ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-300 dark:border-amber-800/60 hover:border-amber-400"
              : "bg-surface border-border-subtle hover:border-primary/40"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Pendientes Aprobación
            </span>
            <span
              className={`p-2 rounded-xl group-hover:scale-105 transition-transform ${
                hayPendientesInstituciones
                  ? "bg-amber-500 text-white"
                  : "bg-surface-subtle text-text-muted"
              }`}
            >
              <Clock size={18} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p
              className={`text-2xl sm:text-3xl font-extrabold m-0 tracking-tight ${
                hayPendientesInstituciones ? "text-amber-600 dark:text-amber-400" : "text-text-primary"
              }`}
            >
              {(statsInstituciones.pendientes || 0).toLocaleString()}
            </p>
            {hayPendientesInstituciones && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300">
                Acción req.
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-1.5 m-0 truncate">
            {hayPendientesInstituciones
              ? "Solicitudes de alta en espera"
              : "Sin solicitudes pendientes"}
          </p>
        </Link>
      </div>

      {/* 2. SECCIÓN DESTACADA: REQUIERE ATENCIÓN */}
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
                        ? `${statsInstituciones.pendientes} solicitud(es) de instituciones sin verificar`
                        : null,
                      hayPendientesReclamos
                        ? `${statsReclamos.pendientes} reclamo(s) ciudadano(s) en espera de revisión inicial`
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
                  <span>Revisar solicitudes ({statsInstituciones.pendientes})</span>
                  <ArrowRight size={13} />
                </Link>
              )}
              {hayPendientesReclamos && (
                <Link
                  href="/admin/reclamos?estado=Pendiente"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-text-primary bg-surface hover:bg-surface-subtle border border-border-subtle shadow-xs transition-colors no-underline"
                >
                  <span>Ver reclamos pendientes ({statsReclamos.pendientes})</span>
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. DOS COLUMNAS: DISTRIBUCIÓN POR ESTADO + ACTIVIDAD MENSUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda (5 cols): Distribución de Reclamos por Estado (Gráfico Compacto) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
                  Distribución por Estado
                </h3>
                <p className="text-xs text-text-secondary m-0 mt-0.5">
                  Proporción sobre {totalReclamosCalculado} reclamos registrados
                </p>
              </div>
              <Link
                href="/admin/reclamos"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 no-underline"
              >
                Supervisar
                <ChevronRight size={12} />
              </Link>
            </div>

            {/* Barra segmentada compacta */}
            <div className="w-full h-3 rounded-full bg-surface-subtle overflow-hidden flex my-4 border border-border-subtle/50">
              {totalReclamosCalculado === 0 ? (
                <div className="w-full h-full bg-border-subtle/40" />
              ) : (
                STATUS_CONFIG.map((cfg) => {
                  const cant = Number(statsReclamos[cfg.key] || 0);
                  const pct = totalReclamosCalculado > 0 ? (cant / totalReclamosCalculado) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={cfg.key}
                      style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                      title={`${cfg.label}: ${cant} (${pct.toFixed(1)}%)`}
                      className="h-full transition-all"
                    />
                  );
                })
              )}
            </div>

            {/* Lista detallada con porcentajes y accesos a filtro */}
            <div className="space-y-2 mt-4">
              {STATUS_CONFIG.map((cfg) => {
                const cant = Number(statsReclamos[cfg.key] || 0);
                const pct = totalReclamosCalculado > 0 ? ((cant / totalReclamosCalculado) * 100).toFixed(1) : "0.0";

                return (
                  <Link
                    key={cfg.key}
                    href={`/admin/reclamos?estado=${encodeURIComponent(cfg.filterParam)}`}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-subtle transition-colors group no-underline text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cfg.color }}
                      />
                      <span className="font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-text-muted">{pct}%</span>
                      <span className="font-bold text-text-primary w-10 text-right">
                        {cant.toLocaleString()}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle mt-4 text-[11px] text-text-muted flex justify-between">
            <span>Resolución global</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {totalReclamosCalculado > 0
                ? `${(((statsReclamos.resueltos || 0) / totalReclamosCalculado) * 100).toFixed(0)}% resueltos`
                : "Sin datos"}
            </span>
          </div>
        </div>

        {/* Columna Derecha (7 cols): Actividad Mensual (Gráfico SVG Nativo sin scripts externos) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
                Actividad Mensual
              </h3>
              <p className="text-xs text-text-secondary m-0 mt-0.5">
                Volumen de reclamos ingresados por mes (escala entera)
              </p>
            </div>
            <span className="text-[11px] font-semibold text-text-muted">
              Año {new Date().getFullYear()}
            </span>
          </div>

          {/* Gráfico SVG nativo liviano y responsivo */}
          <div className="relative w-full pt-2">
            <svg
              viewBox="0 0 540 200"
              className="w-full h-48 sm:h-56 select-none overflow-visible"
              aria-label="Gráfico de barras de actividad mensual de reclamos"
            >
              <defs>
                <linearGradient id={`${chartId}-barGradient`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary, #0ea5e9)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="var(--color-primary, #0ea5e9)" stopOpacity="0.5" />
                </linearGradient>
              </defs>

              {/* Líneas horizontales de guía para ticks enteros */}
              {escalaY.ticks.map((tickVal) => {
                const yPos = 160 - (tickVal / escalaY.max) * 130;
                return (
                  <g key={`tick-${tickVal}`}>
                    <line
                      x1="35"
                      y1={yPos}
                      x2="530"
                      y2={yPos}
                      stroke="currentColor"
                      strokeOpacity="0.08"
                      strokeDasharray={tickVal === 0 ? "none" : "3 3"}
                    />
                    <text
                      x="28"
                      y={yPos + 4}
                      textAnchor="end"
                      className="text-[10px] fill-text-muted font-medium"
                    >
                      {tickVal}
                    </text>
                  </g>
                );
              })}

              {/* Columnas mensuales */}
              {datosActividad12Meses.map((d, idx) => {
                const xPos = 45 + idx * 40;
                const barHeight = escalaY.max > 0 ? (d.total / escalaY.max) * 130 : 0;
                const yPos = 160 - barHeight;
                const isHovered = hoveredMonth === idx;

                return (
                  <g
                    key={d.mesNombre}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredMonth(idx)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Área de interacción ampliada */}
                    <rect
                      x={xPos - 5}
                      y="15"
                      width="34"
                      height="160"
                      fill="transparent"
                    />

                    {/* Barra de valor */}
                    <rect
                      x={xPos}
                      y={d.total > 0 ? yPos : 158}
                      width="24"
                      height={d.total > 0 ? Math.max(barHeight, 3) : 2}
                      rx="4"
                      fill={isHovered ? "var(--color-primary-hover, #0284c7)" : `url(#${chartId}-barGradient)`}
                      className="transition-all duration-150"
                    />

                    {/* Cantidad sobre la barra si es > 0 o está hovered */}
                    {d.total > 0 && (
                      <text
                        x={xPos + 12}
                        y={Math.max(yPos - 6, 25)}
                        textAnchor="middle"
                        className={`text-[10px] font-bold ${
                          isHovered ? "fill-primary font-black" : "fill-text-primary"
                        }`}
                      >
                        {d.total}
                      </text>
                    )}

                    {/* Etiqueta del mes debajo del eje */}
                    <text
                      x={xPos + 12}
                      y="180"
                      textAnchor="middle"
                      className={`text-[11px] font-medium transition-colors ${
                        isHovered ? "fill-primary font-bold" : "fill-text-muted"
                      }`}
                    >
                      {d.mesNombre}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip flotante informativo si hay hover */}
            {hoveredMonth !== null && (
              <div className="text-center mt-2 text-xs font-semibold text-text-secondary bg-surface-subtle py-1.5 px-3 rounded-lg border border-border-subtle inline-block">
                <span>
                  {MESES[hoveredMonth]}:{" "}
                  <strong className="text-text-primary">
                    {datosActividad12Meses[hoveredMonth].total} reclamo(s)
                  </strong>{" "}
                  ingresados
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. DOS COLUMNAS: DISTRIBUCIÓN POR CATEGORÍA + ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categorías (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
                Reclamos por Categoría
              </h3>
              <p className="text-xs text-text-secondary m-0 mt-0.5">
                Volumen acumulado por temática
              </p>
            </div>
            <Link
              href="/admin/categories"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 no-underline"
            >
              Gestionar
              <ChevronRight size={12} />
            </Link>
          </div>

          {porCategoria.length === 0 ? (
            <p className="text-xs text-text-muted py-6 text-center m-0">
              No hay reclamos categorizados en el sistema.
            </p>
          ) : (
            <div className="space-y-3.5">
              {porCategoria.slice(0, 6).map((c) => {
                const cantidad = Number(c.cantidad || 0);
                const porcentaje = Math.round((cantidad / maxCategoriaCantidad) * 100);

                return (
                  <div key={c.categoria || "Sin categoría"} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-primary truncate pr-2">
                        {c.categoria || "Sin categoría asignada"}
                      </span>
                      <span className="font-bold text-text-secondary shrink-0">
                        {cantidad.toLocaleString()}{" "}
                        <span className="text-[11px] font-normal text-text-muted">
                          ({totalReclamosCalculado > 0 ? ((cantidad / totalReclamosCalculado) * 100).toFixed(0) : 0}%)
                        </span>
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(porcentaje, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Accesos rápidos administrativos (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted m-0 mb-1">
              Accesos Directos
            </h3>
            <p className="text-xs text-text-secondary m-0 mb-4">
              Atajos a las principales funciones del panel
            </p>

            <div className="space-y-2">
              <Link
                href="/admin/solicitudes"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group no-underline"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                    <Clock size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate m-0">
                      Verificar Solicitudes
                    </p>
                    <p className="text-[11px] text-text-muted truncate m-0">
                      Altas institucionales pendientes
                    </p>
                  </div>
                </div>
                {statsInstituciones.pendientes > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shrink-0">
                    {statsInstituciones.pendientes}
                  </span>
                ) : (
                  <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
                )}
              </Link>

              <Link
                href="/admin/reclamos"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group no-underline"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform shrink-0">
                    <FileText size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate m-0">
                      Supervisión de Reclamos
                    </p>
                    <p className="text-[11px] text-text-muted truncate m-0">
                      Bandeja y reasignación de instituciones
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
              </Link>

              <Link
                href="/admin/users/new"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group no-underline"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                    <UserPlus size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate m-0">
                      Crear Nuevo Usuario
                    </p>
                    <p className="text-[11px] text-text-muted truncate m-0">
                      Alta manual con rol asignado
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
              </Link>

              <Link
                href="/admin/ciudades"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group no-underline"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                    <MapPin size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate m-0">
                      Administración Territorial
                    </p>
                    <p className="text-[11px] text-text-muted truncate m-0">
                      Ciudades y localidades operativas
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ÚLTIMOS RECLAMOS: Supervisión Directa */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-subtle shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
              Últimos Reclamos Ingresados
            </h3>
            <p className="text-xs text-text-secondary m-0 mt-0.5">
              Supervisión de ingresos recientes en la plataforma
            </p>
          </div>
          <Link
            href="/admin/reclamos"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 no-underline"
          >
            Ver todos en supervisión
            <ArrowRight size={13} />
          </Link>
        </div>

        {ultimos.length === 0 ? (
          <p className="text-xs text-text-muted py-6 text-center m-0">
            No hay reclamos recientes registrados.
          </p>
        ) : (
          <div className="divide-y divide-border-subtle overflow-hidden">
            {ultimos.map((r) => (
              <div
                key={r.id}
                className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-surface-subtle/50 px-2 -mx-2 rounded-xl transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-text-muted">
                      #{r.id}
                    </span>
                    <p className="text-xs font-bold text-text-primary truncate m-0">
                      {r.titulo}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-text-muted">
                    <span>{tiempoRelativo(r.fecha_creacion)}</span>
                    {r.categoriaNombre && (
                      <>
                        <span>·</span>
                        <span className="text-text-secondary">{r.categoriaNombre}</span>
                      </>
                    )}
                    <span>·</span>
                    <span className={r.institucionNombre ? "text-text-secondary" : "text-amber-600 dark:text-amber-400 font-medium"}>
                      {r.institucionNombre || "Sin institución asignada"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                  <ClaimStatusBadge estado={r.estado} />
                  <Link
                    href={`/admin/reclamos`}
                    className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Supervisar reclamo"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}