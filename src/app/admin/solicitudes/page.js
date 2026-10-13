"use client";

import { useEffect, useState } from "react";
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
  Calendar,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { formatearFecha } from "@/utils/dateFormatters";

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modales de acción y detalle
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalAprobar, setModalAprobar] = useState(null);
  const [modalRechazar, setModalRechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [motivoError, setMotivoError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const cargarSolicitudes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/admin/instituciones?estado=pendiente");
      if (res.data?.ok) {
        setSolicitudes(res.data.data || []);
      } else {
        setError("No se pudieron cargar las solicitudes pendientes.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor para consultar solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  async function handleAprobar() {
    if (!modalAprobar) return;
    setProcesando(true);
    try {
      const res = await apiClient.put(`/admin/instituciones/${modalAprobar.id}/verificar`);
      if (res.data?.ok) {
        toast.success(`Institución "${modalAprobar.nombre}" verificada correctamente.`);
        setModalAprobar(null);
        if (modalDetalle?.id === modalAprobar.id) setModalDetalle(null);
        await cargarSolicitudes();
      } else {
        toast.error(res.data?.mensaje || "Error al verificar institución.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al verificar institución.");
    } finally {
      setProcesando(false);
    }
  }

  async function handleRechazar() {
    if (!modalRechazar) return;
    if (!motivoRechazo.trim()) {
      setMotivoError("El motivo de rechazo es obligatorio para notificar a la entidad.");
      return;
    }

    setProcesando(true);
    try {
      const res = await apiClient.put(`/admin/instituciones/${modalRechazar.id}/rechazar`, {
        motivo: motivoRechazo.trim(),
      });
      if (res.data?.ok) {
        toast.success(`Solicitud de "${modalRechazar.nombre}" rechazada correctamente.`);
        setModalRechazar(null);
        setMotivoRechazo("");
        setMotivoError("");
        if (modalDetalle?.id === modalRechazar.id) setModalDetalle(null);
        await cargarSolicitudes();
      } else {
        toast.error(res.data?.mensaje || "Error al rechazar solicitud.");
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al rechazar solicitud.");
    } finally {
      setProcesando(false);
    }
  }

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
              onClick={cargarSolicitudes}
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

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-muted text-xs gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span>Consultando solicitudes pendientes...</span>
          </div>
        ) : error ? (
          <div className="py-12 px-4 text-center">
            <p className="text-xs text-rose-600 font-semibold mb-3">{error}</p>
            <Button onClick={cargarSolicitudes} variant="outline" size="sm">
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
                        {inst.foto_perfil ? (
                          <img
                            src={inst.foto_perfil}
                            alt={inst.nombre}
                            className="w-9 h-9 rounded-xl object-cover border border-border-subtle shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 font-bold">
                            <Building2 size={16} />
                          </div>
                        )}
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
                          onClick={() => {
                            setModalRechazar(inst);
                            setMotivoRechazo("");
                            setMotivoError("");
                          }}
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

      {/* Modal Ver Detalle */}
      {modalDetalle && (
        <Modal
          isOpen={true}
          onClose={() => setModalDetalle(null)}
          title="Ficha de Solicitud Institucional"
          description={`Datos declarados por ${modalDetalle.nombre}`}
          icon={<Building2 size={20} />}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <Building2 size={24} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-text-primary m-0 truncate">
                  {modalDetalle.nombre}
                </h4>
                <p className="text-xs text-text-muted m-0 capitalize">
                  Tipo: {modalDetalle.tipo || "Institución"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border-subtle">
                <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  Ciudad Asociada
                </span>
                <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5">
                  <MapPin size={13} className="text-text-muted shrink-0" />
                  {modalDetalle.ciudad_nombre
                    ? `${modalDetalle.ciudad_nombre}${modalDetalle.provincia ? `, ${modalDetalle.provincia}` : ""}`
                    : "Sin ciudad asignada"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-subtle">
                <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  Dirección
                </span>
                <p className="font-semibold text-text-primary m-0">
                  {modalDetalle.direccion || "No especificada"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-subtle">
                <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  Email de Notificación
                </span>
                <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5 truncate">
                  <Mail size={13} className="text-text-muted shrink-0" />
                  {modalDetalle.email || "Sin email"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-subtle">
                <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                  Teléfono
                </span>
                <p className="font-semibold text-text-primary m-0 flex items-center gap-1.5">
                  <Phone size={13} className="text-text-muted shrink-0" />
                  {modalDetalle.telefono || "No especificado"}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
              <Button
                onClick={() => setModalDetalle(null)}
                variant="outline"
                size="sm"
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  setModalAprobar(modalDetalle);
                }}
                variant="success"
                size="sm"
                leftIcon={<CheckCircle size={13} />}
              >
                Verificar
              </Button>
              <Button
                onClick={() => {
                  setModalRechazar(modalDetalle);
                  setMotivoRechazo("");
                  setMotivoError("");
                }}
                variant="danger-soft"
                size="sm"
                leftIcon={<XCircle size={13} />}
              >
                Rechazar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Confirmar Aprobación */}
      {modalAprobar && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setModalAprobar(null)}
          onConfirm={handleAprobar}
          title="¿Verificar institución?"
          description={`Estás por habilitar a "${modalAprobar.nombre}" (${modalAprobar.email}). Al verificarse, la entidad podrá responder reclamos y publicar comunicados oficiales.`}
          variant="success"
          confirmText="Verificar institución"
          cancelText="Cancelar"
          loading={procesando}
          loadingText="Verificando..."
          icon={<CheckCircle size={20} />}
        />
      )}

      {/* Modal Confirmar Rechazo */}
      {modalRechazar && (
        <ConfirmModal
          isOpen={true}
          onClose={() => {
            setModalRechazar(null);
            setMotivoRechazo("");
            setMotivoError("");
          }}
          onConfirm={handleRechazar}
          title="Rechazar solicitud institucional"
          description={`Indicá el motivo detallado de rechazo para "${modalRechazar.nombre}". Este texto será enviado formalmente por correo electrónico al solicitante.`}
          variant="danger"
          confirmText="Confirmar rechazo"
          cancelText="Cancelar"
          loading={procesando}
          loadingText="Rechazando..."
          icon={<XCircle size={20} />}
        >
          <div className="mt-3 text-left">
            <label className="block text-xs font-bold text-text-primary mb-1">
              Motivo del rechazo <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={motivoRechazo}
              onChange={(e) => {
                setMotivoRechazo(e.target.value);
                setMotivoError("");
              }}
              placeholder="Ej. La documentación adjunta no coincide con el organismo público declarado..."
              rows={3}
              className={`w-full text-xs p-3 rounded-xl border ${
                motivoError ? "border-rose-500" : "border-border-subtle"
              } bg-surface text-text-primary focus:border-rose-500 outline-hidden resize-y transition-all`}
            />
            {motivoError && (
              <p className="text-[11px] text-rose-600 mt-1 font-semibold m-0">{motivoError}</p>
            )}
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}
