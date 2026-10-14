"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import apiClient from "@/services/apiClient";
import DashboardKpis from "./DashboardKpis";
import DashboardAttentionBanner from "./DashboardAttentionBanner";
import DashboardStatusDistribution from "./DashboardStatusDistribution";
import DashboardActivityChart from "./DashboardActivityChart";
import DashboardCategoryBreakdown from "./DashboardCategoryBreakdown";
import DashboardQuickShortcuts from "./DashboardQuickShortcuts";
import DashboardRecentClaims from "./DashboardRecentClaims";

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
      <DashboardKpis
        statsReclamos={statsReclamos}
        statsUsuarios={statsUsuarios}
        statsInstituciones={statsInstituciones}
        activosReclamos={activosReclamos}
      />

      {/* 2. SECCIÓN DESTACADA: REQUIERE ATENCIÓN */}
      <DashboardAttentionBanner
        requiereAtencion={requiereAtencion}
        hayPendientesInstituciones={hayPendientesInstituciones}
        hayPendientesReclamos={hayPendientesReclamos}
        statsInstituciones={statsInstituciones}
        statsReclamos={statsReclamos}
      />

      {/* 3. DOS COLUMNAS: DISTRIBUCIÓN POR ESTADO + ACTIVIDAD MENSUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <DashboardStatusDistribution
          statsReclamos={statsReclamos}
          totalReclamosCalculado={totalReclamosCalculado}
        />
        <DashboardActivityChart actividad={actividad} />
      </div>

      {/* 4. DOS COLUMNAS: DISTRIBUCIÓN POR CATEGORÍA + ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <DashboardCategoryBreakdown
          porCategoria={porCategoria}
          maxCategoriaCantidad={maxCategoriaCantidad}
          totalReclamosCalculado={totalReclamosCalculado}
        />
        <DashboardQuickShortcuts statsInstituciones={statsInstituciones} />
      </div>

      {/* 5. ÚLTIMOS RECLAMOS: Supervisión Directa */}
      <DashboardRecentClaims ultimos={ultimos} />
    </div>
  );
}
