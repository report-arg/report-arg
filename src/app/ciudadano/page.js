"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, ChevronRight, MapPin, Loader2 } from "lucide-react";
import apiClient from "@/services/apiClient";
import StatusBadge from "@/components/ui/StatusBadge";
import { ReportProblemIcon, getCategoryIcon } from "@/components/brand/icons";
import { tiempoRelativo } from "@/utils/dateFormatters";
import PageHeader from "@/components/layout/PageHeader";

const MapaReclamos = dynamic(
  () => import("@/components/mapa/MapaReclamos"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center text-xs text-text-muted gap-2 bg-surface">
        <Loader2 size={18} className="animate-spin text-primary" />
        <span>Cargando mapa…</span>
      </div>
    ),
  }
);

export default function CiudadanoHomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [perfil, setPerfil] = useState(null);
  const [misReclamos, setMisReclamos] = useState([]);
  const [loadingReclamos, setLoadingReclamos] = useState(true);
  const [reclamosMapa, setReclamosMapa] = useState([]);
  const [loadingMapa, setLoadingMapa] = useState(true);
  const [tendencias, setTendencias] = useState([]);
  const [novedadReciente, setNovedadReciente] = useState(null);

  // 1. Cargar perfil del ciudadano
  useEffect(() => {
    if (!session?.user?.id) return;
    apiClient.get(`/auth/me`)
      .then(r => r.data)
      .then(d => { if (d.ok) setPerfil(d.data); })
      .catch(() => {});
  }, [session?.user?.id]);

  // 2. Cargar reclamos personales del ciudadano
  useEffect(() => {
    if (!session?.user?.id) return;
    setLoadingReclamos(true);
    apiClient.get('/reclamos/mis-reclamos')
      .then(r => r.data)
      .then(d => { if (d.ok) setMisReclamos(d.data || []); })
      .catch(() => {})
      .finally(() => setLoadingReclamos(false));
  }, [session?.user?.id]);

  // 3. Cargar reclamos públicos para la preview del mapa
  useEffect(() => {
    setLoadingMapa(true);
    apiClient.get('/reclamos/mapa')
      .then(r => r.data)
      .then(d => { if (d.ok) setReclamosMapa(d.data || []); })
      .catch(() => {})
      .finally(() => setLoadingMapa(false));
  }, []);

  // 4. Cargar temas más reportados (tendencias por ciudad)
  useEffect(() => {
    apiClient.get('/feed/tendencias')
      .then(r => r.data)
      .then(d => { if (d.ok) setTendencias(d.data || []); })
      .catch(() => {});
  }, []);

  // 5. Cargar novedad importante no leída (si existe)
  useEffect(() => {
    if (!session?.user?.id) return;
    apiClient.get('/notificaciones?filtro=no_leidas&limite=1')
      .then(r => r.data)
      .then(d => {
        if (d.ok && Array.isArray(d.data) && d.data.length > 0) {
          setNovedadReciente(d.data[0]);
        } else {
          setNovedadReciente(null);
        }
      })
      .catch(() => {});
  }, [session?.user?.id]);

  // Datos del encabezado
  const nombreUsuario = perfil?.nombre || session?.user?.name || "Ciudadano";
  const primerNombre = nombreUsuario.split(" ")[0];
  const ciudad = perfil?.ciudad_activa || perfil?.ciudad_declarada || null;
  const provincia = perfil?.provincia_activa || perfil?.provincia_declarada || null;
  const ubicacionTexto = ciudad
    ? `${ciudad}${provincia ? `, ${provincia}` : ""}`
    : "tu ciudad";

  // Métricas del resumen personal (datos 100% reales)
  const conteoActivos = useMemo(() => {
    return misReclamos.filter(r => ["Pendiente", "En revisión", "En proceso"].includes(r.estado)).length;
  }, [misReclamos]);

  const conteoNovedades = useMemo(() => {
    return misReclamos.filter(r => (Number(r.actualizacionesCount) || 0) > 0).length;
  }, [misReclamos]);

  const conteoResueltos = useMemo(() => {
    return misReclamos.filter(r => r.estado === "Resuelto").length;
  }, [misReclamos]);

  // Selección de hasta 2 reclamos relevantes (priorizando activos y más recientes)
  const reclamosDestacados = useMemo(() => {
    if (!misReclamos.length) return [];
    const activos = misReclamos
      .filter(r => ["Pendiente", "En revisión", "En proceso"].includes(r.estado))
      .sort((a, b) => new Date(b.fecha_ultimo_cambio_estado || b.fecha_creacion) - new Date(a.fecha_ultimo_cambio_estado || a.fecha_creacion));

    if (activos.length >= 2) return activos.slice(0, 2);

    const otros = misReclamos
      .filter(r => !["Pendiente", "En revisión", "En proceso"].includes(r.estado))
      .sort((a, b) => new Date(b.fecha_ultimo_cambio_estado || b.fecha_creacion) - new Date(a.fecha_ultimo_cambio_estado || a.fecha_creacion));

    return [...activos, ...otros].slice(0, 2);
  }, [misReclamos]);

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* 1. ENCABEZADO UNIFICADO */}
      <PageHeader
        title={`Hola, ${primerNombre}`}
        description={
          <>
            Esto es lo más relevante hoy en <span className="font-semibold text-text-primary">{ubicacionTexto}</span>.
          </>
        }
        action={
          <button
            onClick={() => router.push("/ciudadano/reclamos/nuevo")}
            className="btn-primary-report shrink-0 cursor-pointer"
          >
            <ReportProblemIcon size={16} />
            <span>Reportar un problema</span>
          </button>
        }
      />

      {/* 2. NOVEDAD IMPORTANTE (CONDICIONAL - SOLO SI HAY NOTIFICACIÓN NO LEÍDA) */}
      {novedadReciente && (
        <div className="rounded-xl bg-surface border border-primary/25 p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 animate-pulse" />
            <p className="m-0 truncate text-text-secondary">
              <strong className="text-text-primary mr-1">Tenés una novedad:</strong>
              {novedadReciente.mensaje || novedadReciente.titulo}
            </p>
          </div>
          <Link
            href={novedadReciente.id_reclamo ? `/ciudadano/reclamos/${novedadReciente.id_reclamo}` : "/ciudadano/notificaciones"}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-hover shrink-0 text-xs sm:text-sm"
          >
            Ver <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* 3. RESUMEN PERSONAL COMPACTO */}
      <div className="py-3 px-4 rounded-xl bg-surface border border-border-subtle shadow-xs flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-text-secondary">
        <span className="font-semibold text-text-primary">
          {conteoActivos} {conteoActivos === 1 ? "reclamo activo" : "reclamos activos"}
        </span>
        <span className="text-text-muted">•</span>
        <span className={conteoNovedades > 0 ? "font-semibold text-primary" : "text-text-secondary"}>
          {conteoNovedades} con novedades
        </span>
        <span className="text-text-muted">•</span>
        <span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{conteoResueltos}</span>{" "}
          {conteoResueltos === 1 ? "resuelto" : "resueltos"}
        </span>
      </div>

      {/* 4. QUÉ ESTÁ PASANDO CERCA (PREVIEW DEL MAPA) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight m-0">
              Qué está pasando cerca
            </h2>
            <p className="text-xs text-text-muted mt-0.5 mb-0">
              Reclamos públicos geolocalizados en {ciudad || "tu ciudad"}
            </p>
          </div>
          <Link
            href="/ciudadano/mapa"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Ver mapa completo <ArrowRight size={14} />
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden border border-border-subtle bg-surface shadow-xs h-[280px] sm:h-[320px] relative">
          {loadingMapa ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-text-muted gap-2">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span>Cargando mapa…</span>
            </div>
          ) : reclamosMapa.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
              <MapPin size={24} className="text-primary mb-2 opacity-60" />
              <p className="text-sm font-semibold text-text-secondary m-0">No hay reclamos públicos con ubicación registrada</p>
              <p className="text-xs text-text-muted mt-1 m-0">Los nuevos reclamos geolocalizados aparecerán en este mapa.</p>
            </div>
          ) : (
            <MapaReclamos reclamos={reclamosMapa} height="100%" />
          )}
        </div>
      </section>

      {/* 5. TEMAS MÁS REPORTADOS */}
      {tendencias.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight m-0">
              Temas más reportados {ciudad ? `en ${ciudad}` : ""}
            </h2>
            <Link
              href="/ciudadano/explorar"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-text-muted hover:text-text-primary transition-colors"
            >
              Explorar todos <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tendencias.map((t) => {
              const CategoryIcon = getCategoryIcon(t.codigo || t.nombre, t.nombre);
              const catId = t.id || t.id_categoria;
              return (
                <Link
                  key={t.id || t.nombre}
                  href={catId ? `/ciudadano/explorar?categoria=${catId}` : "/ciudadano/explorar"}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border-subtle hover:border-primary/50 text-xs sm:text-sm font-medium text-text-secondary hover:text-primary transition-all shadow-xs group"
                >
                  <CategoryIcon size={15} className="text-primary shrink-0" />
                  <span className="font-semibold text-text-primary group-hover:text-primary">{t.nombre}</span>
                  <span className="bg-surface-subtle px-1.5 py-0.5 rounded-md text-[11px] font-bold text-text-muted">
                    {t.total}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. TUS RECLAMOS (MÁXIMO 2 COMPACTOS) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight m-0">
            Tus reclamos
          </h2>
          {misReclamos.length > 0 && (
            <Link
              href="/ciudadano/reclamos"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Ver todos mis reclamos ({misReclamos.length}) <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {loadingReclamos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[1, 2].map(i => (
              <div key={i} className="p-4 rounded-xl bg-surface border border-border-subtle animate-pulse space-y-2.5">
                <div className="h-4 w-20 bg-border-subtle rounded" />
                <div className="h-5 w-3/4 bg-border-subtle rounded" />
                <div className="h-3 w-40 bg-surface-subtle rounded" />
              </div>
            ))}
          </div>
        ) : reclamosDestacados.length === 0 ? (
          <div className="p-6 rounded-2xl bg-surface border border-border-subtle text-center">
            <p className="text-sm font-semibold text-text-secondary m-0">No tenés reclamos registrados actualmente</p>
            <p className="text-xs text-text-muted mt-1 mb-4">Si observás una problemática en tu barrio, podés registrar un reclamo para darle seguimiento.</p>
            <button
              onClick={() => router.push("/ciudadano/reclamos/nuevo")}
              className="btn-primary-report inline-flex mx-auto cursor-pointer"
            >
              <ReportProblemIcon size={16} />
              <span>Reportar un problema</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {reclamosDestacados.map((r) => {
              const CategoryIcon = getCategoryIcon(r.categoriaNombre, r.categoriaNombre);
              const tiempoActualizado = tiempoRelativo(r.fecha_ultimo_cambio_estado || r.fecha_creacion);
              return (
                <div
                  key={r.id}
                  onClick={() => router.push(`/ciudadano/reclamos/${r.id}`)}
                  className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-primary/40 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between gap-3 cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <StatusBadge status={r.estado} size="sm" />
                      {r.categoriaNombre && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted">
                          <CategoryIcon size={12} className="text-primary shrink-0" />
                          <span className="truncate max-w-[140px]">{r.categoriaNombre}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1 m-0">
                      {r.titulo}
                    </h3>

                    {r.direccion && (
                      <p className="text-xs text-text-muted flex items-center gap-1 mt-1 mb-0 truncate">
                        <MapPin size={11} className="shrink-0 text-text-muted" />
                        <span className="truncate">{r.direccion}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between text-xs text-text-muted">
                    <span className="truncate max-w-[190px]">
                      {r.institucionNombre || "Institución"} {tiempoActualizado ? `· ${tiempoActualizado}` : ""}
                    </span>
                    <span className="font-semibold text-primary inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
                      Ver seguimiento <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
