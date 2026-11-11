"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw } from "lucide-react";
import apiClient from "@/services/apiClient";
import Button from "@/components/ui/Button";
import DashboardKpis from "./DashboardKpis";
import DashboardAttentionBanner from "./DashboardAttentionBanner";
import DashboardStatusDistribution from "./DashboardStatusDistribution";
import DashboardActivityChart from "./DashboardActivityChart";
import DashboardCategoriaDistribucion from "./DashboardCategoriaDistribucion";
import DashboardQuickShortcuts from "./DashboardQuickShortcuts";
import DashboardReclamosRecientes from "./DashboardReclamosRecientes";

export default function DashboardStats() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [statsUsuarios, setStatsUsuarios] = useState({ total: 0, activos: 0, inactivos: 0, admins: 0 });
  const [statsReclamos, setStatsReclamos] = useState({
    total: 0,
    pendientes: 0,
    enRevision: 0,
    enProceso: 0,
    resueltos: 0,
    cancelados: 0,
    sinAsignar: 0,
    pendienteMasAntiguoDias: 0,
  });
  const [statsInstituciones, setStatsInstituciones] = useState({ total: 0, verificadas: 0, pendientes: 0, suspendidas: 0, rechazadas: 0 });
  const [statsCiudades, setStatsCiudades] = useState({ total: 0, activas: 0, inactivas: 0, sinPrincipal: 0 });
  const [ultimos, setUltimos] = useState([]);
  const [porCategoria, setPorCategoria] = useState([]);
  const [actividad, setActividad] = useState([]);

  // Salvaguarda contra actualizaciones en componente desmontado
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const cargarDatos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [uRes, rRes, iRes, cRes, ultRes, catRes, actRes] = await Promise.all([
        apiClient.get("/admin/usuarios/stats").catch(() => ({ data: { ok: false } })),
        apiClient.get("/admin/reclamos/stats").catch(() => ({ data: { ok: false } })),
        apiClient.get("/admin/instituciones/stats").catch(() => ({ data: { ok: false } })),
        apiClient.get("/admin/ciudades/stats").catch(() => ({ data: { ok: false } })),
        apiClient.get("/admin/reclamos/ultimos").catch(() => ({ data: { ok: false } })),
        apiClient.get("/admin/reclamos/por-categoria").catch(() => ({ data: { ok: false } })),
        apiClient.get("/admin/reclamos/actividad-mensual").catch(() => ({ data: { ok: false } })),
      ]);

      if (!isMountedRef.current) return;

      if (uRes.data?.ok && uRes.data.data) setStatsUsuarios(uRes.data.data);
      if (rRes.data?.ok && rRes.data.data) setStatsReclamos(rRes.data.data);
      if (iRes.data?.ok && iRes.data.data) setStatsInstituciones(iRes.data.data);
      if (cRes.data?.ok && cRes.data.data) setStatsCiudades(cRes.data.data);
      if (ultRes.data?.ok) setUltimos(ultRes.data.data || []);
      if (catRes.data?.ok) setPorCategoria(catRes.data.data || []);
      if (actRes.data?.ok) setActividad(actRes.data.data || []);
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
      if (isMountedRef.current) {
        setError("No se pudieron cargar todos los indicadores del dashboard.");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Indicadores de atención administrativa
  const hayPendientesInstituciones = Number(statsInstituciones?.pendientes || 0) > 0;
  const hayPendientesReclamos = Number(statsReclamos?.pendientes || 0) > 0;
  const hayCiudadesSinPrincipal = Number(statsCiudades?.sinPrincipal || 0) > 0;
  const hayReclamosSinAsignar = Number(statsReclamos?.sinAsignar || 0) > 0;

  const requiereAtencion =
    hayPendientesInstituciones ||
    hayPendientesReclamos ||
    hayCiudadesSinPrincipal ||
    hayReclamosSinAsignar;

  // Cálculos de totales secundarios
  const totalReclamosCalculado = Number(statsReclamos.total || 0);
  const activosReclamos =
    Number(statsReclamos.pendientes || 0) +
    Number(statsReclamos.enRevision || 0) +
    Number(statsReclamos.enProceso || 0);

  // Categoría máxima para escalar barras de progreso
  const maxCategoriaCantidad =
    porCategoria.length > 0 ? Math.max(...porCategoria.map((c) => Number(c.cantidad || 0)), 1) : 1;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Fila 1: 5 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted m-0">
          Supervisión centralizada del estado territorial, solicitudes y salud operativa.
        </p>
        <Button
          onClick={() => cargarDatos(true)}
          disabled={refreshing}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw size={13} className={refreshing ? "animate-spin text-primary" : ""} />}
        >
          {refreshing ? "Actualizando..." : "Actualizar datos"}
        </Button>
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

      {/* 1. SECCIÓN DESTACADA: SALUD DE LA PLATAFORMA Y ATENCIÓN ADMINISTRATIVA */}
      <DashboardAttentionBanner
        requiereAtencion={requiereAtencion}
        hayPendientesInstituciones={hayPendientesInstituciones}
        hayPendientesReclamos={hayPendientesReclamos}
        hayCiudadesSinPrincipal={hayCiudadesSinPrincipal}
        hayReclamosSinAsignar={hayReclamosSinAsignar}
        pendientesInstituciones={Number(statsInstituciones.pendientes || 0)}
        pendientesReclamos={Number(statsReclamos.pendientes || 0)}
        ciudadesSinPrincipal={Number(statsCiudades.sinPrincipal || 0)}
        reclamosSinAsignar={Number(statsReclamos.sinAsignar || 0)}
        demoraDias={Number(statsReclamos.pendienteMasAntiguoDias || 0)}
      />

      {/* 2. PRIMERA FILA: Indicadores Clave de Plataforma (KPIs) */}
      <DashboardKpis
        statsReclamos={statsReclamos}
        statsUsuarios={statsUsuarios}
        statsInstituciones={statsInstituciones}
        statsCiudades={statsCiudades}
        activosReclamos={activosReclamos}
      />

      {/* 3. DOS COLUMNAS: DISTRIBUCIÓN POR ESTADO + ACTIVIDAD MENSUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <DashboardStatusDistribution
          statsReclamos={statsReclamos}
          totalReclamos={totalReclamosCalculado}
          totalReclamosCalculado={totalReclamosCalculado}
        />
        <DashboardActivityChart actividad={actividad} />
      </div>

      {/* 4. DOS COLUMNAS: DISTRIBUCIÓN POR CATEGORÍA + ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <DashboardCategoriaDistribucion
          porCategoria={porCategoria}
          maxCategoriaCantidad={maxCategoriaCantidad}
          totalReclamosCalculado={totalReclamosCalculado}
        />
        <DashboardQuickShortcuts
          statsInstituciones={statsInstituciones}
          statsCiudades={statsCiudades}
          statsReclamos={statsReclamos}
        />
      </div>

      {/* 5. ÚLTIMOS RECLAMOS: Supervisión Directa */}
      <DashboardReclamosRecientes ultimos={ultimos} />
    </div>
  );
}
