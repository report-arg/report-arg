"use client";

import Link from "next/link";
import {
  Inbox,
  CheckCircle,
  XCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { useInstituciones } from "@/hooks/admin/useInstituciones";
import InstitucionAvatar from "@/components/admin/instituciones/InstitucionAvatar";
import InstitucionDetailModal from "@/components/admin/instituciones/InstitucionDetailModal";
import InstitucionApproveModal from "@/components/admin/instituciones/InstitucionApproveModal";
import InstitucionRejectModal from "@/components/admin/instituciones/InstitucionRejectModal";

export default function SolicitudesPage() {
  const {
    instituciones: solicitudes,
    loading,
    error,
    cargarInstituciones,
    modalDetalle,
    setModalDetalle,
    modalAprobar,
    setModalAprobar,
    modalRechazar,
    setModalRechazar,
    procesandoAccion,
    verificarInstitucion,
    rechazarInstitucion,
  } = useInstituciones({ filtroInicialEstado: "pendiente", fetchStats: false });

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Solicitudes Administrativas"
        description="Bandeja de verificación y validación de nuevas instituciones para operar en ReportARG."
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/institutions">
              <Button variant="outline" size="sm" leftIcon={<Building2 size={14} />}>
                Ver todas las instituciones
              </Button>
            </Link>
            <Button
              onClick={() => cargarInstituciones()}
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

      {/* Contenedor principal de solicitudes */}
      <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary m-0">
              Verificación Institucional
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              {solicitudes.length} pendientes
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-muted text-xs gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span>Consultando solicitudes pendientes...</span>
          </div>
        ) : error ? (
          <div className="py-12 px-4 text-center">
            <p className="text-xs text-rose-600 font-semibold mb-3">{error}</p>
            <Button onClick={() => cargarInstituciones()} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-text-muted mb-3">
              <Inbox size={24} />
            </div>
            <h4 className="text-sm font-bold text-text-primary m-0">
              No hay solicitudes pendientes
            </h4>
            <p className="text-xs text-text-muted mt-1 max-w-sm m-0">
              Todas las instituciones registradas han sido procesadas o ya se encuentran validadas en el sistema.
            </p>
            <Link href="/admin/institutions" className="mt-4">
              <Button variant="outline" size="sm" leftIcon={<Building2 size={14} />}>
                Ir al listado general de instituciones
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Institución</th>
                  <th className="py-3 px-4">Ciudad / Territorio</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {solicitudes.map((inst) => (
                  <tr key={inst.id} className="hover:bg-surface-subtle/50 transition-colors">
                    {/* Institución */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <InstitucionAvatar
                          foto={inst.foto_perfil}
                          nombre={inst.nombre}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary m-0 truncate">
                            {inst.nombre}
                          </p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-subtle border border-border-subtle text-text-secondary capitalize">
                            {inst.tipo || "Institución"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Territorio */}
                    <td className="py-3.5 px-4 text-text-secondary">
                      <div className="flex items-center gap-1.5 font-medium text-text-primary">
                        <MapPin size={13} className="text-text-muted shrink-0" />
                        <span>
                          {inst.ciudad_nombre
                            ? `${inst.ciudad_nombre}${inst.provincia ? `, ${inst.provincia}` : ""}`
                            : "Sin ciudad asignada"}
                        </span>
                      </div>
                      {inst.direccion && (
                        <p className="text-[11px] text-text-muted mt-0.5 m-0 pl-5 truncate max-w-xs">
                          {inst.direccion}
                        </p>
                      )}
                    </td>

                    {/* Contacto */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <Mail size={13} className="text-text-muted shrink-0" />
                        <span className="truncate">{inst.email || "Sin email"}</span>
                      </div>
                      {inst.telefono && (
                        <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                          <Phone size={12} className="shrink-0" />
                          <span>{inst.telefono}</span>
                        </div>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Pendiente
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
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
                        <Button
                          onClick={() => setModalRechazar(inst)}
                          variant="danger-soft"
                          size="sm"
                          leftIcon={<XCircle size={13} />}
                        >
                          Rechazar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales Compartidos */}
      <InstitucionDetailModal
        isOpen={Boolean(modalDetalle)}
        onClose={() => setModalDetalle(null)}
        institucion={modalDetalle}
        onAprobar={(inst) => setModalAprobar(inst)}
        onRechazar={(inst) => setModalRechazar(inst)}
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
