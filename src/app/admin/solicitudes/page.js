"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  CheckCircle,
  XCircle,
  Building2,
  MapPin,
  Loader2,
  RefreshCw,
  Eye,
  Clock,
  Globe2,
  Layers,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useInstituciones } from "@/hooks/admin/useInstituciones";
import InstitucionAvatar from "@/components/admin/instituciones/InstitucionAvatar";
import InstitucionDetailModal from "@/components/admin/instituciones/InstitucionDetailModal";
import InstitucionApproveModal from "@/components/admin/instituciones/InstitucionApproveModal";
import InstitucionRejectModal from "@/components/admin/instituciones/InstitucionRejectModal";
import { tiempoRelativo } from "@/utils/dateFormatters";

const TABS_SOLICITUDES = [
  {
    key: "instituciones",
    label: "Verificación de Instituciones",
    icon: Building2,
  },
  {
    key: "ciudades",
    label: "Activación de Ciudades",
    icon: Globe2,
  },
  {
    key: "operaciones",
    label: "Operaciones y Categorías",
    icon: Layers,
  },
];

export default function SolicitudesPage() {
  const [tabActiva, setTabActiva] = useState("instituciones");

  const {
    instituciones: solicitudes,
    stats,
    categoriasGlobales,
    loading,
    error,
    filtroEstado,
    setFiltroEstado,
    cargarInstituciones,
    cargarStats,
    modalDetalle,
    setModalDetalle,
    modalAprobar,
    setModalAprobar,
    modalRechazar,
    setModalRechazar,
    procesandoAccion,
    verificarInstitucion,
    rechazarInstitucion,
    actualizarCategoriasInstitucion,
  } = useInstituciones({
    filtroInicialEstado: "pendiente",
    fetchStats: true,
    fetchCatalogos: true,
  });

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Bandeja de Solicitudes Administrativas"
        description="Centralizá la evaluación de solicitudes de verificación institucional, activación territorial y alcance operativo."
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/institutions">
              <Button variant="outline" size="sm" leftIcon={<Building2 size={14} />}>
                Padrón de instituciones
              </Button>
            </Link>
            <Button
              onClick={() => {
                cargarStats();
                cargarInstituciones();
              }}
              variant="outline"
              size="sm"
              loading={loading}
              leftIcon={<RefreshCw size={14} />}
            >
              Actualizar
            </Button>
          </div>
        }
      />

      {/* Barra de pestañas por tipo de solicitud */}
      <div className="flex flex-wrap items-center gap-2 bg-surface p-2 rounded-2xl border border-border-subtle shadow-2xs">
        {TABS_SOLICITUDES.map((tab) => {
          const Icon = tab.icon;
          const isActiva = tabActiva === tab.key;
          return (
            <Button
              key={tab.key}
              type="button"
              variant={isActiva ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTabActiva(tab.key)}
              leftIcon={<Icon size={14} />}
              className="font-bold"
            >
              <span>{tab.label}</span>
              {tab.key === "instituciones" && Number(stats.pendientes) > 0 && (
                <span
                  className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActiva
                      ? "bg-white/20 text-white"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {stats.pendientes}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Pestaña 1: Verificación de Instituciones */}
      {tabActiva === "instituciones" && (
        <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold text-text-primary m-0">
                Solicitudes de Verificación Institucional
              </h3>
              <Badge
                variant={filtroEstado === "pendiente" ? "warning" : "danger"}
                size="sm"
              >
                {solicitudes.length}{" "}
                {filtroEstado === "pendiente" ? "pendientes" : "rechazadas"}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-xl border border-border-subtle w-fit">
              <Button
                type="button"
                size="sm"
                variant={filtroEstado === "pendiente" ? "outline" : "ghost"}
                onClick={() => setFiltroEstado("pendiente")}
                className={
                  filtroEstado === "pendiente"
                    ? "bg-surface text-primary font-bold shadow-2xs"
                    : "text-text-muted"
                }
              >
                Pendientes ({stats.pendientes ?? 0})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filtroEstado === "rechazada" ? "outline" : "ghost"}
                onClick={() => setFiltroEstado("rechazada")}
                className={
                  filtroEstado === "rechazada"
                    ? "bg-surface text-primary font-bold shadow-2xs"
                    : "text-text-muted"
                }
              >
                Rechazadas ({stats.rechazadas ?? 0})
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-text-muted text-xs gap-2">
              <Loader2 size={24} className="animate-spin text-primary" />
              <span>Consultando solicitudes institucionales...</span>
            </div>
          ) : error ? (
            <div className="py-12 px-4 text-center">
              <p className="text-xs text-rose-600 font-semibold mb-3">{error}</p>
              <Button
                onClick={() => cargarInstituciones()}
                variant="outline"
                size="sm"
              >
                Reintentar
              </Button>
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-text-muted mb-3">
                <Inbox size={24} />
              </div>
              <h4 className="text-sm font-bold text-text-primary m-0">
                {filtroEstado === "pendiente"
                  ? "No hay solicitudes pendientes de verificación"
                  : "No hay solicitudes institucionales rechazadas activas"}
              </h4>
              <p className="text-xs text-text-muted mt-1 max-w-sm m-0">
                {filtroEstado === "pendiente"
                  ? "Todas las instituciones registradas han sido evaluadas por la administración."
                  : "Las solicitudes rechazadas permanecen visibles durante 7 días por si la entidad corrige sus datos."}
              </p>
              <Link href="/admin/institutions" className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Building2 size={14} />}
                >
                  Ir al padrón general de instituciones
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Ciudad y Provincia</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Antigüedad</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {solicitudes.map((inst) => {
                    const esRechazada =
                      inst.status === "rejected" || Boolean(inst.motivo_rechazo);
                    return (
                      <tr
                        key={inst.id}
                        className="hover:bg-surface-subtle/50 transition-colors"
                      >
                        {/* Nombre */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <InstitucionAvatar
                              foto={inst.foto_perfil}
                              nombre={inst.nombre}
                              size="md"
                            />
                            <p className="font-bold text-text-primary m-0 truncate">
                              {inst.nombre}
                            </p>
                          </div>
                        </td>

                        {/* Ciudad y Provincia */}
                        <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-text-primary">
                            <MapPin size={13} className="text-text-muted shrink-0" />
                            <span>
                              {inst.ciudad_nombre
                                ? `${inst.ciudad_nombre}${
                                    inst.provincia ? `, ${inst.provincia}` : ""
                                  }`
                                : "Sin ciudad asignada"}
                            </span>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {esRechazada ? (
                            <Badge variant="danger" size="sm">
                              Rechazada
                            </Badge>
                          ) : (
                            <Badge variant="warning" size="sm">
                              Pendiente
                            </Badge>
                          )}
                        </td>

                        {/* Antigüedad */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Clock size={12} className="shrink-0" />
                            {inst.creado_en ? tiempoRelativo(inst.creado_en) : "Reciente"}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              onClick={() => setModalDetalle(inst)}
                              variant="outline"
                              size="sm"
                              leftIcon={<Eye size={13} />}
                              title="Ver datos completos de la entidad"
                            >
                              Detalle
                            </Button>
                            <Button
                              onClick={() => setModalAprobar(inst)}
                              variant="success"
                              size="sm"
                              leftIcon={<CheckCircle size={13} />}
                            >
                              Verificar
                            </Button>
                            {!esRechazada && (
                              <Button
                                onClick={() => setModalRechazar(inst)}
                                variant="danger-soft"
                                size="sm"
                                leftIcon={<XCircle size={13} />}
                              >
                                Rechazar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pestaña 2: Activación / Reactivación de Ciudades */}
      {tabActiva === "ciudades" && (
        <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
            <Globe2 size={24} />
          </div>
          <h3 className="text-sm font-bold text-text-primary m-0">
            Solicitudes de Activación y Reactivación de Ciudades
          </h3>
          <p className="text-xs text-text-muted max-w-md mx-auto m-0 leading-relaxed">
            No hay solicitudes territoriales pendientes en esta bandeja. La habilitación o
            desactivación operativa de ciudades requiere contar con una institución principal
            verificada y activa en la localidad.
          </p>
          <div className="pt-2">
            <Link href="/admin/ciudades">
              <Button variant="outline" size="sm" leftIcon={<Globe2 size={14} />}>
                Ir a Gestión de Ciudades
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Pestaña 3: Operaciones y Categorías */}
      {tabActiva === "operaciones" && (
        <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-text-muted mx-auto">
            <Layers size={24} />
          </div>
          <h3 className="text-sm font-bold text-text-primary m-0">
            Solicitudes de Ampliación de Categorías y Operaciones
          </h3>
          <p className="text-xs text-text-muted max-w-md mx-auto m-0 leading-relaxed">
            No hay solicitudes de ampliación de alcance pendientes en este momento. Podés
            configurar de forma directa las categorías operativas autorizadas de cualquier
            institución verificada desde su ficha de detalle.
          </p>
          <div className="pt-2">
            <Link href="/admin/institutions">
              <Button variant="outline" size="sm" leftIcon={<Building2 size={14} />}>
                Configurar categorías en Instituciones
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Modales Compartidos */}
      <InstitucionDetailModal
        isOpen={Boolean(modalDetalle)}
        onClose={() => setModalDetalle(null)}
        institucion={modalDetalle}
        categoriasGlobales={categoriasGlobales}
        onAprobar={(inst) => setModalAprobar(inst)}
        onRechazar={(inst) => setModalRechazar(inst)}
        onActualizarCategorias={actualizarCategoriasInstitucion}
        procesando={procesandoAccion}
      />

      <InstitucionApproveModal
        isOpen={Boolean(modalAprobar)}
        onClose={() => setModalAprobar(null)}
        onConfirm={() => verificarInstitucion(modalAprobar)}
        institucion={modalAprobar}
        loading={procesandoAccion}
      />

      <InstitucionRejectModal
        isOpen={Boolean(modalRechazar)}
        onClose={() => setModalRechazar(null)}
        onConfirm={(motivo) => rechazarInstitucion(modalRechazar, motivo)}
        institucion={modalRechazar}
        loading={procesandoAccion}
      />
    </div>
  );
}
